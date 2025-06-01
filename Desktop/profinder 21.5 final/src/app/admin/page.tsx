/**
 * This code is written by Khalid as part of a university thesis project. The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the admin dashboard for the ProFinder web application. The dashboard provides administrators with tools to manage users, view reports, and analyze user registration trends. It includes features such as user blocking/unblocking, report resolution, bulk actions, and data export. The dashboard is designed to be responsive and user-friendly, with a focus on security and efficiency.
 */

"use client"; // Mark this as a Client Component since it uses browser-specific APIs.

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Switch,
  useTheme,
  Pagination,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockOpen as LockOpenIcon,
  Search as SearchIcon,
  Report as ReportIcon,
  BarChart as BarChartIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase"; // Import Firestore instance
import { useRouter } from "next/navigation"; // Import Next.js router for navigation
import {
  Chart,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2"; // Use Line for the registration trend chart
const { CSVLink } = require("react-csv");

// Register Chart.js components
Chart.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  PointElement
);

interface User {
  id: string;
  name: string;
  email: string;
  age: number; // Unix timestamp
  bio: string;
  location: string;
  area: string;
  profession: string;
  profilePictureUrl: string;
  ip: string;
  regTime: number; // Unix timestamp
  connections: string[];
  pendingConnections: string[];
  blocked: boolean;
}

interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  timestamp: number;
}

const AdminPage: React.FC = () => {
  const theme = useTheme(); // Access the theme for consistent styling
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile devices for responsive design
  const router = useRouter(); // Use Next.js router for navigation
  const [password, setPassword] = useState(""); // Store admin password
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track admin authentication
  const [users, setUsers] = useState<User[]>([]); // Store all users
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Store filtered users for search
  const [reports, setReports] = useState<Report[]>([]); // Store all reports
  const [filteredReports, setFilteredReports] = useState<Report[]>([]); // Store filtered reports for search
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Store the selected user for editing
  const [editDialogOpen, setEditDialogOpen] = useState(false); // Control the edit dialog visibility
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Control the snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Store snackbar messages
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [page, setPage] = useState(1); // Pagination for users
  const [reportsPage, setReportsPage] = useState(1); // Pagination for reports
  const [searchQuery, setSearchQuery] = useState(""); // Store search query for users
  const [reportsSearchQuery, setReportsSearchQuery] = useState(""); // Store search query for reports
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // Store selected users for bulk actions
  const [sortField, setSortField] = useState<string>("regTime"); // Store the field to sort by
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Store the sort order
  const itemsPerPage = 10; // Number of items per page

  /**
   * Fetch all users and reports from Firestore.
   * This function is called when the admin is authenticated.
   */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
      setFilteredUsers(usersData);

      // Fetch reports
      const reportsCollection = collection(db, "reports");
      const reportsSnapshot = await getDocs(reportsCollection);
      const reportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbarMessage("Failed to fetch data.");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password submission for admin authentication.
   * If the password is correct, fetch data and grant access.
   */
  const handlePasswordSubmit = () => {
    if (password === "khalid") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setSnackbarMessage("Incorrect password.");
      setSnackbarOpen(true);
    }
  };

  /**
   * Handle search for users.
   * Filter users based on the search query.
   */
  useEffect(() => {
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
    setPage(1); // Reset to the first page after search
  }, [searchQuery, users]);

  /**
   * Handle search for reports.
   * Filter reports based on the search query.
   */
  useEffect(() => {
    const filtered = reports.filter((report) =>
      Object.values(report).some((value) =>
        String(value).toLowerCase().includes(reportsSearchQuery.toLowerCase())
      )
    );
    setFilteredReports(filtered);
    setReportsPage(1); // Reset to the first page after search
  }, [reportsSearchQuery, reports]);

  /**
   * Handle user edit.
   * Open the edit dialog with the selected user's data.
   */
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  /**
   * Handle save edited user.
   * Update the user's data in Firestore and refresh the dashboard.
   */
  const handleSaveEdit = async () => {
    if (selectedUser) {
      try {
        const userRef = doc(db, "users", selectedUser.id);
        await updateDoc(userRef, {
          name: selectedUser.name,
          email: selectedUser.email,
          age: selectedUser.age,
          bio: selectedUser.bio,
          location: selectedUser.location,
          area: selectedUser.area,
          profession: selectedUser.profession,
        });
        setSnackbarMessage("User updated successfully.");
        setSnackbarOpen(true);
        fetchData(); // Refresh the data
      } catch (error) {
        console.error("Error updating user:", error);
        setSnackbarMessage("Failed to update user.");
        setSnackbarOpen(true);
      } finally {
        setEditDialogOpen(false);
      }
    }
  };

  /**
   * Handle block/unblock user.
   * Update the user's blocked status in Firestore and refresh the dashboard.
   */
  const handleBlockUser = async (userId: string, blocked: boolean) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { blocked });
      setSnackbarMessage(
        `User ${blocked ? "blocked" : "unblocked"} successfully.`
      );
      setSnackbarOpen(true);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error blocking user:", error);
      setSnackbarMessage("Failed to block user.");
      setSnackbarOpen(true);
    }
  };

  /**
   * Handle delete user.
   * Delete the user from Firestore and refresh the dashboard.
   */
  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setSnackbarMessage("User deleted successfully.");
        setSnackbarOpen(true);
        fetchData(); // Refresh the data
      } catch (error) {
        console.error("Error deleting user:", error);
        setSnackbarMessage("Failed to delete user.");
        setSnackbarOpen(true);
      }
    }
  };

  /**
   * Handle resolve report.
   * Delete the report from Firestore and refresh the dashboard.
   */
  const handleResolveReport = async (reportId: string) => {
    try {
      await deleteDoc(doc(db, "reports", reportId));
      setSnackbarMessage("Report resolved successfully.");
      setSnackbarOpen(true);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error("Error resolving report:", error);
      setSnackbarMessage("Failed to resolve report.");
      setSnackbarOpen(true);
    }
  };

  /**
   * Convert Unix timestamp to a readable date format.
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  /**
   * Convert Unix timestamp to age.
   */
  const calculateAge = (timestamp: number) => {
    const birthDate = new Date(timestamp);
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

  /**
   * Handle select/deselect all users for bulk actions.
   */
  const handleSelectAllUsers = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  /**
   * Handle select/deselect a single user for bulk actions.
   */
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  /**
   * Handle bulk actions (e.g., block, unblock, delete).
   */
  const handleBulkAction = async (action: "block" | "unblock" | "delete") => {
    if (selectedUsers.length === 0) return;
    try {
      selectedUsers.forEach(async (userId) => {
        const userRef = doc(db, "users", userId);
        if (action === "block") {
          await updateDoc(userRef, { blocked: true });
        } else if (action === "unblock") {
          await updateDoc(userRef, { blocked: false });
        } else if (action === "delete") {
          await deleteDoc(userRef);
        }
      });
      setSnackbarMessage(`Bulk ${action} completed successfully.`);
      setSnackbarOpen(true);
      fetchData(); // Refresh the data
      setSelectedUsers([]); // Clear selected users
    } catch (error) {
      console.error("Error performing bulk action:", error);
      setSnackbarMessage("Failed to perform bulk action.");
      setSnackbarOpen(true);
    }
  };

  /**
   * Handle sorting of users.
   */
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /**
   * Sort filtered users based on the selected field and order.
   */
  const sortedUsers = filteredUsers.sort((a, b) => {
    const valueA = a[sortField as keyof User];
    const valueB = b[sortField as keyof User];
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  /**
   * Paginate users for display.
   */
  const paginatedUsers = sortedUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  /**
   * Paginate reports for display.
   */
  const paginatedReports = filteredReports.slice(
    (reportsPage - 1) * itemsPerPage,
    reportsPage * itemsPerPage
  );

  /**
   * Enhanced Chart Data for Line Chart.
   * Displays user registration trends over time.
   */
  const registrationChartData = {
    labels: users.map((user) => formatDate(user.regTime)),
    datasets: [
      {
        label: "User Registrations",
        data: users.map((user) => 1),
        borderColor: theme.palette.primary.main, // Line color
        backgroundColor: theme.palette.primary.light, // Fill color
        borderWidth: 2,
        fill: true, // Fill the area under the line
        pointRadius: 4, // Size of the data points
        pointBackgroundColor: theme.palette.primary.main, // Color of the data points
        tension: 0.4, // Smoothness of the line
      },
    ],
  };

  /**
   * Chart Options for Line Chart.
   */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom height and width
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Registration Trends Over Time",
        font: {
          size: 14, // Smaller title font size
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {},
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Registration Date",
          font: {
            size: 12, // Smaller axis title font size
          },
        },
      },
      y: {
        grid: {
          color: theme.palette.divider,
        },
        title: {
          display: true,
          text: "Number of Registrations",
          font: {
            size: 12, // Smaller axis title font size
          },
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  /**
   * Render password input if the admin is not authenticated.
   */
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            sx={{
              p: 4,
              width: "100%",
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 4,
                fontWeight: "bold",
                color: theme.palette.primary.main,
              }}
            >
              Admin Login
            </Typography>
            <TextField
              label="Enter Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handlePasswordSubmit}
              disabled={!password}
            >
              Submit
            </Button>
          </Paper>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  /**
   * Render the admin dashboard.
   */
  return (
    <Container maxWidth="lg">
      <Box sx={{ marginTop: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 4, fontWeight: "bold", color: theme.palette.primary.main }}
        >
          Admin Dashboard
        </Typography>

        {/* Statistics Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BarChartIcon fontSize="large" color="primary" />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ReportIcon fontSize="large" color="secondary" />
                  <Typography variant="h6">Total Reports</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {reports.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <BlockIcon fontSize="large" color="error" />
                  <Typography variant="h6">Blocked Users</Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 2 }}>
                  {users.filter((user) => user.blocked).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Registration Chart */}
        <Paper sx={{ p: 2, mb: 4, height: 320 }}>
          {" "}
          {/* Smaller chart container */}
          <Typography variant="h6" sx={{ mb: 2, fontSize: "1rem" }}>
            {" "}
            {/* Smaller title font size */}
            User Registration Trends
          </Typography>
          <Box sx={{ height: 250 }}>
            {" "}
            {/* Smaller chart height */}
            <Line data={registrationChartData} options={chartOptions as any} />
          </Box>
        </Paper>

        {/* Users Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 2, fontWeight: "bold" }}
        >
          Users
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <TextField
            label="Search Users"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="regTime">Registration Date</MenuItem>
              <MenuItem value="connections">Connections</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            component={CSVLink}
            sx={{ color: "black" }}
            data={filteredUsers}
            filename="users.csv"
          >
            CSV
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedUsers.length > 0 &&
                      selectedUsers.length < filteredUsers.length
                    }
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAllUsers}
                  />
                </TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Connections</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell>Blocked</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={user.profilePictureUrl}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{calculateAge(user.age)}</TableCell>
                  <TableCell>{user.location}</TableCell>
                  <TableCell>{user.connections?.length || 0}</TableCell>
                  <TableCell>{formatDate(user.regTime)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.blocked}
                      onChange={(e) =>
                        handleBlockUser(user.id, e.target.checked)
                      }
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditUser(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / itemsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 2,
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <Button
              variant="contained"
              startIcon={<BlockIcon />}
              onClick={() => handleBulkAction("block")}
            >
              Block Selected
            </Button>
            <Button
              variant="contained"
              startIcon={<LockOpenIcon />}
              onClick={() => handleBulkAction("unblock")}
            >
              Unblock Selected
            </Button>
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={() => handleBulkAction("delete")}
              color="error"
            >
              Delete Selected
            </Button>
          </Box>
        )}

        {/* Reports Section */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ mt: 6, mb: 2, fontWeight: "bold" }}
        >
          Harassment Reports
        </Typography>
        <TextField
          label="Search Reports"
          variant="outlined"
          fullWidth
          value={reportsSearchQuery}
          onChange={(e) => setReportsSearchQuery(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reporter ID</TableCell>
                <TableCell>Reported User ID</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.reporterId}</TableCell>
                  <TableCell>{report.reportedUserId}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{formatDate(report.timestamp)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleResolveReport(report.id)}>
                      <CheckCircleIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredReports.length / itemsPerPage)}
            page={reportsPage}
            onChange={(_, value) => setReportsPage(value)}
            color="primary"
          />
        </Box>
      </Box>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <TextField
                label="Name"
                fullWidth
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                fullWidth
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Age"
                type="number"
                fullWidth
                value={calculateAge(selectedUser.age)}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    age: Number(e.target.value),
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Location"
                fullWidth
                value={selectedUser.location}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, location: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Bio"
                fullWidth
                value={selectedUser.bio}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, bio: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Area"
                fullWidth
                value={selectedUser.area}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, area: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Profession"
                fullWidth
                value={selectedUser.profession}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    profession: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage;
