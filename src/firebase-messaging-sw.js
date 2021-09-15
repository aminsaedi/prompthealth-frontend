// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.0.1/firebase-messaging.js");
firebase.initializeApp({
  apiKey: "AIzaSyC6JqGOHfsZShTHqy1cq-nWOKhlIULtRmI",
  authDomain: "prompthealth-22680.firebaseapp.com",
  projectId: "prompthealth-22680",
  storageBucket: "prompthealth-22680.appspot.com",
  messagingSenderId: "740878106701",
  appId: "1:740878106701:web:a596945bf68f452e37dc04",
  measurementId: "G-3GTRM03FCL"
});
const messaging = firebase.messaging();
