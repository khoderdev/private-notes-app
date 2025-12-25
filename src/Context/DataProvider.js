import React, { createContext, useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useAuth } from "../hooks/useAuth";
import {
  fetchNotes,
  fetchArchivedNotes,
  fetchDeletedNotes,
  addNote,
  updateNote,
  deleteNote as deleteNoteFirebase,
  addArchivedNote as archiveNoteFirebase,
  deleteArchivedNote as unarchiveNoteFirebase,
  addDeletedNote,
  deleteDeletedNote,
  updateNotesOrder,
  checkFirestoreAccess,
} from "../services/firebase";

export const DataContext = createContext(null);

const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [archiveNotes, setArchiveNotes] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [firestoreEnabled, setFirestoreEnabled] = useState(true);
  const { user, authEnabled } = useAuth(setFirebaseError, setFirestoreEnabled);

  // Check Firestore access on component mount and whenever user changes
  useEffect(() => {
    const checkAccess = async () => {
      if (user && authEnabled) {
        try {
          const hasAccess = await checkFirestoreAccess();
          // console.log("Firestore access check result:", hasAccess);
          setFirestoreEnabled(hasAccess);

          // Only clear error if access is restored
          // Don't set error on initial check - let actual operations determine if there's a real issue
          if (hasAccess) {
            setFirebaseError(null);
          }
        } catch (error) {
          // console.error("Error checking Firestore access:", error);
          setFirestoreEnabled(false);
          setFirebaseError("Error accessing Firestore: " + error.message);
        }
      } else {
        // console.log("No user or auth disabled - using local storage only");
        setFirestoreEnabled(false);
      }
    };

    checkAccess();
  }, [user, authEnabled, setFirebaseError]);

  // Load data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const localNotes = JSON.parse(localStorage.getItem("notes")) || [];
      const localArchiveNotes =
        JSON.parse(localStorage.getItem("archiveNotes")) || [];
      const localDeletedNotes =
        JSON.parse(localStorage.getItem("deletedNotes")) || [];

      // console.log("Loading from localStorage:", {
      //   notesCount: localNotes.length,
      //   archiveNotesCount: localArchiveNotes.length,
      //   deletedNotesCount: localDeletedNotes.length,
      // });

      if (localNotes.length > 0) {
        // console.log("Sample note from localStorage:", localNotes[0]);
      }

      setNotes(localNotes);
      setArchiveNotes(localArchiveNotes);
      setDeletedNotes(localDeletedNotes);
      setLoading(false);

      return { localNotes, localArchiveNotes, localDeletedNotes };
    } catch (error) {
      // console.error("Error loading from localStorage:", error);
      setLoading(false);
      return { localNotes: [], localArchiveNotes: [], localDeletedNotes: [] };
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = useCallback(
    (notes, archiveNotes, deletedNotes) => {
      try {
        localStorage.setItem("notes", JSON.stringify(notes));
        localStorage.setItem("archiveNotes", JSON.stringify(archiveNotes));
        localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
      } catch (error) {
        // console.error("Error saving to localStorage:", error);
      }
    },
    []
  );

  // Load data from Firebase
  const loadFromFirebase = useCallback(async () => {
    console.log("[loadFromFirebase] Starting Firebase load");
    console.log("[loadFromFirebase] user:", !!user, "authEnabled:", authEnabled, "firestoreEnabled:", firestoreEnabled);
    
    if (!user || !authEnabled || !firestoreEnabled) {
      console.log("[loadFromFirebase] Skipping Firebase load - not enabled or no user");
      return false;
    }

    try {
      setLoading(true);
      console.log("[loadFromFirebase] Fetching notes from Firebase for user:", user.uid);

      // Fetch all data from Firebase
      const [firebaseNotes, firebaseArchiveNotes, firebaseDeletedNotes] =
        await Promise.all([
          fetchNotes(user.uid),
          fetchArchivedNotes(user.uid),
          fetchDeletedNotes(user.uid),
        ]);

      console.log("[loadFromFirebase] Fetch complete - Notes:", firebaseNotes.length, "Archived:", firebaseArchiveNotes.length, "Deleted:", firebaseDeletedNotes.length);

      // Only update state if Firebase returned data
      // If Firebase returns empty arrays, keep the localStorage data
      if (firebaseNotes.length > 0 || firebaseArchiveNotes.length > 0 || firebaseDeletedNotes.length > 0) {
        console.log("[loadFromFirebase] Firebase has data, updating state");
        // Update state with Firebase data
        setNotes(firebaseNotes);
        setArchiveNotes(firebaseArchiveNotes);
        setDeletedNotes(firebaseDeletedNotes);

        // Also update localStorage with Firebase data
        saveToLocalStorage(
          firebaseNotes,
          firebaseArchiveNotes,
          firebaseDeletedNotes
        );
      } else {
        console.log("[loadFromFirebase] Firebase returned empty data, keeping localStorage data");
      }

      setLoading(false);
      console.log("[loadFromFirebase] Firebase load completed successfully");
      return true;
    } catch (error) {
      console.error("[loadFromFirebase] Error loading from Firebase:", error);
      console.error("[loadFromFirebase] Error code:", error.code, "Message:", error.message);
      setFirebaseError(error.message);

      // If we get a permissions error, disable Firestore
      if (
        error.code === "permission-denied" ||
        error.code === "missing-or-insufficient-permissions"
      ) {
        console.log("[loadFromFirebase] Permission error detected, disabling Firestore");
        setFirestoreEnabled(false);

        // Don't overwrite existing data with empty data from Firebase
        // Just set the error message and keep the current data
        setLoading(false);
      } else {
        // For other errors, fall back to localStorage
        console.log("[loadFromFirebase] Non-permission error, falling back to localStorage");
        loadFromLocalStorage();
      }

      return false;
    }
  }, [
    user,
    authEnabled,
    firestoreEnabled,
    loadFromLocalStorage,
    saveToLocalStorage,
  ]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      console.log("[DataProvider] Initializing data on component mount");
      // First, always load from localStorage on mount
      loadFromLocalStorage();
      console.log("[DataProvider] Loaded data from localStorage");
      
      // If no user, just mark loading as done (auth form will be shown)
      if (!user) {
        console.log("[DataProvider] No user signed in, skipping Firebase load");
        return;
      }
      
      console.log("[DataProvider] User signed in:", user.uid, "authEnabled:", authEnabled, "firestoreEnabled:", firestoreEnabled);
      
      // Then try to load from Firebase if available and not already known to be disabled
      if (user && authEnabled && firestoreEnabled) {
        try {
          // Check Firestore access first before attempting to load data
          console.log("[DataProvider] Checking Firestore access");
          const hasAccess = await checkFirestoreAccess();
          console.log("[DataProvider] Firestore access check result:", hasAccess);

          if (hasAccess) {
            console.log("[DataProvider] Firestore access confirmed, loading data");
            await loadFromFirebase();
          } else {
            // If we don't have access, just disable Firestore and keep using localStorage data
            // Don't set error message here - let actual operations determine if there's a real issue
            console.log("[DataProvider] Firestore access denied, disabling Firestore");
            setFirestoreEnabled(false);
            // console.log(
            //   "Firestore access denied during initialization - using local storage only"
            // );
          }
        } catch (error) {
          console.error("[DataProvider] Error during initialization:", error);
        }
      } else {
        console.log("[DataProvider] Skipping Firebase load - user:", !!user, "authEnabled:", authEnabled, "firestoreEnabled:", firestoreEnabled);
      }
    };

    initializeData();
  }, [
    user,
    authEnabled,
    firestoreEnabled,
    loadFromLocalStorage,
    loadFromFirebase,
  ]);

  // Add a note
  const addNoteHandler = async (heading, text, password = "") => {
    console.log("[addNoteHandler] Creating new note");
    console.log("[addNoteHandler] User:", user?.uid, "firestoreEnabled:", firestoreEnabled);
    try {
      // Create the new note object
      const newNote = {
        id: uuid(),
        heading,
        text,
        password,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        userId: user ? user.uid : "local-user",
      };

      console.log("[addNoteHandler] New note created:", newNote.id);

      // Always save to localStorage first
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);
      console.log("[addNoteHandler] Note saved to localStorage");

      // Try to save to Firebase if enabled
      if (user && firestoreEnabled) {
        console.log("[addNoteHandler] Attempting to save note to Firebase:", newNote.id);
        try {
          await addNote(newNote, user.uid);
          console.log("[addNoteHandler] Note successfully saved to Firebase:", newNote.id);
        } catch (error) {
          console.error("[addNoteHandler] Error adding note to Firebase:", error);
          console.error("[addNoteHandler] Error code:", error.code, "Message:", error.message);

          // If we get a permission error, disable Firestore for future operations
          if (
            error.code === "permission-denied" ||
            error.message.includes("Missing or insufficient permissions")
          ) {
            console.log(
              "[addNoteHandler] Permission denied - disabling Firestore for future operations"
            );
            setFirestoreEnabled(false);
            setFirebaseError(
              "Firestore permission denied. Using local storage only."
            );

            // Note is already saved to localStorage, so we don't need to do anything else
            // Just log the error and continue
          } else {
            // For other errors, show the error but don't disable Firestore
            console.log("[addNoteHandler] Non-permission error, keeping Firestore enabled");
            setFirebaseError(`Error saving to cloud: ${error.message}`);
          }
        }
      } else {
        console.log("[addNoteHandler] Skipping Firebase save - user:", !!user, "firestoreEnabled:", firestoreEnabled);
      }

      return newNote;
    } catch (error) {
      console.error("[addNoteHandler] Error adding note:", error);
      return null;
    }
  };

  // Update an existing note
  const updateNoteHandler = async (updatedNote) => {
    // Update local state
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id
        ? { ...updatedNote, timestamp: new Date().toISOString() }
        : note
    );

    setNotes(updatedNotes);

    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await updateNote(updatedNote.id, updatedNote);
      } catch (error) {
        // console.error("Error updating note in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Delete a note (move to trash)
  const deleteNoteHandler = async (note) => {
    // Update local state
    const updatedNotes = notes.filter((item) => item.id !== note.id);
    const updatedDeletedNotes = [
      { ...note, timestamp: new Date().toISOString() },
      ...deletedNotes,
    ];

    setNotes(updatedNotes);
    setDeletedNotes(updatedDeletedNotes);

    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, updatedDeletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteNoteFirebase(note.id);
        await addDeletedNote(note, user.uid);
      } catch (error) {
        // console.error("Error deleting note in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Archive a note
  const archiveNoteHandler = async (note) => {
    // Update local state
    const updatedNotes = notes.filter((item) => item.id !== note.id);
    const updatedArchiveNotes = [
      { ...note, timestamp: new Date().toISOString() },
      ...archiveNotes,
    ];

    setNotes(updatedNotes);
    setArchiveNotes(updatedArchiveNotes);

    // Save to localStorage
    saveToLocalStorage(updatedNotes, updatedArchiveNotes, deletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteNoteFirebase(note.id);
        await archiveNoteFirebase(note, user.uid);
      } catch (error) {
        // console.error("Error archiving note in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Restore a note from archive
  const restoreArchiveNoteHandler = async (note) => {
    // Update local state
    const updatedArchiveNotes = archiveNotes.filter(
      (item) => item.id !== note.id
    );
    const updatedNotes = [
      { ...note, timestamp: new Date().toISOString() },
      ...notes,
    ];

    setArchiveNotes(updatedArchiveNotes);
    setNotes(updatedNotes);

    // Save to localStorage
    saveToLocalStorage(updatedNotes, updatedArchiveNotes, deletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await unarchiveNoteFirebase(note.id);
        await addNote(note, user.uid);
      } catch (error) {
        // console.error("Error restoring note from archive in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Delete a note from archive (move to trash)

  // Restore a note from trash
  const restoreDeletedNoteHandler = async (note) => {
    // Update local state
    const updatedDeletedNotes = deletedNotes.filter(
      (item) => item.id !== note.id
    );
    const updatedNotes = [
      { ...note, timestamp: new Date().toISOString() },
      ...notes,
    ];

    setDeletedNotes(updatedDeletedNotes);
    setNotes(updatedNotes);

    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, updatedDeletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteDeletedNote(note.id);
        await addNote(note, user.uid);
      } catch (error) {
        // console.error("Error restoring note from trash in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Permanently delete a note from trash
  const deleteDeletedNoteHandler = async (note) => {
    // Update local state
    const updatedDeletedNotes = deletedNotes.filter(
      (item) => item.id !== note.id
    );
    setDeletedNotes(updatedDeletedNotes);

    // Save to localStorage
    saveToLocalStorage(notes, archiveNotes, updatedDeletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteDeletedNote(note.id);
      } catch (error) {
        // console.error("Error permanently deleting note in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Empty trash (delete all notes in trash)
  const emptyTrashHandler = async () => {
    // Update local state
    setDeletedNotes([]);

    // Save to localStorage
    saveToLocalStorage(notes, archiveNotes, []);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        // Delete all deleted notes from Firebase
        for (const note of deletedNotes) {
          await deleteDeletedNote(note.id);
        }
      } catch (error) {
        // console.error("Error emptying trash in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Update notes order (for drag and drop)
  const updateNotesOrderHandler = async (reorderedNotes) => {
    // Update local state
    setNotes(reorderedNotes);

    // Save to localStorage
    saveToLocalStorage(reorderedNotes, archiveNotes, deletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await updateNotesOrder(reorderedNotes, user.uid);
      } catch (error) {
        // console.error("Error updating notes order in Firebase:", error);
        setFirebaseError(error.message);

        // If we get a permissions error, disable Firestore
        if (
          error.code === "permission-denied" ||
          error.code === "missing-or-insufficient-permissions"
        ) {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Retry Firebase connection
  const retryFirebaseConnection = async () => {
    setFirebaseError(null);
    setFirestoreEnabled(true);

    // Check Firestore access
    const hasAccess = await checkFirestoreAccess();
    setFirestoreEnabled(hasAccess);

    if (hasAccess) {
      return loadFromFirebase();
    }

    return false;
  };

  return (
    <DataContext.Provider
      value={{
        notes,
        setNotes,
        archiveNotes,
        setArchiveNotes,
        deletedNotes,
        setDeletedNotes,
        addNoteHandler,
        archiveNoteHandler,
        unarchiveNoteHandler: restoreArchiveNoteHandler,
        deleteNoteHandler,
        deleteNoteForeverHandler: deleteDeletedNoteHandler,
        restoreNoteHandler: restoreDeletedNoteHandler,
        emptyTrashHandler,
        updateNoteHandler,
        updateNoteText: updateNoteHandler,
        updateNoteColor: updateNoteHandler,
        updateNotePinStatus: updateNoteHandler,
        updateNoteLockStatus: updateNoteHandler,
        updateNotePassword: updateNoteHandler,
        updateNotesOrderHandler,
        loading,
        firebaseError,
        setFirebaseError,
        firestoreEnabled,
        setFirestoreEnabled,
        retryFirebaseConnection,
        user,
        authEnabled,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
