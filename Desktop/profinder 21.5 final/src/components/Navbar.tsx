"use client";

/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file contains the implementation of the Navbar component, which serves as the
 * primary navigation bar for the web application. The Navbar provides users with
 * access to key features such as browsing, messaging, profile management, and logging out.
 * It dynamically adjusts its appearance based on the user's authentication status and
 * whether the user is on an admin page.
 */

import React, { useEffect, useState } from "react";
import {
  AppBar,
  alpha,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { auth } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

// Interface defining the structure of user data
interface UserData {
  name: string;
  email: string;
  photoURL?: string;
  profilePictureUrl?: string;
}

/**
 * Navbar Component
 *
 * This component is responsible for rendering the navigation bar at the top of the application.
 * It includes functionality for user authentication, navigation, and profile management.
 */
const Navbar: React.FC = () => {
  const theme = useTheme(); // Access the theme for consistent styling
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if the device is mobile
  const { currentUser, loading } = useAuth(); // Access the current user and loading state from the authentication context
  const router = useRouter(); // Router for navigation
  const pathname = usePathname(); // Current pathname for conditional rendering
  const [userData, setUserData] = useState<UserData | null>(null); // State to store user data
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State to manage the menu anchor element

  // Fetch user data from Firestore when the currentUser changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  // Handle opening the user menu
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the user menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      router.push("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error logging out:", error); // Log any errors
    }
    handleClose(); // Close the menu
  };

  // Display a loading state while the authentication status is being determined
  if (loading) {
    return (
      <Box className="flex h-16 items-center justify-center">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Check if the current page is an admin page
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: isAdminPage
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
            : theme.palette.background.default,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: isAdminPage
            ? `0 4px 30px ${alpha(theme.palette.primary.main, 0.1)}`
            : theme.shadows[3],
          backdropFilter: isAdminPage ? "blur(20px)" : "none",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "64px",
            justifyContent: "space-between",
            padding: isMobile ? "0 8px" : "0 16px",
          }}
        >
          {/* Application Logo */}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            onClick={() => router.push("/")}
            sx={{
              fontWeight: 700,
              background: isAdminPage
                ? `linear-gradient(90deg, ${
                    theme.palette.common.white
                  } 0%, ${alpha(theme.palette.common.white, 0.8)} 100%)`
                : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              cursor: "pointer",
            }}
          >
            ProFinder
          </Typography>

          {/* Conditional rendering based on user authentication status */}
          {currentUser ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 0.5 : 1,
              }}
            >
              {isAdminPage ? (
                <>
                  {!isMobile && (
                    <Typography
                      variant="h6"
                      sx={{ color: theme.palette.common.white }}
                    >
                      Admin Dashboard
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => router.push("/browse")}
                    sx={{
                      ml: isMobile ? 1 : 2,
                      background: alpha(theme.palette.common.white, 0.1),
                      color: theme.palette.common.white,
                      "&:hover": {
                        background: alpha(theme.palette.common.white, 0.2),
                      },
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      padding: isMobile ? "4px 8px" : "6px 16px",
                    }}
                  >
                    {isMobile ? "User View" : "Back to User Account"}
                  </Button>
                </>
              ) : (
                <>
                  {/* Browse Button */}
                  <Tooltip title="Browse">
                    <IconButton
                      onClick={() => router.push("/browse")}
                      sx={{
                        color: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: "12px",
                        padding: "8px",
                        "&:hover": {
                          background: alpha(theme.palette.primary.main, 0.2),
                          transform: "translateY(-2px)",
                          transition: "all 0.2s ease-in-out",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        },
                      }}
                    >
                      <HomeRoundedIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </IconButton>
                  </Tooltip>

                  {/* Messages Button */}
                  <Tooltip title="Messages">
                    <IconButton
                      onClick={() =>
                        router.push(`/messages/${currentUser.uid}`)
                      }
                      sx={{
                        color: theme.palette.secondary.main,
                        background: alpha(theme.palette.secondary.main, 0.1),
                        borderRadius: "12px",
                        padding: "8px",
                        "&:hover": {
                          background: alpha(theme.palette.secondary.main, 0.2),
                          transform: "translateY(-2px)",
                          transition: "all 0.2s ease-in-out",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.secondary.main,
                            0.2
                          )}`,
                        },
                      }}
                    >
                      <MailRoundedIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </IconButton>
                  </Tooltip>

                  {/* About Button */}
                  <Tooltip title="About">
                    <IconButton
                      onClick={() => router.push("/about")}
                      sx={{
                        color: theme.palette.info.main,
                        background: alpha(theme.palette.info.main, 0.1),
                        borderRadius: "12px",
                        padding: "8px",
                        "&:hover": {
                          background: alpha(theme.palette.info.main, 0.2),
                          transform: "translateY(-2px)",
                          transition: "all 0.2s ease-in-out",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.info.main,
                            0.2
                          )}`,
                        },
                      }}
                    >
                      <InfoRoundedIcon
                        fontSize={isMobile ? "small" : "medium"}
                      />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              {/* User Profile Section */}
              <Box
                sx={{
                  ml: isMobile ? 1 : 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  background: isAdminPage
                    ? alpha(theme.palette.common.white, 0.1)
                    : alpha(theme.palette.primary.main, 0.1),
                  padding: isMobile ? "4px 8px" : "6px 16px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  border: `1px solid ${
                    isAdminPage
                      ? alpha(theme.palette.common.white, 0.2)
                      : alpha(theme.palette.primary.main, 0.2)
                  }`,
                  "&:hover": {
                    background: isAdminPage
                      ? alpha(theme.palette.common.white, 0.15)
                      : alpha(theme.palette.primary.main, 0.15),
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                }}
                onClick={handleMenu}
              >
                <Avatar
                  alt={userData?.name || currentUser.email || "User"}
                  src={
                    userData?.profilePictureUrl ||
                    userData?.photoURL ||
                    currentUser.photoURL ||
                    ""
                  }
                  sx={{
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32,
                    border: `2px solid ${
                      isAdminPage
                        ? theme.palette.common.white
                        : theme.palette.primary.main
                    }`,
                  }}
                />
                {!isMobile && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: isAdminPage
                        ? theme.palette.common.white
                        : theme.palette.text.primary,
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {userData?.name || currentUser.email || "User"}
                  </Typography>
                )}
              </Box>

              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: {
                    width: "200px",
                    mt: 1,
                    background: isAdminPage
                      ? alpha(theme.palette.primary.dark, 0.9)
                      : theme.palette.background.paper,
                    border: `1px solid ${
                      isAdminPage
                        ? alpha(theme.palette.common.white, 0.2)
                        : alpha(theme.palette.primary.main, 0.2)
                    }`,
                    borderRadius: "12px",
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    overflow: "hidden",
                    "& .MuiMenuItem-root": {
                      padding: "8px 16px",
                      color: isAdminPage
                        ? theme.palette.common.white
                        : theme.palette.text.primary,
                      "&:hover": {
                        background: isAdminPage
                          ? alpha(theme.palette.common.white, 0.1)
                          : alpha(theme.palette.primary.main, 0.1),
                      },
                      "& svg": {
                        marginRight: "12px",
                      },
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    router.push("/profile");
                    handleClose();
                  }}
                >
                  <PersonRoundedIcon
                    fontSize="small"
                    sx={{
                      color: isAdminPage
                        ? theme.palette.common.white
                        : theme.palette.primary.main,
                    }}
                  />
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: theme.palette.error.main,
                  }}
                >
                  <ExitToAppRoundedIcon fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            // Login and About Buttons for unauthenticated users
            <Box sx={{ display: "flex", gap: isMobile ? 1 : 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonRoundedIcon />}
                onClick={() => router.push("/login")}
                sx={{
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  borderRadius: "12px",
                  textTransform: "none",
                  px: isMobile ? 2 : 3,
                  py: 1,
                  "&:hover": {
                    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                startIcon={<InfoRoundedIcon />}
                onClick={() => router.push("/about")}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  px: isMobile ? 2 : 3,
                  py: 1,
                  "&:hover": {
                    borderColor: theme.palette.primary.dark,
                    background: alpha(theme.palette.primary.main, 0.1),
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                About
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ height: "1px" }} />
    </>
  );
};

export default Navbar;
