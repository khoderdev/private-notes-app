import { initializeApp } from 'firebase/app';
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
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_DPhver3m_7WPxR3aXeiOVqFUkhSVRsE",
  authDomain: "private-notes-2025.firebaseapp.com",
  projectId: "private-notes-2025",
  storageBucket: "private-notes-2025.appspot.com",
  messagingSenderId: "911058834277",
  appId: "1:911058834277:web:1771cd83df608e5837c78c",
  measurementId: "G-1KHVE11MN5"
};

// Admin user credentials - in a real app, these would be securely stored
const ADMIN_EMAIL = "khoder.dev@gmail.com";
const ADMIN_PASSWORD = "admin123";

// Initialize Firebase
let app;
let db;
let auth;
let firestoreEnabled = true;
let initializationAttempted = false;

// Initialize Firebase with retry mechanism
const initializeFirebase = async (retryCount = 0, maxRetries = 3) => {
  if (initializationAttempted && app && db && auth) {
    return { success: true, app, db, auth };
  }
  
  try {
    console.log(`Initializing Firebase (attempt ${retryCount + 1}/${maxRetries + 1})`);
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Connect to emulators if in development environment
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase emulators');
      } catch (emulatorError) {
        console.warn('Failed to connect to Firebase emulators:', emulatorError);
      }
    }
    
    initializationAttempted = true;
    console.log("Firebase initialized successfully");
    return { success: true, app, db, auth };
  } catch (error) {
    console.error(`Error initializing Firebase (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      console.log(`Retrying initialization in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return initializeFirebase(retryCount + 1, maxRetries);
    } else {
      initializationAttempted = true;
      firestoreEnabled = false;
      console.error(`Failed to initialize Firebase after ${maxRetries + 1} attempts`);
      return { success: false, error };
    }
  }
};

// Initialize Firebase on module load
initializeFirebase().then(result => {
  if (!result.success) {
    console.error('Firebase initialization failed:', result.error);
  }
}).catch(error => {
  console.error('Unexpected error during Firebase initialization:', error);
});

// Check if we have access to Firestore
export const checkFirestoreAccess = async () => {
  try {
    // If Firebase hasn't been initialized yet, try to initialize it
    if (!initializationAttempted) {
      const result = await initializeFirebase();
      if (!result.success) {
        console.log("Firestore access check failed: Firebase initialization failed");
        return false;
      }
    }
    
    if (!db) {
      console.log("Firestore not initialized");
      return false;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("Firestore access check failed: No user signed in");
      return false;
    }
    
    const userId = currentUser.uid;
    console.log(`Checking Firestore access for user ${userId}`);
    
    // Reset firestoreEnabled to true before checking
    firestoreEnabled = true;
    
    // Check if this is the admin user
    if (userId === "mqezh9S4dbeNPgz4EEmjgf5ohfk1" || 
        (currentUser.email && currentUser.email === "khoder.dev@gmail.com")) {
      console.log("Admin user detected, assuming Firestore access");
      return true;
    }
    
    // Try to access the notes collection
    try {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, where("userId", "==", userId), limit(1));
      await getDocs(q);
      
      console.log("Firestore access check passed");
      return true;
    } catch (permissionError) {
      console.log("Permission error when accessing notes:", permissionError);
      
      if (permissionError.code === 'permission-denied' || 
          permissionError.code === 'missing-or-insufficient-permissions') {
        console.log("Permission denied for regular access, trying admin collection");
        
        // Try to access an admin-only collection as a fallback
        try {
          const adminRef = collection(db, 'system');
          const adminQuery = query(adminRef, limit(1));
          await getDocs(adminQuery);
          
          console.log("Admin Firestore access check passed");
          return true;
        } catch (adminError) {
          console.error("Admin Firestore access check failed:", adminError);
          // Only disable Firestore for permission errors, not for network errors
          if (adminError.code === 'permission-denied' || 
              adminError.code === 'missing-or-insufficient-permissions') {
            firestoreEnabled = false;
          }
          return false;
        }
      } else {
        throw permissionError; // Re-throw non-permission errors
      }
    }
  } catch (error) {
    console.error("Firestore access check failed:", error);
    console.log("Error details:", error.code, error.message);
    
    // Only disable Firestore for permission errors, not for network errors
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    
    return false;
  }
};

// Authentication functions
export const signInAnonymousUser = async () => {
  // If Firebase hasn't been initialized yet, try to initialize it
  if (!initializationAttempted) {
    const result = await initializeFirebase();
    if (!result.success) {
      return null;
    }
  }
  
  if (!auth) {
    console.error("Firebase auth not initialized");
    return null;
  }

  try {
    // Try to sign in with admin credentials first
    try {
      console.log("Attempting to sign in with admin credentials");
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log("Admin user signed in:", userCredential.user.uid);
      return userCredential.user;
    } catch (adminError) {
      // Check if this is an ADMIN_ONLY_OPERATION error
      if (adminError.message && adminError.message.includes("ADMIN_ONLY_OPERATION")) {
        console.log("Admin sign-in not available in this environment, falling back to anonymous auth");
      } else {
        console.error("Admin sign-in failed, falling back to anonymous:", adminError);
      }
      
      // Fall back to anonymous auth if admin sign-in fails
      const userCredential = await signInAnonymously(auth);
      console.log("Anonymous user signed in:", userCredential.user.uid);
      return userCredential.user;
    }
  } catch (error) {
    console.error("All authentication methods failed:", error);
    return null;
  }
};

export const onAuthStateChange = (callback) => {
  // If Firebase hasn't been initialized yet, try to initialize it
  if (!initializationAttempted) {
    initializeFirebase().then(result => {
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
  console.error(`Error during ${operation}:`, error);
  
  // Check if it's a permissions error
  if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
    console.error(`Permission denied during ${operation}`);
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
    console.error("Error getting server timestamp:", error);
    return new Date().toISOString();
  }
};

// Firestore data operations
export const fetchNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Fetch notes: Firestore not enabled or initialized");
    return [];
  }
  
  try {
    console.log(`Fetching notes for user ${userId}`);
    
    if (!userId) {
      console.error("fetchNotes called with no userId");
      return [];
    }
    
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef, 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    console.log("Executing Firestore query:", q);
    const querySnapshot = await getDocs(q);
    const notes = [];
    
    console.log(`Query returned ${querySnapshot.size} documents`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Processing note document: ${doc.id}`, data);
      notes.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    console.log(`Fetched ${notes.length} notes:`, notes);
    return notes;
  } catch (error) {
    console.error("Error in fetchNotes:", error);
    console.error("Error details:", error.code, error.message);
    handleFirestoreError(error, 'fetchNotes');
    return [];
  }
};

export const fetchArchivedNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Fetch archived notes: Firestore not enabled or initialized");
    return [];
  }
  
  try {
    console.log(`Fetching archived notes for user ${userId}`);
    const archivedNotesRef = collection(db, 'archivedNotes');
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
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    console.log(`Fetched ${archivedNotes.length} archived notes`);
    return archivedNotes;
  } catch (error) {
    handleFirestoreError(error, 'fetchArchivedNotes');
    return [];
  }
};

export const fetchDeletedNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Fetch deleted notes: Firestore not enabled or initialized");
    return [];
  }
  
  try {
    console.log(`Fetching deleted notes for user ${userId}`);
    const deletedNotesRef = collection(db, 'deletedNotes');
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
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    console.log(`Fetched ${deletedNotes.length} deleted notes`);
    return deletedNotes;
  } catch (error) {
    handleFirestoreError(error, 'fetchDeletedNotes');
    return [];
  }
};

export const addNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Add note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Adding note for user ${userId}:`, note.id);
    
    // Ensure the note has the required fields
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: getTimestamp(),
      // Add title and text fields if they don't exist
      title: note.heading || note.title || "",
      text: note.text || ""
    };
    
    // Log the note structure being saved
    console.log("Saving note to Firestore:", noteWithMetadata);
    
    // Add the note to Firestore
    const notesRef = collection(db, 'notes');
    await setDoc(doc(notesRef, note.id), noteWithMetadata);
    
    console.log(`Note added successfully: ${note.id}`);
    return note.id;
  } catch (error) {
    console.error("Error adding note to Firestore:", error);
    console.log("Error details:", error.code, error.message);
    handleFirestoreError(error, 'addNote');
    throw error;
  }
};

export const updateNote = async (noteId, updatedNote) => {
  if (!db || !firestoreEnabled) {
    console.log("Update note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Updating note: ${noteId}`);
    
    // Update the note in Firestore
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...updatedNote,
      timestamp: getTimestamp()
    });
    
    console.log(`Note updated successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, 'updateNote');
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    console.log("Delete note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Deleting note: ${noteId}`);
    
    // Delete the note from Firestore
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
    
    console.log(`Note deleted successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, 'deleteNote');
    throw error;
  }
};

export const addArchivedNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Add archived note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Adding archived note for user ${userId}:`, note.id);
    
    // Ensure the note has the required fields
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: getTimestamp()
    };
    
    // Add the note to Firestore
    const archivedNotesRef = collection(db, 'archivedNotes');
    await setDoc(doc(archivedNotesRef, note.id), noteWithMetadata);
    
    console.log(`Archived note added successfully: ${note.id}`);
    return note.id;
  } catch (error) {
    handleFirestoreError(error, 'addArchivedNote');
    throw error;
  }
};

export const deleteArchivedNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    console.log("Delete archived note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Deleting archived note: ${noteId}`);
    
    // Delete the note from Firestore
    const noteRef = doc(db, 'archivedNotes', noteId);
    await deleteDoc(noteRef);
    
    console.log(`Archived note deleted successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, 'deleteArchivedNote');
    throw error;
  }
};

export const addDeletedNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Add deleted note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Adding deleted note for user ${userId}:`, note.id);
    
    // Ensure the note has the required fields
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: getTimestamp()
    };
    
    // Add the note to Firestore
    const deletedNotesRef = collection(db, 'deletedNotes');
    await setDoc(doc(deletedNotesRef, note.id), noteWithMetadata);
    
    console.log(`Deleted note added successfully: ${note.id}`);
    return note.id;
  } catch (error) {
    handleFirestoreError(error, 'addDeletedNote');
    throw error;
  }
};

export const deleteDeletedNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    console.log("Delete deleted note: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Permanently deleting note: ${noteId}`);
    
    // Delete the note from Firestore
    const noteRef = doc(db, 'deletedNotes', noteId);
    await deleteDoc(noteRef);
    
    console.log(`Note permanently deleted successfully: ${noteId}`);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, 'deleteDeletedNote');
    throw error;
  }
};

export const updateNotesOrder = async (notes, userId) => {
  if (!db || !firestoreEnabled) {
    console.log("Update notes order: Firestore not enabled or initialized");
    throw new Error("Firestore not available");
  }
  
  try {
    console.log(`Updating notes order for user ${userId}`);
    
    // Use a batch to update all notes at once
    const batch = writeBatch(db);
    
    notes.forEach((note, index) => {
      const noteRef = doc(db, 'notes', note.id);
      batch.update(noteRef, { 
        order: index,
        timestamp: getTimestamp()
      });
    });
    
    await batch.commit();
    
    console.log(`Notes order updated successfully for ${notes.length} notes`);
    return true;
  } catch (error) {
    handleFirestoreError(error, 'updateNotesOrder');
    throw error;
  }
};
