// src/app/Providers.tsx

/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the `Providers` component, which serves as a wrapper for the application's
 * client-side components. It provides essential context and styling configurations, such as
 * the custom theme and authentication state, to the entire application. This ensures a
 * consistent look and feel while managing user authentication across the platform.
 */

"use client"; // This directive marks the component as a Client Component, ensuring it runs on the client side.

import { ThemeProvider } from "@mui/material/styles"; // Import ThemeProvider to apply custom themes.
import CssBaseline from "@mui/material/CssBaseline"; // Import CssBaseline to normalize CSS and apply baseline styles.
import theme from "@/styles/theme"; // Import the custom theme defined for the application.
import { AuthProvider } from "@/context/AuthContext"; // Import AuthProvider to manage authentication state.

/**
 * The `Providers` component wraps the application's children components with necessary providers
 * for theme and authentication. This ensures that all components within the application have
 * access to the theme and authentication context.
 *
 * @param {React.ReactNode} children - The child components to be wrapped by the providers.
 * @returns {JSX.Element} - A wrapper component that provides theme and authentication context.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalizes CSS across browsers and applies baseline styles for consistency. */}
      <CssBaseline />
      {/* AuthProvider wraps the application to manage and provide authentication state. */}
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
