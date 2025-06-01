/**
 * This code is written by Khalid as part of a university thesis project.
 * The explanations are provided to offer guidance on the project's implementation.
 *
 * This file defines the `MessagesPage` component, which serves as the messaging interface
 * for the platform. It allows users to send and receive messages, manage connections,
 * and interact with other users. The page is designed to be responsive, ensuring a seamless
 * experience across devices.
 */

"use client"; // Marks this component as a Client Component, ensuring it runs on the client side.

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Container,
  Fade,
  Drawer,
  Avatar,
  Paper,
  IconButton,
  alpha,
  Popover,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Skeleton,
} from "@mui/material"; // Import Material-UI components for building the UI.
import { db } from "@/firebase"; // Import Firebase Firestore database instance.
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  orderBy,
  deleteDoc,
} from "firebase/firestore"; // Import Firestore functions for database operations.
import { useAuth } from "@/context/AuthContext"; // Import AuthContext to access the current authenticated user.
import { useRouter, useParams } from "next/navigation"; // Import Next.js router and params for navigation.
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"; // Emoji picker library for reactions.
import MenuIcon from "@mui/icons-material/Menu"; // Icon for mobile menu.
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CloseIcon from "@mui/icons-material/Close"; // Close icon for mobile drawer.

// Interface for User data
interface User {
  id: string;
  name: string;
  age: number; // Age in years (not timestamp)
  bio: string;
  location: string;
  area: string;
  profession: string;
  profilePictureUrl: string; // URL from ImgBB
  connections: string[];
  pendingConnections: string[];
  blockedUsers?: string[]; // New field for blocked users
}

// Interface for Message data
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  seen: boolean; // New field for seen status
  reactions?: { [userId: string]: string }; // New field for reactions
  isDeleted?: boolean; // New field for deleted messages
  edited?: boolean; // New field for edited messages
}

// Interface for Report data
interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  timestamp: number;
}

/**
 * The `MessagesPage` component is the main interface for users to send and receive messages,
 * manage connections, and interact with other users. It integrates with Firebase for real-time
 * messaging and uses Material-UI for the UI components.
 */
const MessagesPage: React.FC = () => {
  const theme = useTheme(); // Use the theme for styling.
  const { currentUser } = useAuth(); // Get the current authenticated user.
  const params = useParams(); // Get the user ID from the URL parameter.
  const userId = params.userId as string; // Extract userId from params.
  const [users, setUsers] = useState<User[]>([]); // List of connected users.
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Selected user for chat.
  const [messages, setMessages] = useState<Message[]>([]); // Messages in the selected chat.
  const [newMessage, setNewMessage] = useState(""); // New message input.
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null); // Track message being edited.
  const [editingMessageText, setEditingMessageText] = useState(""); // Track text of the message being edited.
  const [reactionPickerAnchor, setReactionPickerAnchor] =
    useState<HTMLElement | null>(null); // Anchor for reaction emoji picker.
  const [messagePickerAnchor, setMessagePickerAnchor] =
    useState<HTMLElement | null>(null); // Anchor for message emoji picker.
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  ); // Track message for reaction.
  const [isBlocked, setIsBlocked] = useState(false); // Track if the selected user is blocked by current user.
  const [isBlockedByThem, setIsBlockedByThem] = useState(false); // Track if current user is blocked by selected user.
  const [isReported, setIsReported] = useState(false); // Track if the selected user is reported.
  const [isChatListOpen, setIsChatListOpen] = useState(false); // Track if the chat list is open on mobile.
  const [unreadMessages, setUnreadMessages] = useState<{
    [userId: string]: number;
  }>({}); // Track unread messages.
  const [lastMessages, setLastMessages] = useState<{
    [userId: string]: { text: string; senderId: string };
  }>({}); // Track last messages for each user.
  const [loading, setLoading] = useState(true); // Track loading state.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile devices.
  const router = useRouter(); // Next.js router for navigation.

  // Helper function to check if a user is blocked by another user
  const isUserBlocked = async (blockerId: string, blockedId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", blockerId));
      if (userDoc.exists()) {
        const blockedUsers = userDoc.data().blockedUsers || [];
        return blockedUsers.includes(blockedId);
      }
      return false;
    } catch (error) {
      console.error("Error checking block status:", error);
      return false;
    }
  };

  // Helper function to check mutual blocking status
  const checkMutualBlockStatus = async (user1Id: string, user2Id: string) => {
    const [user1BlocksUser2, user2BlocksUser1] = await Promise.all([
      isUserBlocked(user1Id, user2Id),
      isUserBlocked(user2Id, user1Id),
    ]);
    return { user1BlocksUser2, user2BlocksUser1 };
  };

  // Fetch the list of connected users
  useEffect(() => {
    const fetchConnectedUsers = async () => {
      if (!currentUser) return;

      try {
        // Fetch the current user's document from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const connectedUserIds = userData.connections || [];

          // Fetch details of all connected users
          const userPromises = connectedUserIds.map(async (userId: string) => {
            const connectedUserDoc = await getDoc(doc(db, "users", userId));
            if (connectedUserDoc.exists()) {
              const connectedUserData = connectedUserDoc.data();
              return {
                id: connectedUserDoc.id,
                name: connectedUserData.name,
                age: connectedUserData.age, // Age in years (not timestamp)
                bio: connectedUserData.bio,
                location: connectedUserData.location,
                area: connectedUserData.area,
                profession: connectedUserData.profession,
                profilePictureUrl:
                  connectedUserData.profilePictureUrl || "/default-profile.png",
                connections: connectedUserData.connections || [],
                pendingConnections: connectedUserData.pendingConnections || [],
                blockedUsers: connectedUserData.blockedUsers || [], // Initialize blockedUsers
              };
            }
            return null;
          });

          // Filter out null values and set the connected users
          const connectedUsers = (await Promise.all(userPromises)).filter(
            Boolean
          );
          setUsers(connectedUsers as User[]);

          // If a user ID is provided in the URL, set that user as the selected user
          if (userId) {
            const selectedUser = connectedUsers.find(
              (user) => user?.id === userId
            );
            if (selectedUser) {
              setSelectedUser(selectedUser);
              
              // Check blocking status for the selected user
              const blockStatus = await checkMutualBlockStatus(currentUser.uid, selectedUser.id);
              setIsBlocked(blockStatus.user1BlocksUser2);
              setIsBlockedByThem(blockStatus.user2BlocksUser1);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching connected users:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching users
      }
    };

    fetchConnectedUsers();
  }, [currentUser, userId]);

  // Update block status when selected user changes
  useEffect(() => {
    const updateBlockStatus = async () => {
      if (!currentUser || !selectedUser) return;

      try {
        const blockStatus = await checkMutualBlockStatus(currentUser.uid, selectedUser.id);
        setIsBlocked(blockStatus.user1BlocksUser2);
        setIsBlockedByThem(blockStatus.user2BlocksUser1);
      } catch (error) {
        console.error("Error updating block status:", error);
      }
    };

    updateBlockStatus();
  }, [currentUser, selectedUser]);

  // Fetch messages for the selected user with block filtering
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    // Query messages between the current user and the selected user
    const messagesQuery = query(
      collection(db, "messages"),
      where("senderId", "in", [currentUser.uid, selectedUser.id]),
      where("receiverId", "in", [currentUser.uid, selectedUser.id]),
      orderBy("timestamp", "asc")
    );

    // Subscribe to real-time updates for the messages
    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      try {
        // Check current block status
        const blockStatus = await checkMutualBlockStatus(currentUser.uid, selectedUser.id);
        
        // If either user has blocked the other, don't show any messages
        if (blockStatus.user1BlocksUser2 || blockStatus.user2BlocksUser1) {
          setMessages([]);
          return;
        }

        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          senderId: doc.data().senderId,
          receiverId: doc.data().receiverId,
          text: doc.data().text,
          timestamp: doc.data().timestamp?.toDate().getTime() || 0,
          seen: doc.data().seen || false,
          reactions: doc.data().reactions || {},
          isDeleted: doc.data().isDeleted || false,
          edited: doc.data().edited || false,
        }));

        // Mark messages as seen if the current user is the receiver and not blocked
        const batch = writeBatch(db);
        messagesData.forEach((message) => {
          if (message.receiverId === currentUser.uid && !message.seen) {
            const messageRef = doc(db, "messages", message.id);
            batch.update(messageRef, { seen: true });
          }
        });
        await batch.commit();

        setMessages(messagesData);

        // Update unread messages count
        const unreadCount = messagesData.filter(
          (message) => message.receiverId === currentUser.uid && !message.seen
        ).length;
        setUnreadMessages((prev) => ({
          ...prev,
          [selectedUser.id]: unreadCount,
        }));

        // Update last message for the selected user
        const lastMessage = messagesData[messagesData.length - 1];
        if (lastMessage) {
          setLastMessages((prev) => ({
            ...prev,
            [selectedUser.id]: {
              text: lastMessage.text,
              senderId: lastMessage.senderId,
            },
          }));
        }
      } catch (error) {
        console.error("Error processing messages:", error);
      }
    });

    return () => unsubscribe(); // Unsubscribe from the snapshot listener when the component unmounts
  }, [currentUser, selectedUser]);

  // Update last messages and unread counts for all users with block filtering
  useEffect(() => {
    if (!currentUser) return;

    const updateLastMessagesAndUnreadCounts = async () => {
      const updatedLastMessages: {
        [userId: string]: { text: string; senderId: string };
      } = {};
      const updatedUnreadMessages: { [userId: string]: number } = {};

      for (const user of users) {
        try {
          // Check if either user has blocked the other
          const blockStatus = await checkMutualBlockStatus(currentUser.uid, user.id);
          
          // If either user has blocked the other, skip this user
          if (blockStatus.user1BlocksUser2 || blockStatus.user2BlocksUser1) {
            updatedUnreadMessages[user.id] = 0;
            continue;
          }

          const messagesQuery = query(
            collection(db, "messages"),
            where("senderId", "in", [currentUser.uid, user.id]),
            where("receiverId", "in", [currentUser.uid, user.id]),
            orderBy("timestamp", "asc")
          );

          const messagesSnapshot = await getDocs(messagesQuery);
          const messagesData = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            senderId: doc.data().senderId,
            receiverId: doc.data().receiverId,
            text: doc.data().text,
            timestamp: doc.data().timestamp?.toDate().getTime() || 0,
            seen: doc.data().seen || false,
            reactions: doc.data().reactions || {},
            isDeleted: doc.data().isDeleted || false,
            edited: doc.data().edited || false,
          }));

          const lastMessage = messagesData[messagesData.length - 1];
          if (lastMessage) {
            updatedLastMessages[user.id] = {
              text: lastMessage.text,
              senderId: lastMessage.senderId,
            };
          }

          const unreadCount = messagesData.filter(
            (message) => message.receiverId === currentUser.uid && !message.seen
          ).length;
          updatedUnreadMessages[user.id] = unreadCount;
        } catch (error) {
          console.error(`Error updating messages for user ${user.id}:`, error);
          updatedUnreadMessages[user.id] = 0;
        }
      }

      setLastMessages(updatedLastMessages);
      setUnreadMessages(updatedUnreadMessages);
    };

    updateLastMessagesAndUnreadCounts();
  }, [currentUser, users]);

  // Handle sending a new message with block checking
  const handleSendMessage = async () => {
    if (!currentUser || !selectedUser || !newMessage.trim()) return;

    try {
      // Check if either user has blocked the other
      const blockStatus = await checkMutualBlockStatus(currentUser.uid, selectedUser.id);
      
      if (blockStatus.user2BlocksUser1) {
        alert("Cannot send message. You have been blocked by this user.");
        return;
      }

      if (blockStatus.user1BlocksUser2) {
        alert("Cannot send message. You have blocked this user. Unblock them first.");
        return;
      }

      // Add a new message to the Firestore collection
      await addDoc(collection(db, "messages"), {
        senderId: currentUser.uid,
        receiverId: selectedUser.id,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        seen: false,
        reactions: {},
        isDeleted: false,
        edited: false,
      });

      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handle adding a reaction to a message
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const reactions = messageDoc.data().reactions || {};
        reactions[currentUser.uid] = emoji; // Add/update reaction
        await updateDoc(messageRef, { reactions });
      }
      setReactionPickerAnchor(null); // Close the emoji picker
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, { isDeleted: true });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle editing a message
  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!currentUser) return;

    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, { text: newText, edited: true });
      setEditingMessageId(null); // Exit edit mode
      setEditingMessageText(""); // Clear the edit text
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText("");
  };

  // Handle blocking a user
  const handleBlockUser = async (userId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid); // Reference to the current user's document
      const userDoc = await getDoc(userRef); // Fetch the current user's document

      if (userDoc.exists()) {
        const blockedUsers = userDoc.data().blockedUsers || []; // Get the current list of blocked users
        if (!blockedUsers.includes(userId)) {
          // Add the user to the blocked list if they're not already blocked
          await updateDoc(userRef, { blockedUsers: [...blockedUsers, userId] });
          setIsBlocked(true);
          setMessages([]); // Clear messages when blocking
          alert("User blocked successfully.");
        } else {
          alert("User is already blocked.");
        }
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user. Please try again.");
    }
  };

  // Handle unblocking a user
  const handleUnblockUser = async (userId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid); // Reference to the current user's document
      const userDoc = await getDoc(userRef); // Fetch the current user's document

      if (userDoc.exists()) {
        const blockedUsers = userDoc.data().blockedUsers || []; // Get the current list of blocked users
        if (blockedUsers.includes(userId)) {
          // Remove the user from the blocked list
          const updatedBlockedUsers = blockedUsers.filter(
            (id: string) => id !== userId
          );
          await updateDoc(userRef, { blockedUsers: updatedBlockedUsers });
          setIsBlocked(false);
          alert("User unblocked successfully.");
        } else {
          alert("User is not blocked.");
        }
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user. Please try again.");
    }
  };

  // Handle reporting a user
  const handleReportUser = async (reportedUserId: string, reason: string) => {
    if (!currentUser) return;

    try {
      // Add a new report to the "reports" collection
      await addDoc(collection(db, "reports"), {
        reporterId: currentUser.uid, // ID of the user reporting
        reportedUserId, // ID of the user being reported
        reason, // Reason for the report (e.g., "Spam", "Harassment")
        timestamp: serverTimestamp(), // Timestamp of the report
      });
      setIsReported(true);
      alert("User reported successfully.");
    } catch (error) {
      console.error("Error reporting user:", error);
      alert("Failed to report user. Please try again.");
    }
  };

  // Handle unreporting a user
  const handleUnreportUser = async (reportedUserId: string) => {
    if (!currentUser) return;

    try {
      // Find and delete the report document
      const reportsQuery = query(
        collection(db, "reports"),
        where("reporterId", "==", currentUser.uid),
        where("reportedUserId", "==", reportedUserId)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      reportsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setIsReported(false);
      alert("User unreported successfully.");
    } catch (error) {
      console.error("Error unreporting user:", error);
      alert("Failed to unreport user. Please try again.");
    }
  };

  // Handle deleting entire chat history
  const handleDeleteChatHistory = async () => {
    if (!currentUser || !selectedUser) return;

    try {
      // Query all messages between the current user and the selected user
      const messagesQuery = query(
        collection(db, "messages"),
        where("senderId", "in", [currentUser.uid, selectedUser.id]),
        where("receiverId", "in", [currentUser.uid, selectedUser.id])
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      // Delete all messages
      const batch = writeBatch(db);
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      alert("Chat history deleted successfully.");
      setMessages([]); // Clear the messages state
    } catch (error) {
      console.error("Error deleting chat history:", error);
      alert("Failed to delete chat history. Please try again.");
    }
  };

  // Handle opening the reaction emoji picker
  const handleOpenReactionPicker = (
    event: React.MouseEvent<HTMLElement>,
    messageId: string
  ) => {
    setSelectedMessageId(messageId);
    setReactionPickerAnchor(event.currentTarget);
  };

  // Handle opening the message emoji picker
  const handleOpenMessagePicker = (event: React.MouseEvent<HTMLElement>) => {
    setMessagePickerAnchor(event.currentTarget);
  };

  // Handle inserting an emoji into the message input
  const handleInsertEmoji = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setMessagePickerAnchor(null); // Close the emoji picker
  };

  // Toggle chat list visibility on mobile
  const toggleChatList = () => {
    setIsChatListOpen(!isChatListOpen);
  };

  // Format age from timestamp to years
  const formatAge = (age: number) => {
    const birthDate = new Date(age);
    const currentDate = new Date();
    const years = currentDate.getFullYear() - birthDate.getFullYear();
    return years;
  };

  // Get the last message for a user (only if not blocked)
  const getLastMessage = (userId: string) => {
    const lastMessage = lastMessages[userId];
    if (!lastMessage) return "No messages yet";
    const senderName =
      lastMessage.senderId === currentUser?.uid
        ? "You"
        : users.find((user) => user.id === userId)?.name || "User";
    return `${senderName}: ${
      lastMessage.text.length > 20
        ? lastMessage.text.slice(0, 20) + "..."
        : lastMessage.text
    }`;
  };

  // Determine if messaging is disabled
  const isMessagingDisabled = isBlocked || isBlockedByThem || isReported;

  return (
    <Container maxWidth="lg" sx={{ height: "100vh", py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "background.paper",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {/* Chat List Panel */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? isChatListOpen : true}
          onClose={() => setIsChatListOpen(false)}
          sx={{
            width: isMobile ? "100%" : 320,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: isMobile ? "100%" : 320,
              position: "relative",
              border: "none",
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body1">Messages</Typography>
              {isMobile && (
                <IconButton onClick={() => setIsChatListOpen(false)}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box sx={{ overflow: "auto", px: 2, py: 1 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{ p: 2, mb: 1, display: "flex", alignItems: "center" }}
                  >
                    <Skeleton
                      variant="circular"
                      width={44}
                      height={44}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                ))
              : users.map((user) => (
                  <Fade in key={user.id}>
                    <Box
                      onClick={() => {
                        setSelectedUser(user);
                        setIsChatListOpen(false);
                        setUnreadMessages((prev) => ({
                          ...prev,
                          [user.id]: 0,
                        })); // Reset unread count
                      }}
                      sx={{
                        p: 2,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor:
                          selectedUser?.id === user.id
                            ? alpha(theme.palette.primary.main, 0.08)
                            : "transparent",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <Badge
                        badgeContent={unreadMessages[user.id] || 0}
                        color="primary"
                        sx={{ mr: 2 }}
                      >
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="subtitle1">
                                {user.name}
                              </Typography>
                              <Typography variant="body2">
                                Age: {formatAge(user.age)}
                              </Typography>
                              <Typography variant="body2">
                                Bio: {user.bio}
                              </Typography>
                              <Typography variant="body2">
                                Location: {user.location}
                              </Typography>
                              <Typography variant="body2">
                                Area: {user.area}
                              </Typography>
                              <Typography variant="body2">
                                Profession: {user.profession}
                              </Typography>
                            </Box>
                          }
                          arrow
                        >
                          <Avatar
                            src={user.profilePictureUrl}
                            sx={{ width: 44, height: 44 }}
                          />
                        </Tooltip>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getLastMessage(user.id)}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                ))}
          </Box>
        </Drawer>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: `1px solid ${alpha(
                    theme.palette.divider,
                    0.1
                  )}`,
                }}
              >
                {isMobile && (
                  <IconButton
                    onClick={() => setIsChatListOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}

                <Tooltip
                  title={
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedUser.name}
                      </Typography>
                      <Typography variant="body2">
                        Age: {formatAge(selectedUser.age)}
                      </Typography>
                      <Typography variant="body2">
                        Bio: {selectedUser.bio}
                      </Typography>
                      <Typography variant="body2">
                        Location: {selectedUser.location}
                      </Typography>
                      <Typography variant="body2">
                        Area: {selectedUser.area}
                      </Typography>
                      <Typography variant="body2">
                        Profession: {selectedUser.profession}
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <Avatar
                    src={selectedUser.profilePictureUrl}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                </Tooltip>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {selectedUser.name}
                  </Typography>
                  {isBlockedByThem && (
                    <Typography variant="caption" color="error.main">
                      You have been blocked by this user
                    </Typography>
                  )}
                  {isBlocked && (
                    <Typography variant="caption" color="warning.main">
                      You have blocked this user
                    </Typography>
                  )}
                </Box>

                <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
                  {isBlocked ? (
                    <IconButton
                      size="small"
                      onClick={() => handleUnblockUser(selectedUser.id)}
                      sx={{ color: "success.main" }}
                    >
                      <BlockOutlinedIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleBlockUser(selectedUser.id)}
                      disabled={isBlockedByThem}
                    >
                      <BlockOutlinedIcon />
                    </IconButton>
                  )}

                  <IconButton
                    size="small"
                    onClick={() =>
                      isReported
                        ? handleUnreportUser(selectedUser.id)
                        : handleReportUser(selectedUser.id, "Spam")
                    }
                    sx={{ color: isReported ? "success.main" : "inherit" }}
                    disabled={isBlockedByThem}
                  >
                    <FlagOutlinedIcon />
                  </IconButton>

                  <IconButton 
                    size="small" 
                    onClick={handleDeleteChatHistory}
                    disabled={isBlockedByThem}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2 }}>
                {(isBlocked || isBlockedByThem) ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      {isBlockedByThem 
                        ? "You have been blocked by this user" 
                        : "You have blocked this user"}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {isBlockedByThem 
                        ? "You cannot see messages or send new ones" 
                        : "Unblock to see messages and chat again"}
                    </Typography>
                  </Box>
                ) : loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent:
                          index % 2 === 0 ? "flex-end" : "flex-start",
                        mb: 2,
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        width="70%"
                        height={100}
                      />
                    </Box>
                  ))
                ) : messages.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      No messages yet
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Start a conversation with {selectedUser.name}
                    </Typography>
                  </Box>
                ) : (
                  messages.map((message) => (
                    <Fade in key={message.id}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            message.senderId === currentUser?.uid
                              ? "flex-end"
                              : "flex-start",
                          mb: 2,
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            maxWidth: "70%",
                            borderRadius: 3,
                            bgcolor:
                              message.senderId === currentUser?.uid
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.grey[100], 0.5),
                          }}
                        >
                          {message.isDeleted ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontStyle="italic"
                            >
                              Message deleted
                            </Typography>
                          ) : editingMessageId === message.id ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={editingMessageText}
                                onChange={(e) =>
                                  setEditingMessageText(e.target.value)
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleEditMessage(
                                      message.id,
                                      editingMessageText
                                    )
                                  }
                                  sx={{ color: "success.main" }}
                                >
                                  <CheckRoundedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={handleCancelEdit}
                                  sx={{ color: "error.main" }}
                                >
                                  <CloseRoundedIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          ) : (
                            <>
                              <Typography variant="body1">
                                {message.text}
                                {message.edited && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    (edited)
                                  </Typography>
                                )}
                              </Typography>

                              <Box
                                sx={{
                                  mt: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString()}
                                </Typography>

                                {message.senderId === currentUser?.uid && (
                                  <DoneAllRoundedIcon
                                    sx={{
                                      fontSize: 16,
                                      color: message.seen
                                        ? "primary.main"
                                        : "text.disabled",
                                    }}
                                  />
                                )}
                              </Box>

                              {/* Message Reactions */}
                              {Object.entries(message.reactions || {}).map(
                                ([userId, emoji]) => (
                                  <Typography
                                    key={userId}
                                    variant="caption"
                                    sx={{ ml: 1 }}
                                  >
                                    {emoji}
                                  </Typography>
                                )
                              )}

                              {/* Message Actions */}
                              <Box
                                sx={{
                                  mt: 1,
                                  display: "flex",
                                  gap: 1,
                                  opacity: 0,
                                  transition: "0.2s",
                                  "&:hover": { opacity: 1 },
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    handleOpenReactionPicker(e, message.id)
                                  }
                                >
                                  <AddReactionOutlinedIcon fontSize="small" />
                                </IconButton>
                                {message.senderId === currentUser?.uid &&
                                  !message.isDeleted && (
                                    <>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setEditingMessageId(message.id);
                                          setEditingMessageText(message.text);
                                        }}
                                      >
                                        <EditOutlinedIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleDeleteMessage(message.id)
                                        }
                                        sx={{ color: "error.light" }}
                                      >
                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                      </IconButton>
                                    </>
                                  )}
                              </Box>
                            </>
                          )}
                        </Paper>
                      </Box>
                    </Fade>
                  ))
                )}
              </Box>

              {/* Message Input */}
              {!isMessagingDisabled ? (
                <Box
                  sx={{
                    p: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    variant="outlined"
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />

                  <IconButton onClick={handleOpenMessagePicker}>
                    <AddReactionOutlinedIcon />
                  </IconButton>

                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {isBlockedByThem
                      ? "You have been blocked by this user and cannot send messages."
                      : isBlocked
                      ? "You have blocked this user. Unblock to send messages."
                      : "You have reported this user. Unreport to send messages."}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a conversation
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Choose a contact from the left to start chatting
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Emoji Pickers */}
      <Popover
        open={Boolean(messagePickerAnchor)}
        anchorEl={messagePickerAnchor}
        onClose={() => setMessagePickerAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <EmojiPicker onEmojiClick={handleInsertEmoji} />
      </Popover>

      <Popover
        open={Boolean(reactionPickerAnchor)}
        anchorEl={reactionPickerAnchor}
        onClose={() => setReactionPickerAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            if (selectedMessageId) {
              handleAddReaction(selectedMessageId, emojiData.emoji);
            }
          }}
        />
      </Popover>
    </Container>
  );
};

export default MessagesPage;
