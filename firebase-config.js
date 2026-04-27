// firebase-config.js
// Central Firebase configuration for MedCO Assess
// Replace placeholder values with your Firebase project settings

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================================================
   YOUR FIREBASE PROJECT CONFIGURATION
   Steps:
   Firebase Console → Project Settings → General → Your Apps
   ========================================================= */

const firebaseConfig = {
   apiKey: "AIzaSyCxCexZLH3m2bni7wZ3Wqvs3BzJHzh9fxc",
  authDomain: "tues-2f354.firebaseapp.com",
  databaseURL: "https://tues-2f354-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tues-2f354",
  storageBucket: "tues-2f354.firebasestorage.app",
  messagingSenderId: "41087849708",
  appId: "1:41087849708:web:25c1f91d54858a2111c1c9",
  measurementId: "G-S6Z5JJ97CB"
};

/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);

/* =========================================================
   SERVICES
   ========================================================= */

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

/* =========================================================
   EXPORTS
   ========================================================= */

export {
  app,
  db,
  auth,
  storage
};

/* =========================================================
   FIRESTORE DATABASE STRUCTURE (RECOMMENDED)
   =========================================================

admins (collection)
   └── HOST001 (document)
         ├── name: "Dr Admin"
         ├── accessKey: "123456"
         └── role: "host"

students (collection)
   └── ROLL001 (document)
         ├── name: "Student Name"
         ├── rollNumber: "ROLL001"
         ├── status: "waiting/live/completed"
         └── joinedAt

questionBank (collection)
   └── autoDocId
         ├── question
         ├── options [4]
         ├── correctAnswer
         ├── explanation
         ├── courseOutcome
         └── createdAt

system (collection)
   └── activeSession (document)
         ├── sessionId
         ├── questionTimer
         ├── status
         └── createdAt

results (collection)
   └── ROLL001 (document)
         ├── studentName
         ├── rollNumber
         ├── totalScore
         ├── totalQuestions
         ├── submittedAt
         └── answers [
               {
                 question,
                 selectedAnswer,
                 correctAnswer,
                 marks,
                 explanation,
                 courseOutcome
               }
             ]

sessionHistory (collection)
   └── SESSION001 (document)
         ├── sessionId
         ├── createdAt
         ├── endedAt
         ├── totalStudents
         ├── averageScore
         └── exportReady

========================================================= */


/* =========================================================
   OPTIONAL HELPER METHODS
   ========================================================= */

// Example:
export const COLLECTIONS = {
  ADMINS: "admins",
  STUDENTS: "students",
  QUESTION_BANK: "questionBank",
  RESULTS: "results",
  SYSTEM: "system",
  SESSION_HISTORY: "sessionHistory"
};

/* =========================================================
   SECURITY RULES RECOMMENDATION (Firestore)
   =========================================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /students/{studentId} {
      allow read, write: if true;
    }

    match /questionBank/{docId} {
      allow read: if true;
      allow write: if true;
    }

    match /results/{docId} {
      allow read, write: if true;
    }

    match /system/{docId} {
      allow read, write: if true;
    }

    match /admins/{docId} {
      allow read, write: if true;
    }

    match /sessionHistory/{docId} {
      allow read, write: if true;
    }
  }
}
========================================================= */


/* =========================================================
   IMPORTANT PRODUCTION NOTE
   =========================================================
   For real deployment:
   - Replace open rules with authenticated admin checks
   - Use Firebase App Check
   - Restrict admin credentials
   - Add Cloud Functions for Excel export
   ========================================================= */
