/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the root layout of the web application. It serves as the foundational
 * structure for all pages, ensuring consistent styling, metadata, and functionality across
 * the application. The layout includes the Navbar component and wraps the application
 * with necessary providers for state management and theming.
 */

import type { Metadata } from "next"; // Import Metadata type for defining page metadata
import { Inter } from "next/font/google"; // Import the Inter font from Google Fonts
import Providers from "../components/Providers"; // Import the Providers component for global state management
import Navbar from "@/components/Navbar"; // Import the Navbar component for consistent navigation

// Initialize the Inter font with the Latin subset
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  title: "ProFinder", // Application title
  description: "A dating platform for professionals", // Application description
};

/**
 * RootLayout Component
 *
 * This component serves as the root layout for the application. It wraps all pages with
 * consistent styling, metadata, and functionality. The layout includes the Navbar component
 * and ensures that the application is wrapped with necessary providers for state management
 * and theming.
 *
 * @param children - The child components to be rendered within the layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Set the language of the document to English */}
      <body className={inter.className}>    
        {/* Apply the Inter font to the body */}
        <Providers>
          {/* Wrap the application with Providers for global state management */}
          <Navbar />
          {/* Include the Navbar component for consistent navigation */}
          {children} {/* Render the child components (pages) */}
        </Providers>
      </body>
    </html>
  );
}
