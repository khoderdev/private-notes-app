import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import {
  fetchNotes,
  fetchArchivedNotes,
  fetchDeletedNotes,
  addNote,
  updateNote,
  deleteNote,
  addArchivedNote,
  deleteArchivedNote,
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
  const [firestoreEnabled, setFirestoreEnabled] = useState(true);

  // Check Firestore access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      if (authEnabled) {
        const hasAccess = await checkFirestoreAccess();
        setFirestoreEnabled(hasAccess);
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
      
      setNotes(localNotes);
      setArchiveNotes(localArchiveNotes);
      setDeletedNotes(localDeletedNotes);
      
      return { localNotes, localArchiveNotes, localDeletedNotes };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return { localNotes: [], localArchiveNotes: [], localDeletedNotes: [] };
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = useCallback((updatedNotes, updatedArchiveNotes, updatedDeletedNotes) => {
    try {
      localStorage.setItem('notes', JSON.stringify(updatedNotes || notes));
      localStorage.setItem('archiveNotes', JSON.stringify(updatedArchiveNotes || archiveNotes));
      localStorage.setItem('deletedNotes', JSON.stringify(updatedDeletedNotes || deletedNotes));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [notes, archiveNotes, deletedNotes]);

  // Load data from Firebase
  const loadFromFirebase = useCallback(async () => {
    if (!user || !authEnabled || !firestoreEnabled) {
      return false;
    }

    setLoading(true);
    try {
      const firebaseNotes = await fetchNotes(user.uid);
      const firebaseArchiveNotes = await fetchArchivedNotes(user.uid);
      const firebaseDeletedNotes = await fetchDeletedNotes(user.uid);
      
      setNotes(firebaseNotes);
      setArchiveNotes(firebaseArchiveNotes);
      setDeletedNotes(firebaseDeletedNotes);
      
      // Update localStorage with Firebase data
      saveToLocalStorage(firebaseNotes, firebaseArchiveNotes, firebaseDeletedNotes);
      
      setFirebaseError(null);
      return true;
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      setFirebaseError(error.message);
      
      // If we get a permissions error, disable Firestore
      if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
        setFirestoreEnabled(false);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, authEnabled, firestoreEnabled, saveToLocalStorage]);

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // First load from localStorage
      const { localNotes, localArchiveNotes, localDeletedNotes } = loadFromLocalStorage();
      
      // Set initial data from localStorage
      setNotes(localNotes);
      setArchiveNotes(localArchiveNotes);
      setDeletedNotes(localDeletedNotes);
      
      // Then try to load from Firebase if available
      if (user && authEnabled && firestoreEnabled) {
        try {
          await loadFromFirebase();
        } catch (error) {
          console.error('Error in initial Firebase load:', error);
          setFirebaseError(error.message);
          
          // If we get a permissions error, disable Firestore
          if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
            setFirestoreEnabled(false);
          }
        }
      }
      
      setLoading(false);
    };
    
    initializeData();
  }, [user, authEnabled, firestoreEnabled, loadFromLocalStorage, loadFromFirebase]);

  // Add a new note
  const addNoteHandler = async (title, text, isLocked = false, password = null) => {
    const newNote = {
      id: uuid(),
      title,
      text,
      isLocked,
      password,
      date: new Date().toLocaleString().toString(),
      timestamp: new Date()
    };
    
    // Update local state
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);
    
    // Save to Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await addNote(newNote, user.uid);
      } catch (error) {
        console.error('Error adding note to Firebase:', error);
        setFirebaseError(error.message);
        
        // If we get a permissions error, disable Firestore
        if (error.code === 'permission-denied' || error.code === 'missing-or-insufficient-permissions') {
          setFirestoreEnabled(false);
        }
      }
    }
  };

  // Update an existing note
  const updateNoteHandler = async (updatedNote) => {
    // Update local state
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? { ...updatedNote, timestamp: new Date() } : note
    );
    setNotes(updatedNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, deletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await updateNote(updatedNote.id, { ...updatedNote, timestamp: new Date() });
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
    const updatedDeletedNotes = [{ ...note, timestamp: new Date() }, ...deletedNotes];
    
    setNotes(updatedNotes);
    setDeletedNotes(updatedDeletedNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, archiveNotes, updatedDeletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteNote(note.id);
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
    const updatedArchiveNotes = [{ ...note, timestamp: new Date() }, ...archiveNotes];
    
    setNotes(updatedNotes);
    setArchiveNotes(updatedArchiveNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, updatedArchiveNotes, deletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteNote(note.id);
        await addArchivedNote(note, user.uid);
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
    const updatedNotes = [{ ...note, timestamp: new Date() }, ...notes];
    
    setArchiveNotes(updatedArchiveNotes);
    setNotes(updatedNotes);
    
    // Save to localStorage
    saveToLocalStorage(updatedNotes, updatedArchiveNotes, deletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteArchivedNote(note.id);
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

  // Delete a note from archive
  const deleteArchiveNoteHandler = async (note) => {
    // Update local state
    const updatedArchiveNotes = archiveNotes.filter(item => item.id !== note.id);
    const updatedDeletedNotes = [{ ...note, timestamp: new Date() }, ...deletedNotes];
    
    setArchiveNotes(updatedArchiveNotes);
    setDeletedNotes(updatedDeletedNotes);
    
    // Save to localStorage
    saveToLocalStorage(notes, updatedArchiveNotes, updatedDeletedNotes);
    
    // Update in Firebase if available
    if (user && authEnabled && firestoreEnabled) {
      try {
        await deleteArchivedNote(note.id);
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
    const updatedNotes = [{ ...note, timestamp: new Date() }, ...notes];
    
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
