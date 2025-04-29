// This code is written by Khalid as part of a university thesis project.
// The explanations are provided to offer guidance on the project's implementation.
// This file initializes Firebase services, which are essential for the platform's functionality.
// Firebase is used for authentication, database management (Firestore), and file storage (Firebase Storage).

// Import necessary Firebase modules for app initialization, authentication, Firestore, and storage.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object containing keys and identifiers for connecting to the Firebase project.
// These values are obtained from the Firebase Console when setting up the project.
const firebaseConfig = {
  apiKey: "AIzaSyAlMB6C7ZbF7XWTc6zTNQn6bpvryIRj8W0",
  authDomain: "profinder-bb212.firebaseapp.com",
  projectId: "profinder-bb212",
  storageBucket: "profinder-bb212.firebasestorage.app",
  messagingSenderId: "17878932303",
  appId: "1:17878932303:web:61d3e08d365735ec9d033a",
  measurementId: "G-T8G9B2H9CR"
};

// Initialize the Firebase app using the configuration object.
// This sets up the connection to Firebase services.
const app = initializeApp(firebaseConfig);

// Export Firebase Authentication instance for user login, registration, and authentication.
export const auth = getAuth(app);

// Export Firestore instance for database operations (e.g., storing and retrieving user data).
export const db = getFirestore(app);

// Export Firebase Storage instance for handling file uploads and storage (e.g., profile pictures).
export const storage = getStorage(app);
