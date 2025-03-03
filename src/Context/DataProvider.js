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
  const [firestoreEnabled, setFirestoreEnabled] = useState(true); // Start with Firestore enabled by default

  const { user, authEnabled } = useAuth(setFirebaseError, setFirestoreEnabled);

  // Check Firestore access on component mount and whenever user changes
  useEffect(() => {
    const checkAccess = async () => {
      if (user && authEnabled) {
        try {
          const hasAccess = await checkFirestoreAccess();
          console.log("Firestore access check result:", hasAccess);
          setFirestoreEnabled(hasAccess);

          // If we don't have access, log the reason
          if (!hasAccess) {
            console.log("Firestore access denied - using local storage only");
            setFirebaseError(
              "Firestore access denied. Using local storage only."
            );
          } else {
            setFirebaseError(null);
          }
        } catch (error) {
          console.error("Error checking Firestore access:", error);
          setFirestoreEnabled(false);
          setFirebaseError("Error accessing Firestore: " + error.message);
        }
      } else {
        console.log("No user or auth disabled - using local storage only");
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

      console.log("Loading from localStorage:", {
        notesCount: localNotes.length,
        archiveNotesCount: localArchiveNotes.length,
        deletedNotesCount: localDeletedNotes.length,
      });

      if (localNotes.length > 0) {
        console.log("Sample note from localStorage:", localNotes[0]);
      }

      setNotes(localNotes);
      setArchiveNotes(localArchiveNotes);
      setDeletedNotes(localDeletedNotes);
      setLoading(false);

      return { localNotes, localArchiveNotes, localDeletedNotes };
    } catch (error) {
      console.error("Error loading from localStorage:", error);
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
        console.error("Error saving to localStorage:", error);
      }
    },
    []
  );

  // Load data from Firebase
  const loadFromFirebase = useCallback(async () => {
    if (!user || !authEnabled || !firestoreEnabled) {
      console.log("Skipping Firebase load - not enabled or no user");
      return false;
    }

    try {
      setLoading(true);

      // Fetch all data from Firebase
      const [firebaseNotes, firebaseArchiveNotes, firebaseDeletedNotes] =
        await Promise.all([
          fetchNotes(user.uid),
          fetchArchivedNotes(user.uid),
          fetchDeletedNotes(user.uid),
        ]);

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

      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error loading from Firebase:", error);
      setFirebaseError(error.message);

      // If we get a permissions error, disable Firestore
      if (
        error.code === "permission-denied" ||
        error.code === "missing-or-insufficient-permissions"
      ) {
        setFirestoreEnabled(false);

        // Don't overwrite existing data with empty data from Firebase
        // Just set the error message and keep the current data
        setLoading(false);
      } else {
        // For other errors, fall back to localStorage
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
      // Always load from localStorage first for immediate data display
      const localData = loadFromLocalStorage();

      // Then try to load from Firebase if available and not already known to be disabled
      if (user && authEnabled && firestoreEnabled) {
        try {
          // Check Firestore access first before attempting to load data
          const hasAccess = await checkFirestoreAccess();

          if (hasAccess) {
            await loadFromFirebase();
          } else {
            // If we don't have access, just set the error message and keep using localStorage data
            setFirestoreEnabled(false);
            setFirebaseError(
              "Firestore access denied. Using local storage only."
            );
            console.log(
              "Firestore access denied during initialization - using local storage only"
            );
          }
        } catch (error) {
          console.error("Error loading from Firebase:", error);
          // We already have data from localStorage, so just log the error
        }
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

      // Always save to localStorage first
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);

      // Try to save to Firebase if enabled
      if (user && firestoreEnabled) {
        console.log("Attempting to save note to Firebase:", newNote);
        try {
          await addNote(newNote, user.uid);
        } catch (error) {
          console.log("Error adding note to Firebase:", error);

          // If we get a permission error, disable Firestore for future operations
          if (
            error.code === "permission-denied" ||
            error.message.includes("Missing or insufficient permissions")
          ) {
            console.log(
              "Permission denied - disabling Firestore for future operations"
            );
            setFirestoreEnabled(false);
            setFirebaseError(
              "Firestore permission denied. Using local storage only."
            );

            // Note is already saved to localStorage, so we don't need to do anything else
            // Just log the error and continue
          } else {
            // For other errors, show the error but don't disable Firestore
            setFirebaseError(`Error saving to cloud: ${error.message}`);
          }
        }
      } else {
        console.log("Skipping Firebase save - not enabled or no user");
      }

      return newNote;
    } catch (error) {
      console.error("Error adding note:", error);
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
        console.error("Error updating note in Firebase:", error);
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
        console.error("Error deleting note in Firebase:", error);
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
        console.error("Error archiving note in Firebase:", error);
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
        console.error("Error restoring note from archive in Firebase:", error);
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
  const deleteArchiveNoteHandler = async (note) => {
    // Update local state
    const updatedArchiveNotes = archiveNotes.filter(
      (item) => item.id !== note.id
    );
    const updatedDeletedNotes = [
      { ...note, timestamp: new Date().toISOString() },
      ...deletedNotes,
    ];

    setArchiveNotes(updatedArchiveNotes);
    setDeletedNotes(updatedDeletedNotes);

    // Save to localStorage
    saveToLocalStorage(notes, updatedArchiveNotes, updatedDeletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await unarchiveNoteFirebase(note.id);
        await addDeletedNote(note, user.uid);
      } catch (error) {
        console.error("Error deleting note from archive in Firebase:", error);
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
        console.error("Error restoring note from trash in Firebase:", error);
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
        console.error("Error permanently deleting note in Firebase:", error);
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
  const emptyTrashHandler = async (notesToKeep = []) => {
    // If notesToKeep is provided, use it; otherwise, empty the trash completely
    const updatedDeletedNotes = notesToKeep.length > 0 ? notesToKeep : [];
    setDeletedNotes(updatedDeletedNotes);

    // Save to localStorage
    saveToLocalStorage(notes, archiveNotes, updatedDeletedNotes);

    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled && deletedNotes.length > 0) {
      try {
        // Delete each note individually
        const deletePromises = deletedNotes
          .filter((note) => !notesToKeep.some((keep) => keep.id === note.id))
          .map((note) => deleteDeletedNote(note.id));

        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Error emptying trash in Firebase:", error);
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
        console.error("Error updating notes order in Firebase:", error);
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
