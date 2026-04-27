/* =========================================================
   MedCO Assess — Global App Logic (app.js)
   Shared utility file for:
   - Student Login
   - Session Monitoring
   - Randomized Exam Generation
   - Result Calculation
   - Course Outcome Analytics
   ========================================================= */

import { db, COLLECTIONS } from "./firebase-config.js";

import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

export let activeSession = null;
export let questionBank = [];
export let studentAnswers = [];

/* =========================================================
   STUDENT AUTH / LOGIN
   ========================================================= */

export async function studentLogin(studentName, rollNumber){
  try{
    if(!studentName || !rollNumber){
      throw new Error("Name and Roll Number required.");
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, rollNumber);

    await setDoc(studentRef,{
      name: studentName,
      rollNumber: rollNumber,
      status: "waiting",
      joinedAt: new Date().toISOString()
    });

    localStorage.setItem("studentName", studentName);
    localStorage.setItem("rollNumber", rollNumber);

    return {
      success:true,
      message:"Student login successful."
    };

  }catch(error){
    console.error("Student Login Error:", error);
    return {
      success:false,
      message:error.message
    };
  }
}

/* =========================================================
   SESSION STATUS
   ========================================================= */

export async function fetchActiveSession(){
  try{
    const sessionRef = doc(db, COLLECTIONS.SYSTEM, "activeSession");
    const sessionSnap = await getDoc(sessionRef);

    if(sessionSnap.exists()){
      activeSession = sessionSnap.data();
      return activeSession;
    }

    return null;

  }catch(error){
    console.error("Fetch Session Error:", error);
    return null;
  }
}

/* =========================================================
   QUESTION BANK FETCH
   ========================================================= */

export async function fetchQuestionBank(){
  try{
    const questionSnap = await getDocs(
      collection(db, COLLECTIONS.QUESTION_BANK)
    );

    questionBank = [];

    questionSnap.forEach((docSnap)=>{
      questionBank.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    return questionBank;

  }catch(error){
    console.error("Question Fetch Error:", error);
    return [];
  }
}

/* =========================================================
   RANDOMIZE QUESTIONS PER STUDENT
   ========================================================= */

export function shuffleArray(array){
  let newArray = [...array];

  for(let i = newArray.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

export async function generateStudentExam(totalQuestions = 50){
  try{
    if(questionBank.length === 0){
      await fetchQuestionBank();
    }

    const randomized = shuffleArray(questionBank);

    return randomized.slice(0, totalQuestions);

  }catch(error){
    console.error("Generate Exam Error:", error);
    return [];
  }
}

/* =========================================================
   SAVE ANSWER
   ========================================================= */

export function saveStudentAnswer(questionObj, selectedAnswer){
  const isCorrect =
    parseInt(selectedAnswer) === parseInt(questionObj.correctAnswer);

  studentAnswers.push({
    question: questionObj.question,
    options: questionObj.options,
    selectedAnswer:
      selectedAnswer !== null && selectedAnswer !== undefined
        ? parseInt(selectedAnswer)
        : null,
    correctAnswer: parseInt(questionObj.correctAnswer),
    marks: isCorrect ? 1 : 0,
    explanation: questionObj.explanation || "",
    courseOutcome: questionObj.courseOutcome || "Unassigned"
  });
}

/* =========================================================
   RESULT CALCULATION
   CO Formula:
   CO Score = (Marks Obtained / Total CO Marks) × 100
   ========================================================= */

export function calculateResults(){
  let totalScore = 0;
  let coStats = {};

  studentAnswers.forEach((ans)=>{
    totalScore += ans.marks;

    const co = ans.courseOutcome;

    if(!coStats[co]){
      coStats[co] = {
        scored:0,
        total:0
      };
    }

    coStats[co].scored += ans.marks;
    coStats[co].total += 1;
  });

  let coResults = {};

  Object.keys(coStats).forEach((co)=>{
    const scored = coStats[co].scored;
    const total = coStats[co].total;

    const percentage = (scored / total) * 100;

    let level = 0;

    if(percentage >= 70){
      level = 3;
    }else if(percentage >= 60){
      level = 2;
    }else if(percentage >= 50){
      level = 1;
    }

    coResults[co] = {
      scored,
      total,
      percentage: percentage.toFixed(2),
      level
    };
  });

  return {
    totalScore,
    totalQuestions: studentAnswers.length,
    percentage:
      ((totalScore / studentAnswers.length) * 100).toFixed(2),
    answers: studentAnswers,
    courseOutcomes: coResults
  };
}

/* =========================================================
   SUBMIT STUDENT RESULT
   ========================================================= */

export async function submitStudentResults(){
  try{
    const rollNumber = localStorage.getItem("rollNumber");
    const studentName = localStorage.getItem("studentName");

    if(!rollNumber || !studentName){
      throw new Error("Student not logged in.");
    }

    const finalResult = calculateResults();

    await setDoc(doc(db, COLLECTIONS.RESULTS, rollNumber),{
      studentName,
      rollNumber,
      totalScore: finalResult.totalScore,
      totalQuestions: finalResult.totalQuestions,
      percentage: finalResult.percentage,
      answers: finalResult.answers,
      courseOutcomes: finalResult.courseOutcomes,
      submittedAt: new Date().toISOString()
    });

    // Update student status
    await updateDoc(doc(db, COLLECTIONS.STUDENTS, rollNumber),{
      status:"completed"
    });

    return {
      success:true,
      result:finalResult
    };

  }catch(error){
    console.error("Submit Result Error:", error);

    return {
      success:false,
      message:error.message
    };
  }
}

/* =========================================================
   HOST SESSION CONTROLS
   ========================================================= */

export async function createSession(sessionId, questionTimer){
  try{
    await setDoc(doc(db, COLLECTIONS.SYSTEM, "activeSession"),{
      sessionId,
      questionTimer,
      status:"waiting",
      createdAt:new Date().toISOString()
    });

    return true;

  }catch(error){
    console.error("Create Session Error:", error);
    return false;
  }
}

export async function startSession(){
  try{
    await updateDoc(doc(db, COLLECTIONS.SYSTEM, "activeSession"),{
      status:"live"
    });

    return true;

  }catch(error){
    console.error("Start Session Error:", error);
    return false;
  }
}

export async function endSession(){
  try{
    await updateDoc(doc(db, COLLECTIONS.SYSTEM, "activeSession"),{
      status:"ended",
      endedAt:new Date().toISOString()
    });

    return true;

  }catch(error){
    console.error("End Session Error:", error);
    return false;
  }
}

export async function resetSession(){
  try{
    await deleteDoc(doc(db, COLLECTIONS.SYSTEM, "activeSession"));

    studentAnswers = [];
    activeSession = null;

    return true;

  }catch(error){
    console.error("Reset Session Error:", error);
    return false;
  }
}

/* =========================================================
   CLASS CO ANALYTICS
   ========================================================= */

export async function calculateClassCOAnalytics(){
  try{
    const resultsSnap = await getDocs(
      collection(db, COLLECTIONS.RESULTS)
    );

    let classStats = {};

    resultsSnap.forEach((docSnap)=>{
      const resultData = docSnap.data();
      const courseOutcomes = resultData.courseOutcomes || {};

      Object.keys(courseOutcomes).forEach((co)=>{
        const coData = courseOutcomes[co];

        if(!classStats[co]){
          classStats[co] = {
            totalStudents:0,
            totalPercentage:0,
            level3:0,
            level2:0,
            level1:0,
            level0:0
          };
        }

        classStats[co].totalStudents++;
        classStats[co].totalPercentage += parseFloat(coData.percentage);

        switch(coData.level){
          case 3:
            classStats[co].level3++;
            break;
          case 2:
            classStats[co].level2++;
            break;
          case 1:
            classStats[co].level1++;
            break;
          default:
            classStats[co].level0++;
        }
      });
    });

    Object.keys(classStats).forEach((co)=>{
      classStats[co].averageAttainment =
        (
          classStats[co].totalPercentage /
          classStats[co].totalStudents
        ).toFixed(2);
    });

    return classStats;

  }catch(error){
    console.error("Class CO Analytics Error:", error);
    return {};
  }
}

/* =========================================================
   SESSION HISTORY SAVE
   ========================================================= */

export async function saveSessionHistory(sessionId){
  try{
    const analytics = await calculateClassCOAnalytics();

    await addDoc(collection(db, COLLECTIONS.SESSION_HISTORY),{
      sessionId,
      analytics,
      savedAt:new Date().toISOString()
    });

    return true;

  }catch(error){
    console.error("Save Session History Error:", error);
    return false;
  }
}

/* =========================================================
   RESET LOCAL EXAM
   ========================================================= */

export function clearLocalExamState(){
  studentAnswers = [];

  localStorage.removeItem("studentExam");
  localStorage.removeItem("currentQuestionIndex");
}

/* =========================================================
   HELPER UTILITIES
   ========================================================= */

export function formatPercentage(value){
  return `${parseFloat(value).toFixed(2)}%`;
}

export function getCOLevel(score){
  if(score >= 70) return 3;
  if(score >= 60) return 2;
  if(score >= 50) return 1;
  return 0;
}

/* =========================================================
   END OF APP.JS
   ========================================================= */
