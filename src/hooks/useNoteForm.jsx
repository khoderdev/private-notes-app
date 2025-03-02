import { useState, useContext, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { DataContext } from '../Context/DataProvider';
import { useFirebaseAuth } from './useFirebaseAuth';

export const useNoteForm = (initialState = {
    id: '',
    heading: '',
    text: '',
    color: '',
    created: new Date(),
    pinned: false,
    locked: false,
    password: ''
}) => {
    const [note, setNote] = useState(initialState);
    const [showTextField, setShowTextField] = useState(false);
    const { addNoteHandler } = useContext(DataContext);
    const { user } = useFirebaseAuth();
    const containerRef = useRef();

    const onTextChange = (e) => {
        const { name, value } = e.target;
        setNote(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        // Show the title field when user starts typing in the text field
        if (name === 'text' && value.length > 0 && !showTextField) {
            setShowTextField(true);
        }
    }

    const handleClickAway = async () => {
        if (note.heading || note.text) {
            try {
                await addNoteHandler(
                    note.heading, 
                    note.text, 
                    note.locked, 
                    note.password
                );
                
                // Reset form after successful save
                setNote({
                    id: '',
                    heading: '',
                    text: '',
                    color: '',
                    created: new Date(),
                    pinned: false,
                    locked: false,
                    password: ''
                });
            } catch (error) {
                console.error("Error saving note:", error);
            }
        }
        
        setShowTextField(false);
    }

    const togglePin = () => {
        setNote(prevState => ({
            ...prevState,
            pinned: !prevState.pinned
        }));
    }

    const changeColor = (color) => {
        setNote(prevState => ({
            ...prevState,
            color
        }));
    }

    const toggleLock = () => {
        setNote(prevState => ({
            ...prevState,
            locked: !prevState.locked
        }));
    }

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            handleClickAway();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [note]);

    return {
        note,
        setNote,
        showTextField,
        setShowTextField,
        onTextChange,
        handleClickAway,
        togglePin,
        changeColor,
        toggleLock,
        containerRef
    };
};
