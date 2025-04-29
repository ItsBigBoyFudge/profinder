// src/app/page.tsx

/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the `AboutPage` component, which serves as the "About Us" page for the platform.
 * It highlights the platform's features, mission, and benefits in an engaging and visually appealing way.
 * The page uses animations, gradients, and interactive elements to create a modern and immersive user experience.
 */

"use client"; // Marks this component as a Client Component, ensuring it runs on the client side.

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material"; // Import Material-UI components for building the UI.
import { styled, keyframes } from "@mui/system"; // Import styled and keyframes for custom animations and styles.
import PeopleIcon from "@mui/icons-material/People"; // Import Material-UI icons for visual elements.
import WorkIcon from "@mui/icons-material/Work";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";

// Keyframes for animations
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const neonGlow = keyframes`
  0% { text-shadow: 0 0 5px #00ffea, 0 0 10px #00ffea, 0 0 20px #00ffea, 0 0 40px #00ffea; }
  50% { text-shadow: 0 0 10px #00ffea, 0 0 20px #00ffea, 0 0 40px #00ffea, 0 0 80px #00ffea; }
  100% { text-shadow: 0 0 5px #00ffea, 0 0 10px #00ffea, 0 0 20px #00ffea, 0 0 40px #00ffea; }
`;

const gradientBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled components for reusable styles
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
  textAlign: "center",
  background: `linear-gradient(-45deg, ${theme.palette.background.paper}, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
  backgroundSize: "400% 400%",
  animation: `${gradientBackground} 15s ease infinite`,
  overflow: "hidden",
  position: "relative",
}));

const AsymmetricalCard = styled(Box)(({ theme }) => ({
  background: `rgba(${
    theme.palette.mode === "dark" ? "0, 0, 0, 0.2" : "255, 255, 255, 0.2"
  })`,
  backdropFilter: "blur(10px)",
  borderRadius: "30px",
  border: `1px solid rgba(${
    theme.palette.mode === "dark" ? "255, 255, 255, 0.1" : "0, 0, 0, 0.1"
  })`,
  padding: theme.spacing(4),
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  transform: "rotate(-2deg)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "rotate(0deg) scale(1.05)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  margin: "0 auto",
  marginBottom: theme.spacing(4),
  boxShadow: `0 8px 24px ${theme.palette.primary.main}80`,
  animation: `${float} 4s ease-in-out infinite`,
  "& svg": {
    fontSize: "60px",
    color: theme.palette.common.white,
  },
}));

const ParticleBackground = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 0,
  background: `radial-gradient(circle, ${theme.palette.primary.main}20 10%, transparent 10%)`,
  backgroundSize: "20px 20px",
  animation: `${float} 10s ease-in-out infinite`,
}));

const CustomCursor = styled(Box)(({ theme }) => ({
  position: "fixed",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: `radial-gradient(circle, ${theme.palette.primary.main}, transparent)`,
  pointerEvents: "none",
  transform: "translate(-50%, -50%)",
  zIndex: 9999,
  transition: "transform 0.1s ease, opacity 0.2s ease",
}));

/**
 * The `AboutPage` component is the main interface for the "About Us" page.
 * It highlights the platform's mission, features, and benefits using engaging animations and visuals.
 */
const AboutPage: React.FC = () => {
  const theme = useTheme(); // Use the theme for styling.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile devices.
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 }); // Track cursor position for custom cursor effect.

  // Update cursor position on mouse move
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window !== 'undefined') {
      const handleMouseMove = (e: MouseEvent) => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);
  
  return (
    <StyledBox>
      <ParticleBackground />
      <CustomCursor sx={{ left: cursorPosition.x, top: cursorPosition.y }} />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Page Title */}
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: `${neonGlow} 2s ease-in-out infinite`,
            transform: "rotate(-3deg)",
            display: "inline-block",
            fontSize: isMobile ? "2.5rem" : "4.5rem",
            mb: 4,
          }}
        >
          About Profinder<span style={{ fontSize: "1.5em" }}>🚀</span>
        </Typography>

        {/* Page Subtitle */}
        <Typography
          variant="h5"
          component="p"
          sx={{
            color: theme.palette.text.secondary,
            maxWidth: "800px",
            margin: "0 auto",
            mb: 8,
            animation: `${float} 3s ease-in-out infinite`,
            transform: "rotate(2deg)",
            display: "inline-block",
            fontSize: isMobile ? "1rem" : "1.5rem",
          }}
        >
          Profinder is more than just a platform—it’s a movement to bring people
          together through shared passions and professions. Whether you’re
          looking to network, collaborate, or simply make new friends, Profinder
          is your gateway to meaningful connections.{" "}
          <span style={{ fontSize: "1.5em" }}>🌟</span>
        </Typography>

        {/* Feature Cards */}
        <Grid container spacing={4}>
          {/* Card 1: Find Your Tribe */}
          <Grid item xs={12} md={4}>
            <AsymmetricalCard>
              <IconContainer>
                <PeopleIcon />
              </IconContainer>
              <Typography
                variant="h4"
                component="h3"
                gutterBottom
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                Find Your Tribe <span style={{ fontSize: "1.5em" }}>👥</span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                }}
              >
                Imagine a place where you can instantly connect with people who
                share your professional interests or hobbies. Whether you’re a
                designer, developer, writer, or photographer, Profinder helps
                you find your tribe.{" "}
                <span style={{ fontSize: "1.5em" }}>🎨💻📝📸</span>
              </Typography>
            </AsymmetricalCard>
          </Grid>

          {/* Card 2: Collaborate Seamlessly */}
          <Grid item xs={12} md={4}>
            <AsymmetricalCard sx={{ transform: "rotate(2deg)" }}>
              <IconContainer>
                <WorkIcon />
              </IconContainer>
              <Typography
                variant="h4"
                component="h3"
                gutterBottom
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                Collaborate Seamlessly{" "}
                <span style={{ fontSize: "1.5em" }}>🤝</span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                }}
              >
                Need a partner for your next project? Profinder makes it easy to
                find collaborators who align with your goals. From startups to
                creative ventures, the possibilities are endless.{" "}
                <span style={{ fontSize: "1.5em" }}>🚀💡</span>
              </Typography>
            </AsymmetricalCard>
          </Grid>

          {/* Card 3: Build Lasting Connections */}
          <Grid item xs={12} md={4}>
            <AsymmetricalCard sx={{ transform: "rotate(-1deg)" }}>
              <IconContainer>
                <ConnectWithoutContactIcon />
              </IconContainer>
              <Typography
                variant="h4"
                component="h3"
                gutterBottom
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                Build Lasting Connections{" "}
                <span style={{ fontSize: "1.5em" }}>🌐</span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: isMobile ? "0.9rem" : "1.1rem",
                }}
              >
                Profinder isn’t just about networking—it’s about building
                relationships that last. Share ideas, learn from others, and
                grow together in a supportive community.{" "}
                <span style={{ fontSize: "1.5em" }}>🌱💬</span>
              </Typography>
            </AsymmetricalCard>
          </Grid>
        </Grid>

        {/* Why Choose Profinder Section */}
        <Box sx={{ mt: 10 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: theme.palette.text.primary,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: `${neonGlow} 2s ease-in-out infinite`,
              transform: "rotate(3deg)",
              display: "inline-block",
              fontSize: isMobile ? "2rem" : "3.5rem",
              mb: 6,
            }}
          >
            Why Choose Profinder?<span style={{ fontSize: "1.5em" }}>🤷</span>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "800px",
              margin: "0 auto",
              mb: 8,
              animation: `${float} 3s ease-in-out infinite`,
              transform: "rotate(-2deg)",
              display: "inline-block",
              fontSize: isMobile ? "0.9rem" : "1.2rem",
            }}
          >
            In a world where connections are often superficial, Profinder stands
            out by focusing on what truly matters: shared passions and
            professional alignment. Here’s how we make a difference:
          </Typography>

          {/* Why Choose Profinder Cards */}
          <Grid container spacing={4}>
            {/* Card 1: Real-Life Impact */}
            <Grid item xs={12} md={6}>
              <AsymmetricalCard sx={{ transform: "rotate(-2deg)" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <EmojiPeopleIcon
                    sx={{
                      fontSize: isMobile ? "60px" : "80px",
                      color: theme.palette.primary.main,
                      mr: 3,
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.text.primary,
                    }}
                  >
                    Real-Life Impact{" "}
                    <span style={{ fontSize: "1.5em" }}>🌍</span>
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                  }}
                >
                  Profinder has already helped users find collaborators,
                  mentors, and friends. From launching startups to forming
                  lifelong friendships, the platform is making a real impact.{" "}
                  <span style={{ fontSize: "1.5em" }}>🚀👫</span>
                </Typography>
              </AsymmetricalCard>
            </Grid>

            {/* Card 2: Modern & Minimalistic */}
            <Grid item xs={12} md={6}>
              <AsymmetricalCard sx={{ transform: "rotate(1deg)" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                  <ConnectWithoutContactIcon
                    sx={{
                      fontSize: isMobile ? "60px" : "80px",
                      color: theme.palette.primary.main,
                      mr: 3,
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="h3"
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.text.primary,
                    }}
                  >
                    Modern & Minimalistic{" "}
                    <span style={{ fontSize: "1.5em" }}>✨</span>
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                  }}
                >
                  Our platform is designed with simplicity and elegance in mind.
                  The intuitive interface ensures a seamless experience for
                  users of all backgrounds.{" "}
                  <span style={{ fontSize: "1.5em" }}>🎨🖥️</span>
                </Typography>
              </AsymmetricalCard>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </StyledBox>
  );
};

export default AboutPage;
