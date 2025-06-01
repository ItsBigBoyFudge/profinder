/**
 * This code is written by Khalid as part of a university thesis project. The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the authentication context for the web application. It uses Firebase authentication to manage user sessions and provides a context to share the current user's authentication state across the application. This allows components to easily access and react to changes in the user's authentication status.
 */

"use client"; // Mark this as a Client Component since it uses browser-specific APIs.

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase"; // Import the Firebase authentication instance.

/**
 * Define the type for the authentication context.
 * This includes the current user object and a loading state to indicate whether the authentication state is still being checked.
 */
interface AuthContextType {
  currentUser: User | null; // The currently authenticated user, or null if no user is logged in.
  loading: boolean; // A boolean to indicate if the authentication state is still being determined.
}

/**
 * Create the authentication context with default values.
 * The default context has no authenticated user (`currentUser: null`) and is in a loading state (`loading: true`).
 */
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
});

/**
 * Create a provider component for the authentication context.
 * This component wraps the application (or part of it) and provides the authentication state to all child components.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State to store the current user.
  const [loading, setLoading] = useState(true); // State to track if the authentication check is still loading.

  useEffect(() => {
    /**
     * Listen for changes in the authentication state using Firebase's `onAuthStateChanged` method.
     * This method triggers whenever the user logs in, logs out, or when the authentication state is initially determined.
     */
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Update the current user state.
      setLoading(false); // Set loading to false once the authentication state is determined.
    });

    /**
     * Cleanup function to unsubscribe from the authentication state listener when the component unmounts.
     * This prevents memory leaks and unnecessary updates.
     */
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  /**
   * Provide the authentication state to all child components via the context.
   * The value includes the current user and the loading state.
   */
  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to simplify accessing the authentication context.
 * This hook allows any component to easily retrieve the current user and loading state without directly using `useContext`.
 */
export const useAuth = () => useContext(AuthContext);
