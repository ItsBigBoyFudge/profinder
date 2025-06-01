"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  alpha,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  useTheme,
  Avatar,
  Fade,
  Grow,
  keyframes,
} from "@mui/material";
import {
  People,
  Work,
  ConnectWithoutContact,
  ArrowForward,
} from "@mui/icons-material";
import khalidImage from "../../public/khalid.jpg";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const neonGlowAnimation = keyframes`
  0% { filter: drop-shadow(0 0 5px ${alpha("#00ff88", 0.3)}); }
  50% { filter: drop-shadow(0 0 20px ${alpha("#00ff88", 0.6)}); }
  100% { filter: drop-shadow(0 0 5px ${alpha("#00ff88", 0.3)}); }
`;

const typewriterAnimation = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { width, height } = useWindowSize();

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
      
      const handleMouseMove = (e: MouseEvent) => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      };
      
      if (!isMobile) {
        window.addEventListener("mousemove", handleMouseMove);
      }
      
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isMobile]);

  const handleConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${alpha(
            theme.palette.primary.main,
            0.1
          )}, transparent 70%)`,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )}, transparent)`,
          pointerEvents: "none",
          animation: `${neonGlowAnimation} 3s ease-in-out infinite`,
        },
      }}
    >
      {showConfetti && (
        <Confetti width={width} height={height} recycle={false} />
      )}

      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: cursorPosition.y,
            left: cursorPosition.x,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.5
            )}, transparent)`,
            pointerEvents: "none",
            zIndex: 9999,
            transform: "translate(-50%, -50%)",
            transition: "transform 0.1s ease-out",
          }}
        />
      )}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            background: {
              color: {
                value: theme.palette.background.default,
              },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: {
                  enable: !isMobile,
                  mode: "bubble",
                },
              },
              modes: {
                bubble: {
                  distance: 200,
                  size: 10,
                  duration: 2,
                  opacity: 0.8,
                  color: theme.palette.primary.main,
                },
              },
            },
            particles: {
              color: {
                value: theme.palette.primary.main,
              },
              links: {
                color: theme.palette.primary.main,
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              collisions: {
                enable: true,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: "bounce",
                random: false,
                speed: 2,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 50,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: 5,
              },
            },
            detectRetina: true,
          }}
        />
      </Box>

      {/* Header with Animated Hero Icon */}
      <Fade in={true} timeout={1000}>
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Animated Hero Icon */}
            <Box
              sx={{
                fontSize: { xs: "4rem", sm: "6rem", md: "8rem" }, // Responsive icon size
                color: theme.palette.primary.main, // Neon green from theme
                animation: `${floatAnimation} 3s ease-in-out infinite`,
                filter: `drop-shadow(0 0 20px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )})`, // Neon glow
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </Box>

            {/* Hero Title with Typewriter Effect */}
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, // Responsive font size
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
                borderRight: "0.15em solid orange", // Cursor effect
                animation: `${typewriterAnimation} 3.5s steps(40, end), blink-caret 0.75s step-end infinite`,
              }}
            >
              Welcome to ProFinder
            </Typography>
          
            {/* Hero Subtitle */}
            <Typography
              variant="h5"
              component="p"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary, // Light gray from theme
                maxWidth: "800px",
                textAlign: "center",
                fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" }, // Responsive font size
                lineHeight: 1.6,
              }}
            >
              Connect with like-minded professionals, collaborate on projects,
              and build meaningful relationships.
            </Typography>

            {/* Call-to-Action Button */}
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: "12px",
                padding: { xs: "10px 30px", sm: "14px 40px" }, // Responsive padding
                fontSize: { xs: "1rem", sm: "1.1rem" }, // Responsive font size
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 16px ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 20px ${alpha(
                    theme.palette.primary.main,
                    0.4
                  )}`,
                },
                transition: "all 0.3s ease",
              }}
              onClick={handleConfetti}
              href="/login"
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Fade>

      {/* Features Section */}
      <Container
        maxWidth="lg"
        sx={{ mt: 8, mb: 8, position: "relative", zIndex: 1 }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            mb: 6,
            fontSize: { xs: "2rem", sm: "2.5rem" },
            color: theme.palette.text.primary,
            textAlign: "center",
          }}
        >
          Why Choose ProFinder?
        </Typography>
        
        <Grid container spacing={4}>
          {[
            {
              icon: <People sx={{ fontSize: { xs: "3rem", sm: "4rem" } }} />, // Responsive icon size
              title: "Find Professionals",
              description:
                "Discover and connect with individuals in your industry.",
            },
            {
              icon: <Work sx={{ fontSize: { xs: "3rem", sm: "4rem" } }} />, // Responsive icon size
              title: "Collaborate on Projects",
              description: "Work together on ideas and projects that matter.",
            },
            {
              icon: (
                <ConnectWithoutContact
                  sx={{ fontSize: { xs: "3rem", sm: "4rem" } }}
                />
              ), // Responsive icon size
              title: "Build Meaningful Connections",
              description:
                "Foster relationships based on shared interests and goals.",
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Grow in={true} timeout={(index + 1) * 500}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.background.paper,
                      0.8
                    )}, ${alpha(theme.palette.background.paper, 0.6)})`,
                    borderRadius: "24px",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 20px ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                      "& .feature-icon": {
                        transform: "scale(1.1)",
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <Box
                    className="feature-icon"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 3,
                      transition: "all 0.3s ease",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.text.primary,
                      textAlign: "center",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: "center",
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Me Section */}
      <Container
        maxWidth="lg"
        sx={{ mt: 15, mb: 15, position: "relative", zIndex: 1 }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            mb: 6,
            fontSize: { xs: "2rem", sm: "2.5rem" },
            color: theme.palette.text.primary,
            textAlign: "center",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: `${neonGlowAnimation} 3s ease-in-out infinite`,
          }}
        >
          About Me
        </Typography>
        <Grid container spacing={6} alignItems="center">
          {/* Avatar */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: { xs: 150, sm: 200, md: 250 },
                  height: { xs: 150, sm: 200, md: 250 },
                  borderRadius: "50%",
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  padding: "6px", // Gradient border
                  boxShadow: `0 0 20px ${alpha(
                    theme.palette.primary.main,
                    0.5
                  )}`,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Avatar
                  src={khalidImage.src} // Use your picture
                  alt="Khalid"
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: `4px solid ${theme.palette.background.default}`,
                  }}
                />
              </Box>
            </Box>
          </Grid>

          {/* About Me Content */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.background.paper,
                  0.8
                )}, ${alpha(theme.palette.background.paper, 0.6)})`,
                borderRadius: "24px",
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 12px 20px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                },
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.text.primary,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Hi, Im Khalid
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                  lineHeight: 1.7,
                }}
              >
                I am the creator of ProFinder. With a passion for connecting
                people and fostering collaboration, I built this platform to
                empower professionals like you to achieve your goals.
              </Typography>
              <Typography
                variant="h6"
                component="blockquote"
                sx={{
                  fontStyle: "italic",
                  color: theme.palette.primary.main,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  paddingLeft: 2,
                }}
              >
                Empowering professionals to connect, collaborate, and grow together.
              </Typography>

              {/* Skills Visualization */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  My Skills
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {[
                    "React",
                    "Node.js",
                    "TypeScript",
                    "UI/UX Design",
                    "GraphQL",
                    "AWS",
                  ].map((skill, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.2
                        )}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 8px 16px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {skill}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Container
        maxWidth="md"
        sx={{ mt: 8, pb: 8, position: "relative", zIndex: 1 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.8
            )}, ${alpha(theme.palette.background.paper, 0.6)})`,
            borderRadius: "24px",
            backdropFilter: "blur(20px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "2rem", sm: "2.5rem" },
              color: theme.palette.text.primary,
            }}
          >
            Ready to Join?
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              mb: 4,
              color: theme.palette.text.secondary,
            }}
          >
            Sign up today and start building your professional network.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: "12px",
              padding: { xs: "10px 30px", sm: "14px 40px" },
              fontSize: { xs: "1rem", sm: "1.1rem" },
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 12px 20px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
              },
              transition: "all 0.3s ease",
            }}
            onClick={handleConfetti}
            href="/login"
          >
            Join Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
