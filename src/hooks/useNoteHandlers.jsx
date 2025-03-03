import { useContext, useState } from 'react';
import { DataContext } from '../Context/DataProvider';

export const useNoteHandlers = (note) => {
    const { 
        archiveNoteHandler, 
        deleteNoteHandler, 
        updateNoteHandler 
    } = useContext(DataContext);
    
    // Dialog states
    const [showLockDialog, setShowLockDialog] = useState(false);
    const [showUnlockDialog, setShowUnlockDialog] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    
    // Password states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [unlockPassword, setUnlockPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const archiveNote = () => {
        archiveNoteHandler(note);
    };

    const deleteNote = () => {
        deleteNoteHandler(note);
    };

    const updateNote = (updatedNote) => {
        updateNoteHandler(updatedNote);
    };

    const handleColorChange = (color) => {
        const updatedNote = { ...note, color };
        updateNoteHandler(updatedNote);
    };

    const handleTogglePin = () => {
        const updatedNote = { ...note, pinned: !note.pinned };
        updateNoteHandler(updatedNote);
    };

    // Lock functionality
    const lockNote = () => {
        setShowLockDialog(true);
    };

    const unlockNote = () => {
        setShowUnlockDialog(true);
    };

    const handleCloseLockDialog = () => {
        setShowLockDialog(false);
        setPassword('');
        setConfirmPassword('');
        setPasswordError('');
    };

    const handleCloseUnlockDialog = () => {
        setShowUnlockDialog(false);
        setUnlockPassword('');
        setPasswordError('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError('');
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setPasswordError('');
    };

    const handleUnlockPasswordChange = (e) => {
        setUnlockPassword(e.target.value);
        setPasswordError('');
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLock = () => {
        // Validate password
        if (password.length < 4) {
            setPasswordError('Password must be at least 4 characters');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        
        // Update note with password
        const updatedNote = { 
            ...note, 
            isLocked: true, 
            password: password,
            timestamp: new Date().toISOString()
        };
        updateNoteHandler(updatedNote);
        
        // Close dialog and reset state
        setShowLockDialog(false);
        setPassword('');
        setConfirmPassword('');
    };

    const handleUnlock = () => {
        // Verify password
        if (unlockPassword === note.password) {
            setIsUnlocked(true);
            setShowUnlockDialog(false);
            setUnlockPassword('');
        } else {
            setPasswordError('Incorrect password');
        }
    };

    const handleRemoveLock = () => {
        // Remove lock from note
        const updatedNote = { 
            ...note, 
            isLocked: false, 
            password: '',
            timestamp: new Date().toISOString()
        };
        updateNoteHandler(updatedNote);
        setIsUnlocked(false);
    };

    const handleLockAgain = () => {
        setIsUnlocked(false);
    };

    return {
        showActions,
        setShowActions,
        showLockDialog,
        showUnlockDialog,
        password,
        confirmPassword,
        unlockPassword,
        showPassword,
        passwordError,
        isUnlocked,
        archiveNote,
        deleteNote,
        lockNote,
        unlockNote,
        handleCloseLockDialog,
        handleCloseUnlockDialog,
        handlePasswordChange,
        handleConfirmPasswordChange,
        handleUnlockPasswordChange,
        handleTogglePasswordVisibility,
        handleLock,
        handleUnlock,
        handleRemoveLock,
        handleLockAgain,
        handleColorChange,
        handleTogglePin
    };
};
