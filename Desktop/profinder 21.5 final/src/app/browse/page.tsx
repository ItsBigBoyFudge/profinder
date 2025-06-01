/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file implements the BrowsePage component, which serves as the main page for users
 * to discover and connect with other professionals. It includes features such as search,
 * filtering, and connection management. The page is designed to be responsive and visually
 * appealing, with animations and dynamic content loading.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  alpha,
  useTheme,
  Paper,
  Fade,
  Avatar,
  keyframes,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Work,
  Business,
  Message,
  PersonAdd,
  CheckCircle,
  HourglassEmpty,
  Person,
  Cancel,
  LinkOff,
} from "@mui/icons-material";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Interface defining the structure of a user profile
interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  area: string;
  profession: string;
  profilePicture: string; // URL from ImgBB
  connections: string[];
  pendingConnections: string[];
}

// Keyframes for gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Custom Skeleton Loader Component
const SkeletonLoader = () => {
  const theme = useTheme();
  return (
    <Grid container spacing={4}>
      {Array.from(new Array(6)).map((_, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box
              sx={{
                position: "relative",
                height: 240,
                backgroundColor: alpha(theme.palette.background.default, 0.6),
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: "40%",
                    height: 24,
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.6
                    ),
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Box
                  sx={{
                    width: "60%",
                    height: 24,
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.6
                    ),
                    borderRadius: 1,
                  }}
                />
              </Box>
              <Box
                sx={{
                  width: "80%",
                  height: 16,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 1,
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  width: "90%",
                  height: 16,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 1,
                  mb: 1,
                }}
              />
              <Box
                sx={{
                  width: "70%",
                  height: 16,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 1,
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 30,
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.6
                    ),
                    borderRadius: "20px",
                  }}
                />
                <Box
                  sx={{
                    width: 100,
                    height: 30,
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.6
                    ),
                    borderRadius: "20px",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * BrowsePage Component
 *
 * This component is the main page for users to browse and connect with other professionals.
 * It includes a search bar, filters, and a grid of user profiles. Users can send connection
 * requests, cancel pending requests, disconnect from existing connections, and send messages.
 */
const BrowsePage: React.FC = () => {
  const theme = useTheme();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    area: "",
    profession: "",
    location: "",
  });
  const [areas, setAreas] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const router = useRouter();

  // Fetch all user profiles, areas, and professions from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const profilesCollection = collection(db, "users");
      const profilesSnapshot = await getDocs(profilesCollection);
      const profilesData = profilesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Anonymous", // Default name
          age: data.age || 0,
          bio: data.bio || "", // Empty bio instead of "N/A"
          location: data.location || "Unknown Location", // Default location
          area: data.area || "Unknown Area", // Default area
          profession: data.profession || "Unknown Profession", // Default profession
          profilePicture: data.profilePictureUrl || "", // Map profilePictureUrl here
          connections: data.connections || [],
          pendingConnections: data.pendingConnections || [],
        };
      });
      setProfiles(profilesData);

      // Extract unique areas and professions
      const uniqueAreas = Array.from(
        new Set(profilesData.map((profile) => profile.area))
      );
      const uniqueProfessions = Array.from(
        new Set(profilesData.map((profile) => profile.profession))
      );
      setAreas(uniqueAreas);
      setProfessions(uniqueProfessions);

      // Set the default area filter to the current user's area
      if (currentUser) {
        const currentUserProfile = profilesData.find(
          (profile) => profile.id === currentUser.uid
        );
        if (currentUserProfile) {
          setFilters((prevFilters) => ({
            ...prevFilters,
            area: currentUserProfile.area,
          }));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  // Helper function to calculate age from Unix timestamp
  const calculateAge = (birthTimestamp: number) => {
    const birthDate = new Date(birthTimestamp);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Filter profiles based on search and filters, and exclude the current user's profile
  const filteredProfiles = profiles.filter((profile) => {
    if (currentUser && profile.id === currentUser.uid) return false;

    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.profession.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters =
      (filters.area ? profile.area === filters.area : true) &&
      (filters.profession ? profile.profession === filters.profession : true) &&
      (filters.location ? profile.location === filters.location : true);

    return matchesSearch && matchesFilters;
  });

  // Handle sending a connection request
  const handleAddFriend = async (profileId: string) => {
    if (!currentUser) return;

    const profileRef = doc(db, "users", profileId);
    await updateDoc(profileRef, {
      pendingConnections: arrayUnion(currentUser.uid),
    });

    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              pendingConnections: [
                ...profile.pendingConnections,
                currentUser.uid,
              ],
            }
          : profile
      )
    );
  };

  // Handle canceling a connection request
  const handleCancelRequest = async (profileId: string) => {
    if (!currentUser) return;

    const profileRef = doc(db, "users", profileId);
    await updateDoc(profileRef, {
      pendingConnections: arrayRemove(currentUser.uid),
    });

    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              pendingConnections: profile.pendingConnections.filter(
                (id) => id !== currentUser.uid
              ),
            }
          : profile
      )
    );
  };

  // Handle disconnecting from a user
  const handleDisconnect = async (profileId: string) => {
    if (!currentUser) return;

    const profileRef = doc(db, "users", profileId);
    await updateDoc(profileRef, {
      connections: arrayRemove(currentUser.uid),
    });

    // Also remove the current user from the other user's connections
    const currentUserRef = doc(db, "users", currentUser.uid);
    await updateDoc(currentUserRef, {
      connections: arrayRemove(profileId),
    });

    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              connections: profile.connections.filter(
                (id) => id !== currentUser.uid
              ),
            }
          : profile
      )
    );
  };

  // Handle redirecting to messages page with the selected user's ID
  const handleSendMessage = (profileId: string) => {
    router.push(`/messages/${profileId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            mb: 2,
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
            animation: `${gradientAnimation} 6s ease infinite`,
            backgroundSize: "200% 200%",
          }}
        >
          Discover Professionals
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Connect with talented individuals in your area.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Search sx={{ color: "text.secondary" }} />
          <TextField
            fullWidth
            placeholder="Search by name, area, or profession..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ "& input": { fontSize: "1.1rem" } }}
          />
        </Box>
      </Paper>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {[
          {
            label: "Area",
            icon: <Business />,
            value: filters.area,
            options: areas,
          },
          {
            label: "Profession",
            icon: <Work />,
            value: filters.profession,
            options: professions,
          },
          {
            label: "Location",
            icon: <LocationOn />,
            value: filters.location,
            options: Array.from(new Set(profiles.map((p) => p.location))),
          },
        ].map((filter) => (
          <Grid item xs={12} sm={4} key={filter.label}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filter.value}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    [filter.label.toLowerCase()]: e.target.value,
                  })
                }
                label={filter.label}
                startAdornment={
                  <Box sx={{ mr: 1, color: "text.secondary" }}>
                    {filter.icon}
                  </Box>
                }
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  },
                }}
              >
                <MenuItem value="">All {filter.label}s</MenuItem>
                {filter.options.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      {/* Profiles Grid */}
      {loading ? (
        <SkeletonLoader />
      ) : (
        <Grid container spacing={4}>
          {filteredProfiles.map((profile) => (
            <Grid item key={profile.id} xs={12} sm={6} md={4}>
              <Fade in timeout={500}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: `0 8px 32px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: `0 12px 48px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    },
                  }}
                >
                  <Box sx={{ position: "relative", height: 240 }}>
                    {profile.profilePicture ? (
                      <CardMedia
                        component="img"
                        height="240"
                        image={profile.profilePicture}
                        alt={profile.name}
                        sx={{
                          objectFit: "cover",
                          filter: "brightness(0.9)",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: theme.palette.background.default,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            fontSize: "3rem",
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }}
                        >
                          <Person sx={{ fontSize: "4rem" }} />
                        </Avatar>
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        p: 2,
                        color: "white",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {profile.name}
                      </Typography>
                      <Typography variant="subtitle2">
                        {calculateAge(profile.age)} • {profile.location}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Area and Profession Chips */}
                    <Box sx={{ mb: 2.5, display: "flex", gap: 1 }}>
                      <Chip
                        label={profile.area}
                        size="small"
                        sx={{
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                        }}
                      />
                      <Chip
                        label={profile.profession}
                        size="small"
                        sx={{
                          backgroundColor: alpha(
                            theme.palette.secondary.main,
                            0.1
                          ),
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                        }}
                      />
                    </Box>

                    {/* Bio */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontStyle: !profile.bio ? "italic" : "inherit",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {profile.bio ||
                        "This user hasn't updated their bio yet. Stay tuned!"}
                    </Typography>

                    {/* Status Buttons */}
                    {currentUser && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 2,
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {profile.connections?.includes(currentUser.uid) ? (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                backgroundColor: alpha(
                                  theme.palette.success.main,
                                  0.1
                                ),
                                color: theme.palette.success.main,
                                borderRadius: "20px",
                                padding: "12px",
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                            >
                              <CheckCircle sx={{ fontSize: "1.5rem" }} />
                              Connected
                            </Box>
                            <Button
                              variant="outlined"
                              size="large"
                              startIcon={
                                <LinkOff sx={{ fontSize: "1.5rem" }} />
                              }
                              sx={{
                                borderRadius: "20px",
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                                fontSize: "1rem",
                                fontWeight: 600,
                                padding: { xs: "12px 16px", sm: "6px 12px" },
                                minWidth: { xs: "100%", sm: "auto" },
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                  borderColor: theme.palette.error.dark,
                                },
                              }}
                              onClick={() => handleDisconnect(profile.id)}
                            >
                              Disconnect
                            </Button>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={
                                <Message sx={{ fontSize: "1.5rem" }} />
                              }
                              sx={{
                                borderRadius: "20px",
                                backgroundColor: theme.palette.primary.main,
                                color: "black",
                                fontSize: "1rem",
                                fontWeight: 600,
                                padding: { xs: "12px 16px", sm: "6px 12px" },
                                minWidth: { xs: "100%", sm: "auto" },
                                "&:hover": {
                                  backgroundColor: theme.palette.primary.dark,
                                },
                              }}
                              onClick={() => handleSendMessage(profile.id)}
                            >
                              Message
                            </Button>
                          </>
                        ) : profile.pendingConnections?.includes(
                            currentUser.uid
                          ) ? (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                backgroundColor: alpha(
                                  theme.palette.info.main,
                                  0.1
                                ),
                                color: theme.palette.info.main,
                                borderRadius: "20px",
                                padding: "12px",
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                            >
                              <HourglassEmpty sx={{ fontSize: "1.5rem" }} />
                              Request Sent
                            </Box>
                            <Button
                              variant="outlined"
                              size="large"
                              startIcon={<Cancel sx={{ fontSize: "1.5rem" }} />}
                              sx={{
                                borderRadius: "20px",
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                                fontSize: "1rem",
                                fontWeight: 600,
                                padding: "12px 16px",
                                textTransform: "none",
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                  borderColor: theme.palette.error.dark,
                                },
                              }}
                              onClick={() => handleCancelRequest(profile.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={
                              <PersonAdd sx={{ fontSize: "1.5rem" }} />
                            }
                            sx={{
                              borderRadius: "20px",
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              fontSize: "1rem",
                              fontWeight: 600,
                              padding: "12px 16px",
                              textTransform: "none",
                              minWidth: "100%",
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                              },
                            }}
                            onClick={() => handleAddFriend(profile.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BrowsePage;
