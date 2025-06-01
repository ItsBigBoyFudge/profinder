/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the `ProfilePage` component, which serves as the user profile interface
 * for the platform. It allows users to update their profile information, manage connection
 * requests, and view their connected users. The page is designed to be responsive, ensuring
 * a seamless experience across devices.
 */

"use client"; // Marks this component as a Client Component, ensuring it runs on the client side.

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Snackbar,
  Grid,
  Paper,
  useTheme,
  Pagination,
  Skeleton,
  Collapse,
  useMediaQuery,
} from "@mui/material"; // Import Material-UI components for building the UI.
import { auth, db } from "@/firebase"; // Import Firebase authentication and Firestore database instances.
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore"; // Import Firestore functions for database operations.
import { useRouter } from "next/navigation"; // Import Next.js router for navigation.
import { useAuthState } from "react-firebase-hooks/auth"; // Import hook to track user authentication state.
import * as yup from "yup"; // Import Yup for form validation.
import { useFormik } from "formik"; // Import Formik for form management.
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // Import DatePicker for date input.
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"; // Import LocalizationProvider for date localization.
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"; // Import AdapterDateFns for date formatting.
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Description as BioIcon,
} from "@mui/icons-material"; // Import Material-UI icons for UI elements.
import { motion } from "framer-motion"; // Import Framer Motion for animations.

// Validation schema for profile update using Yup.
const profileSchema = yup.object({
  name: yup.string().required("Name is required"),
  age: yup
    .date()
    .required("Age is required")
    .test("is-adult", "You must be at least 18 years old", (value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  bio: yup.string().max(500, "Bio must be at most 500 characters"),
  location: yup.string().required("Location is required"),
  area: yup.string().required("Area is required"),
  profession: yup.string().required("Profession is required"),
});

// Predefined list of locations for the location dropdown.
const locations = [
  "Moscow",
  "Saint Petersburg",
  "Novosibirsk",
  "Yekaterinburg",
  "Kazan",
  "Nizhny Novgorod",
  "Chelyabinsk",
  "Samara",
  "Omsk",
  "Rostov-on-Don",
  "Ufa",
  "Krasnoyarsk",
  "Voronezh",
  "Perm",
  "Volgograd",
  "Globe",
];

// Interface for form values.
interface FormValues {
  name: string;
  age: Date | null;
  bio: string;
  location: string;
  area: string;
  profession: string;
  customArea: string;
  customProfession: string;
}

// Interface for pending connection requests.
interface PendingConnection {
  id: string;
  name: string;
  profilePicture: string; // URL of the profile picture
}

// Interface for connected users.
interface ConnectedUser {
  id: string;
  name: string;
  profilePicture: string; // URL of the profile picture
}

// Interface for ImgBB API response
interface ImgBBResponse {
  success: boolean;
  data: {
    url: string;
  };
}

/**
 * The `ProfilePage` component is the main interface for users to manage their profile,
 * view connection requests, and interact with connected users. It integrates with Firebase
 * for authentication and data storage, and uses Material-UI for the UI components.
 */
const ProfilePage: React.FC = () => {
  const theme = useTheme(); // Access the current theme for styling.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect if the device is mobile.
  const [user, loading] = useAuthState(auth); // Track the authenticated user.
  const [error, setError] = useState<string | null>(null); // State for error messages.
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  ); // State for profile picture URL.
  const [pendingConnections, setPendingConnections] = useState<
    PendingConnection[]
  >([]); // State for pending connection requests.
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]); // State for connected users.
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar visibility.
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for snackbar message.
  const [isUploading, setIsUploading] = useState<boolean>(false); // State for image upload status.
  const [page, setPage] = useState(1); // State for pagination.
  const [isDataLoading, setIsDataLoading] = useState(true); // State for data loading status.
  const [areas, setAreas] = useState<string[]>([]); // State for available areas.
  const [professions, setProfessions] = useState<string[]>([]); // State for available professions.
  const [isProfileExpanded, setIsProfileExpanded] = useState(true); // State for profile section expansion.
  const [isConnectionsExpanded, setIsConnectionsExpanded] = useState(true); // State for connections section expansion.
  const itemsPerPage = 5; // Number of items per page for pagination.
  const router = useRouter(); // Next.js router for navigation.

  // Fetch user data and connections on component mount or user change.
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setIsDataLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            formik.setValues({
              name: userData.name,
              age: userData.age ? new Date(userData.age) : null,
              bio: userData.bio || "",
              location: userData.location || "",
              area: userData.area || "",
              profession: userData.profession || "",
              customArea: "",
              customProfession: "",
            });
            setProfilePictureUrl(userData.profilePictureUrl || null);

            // Fetch areas and professions from all users.
            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);
            const areasSet = new Set<string>();
            const professionsSet = new Set<string>();

            usersSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.area) areasSet.add(data.area);
              if (data.profession) professionsSet.add(data.profession);
            });

            setAreas(Array.from(areasSet));
            setProfessions(Array.from(professionsSet));

            // Fetch pending connections and connected users.
            const pendingConnectionIds = userData.pendingConnections || [];
            const pendingConnectionPromises = pendingConnectionIds.map(
              async (id: string) => {
                const connectionDoc = await getDoc(doc(db, "users", id));
                if (connectionDoc.exists()) {
                  const connectionData = connectionDoc.data();
                  return {
                    id: connectionDoc.id,
                    name: connectionData.name,
                    profilePicture:
                      connectionData.profilePictureUrl ||
                      "/default-profile.png",
                  };
                }
                return null;
              }
            );

            const pendingConnectionsData = (
              await Promise.all(pendingConnectionPromises)
            ).filter(Boolean);
            setPendingConnections(
              pendingConnectionsData as PendingConnection[]
            );

            const connectedUserIds = userData.connections || [];
            const connectedUserPromises = connectedUserIds.map(
              async (id: string) => {
                const connectionDoc = await getDoc(doc(db, "users", id));
                if (connectionDoc.exists()) {
                  const connectionData = connectionDoc.data();
                  return {
                    id: connectionDoc.id,
                    name: connectionData.name,
                    profilePicture:
                      connectionData.profilePictureUrl ||
                      "/default-profile.png",
                  };
                }
                return null;
              }
            );

            const connectedUsersData = (
              await Promise.all(connectedUserPromises)
            ).filter(Boolean);
            setConnectedUsers(connectedUsersData as ConnectedUser[]);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to fetch user data. Please try again.");
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Formik configuration for profile form.
  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      age: null,
      bio: "",
      location: "",
      area: "",
      profession: "",
      customArea: "",
      customProfession: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setError(null);

      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        const area = values.area === "Other" ? values.customArea : values.area;
        const profession =
          values.profession === "Other"
            ? values.customProfession
            : values.profession;

        await updateDoc(doc(db, "users", user.uid), {
          name: values.name,
          age: values.age ? values.age.getTime() : null,
          bio: values.bio,
          location: values.location,
          area,
          profession,
        });

        setSnackbarMessage("Profile updated successfully!");
        setSnackbarOpen(true);
      } catch (error: unknown) {
        console.error("Error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again."
        );
      }
    },
  });

  // Handle profile picture upload.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      try {
        // Upload the image to ImgBB
        const imageUrl = await uploadImageToImgBB(file);
        setProfilePictureUrl(imageUrl);

        // Save the image URL to Firestore
        if (user) {
          await updateDoc(doc(db, "users", user.uid), {
            profilePictureUrl: imageUrl,
          });
        }

        setSnackbarMessage("Profile picture updated successfully!");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Upload image to ImgBB and return the URL.
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=db82bd3f16b1e9d389f9bea3b9cae862`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = (await response.json()) as ImgBBResponse;
    if (!data.success) {
      throw new Error("Failed to upload image");
    }

    return data.data.url;
  };

  // Handle accepting a connection request.
  const handleAcceptConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      const currentUserRef = doc(db, "users", user.uid);
      const connectionRef = doc(db, "users", connectionId);

      await updateDoc(currentUserRef, {
        connections: arrayUnion(connectionId),
        pendingConnections: arrayRemove(connectionId),
      });

      await updateDoc(connectionRef, {
        connections: arrayUnion(user.uid),
        pendingConnections: arrayRemove(user.uid),
      });

      setPendingConnections((prev) =>
        prev.filter((conn) => conn.id !== connectionId)
      );
      setSnackbarMessage("Connection request accepted!");
      setSnackbarOpen(true);
    } catch (error: unknown) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    }
  };

  // Handle rejecting a connection request.
  const handleRejectConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      const currentUserRef = doc(db, "users", user.uid);

      await updateDoc(currentUserRef, {
        pendingConnections: arrayRemove(connectionId),
      });

      setPendingConnections((prev) =>
        prev.filter((conn) => conn.id !== connectionId)
      );
      setSnackbarMessage("Connection request rejected!");
      setSnackbarOpen(true);
    } catch (error: unknown) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    }
  };

  // Handle deleting the user account.
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        await deleteDoc(doc(db, "users", user.uid));
        await user.delete();
        router.push("/");
      } catch (error: unknown) {
        console.error("Error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again."
        );
      }
    }
  };

  // Handle pagination change.
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Handle sending a message to a connected user.
  const handleSendMessage = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  // Paginate connected users.
  const paginatedConnectedUsers = connectedUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Show loading spinner while data is being fetched.
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Return null if no user is authenticated.
  if (!user) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          background: theme.palette.background.default,
          minHeight: "100vh",
          color: theme.palette.text.primary,
          padding: isMobile ? "1rem" : "2rem",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={isMobile ? 2 : 4}>
            {/* Left Column: Profile Information */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Paper
                  sx={{
                    p: isMobile ? 2 : 4,
                    background: theme.palette.background.paper,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[5],
                  }}
                >
                  {/* Profile Header with Avatar and Title */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <IconButton component="label" sx={{ mr: 2 }}>
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Avatar
                          src={profilePictureUrl || ""}
                          sx={{
                            width: isMobile ? 60 : 80,
                            height: isMobile ? 60 : 80,
                            border: `2px solid ${theme.palette.primary.main}`,
                          }}
                        />
                      </motion.div>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </IconButton>
                    <Typography
                      variant={isMobile ? "h4" : "h3"}
                      component="h1"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      Profile
                    </Typography>
                    <IconButton
                      onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                      sx={{ ml: "auto" }}
                    >
                      {isProfileExpanded ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={isProfileExpanded}>
                    {error && (
                      <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                        {error}
                      </Alert>
                    )}

                    <Box
                      component="form"
                      onSubmit={formik.handleSubmit}
                      sx={{ width: "100%" }}
                    >
                      <TextField
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.name && Boolean(formik.errors.name)
                        }
                        helperText={formik.touched.name && formik.errors.name}
                        fullWidth
                        margin="normal"
                        required
                        InputProps={{
                          startAdornment: (
                            <PersonIcon
                              sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            color: theme.palette.text.primary,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "8px",
                          },
                          "& .MuiInputLabel-root": {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                        <DatePicker
  label="Age"
  value={formik.values.age}
  onChange={(value) => formik.setFieldValue("age", value)}
  slotProps={{
    textField: {
      fullWidth: true,
      margin: "normal",
      error: formik.touched.age && Boolean(formik.errors.age),
      helperText: formik.touched.age && typeof formik.errors.age === 'string' 
        ? formik.errors.age 
        : undefined,
      required: true,
      sx: {
        "& .MuiInputBase-root": {
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "8px",
        },
        "& .MuiInputLabel-root": {
          color: theme.palette.text.secondary,
        },
      },
    },
  }}
/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth margin="normal" required>
                            <InputLabel
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              Location
                            </InputLabel>
                            <Select
                              name="location"
                              value={formik.values.location}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                formik.touched.location &&
                                Boolean(formik.errors.location)
                              }
                              label="Location"
                              sx={{
                                color: theme.palette.text.primary,
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: theme.palette.divider,
                                },
                                "& .MuiSvgIcon-root": {
                                  color: theme.palette.text.secondary,
                                },
                              }}
                              startAdornment={
                                <LocationIcon
                                  sx={{
                                    mr: 1,
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                              }
                            >
                              {locations.map((location) => (
                                <MenuItem
                                  key={location}
                                  value={location}
                                  sx={{ color: theme.palette.text.primary }}
                                >
                                  {location}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Area
                        </InputLabel>
                        <Select
                          name="area"
                          value={formik.values.area}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.area && Boolean(formik.errors.area)
                          }
                          label="Area"
                          sx={{
                            color: theme.palette.text.primary,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.divider,
                            },
                            "& .MuiSvgIcon-root": {
                              color: theme.palette.text.secondary,
                            },
                          }}
                          startAdornment={
                            <LocationIcon
                              sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          }
                        >
                          {areas.map((area) => (
                            <MenuItem
                              key={area}
                              value={area}
                              sx={{ color: theme.palette.text.primary }}
                            >
                              {area}
                            </MenuItem>
                          ))}
                          <MenuItem
                            value="Other"
                            sx={{ color: theme.palette.text.primary }}
                          >
                            Other
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {formik.values.area === "Other" && (
                        <TextField
                          label="Custom Area"
                          name="customArea"
                          value={formik.values.customArea}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.customArea &&
                            Boolean(formik.errors.customArea)
                          }
                          helperText={
                            formik.touched.customArea &&
                            formik.errors.customArea
                          }
                          fullWidth
                          margin="normal"
                          required
                          InputProps={{
                            startAdornment: (
                              <LocationIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              color: theme.palette.text.primary,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "8px",
                            },
                            "& .MuiInputLabel-root": {
                              color: theme.palette.text.secondary,
                            },
                          }}
                        />
                      )}
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Profession
                        </InputLabel>
                        <Select
                          name="profession"
                          value={formik.values.profession}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.profession &&
                            Boolean(formik.errors.profession)
                          }
                          label="Profession"
                          sx={{
                            color: theme.palette.text.primary,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.palette.divider,
                            },
                            "& .MuiSvgIcon-root": {
                              color: theme.palette.text.secondary,
                            },
                          }}
                          startAdornment={
                            <WorkIcon
                              sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          }
                        >
                          {professions.map((profession) => (
                            <MenuItem
                              key={profession}
                              value={profession}
                              sx={{ color: theme.palette.text.primary }}
                            >
                              {profession}
                            </MenuItem>
                          ))}
                          <MenuItem
                            value="Other"
                            sx={{ color: theme.palette.text.primary }}
                          >
                            Other
                          </MenuItem>
                        </Select>
                      </FormControl>
                      {formik.values.profession === "Other" && (
                        <TextField
                          label="Custom Profession"
                          name="customProfession"
                          value={formik.values.customProfession}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.customProfession &&
                            Boolean(formik.errors.customProfession)
                          }
                          helperText={
                            formik.touched.customProfession &&
                            formik.errors.customProfession
                          }
                          fullWidth
                          margin="normal"
                          required
                          InputProps={{
                            startAdornment: (
                              <WorkIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              color: theme.palette.text.primary,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "8px",
                            },
                            "& .MuiInputLabel-root": {
                              color: theme.palette.text.secondary,
                            },
                          }}
                        />
                      )}
                      <TextField
                        label="Bio"
                        name="bio"
                        value={formik.values.bio}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.bio && Boolean(formik.errors.bio)}
                        helperText={formik.touched.bio && formik.errors.bio}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        InputProps={{
                          startAdornment: (
                            <BioIcon
                              sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            color: theme.palette.text.primary,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: "8px",
                          },
                          "& .MuiInputLabel-root": {
                            color: theme.palette.text.secondary,
                          },
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                          mt: 3,
                          mb: 2,
                          background: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          "&:hover": {
                            background: theme.palette.primary.dark,
                          },
                        }}
                      >
                        Update Profile
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteAccount}
                        sx={{
                          mt: 1,
                          borderColor: theme.palette.divider,
                          color: theme.palette.error.main,
                        }}
                      >
                        Delete Account
                      </Button>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            </Grid>

            {/* Right Column: Connection Requests and Connected Users */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper
                  sx={{
                    p: isMobile ? 2 : 4,
                    background: theme.palette.background.paper,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[5],
                    mb: 4,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      component="h2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      New Connection Requests
                    </Typography>
                    <IconButton
                      onClick={() =>
                        setIsConnectionsExpanded(!isConnectionsExpanded)
                      }
                      sx={{ ml: "auto" }}
                    >
                      {isConnectionsExpanded ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={isConnectionsExpanded}>
                    <List>
                      {isDataLoading
                        ? // Skeleton Loader for Pending Connections
                          Array.from({ length: 3 }).map((_, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Skeleton
                                    variant="circular"
                                    width={40}
                                    height={40}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Skeleton variant="text" width="60%" />
                                  }
                                  secondary={
                                    <Skeleton variant="text" width="40%" />
                                  }
                                />
                                <Skeleton
                                  variant="rectangular"
                                  width={100}
                                  height={36}
                                  sx={{ mr: 1 }}
                                />
                                <Skeleton
                                  variant="rectangular"
                                  width={100}
                                  height={36}
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))
                        : // Actual Pending Connections List
                          pendingConnections.map((connection) => (
                            <React.Fragment key={connection.id}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar src={connection.profilePicture} />
                                </ListItemAvatar>
                                <ListItemText primary={connection.name} />
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() =>
                                    handleAcceptConnection(connection.id)
                                  }
                                  sx={{ mr: 1 }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<CancelIcon />}
                                  onClick={() =>
                                    handleRejectConnection(connection.id)
                                  }
                                >
                                  Reject
                                </Button>
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                      {!isDataLoading && pendingConnections.length === 0 && (
                        <Typography
                          variant="body1"
                          color={theme.palette.text.secondary}
                          sx={{ mt: 2 }}
                        >
                          No pending connection requests.
                        </Typography>
                      )}
                    </List>
                  </Collapse>
                </Paper>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Paper
                  sx={{
                    p: isMobile ? 2 : 4,
                    background: theme.palette.background.paper,
                    borderRadius: "16px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[5],
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      component="h2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      Connected Users
                    </Typography>
                    <IconButton
                      onClick={() =>
                        setIsConnectionsExpanded(!isConnectionsExpanded)
                      }
                      sx={{ ml: "auto" }}
                    >
                      {isConnectionsExpanded ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Collapse in={isConnectionsExpanded}>
                    <List>
                      {isDataLoading
                        ? // Skeleton Loader for Connected Users
                          Array.from({ length: 5 }).map((_, index) => (
                            <React.Fragment key={index}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Skeleton
                                    variant="circular"
                                    width={40}
                                    height={40}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Skeleton variant="text" width="60%" />
                                  }
                                  secondary={
                                    <Skeleton variant="text" width="40%" />
                                  }
                                />
                                <Skeleton
                                  variant="circular"
                                  width={40}
                                  height={40}
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))
                        : // Actual Connected Users List
                          paginatedConnectedUsers.map((user) => (
                            <React.Fragment key={user.id}>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar
                                    src={
                                      user.profilePicture ||
                                      "/default-profile.png"
                                    }
                                  />
                                </ListItemAvatar>
                                <ListItemText primary={user.name} />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSendMessage(user.id)}
                                >
                                  <MessageIcon />
                                </IconButton>
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                      {!isDataLoading && connectedUsers.length === 0 && (
                        <Typography
                          variant="body1"
                          color={theme.palette.text.secondary}
                          sx={{ mt: 2 }}
                        >
                          No connected users.
                        </Typography>
                      )}
                    </List>
                    {!isDataLoading && connectedUsers.length > itemsPerPage && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Pagination
                          count={Math.ceil(
                            connectedUsers.length / itemsPerPage
                          )}
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                          sx={{
                            "& .MuiPaginationItem-root": {
                              color: theme.palette.text.primary,
                            },
                            "& .MuiPaginationItem-root.Mui-selected": {
                              background: theme.palette.action.selected,
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Collapse>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          sx={{
            "& .MuiSnackbarContent-root": {
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
            },
          }}
          anchorOrigin={{
            vertical: isMobile ? "bottom" : "top",
            horizontal: "center",
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ProfilePage;