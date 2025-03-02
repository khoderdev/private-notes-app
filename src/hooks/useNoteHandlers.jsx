import { useContext, useState } from 'react';
import { DataContext } from '../Context/DataProvider';

export const useNoteHandlers = (note) => {
    const { 
        archiveNote, 
        deleteNote, 
        updateNoteData 
    } = useContext(DataContext);
    
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleArchiveNote = () => {
        archiveNote(note);
    };

    const handleDeleteNote = () => {
        deleteNote(note);
    };

    const handleUpdateNote = (updatedNote) => {
        updateNoteData(updatedNote);
    };

    const handleColorChange = (color) => {
        const updatedNote = { ...note, color };
        updateNoteData(updatedNote);
    };

    const handleTogglePin = () => {
        const updatedNote = { ...note, pinned: !note.pinned };
        updateNoteData(updatedNote);
    };

    const handleToggleLock = () => {
        if (note.locked) {
            // If already locked, show password dialog to unlock
            setShowPasswordDialog(true);
        } else {
            // If not locked, show password dialog to set password
            setShowPasswordDialog(true);
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError('');
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handlePasswordSubmit = () => {
        if (note.locked) {
            // Verify password to unlock
            if (password === note.password) {
                const updatedNote = { ...note, locked: false, password: '' };
                updateNoteData(updatedNote);
                setShowPasswordDialog(false);
                setPassword('');
            } else {
                setPasswordError('Incorrect password');
            }
        } else {
            // Set password and lock note
            if (password.length < 4) {
                setPasswordError('Password must be at least 4 characters');
                return;
            }
            
            const updatedNote = { ...note, locked: true, password };
            updateNoteData(updatedNote);
            setShowPasswordDialog(false);
            setPassword('');
        }
    };

    const handleClosePasswordDialog = () => {
        setShowPasswordDialog(false);
        setPassword('');
        setPasswordError('');
    };

    return {
        handleArchiveNote,
        handleDeleteNote,
        handleUpdateNote,
        handleColorChange,
        handleTogglePin,
        handleToggleLock,
        showPasswordDialog,
        password,
        passwordError,
        showPassword,
        handlePasswordChange,
        handleTogglePasswordVisibility,
        handlePasswordSubmit,
        handleClosePasswordDialog
    };
};
