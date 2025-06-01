/**
 * This code is written by Khalid as part of a university thesis project. The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the custom theme for the web application using Material-UI (MUI). The theme is designed to create a cohesive and visually appealing user interface that aligns with the project's aesthetic goals. It includes custom colors, typography, and component styles to ensure consistency across the application.
 */

import { createTheme } from "@mui/material/styles";

/**
 * Define the BIOS font for use in the application.
 * The BIOS font is a monospace font that gives the application a retro, tech-inspired look.
 */
const biosFont = {
  fontFamily: "BIOS",
  fontStyle: "normal",
  fontDisplay: "swap",
  fontWeight: 400,
  src: `
    url('/fonts/BIOS.woff2') format('woff2'),
    url('/fonts/BIOS.woff') format('woff')
  `,
};

/**
 * Create a custom Material-UI theme.
 * The theme is designed with a dark mode palette and sharp, neon colors to create a modern and minimalist aesthetic.
 */
const theme = createTheme({
  // Define the color palette for the theme.
  palette: {
    mode: "dark", // Use dark mode as the base theme.
    primary: {
      main: "#00ff5f", // Sharp neon green for primary elements.
      contrastText: "#ffffff", // White text for contrast.
    },
    secondary: {
      main: "#ff9100", // Bright orange for secondary elements.
    },
    background: {
      default: "#121212", // Pure dark gray for the background.
      paper: "#1e1e1e", // Slightly lighter gray for paper-like components.
    },
    text: {
      primary: "#ffffff", // White for primary text.
      secondary: "#b3b3b3", // Soft gray for secondary text.
    },
    error: {
      main: "#ff5252", // Red for error messages.
    },
    success: {
      main: "#00e676", // Bright green for success messages.
    },
    info: {
      main: "#29b6f6", // Bright blue for informational messages.
    },
    warning: {
      main: "#ffa726", // Bright orange for warning messages.
    },
  },

  // Define typography settings for the theme.
  typography: {
    fontFamily: "BIOS, monospace", // Use the BIOS font for a consistent look.
    h1: {
      fontSize: "3rem",
      fontWeight: 600,
      color: "#00ff5f", // Neon green for headings.
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 500,
      color: "#ff9100", // Bright orange for subheadings.
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 400,
      color: "#ffffff", // White for tertiary headings.
      letterSpacing: "0em",
    },
    body1: {
      fontSize: "1rem",
      color: "#ffffff", // White for body text.
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      color: "#b3b3b3", // Soft gray for secondary body text.
      lineHeight: 1.5,
    },
  },

  // Define the shape of components (e.g., border radius).
  shape: {
    borderRadius: 4, // Minimal rounding for a sharp, modern look.
  },

  // Customize the styles of specific MUI components.
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@global": {
          "@font-face": [biosFont], // Apply the BIOS font globally.
        },
        body: {
          backgroundColor: "#121212", // Dark background for the body.
          color: "#ffffff", // White text for the body.
          fontFamily: "BIOS, monospace", // Use the BIOS font.
        },
        a: {
          color: "#00ff5f", // Neon green for links.
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline", // Underline links on hover.
          },
        },
        button: {
          fontFamily: "BIOS, monospace", // Use the BIOS font for buttons.
          textTransform: "none", // Disable uppercase transformation.
          "&:hover": {
            backgroundColor: "#00ff5f20", // Semi-transparent neon green on hover.
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          border: "1px solid #00ff5f", // Neon green border for buttons.
          color: "#ffffff", // White text for buttons.
          borderRadius: "4px", // Minimal border radius.
          padding: "8px 16px", // Standard padding.
          "&:hover": {
            backgroundColor: "#00ff5f20", // Semi-transparent neon green on hover.
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e", // Dark gray background for paper components.
          border: "1px solid #303030", // Subtle border for contrast.
          borderRadius: "4px", // Minimal border radius.
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-input": {
            color: "#ffffff", // White text for input fields.
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "4px", // Minimal border radius.
            "& fieldset": {
              borderColor: "#303030", // Subtle border for input fields.
            },
            "&:hover fieldset": {
              borderColor: "#00ff5f", // Neon green border on hover.
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00ff5f", // Neon green border when focused.
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e", // Dark gray background for cards.
          border: "1px solid #303030", // Subtle border for contrast.
          borderRadius: "4px", // Minimal border radius.
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e", // Dark gray background for the app bar.
          borderBottom: "1px solid #303030", // Subtle border at the bottom.
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#303030", // Subtle border color for dividers.
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1e1e1e", // Dark gray background for tooltips.
          border: "1px solid #303030", // Subtle border for tooltips.
          borderRadius: "4px", // Minimal border radius.
          color: "#ffffff", // White text for tooltips.
        },
      },
    },
  },
});

export default theme;
