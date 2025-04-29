// src/app/page.tsx

/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the main entry point for the application's homepage. It renders the
 * `LandingPage` component, which serves as the first interface users interact with when
 * visiting the platform. The landing page introduces the platform's features and guides
 * users on how to connect with others who share similar professions or interests.
 */

import LandingPage from "../components/LandingPage"; // Import the LandingPage component.

/**
 * The `Home` component is the default export of this file and represents the root page
 * of the application. It simply renders the `LandingPage` component, which contains
 * the content and functionality for the homepage.
 *
 * @returns {JSX.Element} - The `LandingPage` component, which serves as the application's homepage.
 */
export default function Home() {
  return <LandingPage />;
}
