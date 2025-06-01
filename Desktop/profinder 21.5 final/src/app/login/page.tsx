/**
 * This code is written by Khalid as part of a university thesis project. The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the login and registration page for the ProFinder web application. It allows users to either log in with their existing credentials or register as new users. The page includes form validation, error handling, and integration with Firebase for authentication and user data storage.
 */

"use client"; // Mark this as a Client Component since it uses browser-specific APIs.

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
  Paper,
  useTheme,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebase"; // Import Firebase authentication and Firestore instances
import { useRouter } from "next/navigation"; // Import Next.js router for navigation
import * as yup from "yup"; // Import Yup for form validation
import { useFormik } from "formik"; // Import Formik for form management
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // Import DatePicker for age input
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"; // Import LocalizationProvider for date handling
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"; // Import AdapterDateFns for date formatting

/**
 * Validation schema for the login form.
 * Ensures the email is valid and the password is provided.
 */
const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

/**
 * Validation schema for the registration form.
 * Ensures all required fields are filled and validates the user's age (must be at least 18).
 */
const registerSchema = yup.object({
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
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  area: yup.string().required("Area is required"),
  profession: yup.string().required("Profession is required"),
  location: yup.string().required("Location is required"), // Location is required for registration
});

/**
 * List of Russian cities and "Globe" for the location dropdown.
 * Users can select their location or choose "Globe" if they are not in Russia.
 */
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
  "Globe", // Option for users not in Russia
];

const LoginPage: React.FC = () => {
  const theme = useTheme(); // Access the theme for consistent styling
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile devices for responsive design
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and registration forms
  const [error, setError] = useState<string | null>(null); // Store error messages
  const [areas, setAreas] = useState<string[]>([]); // Store available areas for dropdown
  const [professions, setProfessions] = useState<string[]>([]); // Store available professions for dropdown
  const [isLoading, setIsLoading] = useState(false); // Track loading state during form submission
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Track if the user is already logged in
  const router = useRouter(); // Use Next.js router for navigation

  /**
   * Check if the user is already logged in.
   * If logged in, redirect them to the browse page.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserLoggedIn(true);
        router.push("/browse"); // Redirect to the browse page if the user is logged in
      } else {
        setIsUserLoggedIn(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  /**
   * Fetch areas and professions from the Firestore users collection.
   * This populates the dropdowns for area and profession during registration.
   */
  useEffect(() => {
    const fetchAreasAndProfessions = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);

        const areasSet = new Set<string>();
        const professionsSet = new Set<string>();

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.area) areasSet.add(userData.area);
          if (userData.profession) professionsSet.add(userData.profession);
        });

        setAreas(Array.from(areasSet));
        setProfessions(Array.from(professionsSet));
      } catch (error) {
        console.error("Error fetching areas and professions:", error);
      }
    };

    fetchAreasAndProfessions();
  }, []);

  /**
   * Formik configuration for form management and validation.
   * Handles form submission, validation, and error messages.
   */
  const formik = useFormik({
    initialValues: {
      name: "",
      age: null,
      email: "",
      password: "",
      area: "",
      profession: "",
      customArea: "",
      customProfession: "",
      location: "", // Location field for registration
    },
    validationSchema: isLogin ? loginSchema : registerSchema,
    onSubmit: async (values) => {
      setError(null); // Clear previous errors
      setIsLoading(true);

      try {
        if (isLogin) {
          // Login logic
          await signInWithEmailAndPassword(auth, values.email, values.password);
          router.push("/browse"); // Redirect to the browse page after login
        } else {
          // Registration logic
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password
          );
          const user = userCredential.user;

          // Fetch user IP address for logging
          const ipResponse = await fetch("https://api.ipify.org?format=json");
          const ipData = await ipResponse.json();
          const ip = ipData.ip;

          // Save user data to Firestore
          await setDoc(doc(db, "users", user.uid), {
            name: values.name,
            age: values.age ? new Date(values.age).getTime() : null, // Save age as Unix timestamp
            email: values.email,
            area: values.customArea || values.area,
            profession: values.customProfession || values.profession,
            location: values.location, // Save location to Firestore
            regTime: Date.now(), // Save registration time as Unix timestamp
            ip, // Save user IP address
          });

          router.push("/browse"); // Redirect to the browse page after registration
        }
      } catch (error: any) {
        console.error("Error:", error);
        setError(error.message || "An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // If the user is logged in, don't render the login/register form
  if (isUserLoggedIn) {
    return null; // Or a loading spinner
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: isMobile ? 4 : 8,
            marginBottom: isMobile ? 4 : 8, // Add margin at the bottom
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: isMobile ? 2 : 0, // Add padding for mobile
          }}
        >
          <Paper
            sx={{
              p: isMobile ? 2 : 4,
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"} // Adjust typography for mobile
              component="h1"
              sx={{
                mb: 4,
                fontWeight: "bold",
                color: theme.palette.primary.main,
              }}
            >
              {isLogin ? "Login" : "Register"}
            </Typography>
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
              {!isLogin && (
                <>
                  <TextField
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <DatePicker
                    label="Age"
                    value={formik.values.age}
                    onChange={(value) => formik.setFieldValue("age", value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: formik.touched.age && Boolean(formik.errors.age),
                        helperText: formik.touched.age && formik.errors.age,
                        required: true,
                      },
                    }}
                  />
                </>
              )}
              <TextField
                label="Email"
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                fullWidth
                margin="normal"
                required
              />
              {!isLogin && (
                <>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Area</InputLabel>
                    <Select
                      name="area"
                      value={formik.values.area}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.area && Boolean(formik.errors.area)}
                      label="Area"
                    >
                      {areas.map((area) => (
                        <MenuItem key={area} value={area}>
                          {area}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other</MenuItem>
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
                        formik.touched.customArea && formik.errors.customArea
                      }
                      fullWidth
                      margin="normal"
                      required
                    />
                  )}
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Profession</InputLabel>
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
                    >
                      {professions.map((profession) => (
                        <MenuItem key={profession} value={profession}>
                          {profession}
                        </MenuItem>
                      ))}
                      <MenuItem value="Other">Other</MenuItem>
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
                    />
                  )}
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Location</InputLabel>
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
                    >
                      {locations.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </Button>
              <Button
                fullWidth
                onClick={() => setIsLogin(!isLogin)}
                sx={{ mt: 1 }}
              >
                {isLogin
                  ? "Create an account"
                  : "Already have an account? Login"}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default LoginPage;
