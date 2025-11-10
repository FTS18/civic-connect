import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  setDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firestore
export const db = getFirestore(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Email/Password Authentication
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "Failed to login");
  }
};

export const signupWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Signup error:", error);
    throw new Error(error.message || "Failed to create account");
  }
};

// Google Authentication
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google login error:", error);
    throw new Error(error.message || "Failed to sign in with Google");
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Logout error:", error);
    throw new Error(error.message || "Failed to logout");
  }
};

// Auth State Observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Forgot Password
export const forgotPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Password reset email sent to:", email);
    return true;
  } catch (error: any) {
    console.error("❌ Forgot password error:", error);
    throw new Error(error.message || "Failed to send reset email");
  }
};

// Send Email Verification
export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user);
    console.log("✅ Verification email sent to:", user.email);
    return true;
  } catch (error: any) {
    console.error("❌ Email verification error:", error);
    throw new Error(error.message || "Failed to send verification email");
  }
};

// Email Link Sign-In (Passwordless)
export const sendEmailLink = async (email: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/pages/portal.html`,
    handleCodeInApp: true,
  };
  
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("civicconnect_emailLink", email);
    console.log("✅ Email link sent to:", email);
    return true;
  } catch (error: any) {
    console.error("❌ Email link error:", error);
    throw new Error(error.message || "Failed to send email link");
  }
};

// Complete Email Link Sign-In
export const completeEmailLink = async (email: string) => {
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem("civicconnect_emailLink");
      console.log("✅ Email link sign-in successful!");
      return true;
    }
    return false;
  } catch (error: any) {
    console.error("❌ Email link sign-in error:", error);
    throw new Error(error.message || "Failed to complete email link sign-in");
  }
};

// Image Upload
export const uploadImage = async (image: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, image);
  return getDownloadURL(storageRef);
};

// === FIRESTORE ISSUE MANAGEMENT ===

// Add a new issue to Firestore
export const addIssueToFirestore = async (issueData: {
  title: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  userId?: string;
  userName?: string;
  photos?: string[];
}) => {
  try {
    const docRef = await addDoc(collection(db, "issues"), {
      ...issueData,
      status: "reported",
      createdAt: Timestamp.now(),
      upvotes: 0,
      downvotes: 0,
    });
    console.log("✅ [ZURI] Issue saved to Firestore:", docRef.id, issueData.photos ? `with ${issueData.photos.length} photo(s)` : 'no photos');
    return docRef.id;
  } catch (error: any) {
    console.error("❌ [ZURI] Error saving issue to Firestore:", error);
    throw new Error(error.message || "Failed to save issue");
  }
};

// Real-time listener for all issues
export const subscribeToIssues = (callback: (issues: any[]) => void) => {
  const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("✅ Real-time issues update:", issues.length);
    callback(issues);
  }, (error) => {
    console.error("❌ Error subscribing to issues:", error);
  });
};

// Get user's issues from Firestore
export const getUserIssuesFromFirestore = async (userId: string) => {
  try {
    const q = query(
      collection(db, "issues"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const issues = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("✅ Loaded user issues from Firestore:", issues.length);
    return issues;
  } catch (error: any) {
    console.error("❌ Error loading user issues from Firestore:", error);
    return [];
  }
};

// Delete an issue from Firestore
export const deleteIssueFromFirestore = async (issueId: string) => {
  try {
    await deleteDoc(doc(db, "issues", issueId));
    console.log("✅ Issue deleted from Firestore:", issueId);
  } catch (error: any) {
    console.error("❌ Error deleting issue from Firestore:", error);
    throw new Error(error.message || "Failed to delete issue");
  }
};

// Update issue status in Firestore
export const updateIssueStatusInFirestore = async (
  issueId: string,
  newStatus: "reported" | "inProgress" | "resolved"
) => {
  try {
    await updateDoc(doc(db, "issues", issueId), {
      status: newStatus,
    });
    console.log("✅ Issue status updated in Firestore:", issueId, newStatus);
  } catch (error: any) {
    console.error("❌ Error updating issue status in Firestore:", error);
    throw new Error(error.message || "Failed to update issue status");
  }
};

// Update issue votes in Firestore
export const updateIssueVotesInFirestore = async (
  issueId: string,
  upvotes: number,
  downvotes: number
) => {
  try {
    await updateDoc(doc(db, "issues", issueId), {
      upvotes,
      downvotes,
    });
  } catch (error: any) {
    console.error("❌ Error updating votes in Firestore:", error);
  }
};

// Save user vote to Firestore
export const saveUserVoteToFirestore = async (
  userId: string,
  issueId: string,
  voteType: "up" | "down" | null
) => {
  try {
    const voteRef = doc(db, "userVotes", `${userId}_${issueId}`);
    if (voteType === null) {
      await deleteDoc(voteRef).catch(() => {});
    } else {
      await setDoc(voteRef, { userId, issueId, voteType, timestamp: Timestamp.now() });
    }
  } catch (error: any) {
    console.error("❌ Error saving user vote:", error);
  }
};

// Real-time listener for user votes
export const subscribeToUserVotes = (userId: string, callback: (votes: { [issueId: string]: "up" | "down" }) => void) => {
  const q = query(collection(db, "userVotes"), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const votes: { [issueId: string]: "up" | "down" } = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      votes[data.issueId] = data.voteType;
    });
    callback(votes);
  }, (error) => {
    console.error("❌ Error subscribing to votes:", error);
  });
};

// Real-time listener for all votes (to calculate counts)
export const subscribeToAllVotes = (callback: (voteCounts: { [issueId: string]: { upvotes: number; downvotes: number } }) => void) => {
  return onSnapshot(collection(db, "userVotes"), (snapshot) => {
    const voteCounts: { [issueId: string]: { upvotes: number; downvotes: number } } = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const issueId = data.issueId;
      if (!voteCounts[issueId]) {
        voteCounts[issueId] = { upvotes: 0, downvotes: 0 };
      }
      if (data.voteType === "up") {
        voteCounts[issueId].upvotes++;
      } else if (data.voteType === "down") {
        voteCounts[issueId].downvotes++;
      }
    });
    callback(voteCounts);
  }, (error) => {
    console.error("❌ Error subscribing to all votes:", error);
  });
};

// Admin Authentication
export const adminLogin = (email: string, password: string): boolean => {
  // Hardcoded admin credentials (in production, use Firebase Admin SDK)
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "admin123";
  
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Store admin token in localStorage
    localStorage.setItem("civicconnect_admin_token", JSON.stringify({
      email: email,
      timestamp: new Date().getTime(),
    }));
    console.log("✅ Admin login successful");
    return true;
  }
  
  console.error("❌ Invalid admin credentials");
  return false;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const adminToken = localStorage.getItem("civicconnect_admin_token");
  if (!adminToken) return false;
  
  try {
    const token = JSON.parse(adminToken);
    return token.email === "admin@gmail.com";
  } catch {
    return false;
  }
};

// Admin logout
export const adminLogout = (): void => {
  localStorage.removeItem("civicconnect_admin_token");
  console.log("✅ Admin logout successful");
};

export default app;