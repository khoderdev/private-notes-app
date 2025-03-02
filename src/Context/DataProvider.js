import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
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
  checkFirestoreAccess
} from '../services/firebase';

export const DataContext = createContext(null);

const DataProvider = ({ children }) => {
  const { user, authEnabled } = useFirebaseAuth();
  const [notes, setNotes] = useState([]);
  const [archiveNotes, setArchiveNotes] = useState([]);
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [firestoreEnabled, setFirestoreEnabled] = useState(false); // Start with Firestore disabled by default

  // Check Firestore access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      if (authEnabled) {
        try {
          const hasAccess = await checkFirestoreAccess();
          console.log("Firestore access check result:", hasAccess);
          setFirestoreEnabled(hasAccess);
        } catch (error) {
          console.error("Error checking Firestore access:", error);
          setFirestoreEnabled(false);
        }
      } else {
        setFirestoreEnabled(false);
      }
    };
    
    checkAccess();
  }, [authEnabled]);

  // Load data from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const localNotes = JSON.parse(localStorage.getItem('notes')) || [];
      const localArchiveNotes = JSON.parse(localStorage.getItem('archiveNotes')) || [];
      const localDeletedNotes = JSON.parse(localStorage.getItem('deletedNotes')) || [];
      
      console.log("Loading from localStorage:", {
        notesCount: localNotes.length,
        archiveNotesCount: localArchiveNotes.length,
        deletedNotesCount: localDeletedNotes.length
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
      console.error('Error loading from localStorage:', error);
      setLoading(false);
      return { localNotes: [], localArchiveNotes: [], localDeletedNotes: [] };
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = useCallback((notes, archiveNotes, deletedNotes) => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes));
      localStorage.setItem('archiveNotes', JSON.stringify(archiveNotes));
      localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Load data from Firebase
  const loadFromFirebase = useCallback(async () => {
    if (!user || !authEnabled || !firestoreEnabled) {
      console.log("Skipping Firebase load - not enabled or no user");
      return false;
    }
    
    try {
      setLoading(true);
      
      // Fetch all data from Firebase
      const [firebaseNotes, firebaseArchiveNotes, firebaseDeletedNotes] = await Promise.all([
        fetchNotes(user.uid),
        fetchArchivedNotes(user.uid),
        fetchDeletedNotes(user.uid)
      ]);
      
      // Update state with Firebase data
      setNotes(firebaseNotes);
      setArchiveNotes(firebaseArchiveNotes);
      setDeletedNotes(firebaseDeletedNotes);
      
      // Also update localStorage with Firebase data
      saveToLocalStorage(firebaseNotes, firebaseArchiveNotes, firebaseDeletedNotes);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      setFirebaseError(error.message);
      
      // If we get a permissions error, disable Firestore
      if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
        setFirestoreEnabled(false);
      }
      
      // Fall back to localStorage
      loadFromLocalStorage();
      return false;
    }
  }, [user, authEnabled, firestoreEnabled, loadFromLocalStorage, saveToLocalStorage]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Always load from localStorage first for immediate data display
      const localData = loadFromLocalStorage();
      
      // Then try to load from Firebase if available
      if (user && authEnabled && firestoreEnabled) {
        try {
          await loadFromFirebase();
        } catch (error) {
          console.error('Error loading from Firebase:', error);
          // We already have data from localStorage, so just log the error
        }
      }
    };
    
    initializeData();
  }, [user, authEnabled, firestoreEnabled, loadFromLocalStorage, loadFromFirebase]);

  // Add a new note
  const addNoteHandler = async (heading, text, locked = false, password = '') => {
    const newNote = {
      id: uuid(),
      heading,
      text,
      locked,
      password,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    
    // Update local state
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled) {
      try {
        // If Firestore is not enabled, try to check access again
        if (!firestoreEnabled) {
          console.log("Firestore not enabled, retrying access check...");
          const hasAccess = await checkFirestoreAccess();
          console.log("Firestore access check result:", hasAccess);
          setFirestoreEnabled(hasAccess);
          
          if (!hasAccess) {
            console.log("Still no Firestore access, skipping Firebase save");
            return;
          }
        }
        
        console.log("Attempting to save note to Firebase:", newNote);
        await addNote(newNote, user.uid);
      } catch (error) {
        console.error('Error adding note to Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    } else {
      console.log("Skipping Firebase save - not enabled or no user", { 
        user: !!user, 
        authEnabled, 
        firestoreEnabled 
      });
    }
  };

  // Update an existing note
  const updateNoteHandler = async (updatedNote) => {
    // Update local state
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? { ...updatedNote, timestamp: new Date().toISOString() } : note
    );
    
    setNotes(updatedNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await updateNote(updatedNote.id, updatedNote);
      } catch (error) {
        console.error('Error updating note in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Delete a note (move to trash)
  const deleteNoteHandler = async (note) => {
    // Update local state
    const updatedNotes = notes.filter(item => item.id !== note.id);
    const updatedDeletedNotes = [{ ...note, timestamp: new Date().toISOString() }, ...deletedNotes];
    
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
        console.error('Error deleting note in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Archive a note
  const archiveNoteHandler = async (note) => {
    // Update local state
    const updatedNotes = notes.filter(item => item.id !== note.id);
    const updatedArchiveNotes = [{ ...note, timestamp: new Date().toISOString() }, ...archiveNotes];
    
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
        console.error('Error archiving note in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Restore a note from archive
  const restoreArchiveNoteHandler = async (note) => {
    // Update local state
    const updatedArchiveNotes = archiveNotes.filter(item => item.id !== note.id);
    const updatedNotes = [{ ...note, timestamp: new Date().toISOString() }, ...notes];
    
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
        console.error('Error restoring note from archive in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Delete a note from archive (move to trash)
  const deleteArchiveNoteHandler = async (note) => {
    // Update local state
    const updatedArchiveNotes = archiveNotes.filter(item => item.id !== note.id);
    const updatedDeletedNotes = [{ ...note, timestamp: new Date().toISOString() }, ...deletedNotes];
    
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
        console.error('Error deleting note from archive in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Restore a note from trash
  const restoreDeletedNoteHandler = async (note) => {
    // Update local state
    const updatedDeletedNotes = deletedNotes.filter(item => item.id !== note.id);
    const updatedNotes = [{ ...note, timestamp: new Date().toISOString() }, ...notes];
    
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
        console.error('Error restoring note from trash in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Permanently delete a note from trash
  const deleteDeletedNoteHandler = async (note) => {
    // Update local state
    const updatedDeletedNotes = deletedNotes.filter(item => item.id !== note.id);
    setDeletedNotes(updatedDeletedNotes);
    
    // Save to localStorage
    saveToLocalStorage(notes, archiveNotes, updatedDeletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteDeletedNote(note.id);
      } catch (error) {
        console.error('Error permanently deleting note in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
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
          .filter(note => !notesToKeep.some(keep => keep.id === note.id))
          .map(note => deleteDeletedNote(note.id));
        
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error emptying trash in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
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
        console.error('Error updating notes order in Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
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
    <DataContext.Provider value={{
      notes,
      setNotes,
      archiveNotes,
      setArchiveNotes,
      deletedNotes,
      setDeletedNotes,
      addNoteHandler,
      updateNoteHandler,
      deleteNoteHandler,
      archiveNoteHandler,
      restoreArchiveNoteHandler,
      deleteArchiveNoteHandler,
      restoreDeletedNoteHandler,
      deleteDeletedNoteHandler,
      emptyTrashHandler,
      updateNotesOrderHandler,
      loading,
      firebaseError,
      firestoreEnabled,
      retryFirebaseConnection
    }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
