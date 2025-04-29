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
  apiKey: "AIzaSyAbVYh02NaWq6N9yI5ImU45JVxqEjedB3I", // API key for Firebase services.
  authDomain: "profinder-85ebf.firebaseapp.com", // Domain for Firebase Authentication.
  projectId: "profinder-85ebf", // Unique identifier for the Firebase project.
  storageBucket: "profinder-85ebf.appspot.com", // Storage bucket for Firebase Storage (used for file uploads).
  messagingSenderId: "171804776890", // Sender ID for Firebase Cloud Messaging.
  appId: "1:171804776890:web:efa47505b197dc8c4ea583", // App ID for the Firebase project.
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
