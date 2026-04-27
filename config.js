// ============================================================
// CONFIGURATION - Update these values before deployment
// ============================================================

const APP_CONFIG = {
  // Firebase Configuration (replace with your Firebase project config)
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  },

  // Host password (change this!)
  hostPassword: "admin123",

  // Quiz defaults
  defaults: {
    totalQuestions: 50,
    maxStudents: 250,
    defaultQuestionDuration: 60, // seconds
    sessionTimeout: 7200 // 2 hours
  }
};

// Course Outcome Mapping (configurable)
// Maps question indices (0-based) to Course Outcomes
const DEFAULT_CO_MAPPING = {
  "CO 1.1": { questions: [0,1,2,3,4], label: "CO 1.1 - Basic Concepts" },
  "CO 1.2": { questions: [5,6,7,8,9,10], label: "CO 1.2 - Fundamentals" },
  "CO 2.1": { questions: [11,12,13,14,15,16,17,18,19], label: "CO 2.1 - Analysis" },
  "CO 2.2": { questions: [20,21,22,23,24,25,26,27], label: "CO 2.2 - Application" },
  "CO 3.1": { questions: [28,29,30,31,32,33,34,35,36], label: "CO 3.1 - Design" },
  "CO 3.2": { questions: [37,38,39,40,41,42,43,44,45,46,47,48,49], label: "CO 3.2 - Evaluation" }
};

if (typeof module !== 'undefined') {
  module.exports = { APP_CONFIG, DEFAULT_CO_MAPPING };
}
