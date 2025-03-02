import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  setDoc,
  limit
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
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

// Initialize Firebase
let app;
let db;
let auth;
let firestoreEnabled = true;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  firestoreEnabled = false;
}

// Check if Firestore is working properly
export const checkFirestoreAccess = async () => {
  if (!db || !firestoreEnabled) return false;
  
  try {
    // Try to access a test collection
    const testRef = collection(db, 'test_access');
    await getDocs(query(testRef, limit(1)));
    return true;
  } catch (error) {
    console.error("Firestore access check failed:", error);
    firestoreEnabled = false;
    return false;
  }
};

// Authentication functions
export const signInAnonymousUser = async () => {
  if (!auth) {
    console.error("Firebase auth not initialized");
    return null;
  }

  try {
    const userCredential = await signInAnonymously(auth);
    console.log("Anonymous user signed in:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    return null;
  }
};

export const onAuthStateChange = (callback) => {
  if (!auth) {
    console.error("Firebase auth not initialized");
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// Firestore data operations
export const fetchNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    return [];
  }

  try {
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef, 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const notes = [];
    querySnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    
    return notes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    return [];
  }
};

export const fetchArchivedNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    return [];
  }

  try {
    const archivedNotesRef = collection(db, 'archivedNotes');
    const q = query(
      archivedNotesRef, 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const archivedNotes = [];
    querySnapshot.forEach((doc) => {
      archivedNotes.push({ id: doc.id, ...doc.data() });
    });
    
    return archivedNotes;
  } catch (error) {
    console.error("Error fetching archived notes:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    return [];
  }
};

export const fetchDeletedNotes = async (userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    return [];
  }

  try {
    const deletedNotesRef = collection(db, 'deletedNotes');
    const q = query(
      deletedNotesRef, 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    const deletedNotes = [];
    querySnapshot.forEach((doc) => {
      deletedNotes.push({ id: doc.id, ...doc.data() });
    });
    
    return deletedNotes;
  } catch (error) {
    console.error("Error fetching deleted notes:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    return [];
  }
};

export const addNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const notesRef = collection(db, 'notes');
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(notesRef, noteWithMetadata);
    return { id: docRef.id, ...noteWithMetadata, timestamp: new Date() };
  } catch (error) {
    console.error("Error adding note:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const updateNote = async (noteId, updatedNote) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...updatedNote,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating note:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const addArchivedNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const archivedNotesRef = collection(db, 'archivedNotes');
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(archivedNotesRef, noteWithMetadata);
    return { id: docRef.id, ...noteWithMetadata };
  } catch (error) {
    console.error("Error adding archived note:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const deleteArchivedNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const noteRef = doc(db, 'archivedNotes', noteId);
    await deleteDoc(noteRef);
    return true;
  } catch (error) {
    console.error("Error deleting archived note:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const addDeletedNote = async (note, userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const deletedNotesRef = collection(db, 'deletedNotes');
    const noteWithMetadata = {
      ...note,
      userId,
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(deletedNotesRef, noteWithMetadata);
    return { id: docRef.id, ...noteWithMetadata };
  } catch (error) {
    console.error("Error adding deleted note:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const deleteDeletedNote = async (noteId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    const noteRef = doc(db, 'deletedNotes', noteId);
    await deleteDoc(noteRef);
    return true;
  } catch (error) {
    console.error("Error deleting note from trash:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};

export const updateNotesOrder = async (notes, userId) => {
  if (!db || !firestoreEnabled) {
    console.error("Firestore not initialized or disabled");
    throw new Error("Firestore not initialized or disabled");
  }

  try {
    // Update each note with its new position
    const updatePromises = notes.map(async (note, index) => {
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        order: index,
        timestamp: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error updating notes order:", error);
    if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
      firestoreEnabled = false;
    }
    throw error;
  }
};
