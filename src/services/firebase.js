import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  limit,
  writeBatch,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_DPhver3m_7WPxR3aXeiOVqFUkhSVRsE",
  authDomain: "private-notes-2025.firebaseapp.com",
  projectId: "private-notes-2025",
  storageBucket: "private-notes-2025.appspot.com",
  messagingSenderId: "911058834277",
  appId: "1:911058834277:web:1771cd83df608e5837c78c",
  measurementId: "G-1KHVE11MN5",
};

// Initialize Firebase
let app;
let db;
let auth;
let firestoreEnabled = true;
let initializationAttempted = false;

// Quota management constants
const QUOTA_EXCEEDED_KEY = "firebase_quota_exceeded";
const QUOTA_RESET_TIME_KEY = "firebase_quota_reset_time";
const QUOTA_ATTEMPTS_KEY = "firebase_auth_attempts";
const DEFAULT_QUOTA_RESET_HOURS = 24; // Default reset time in hours

// Check if quota is exceeded
export const isQuotaExceeded = () => {
  const quotaExceeded = localStorage.getItem(QUOTA_EXCEEDED_KEY);
  return quotaExceeded === "true";
};

// Set quota exceeded flag with reset time
export const setQuotaExceeded = () => {
  localStorage.setItem(QUOTA_EXCEEDED_KEY, "true");

  // Set reset time to 24 hours from now
  const resetTime = new Date();
  resetTime.setHours(resetTime.getHours() + DEFAULT_QUOTA_RESET_HOURS);
  localStorage.setItem(QUOTA_RESET_TIME_KEY, resetTime.toISOString());

  console.warn(
    `Firebase quota exceeded. Will reset at ${resetTime.toLocaleString()}`
  );
};

// Clear quota exceeded flag
export const clearQuotaExceeded = () => {
  localStorage.removeItem(QUOTA_EXCEEDED_KEY);
  localStorage.removeItem(QUOTA_RESET_TIME_KEY);
  localStorage.setItem(QUOTA_ATTEMPTS_KEY, "0");
  console.log("Cleared Firebase quota exceeded flag");
};

// Check if quota reset time has passed
export const checkQuotaResetTime = () => {
  const resetTimeStr = localStorage.getItem(QUOTA_RESET_TIME_KEY);
  if (!resetTimeStr) return true;

  const resetTime = new Date(resetTimeStr);
  const now = new Date();

  if (now >= resetTime) {
    clearQuotaExceeded();
    return true;
  }

  return false;
};

// Increment auth attempts counter
export const incrementAuthAttempts = () => {
  const attempts = parseInt(
    localStorage.getItem(QUOTA_ATTEMPTS_KEY) || "0",
    10
  );
  localStorage.setItem(QUOTA_ATTEMPTS_KEY, (attempts + 1).toString());
  return attempts + 1;
};

// Get remaining time until quota reset
export const getQuotaResetTimeRemaining = () => {
  const resetTimeStr = localStorage.getItem(QUOTA_RESET_TIME_KEY);
  if (!resetTimeStr) return null;

  const resetTime = new Date(resetTimeStr);
  const now = new Date();

  if (now >= resetTime) {
    clearQuotaExceeded();
    return null;
  }

  const diffMs = resetTime - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours: diffHrs, minutes: diffMins, milliseconds: diffMs };
};

// Enhanced error handling for Firebase auth
export const handleAuthError = (error) => {
  // console.error('Firebase auth error:', error.code, error.message);

  if (error.code === "auth/quota-exceeded") {
    // console.warn('Setting quota exceeded flag due to auth/quota-exceeded error');
    setQuotaExceeded();
  }

  // Track auth attempts for potential quota issues
  incrementAuthAttempts();

  return error;
};

// Initialize Firebase with retry mechanism
const initializeFirebase = async (retryCount = 0, maxRetries = 3) => {
  if (initializationAttempted && app && db && auth) {
    return { success: true, app, db, auth };
  }

  try {
    console.log(
      `Initializing Firebase (attempt ${retryCount + 1}/${maxRetries + 1})`
    );
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Connect to emulators if in development environment
    if (
      process.env.NODE_ENV === "development" &&
      process.env.REACT_APP_USE_EMULATORS === "true"
    ) {
      try {
        connectFirestoreEmulator(db, "localhost", 8080);
        connectAuthEmulator(auth, "http://localhost:9099");
        // console.log('Connected to Firebase emulators');
      } catch (emulatorError) {
        // console.warn('Failed to connect to Firebase emulators:', emulatorError);
      }
    }

    initializationAttempted = true;
    console.log("Firebase initialized successfully");
    return { success: true, app, db, auth };
  } catch (error) {
    // console.error(`Error initializing Firebase (attempt ${retryCount + 1}):`, error);

    if (retryCount < maxRetries) {
      // console.log(`Retrying initialization in ${(retryCount + 1) * 1000}ms...`);
      await new Promise((resolve) =>
        setTimeout(resolve, (retryCount + 1) * 1000)
      );
      return initializeFirebase(retryCount + 1, maxRetries);
    } else {
      initializationAttempted = true;
      firestoreEnabled = false;
      // console.error(`Failed to initialize Firebase after ${maxRetries + 1} attempts`);
      return { success: false, error };
    }
  }
};

// Initialize Firebase on module load
initializeFirebase()
  .then((result) => {
    if (!result.success) {
      // console.error('Firebase initialization failed:', result.error);
    }
  })
  .catch((error) => {
    // console.error('Unexpected error during Firebase initialization:', error);
  });

// Check if we have access to Firestore
export const checkFirestoreAccess = async () => {
  try {
    // If Firebase hasn't been initialized yet, try to initialize it
    if (!initializationAttempted) {
      const result = await initializeFirebase();
      if (!result.success) {
        // console.log("Firestore access check failed: Firebase initialization failed");
        return false;
      }
    }

    if (!db) {
      // console.log("Firestore not initialized");
      return false;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      // console.log("Firestore access check failed: No user signed in");
      return false;
    }

    const userId = currentUser.uid;
    // console.log(`Checking Firestore access for user ${userId}`);

    // Reset firestoreEnabled to true before checking
    firestoreEnabled = true;

    // Try to access the notes collection
    try {
      const notesRef = collection(db, "notes");
      const q = query(notesRef, where("userId", "==", userId), limit(1));
      await getDocs(q);

      // console.log("Firestore access check passed");
      return true;
    } catch (permissionError) {
      // console.log("Permission error when accessing notes:", permissionError);

      if (
        permissionError.code === "permission-denied" ||
        permissionError.code === "missing-or-insufficient-permissions"
      ) {
        // console.log("Permission denied for regular access, trying admin collection");

        // Try to access an admin-only collection as a fallback
        try {
          const adminRef = collection(db, "system");
          const adminQuery = query(adminRef, limit(1));
          await getDocs(adminQuery);

          // console.log("Admin Firestore access check passed");
          return true;
        } catch (adminError) {
          // console.error("Admin Firestore access check failed:", adminError);
          // Only disable Firestore for permission errors, not for network errors
          if (
            adminError.code === "permission-denied" ||
            adminError.code === "missing-or-insufficient-permissions"
          ) {
            firestoreEnabled = false;
          }
          return false;
        }
      } else {
        throw permissionError; // Re-throw non-permission errors
      }
    }
  } catch (error) {
    // console.error("Firestore access check failed:", error);
    // console.log("Error details:", error.code, error.message);

    // Only disable Firestore for permission errors, not for network errors
    if (
      error.code === "permission-denied" ||
      error.code === "missing-or-insufficient-permissions"
    ) {
      firestoreEnabled = false;
    }

    return false;
  }
};

// Authentication functions
export const signInWithEmailAndPasswordUser = async (email, password) => {
  try {
    // Check if quota is already exceeded
    if (isQuotaExceeded() && !checkQuotaResetTime()) {
      const error = {
        code: "auth/quota-exceeded",
        message: "Authentication quota exceeded. Please try again later.",
      };
      throw error;
    }

    // Check if Firebase is initialized
    if (!auth) {
      // console.error("Firebase auth not initialized");
      throw new Error("Firebase authentication is not available");
    }

    // Attempt to sign in
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Verify we have a valid user
    if (!userCredential || !userCredential.user) {
      throw new Error("Authentication failed: No user returned");
    }

    // console.log("Email sign-in successful in firebase.js:", userCredential.user.uid);
    return userCredential;
  } catch (error) {
    // console.error("Error in signInWithEmailAndPasswordUser:", error);
    throw handleAuthError(error);
  }
};

export const createUserWithEmailAndPasswordUser = async (email, password) => {
  try {
    // Check if quota is already exceeded
    if (isQuotaExceeded() && !checkQuotaResetTime()) {
      throw {
        code: "auth/quota-exceeded",
        message: "Authentication quota exceeded. Please try again later.",
      };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Verify we have a valid user
    if (!userCredential || !userCredential.user) {
      throw new Error("Authentication failed: No user returned");
    }

    // console.log("Email sign-up successful in firebase.js:", userCredential.user.uid);
    return userCredential;
  } catch (error) {
    // console.error("Error in createUserWithEmailAndPasswordUser:", error);

    // Track quota exceeded errors
    if (error.code === "auth/quota-exceeded") {
      setQuotaExceeded();
    }

    throw handleAuthError(error);
  }
};

export const signInWithGoogleUser = async () => {
  try {
    // Check if quota is already exceeded
    if (isQuotaExceeded() && !checkQuotaResetTime()) {
      throw {
        code: "auth/quota-exceeded",
        message: "Authentication quota exceeded. Please try again later.",
      };
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Verify we have a valid user
    if (!userCredential || !userCredential.user) {
      throw new Error(
        "Authentication failed: No user returned from Google sign-in"
      );
    }

    // console.log("Google sign-in successful in firebase.js:", userCredential.user.uid);
    return userCredential;
  } catch (error) {
    // console.error("Error in signInWithGoogleUser:", error);

    // Track quota exceeded errors
    if (error.code === "auth/quota-exceeded") {
      setQuotaExceeded();
    }

    throw handleAuthError(error);
  }
};

export const onAuthStateChange = (callback) => {
  // If Firebase hasn't been initialized yet, try to initialize it
  if (!initializationAttempted) {
    initializeFirebase().then((result) => {
      if (result.success && auth) {
        return onAuthStateChanged(auth, callback);
      } else {
        callback(null);
        return () => {};
      }
    });
  } else if (auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    callback(null);
    return () => {};
  }
};

// Helper function to handle Firestore errors
const handleFirestoreError = (error, operation) => {
  // console.error(`Error during ${operation}:`, error);

  // Check if it's a permissions error
  if (
    error.code === "permission-denied" ||
    error.code === "missing-or-insufficient-permissions"
  ) {
    // console.error(`Permission denied during ${operation}`);
    firestoreEnabled = false;
  }

  // Rethrow the error for the caller to handle
  throw error;
};

// Helper function to get a timestamp
export const getTimestamp = () => {
  try {
    return serverTimestamp();
  } catch (error) {
    // console.error("Error getting server timestamp:", error);
    return new Date().toISOString();
  }
};

// Firestore data operations
export const fetchNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Fetch notes: Firestore not enabled or initialized");
    return [];
  }

  try {
    // console.log(`Fetching notes for user ${userId}`);

    if (!userId) {
      // console.error("fetchNotes called with no userId");
      return [];
    }

    const notesRef = collection(db, "notes");
    const q = query(
      notesRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    // console.log("Executing Firestore query:", q);
    const querySnapshot = await getDocs(q);
    const notes = [];

    // console.log(`Query returned ${querySnapshot.size} documents`);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // console.log(`Processing note document: ${doc.id}`, data);
      notes.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp
          ? data.timestamp.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    // console.log(`Fetched ${notes.length} notes:`, notes);
    return notes;
  } catch (error) {
    // console.error("Error in fetchNotes:", error);
    // console.error("Error details:", error.code, error.message);
    handleFirestoreError(error, "fetchNotes");
    return [];
  }
};

export const fetchArchivedNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Fetch archived notes: Firestore not enabled or initialized");
    return [];
  }

  try {
    // console.log(`Fetching archived notes for user ${userId}`);
    const archivedNotesRef = collection(db, "archivedNotes");
    const q = query(
      archivedNotesRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const archivedNotes = [];

    querySnapshot.forEach((doc) => {
      archivedNotes.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
          ? doc.data().timestamp.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    // console.log(`Fetched ${archivedNotes.length} archived notes`);
    return archivedNotes;
  } catch (error) {
    handleFirestoreError(error, "fetchArchivedNotes");
    return [];
  }
};

export const fetchDeletedNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Fetch deleted notes: Firestore not enabled or initialized");
    return [];
  }

  try {
    console.log(`Fetching deleted notes for user ${userId}`);
    const deletedNotesRef = collection(db, "deletedNotes");
    const q = query(
      deletedNotesRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const deletedNotes = [];

    querySnapshot.forEach((doc) => {
      deletedNotes.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp
          ? doc.data().timestamp.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    // console.log(`Fetched ${deletedNotes.length} deleted notes`);
    return deletedNotes;
  } catch (error) {
    handleFirestoreError(error, "fetchDeletedNotes");
    return [];
  }
};

export const addNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Add note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Adding note for user ${userId}:`, note.id);

    // Ensure the note has the required fields and consistent naming
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: getTimestamp(),
      // Store heading as heading (keep original field name for consistency)
      heading: note.heading || "",
      text: note.text || "",
    };

    // Log the note structure being saved
    // console.log("Saving note to Firestore:", noteWithMetadata);

    // Add the note to Firestore
    const notesRef = collection(db, "notes");
    await setDoc(doc(notesRef, note.id), noteWithMetadata);

    // console.log(`Note added successfully: ${note.id}`);
    return note.id;
  } catch (error) {
    // console.error("Error adding note to Firestore:", error);
    // console.log("Error details:", error.code, error.message);
    handleFirestoreError(error, "addNote");
    throw error;
  }
};

export const updateNote = async (noteId, updatedNote) => {
  if (!db || !firestoreEnabled) {
    // console.log("Update note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Updating note: ${noteId}`);

    // Update the note in Firestore
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, {
      ...updatedNote,
      timestamp: getTimestamp(),
    });

    // console.log(`Note updated successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, "updateNote");
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Delete note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Deleting note: ${noteId}`);

    // Delete the note from Firestore
    const noteRef = doc(db, "notes", noteId);
    await deleteDoc(noteRef);

    // console.log(`Note deleted successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, "deleteNote");
    throw error;
  }
};

export const addArchivedNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Add archived note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Adding archived note for user ${userId}:`, note.id);

    // Ensure the note has the required fields
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: getTimestamp(),
    };

    // Add the note to Firestore
    const archivedNotesRef = collection(db, "archivedNotes");
    await setDoc(doc(archivedNotesRef, note.id), noteWithMetadata);

    // console.log(`Archived note added successfully: ${note.id}`);
    return note.id;
  } catch (error) {
    handleFirestoreError(error, "addArchivedNote");
    throw error;
  }
};

export const deleteArchivedNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Delete archived note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Deleting archived note: ${noteId}`);

    // Delete the note from Firestore
    const noteRef = doc(db, "archivedNotes", noteId);
    await deleteDoc(noteRef);

    // console.log(`Archived note deleted successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, "deleteArchivedNote");
    throw error;
  }
};

export const addDeletedNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Add deleted note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Adding deleted note for user ${userId}:`, note.id);

    // Ensure the note has the required fields
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: getTimestamp(),
    };

    // Add the note to Firestore
    const deletedNotesRef = collection(db, "deletedNotes");
    await setDoc(doc(deletedNotesRef, note.id), noteWithMetadata);

    // console.log(`Deleted note added successfully: ${note.id}`);
    return note.id;
  } catch (error) {
    handleFirestoreError(error, "addDeletedNote");
    throw error;
  }
};

export const deleteDeletedNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Delete deleted note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Permanently deleting note: ${noteId}`);

    // Delete the note from Firestore
    const noteRef = doc(db, "deletedNotes", noteId);
    await deleteDoc(noteRef);

    // console.log(`Note permanently deleted successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, "deleteDeletedNote");
    throw error;
  }
};

export const updateNotesOrder = async (notes, userId) => {
  if (!db || !firestoreEnabled) {
    // console.log("Update notes order: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }

  try {
    // console.log(`Updating notes order for user ${userId}`);

    // Use a batch to update all notes at once
    const batch = writeBatch(db);

    notes.forEach((note, index) => {
      const noteRef = doc(db, "notes", note.id);
      batch.update(noteRef, {
        order: index,
        timestamp: getTimestamp(),
      });
    });

    await batch.commit();

    // console.log(`Notes order updated successfully for ${notes.length} notes`);
    return true;
  } catch (error) {
    handleFirestoreError(error, "updateNotesOrder");
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    // console.error('Sign out error:', error);
    return false;
  }
};
