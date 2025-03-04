import { useState, useContext, useRef } from "react";
import { DataContext } from "../Context/DataProvider";
import { useAuth } from "./useAuth";

export const useNoteForm = (
  initialState = {
    id: "",
    heading: "",
    text: "",
    color: "",
    created: new Date(),
    pinned: false,
    locked: false,
    password: "",
  }
) => {
  const [note, setNote] = useState(initialState);
  const [showTextField, setShowTextField] = useState(false);
  const { addNoteHandler, setFirebaseError, setFirestoreEnabled } =
    useContext(DataContext);
  useAuth(setFirebaseError, setFirestoreEnabled);
  const containerRef = useRef();

  const onTextChange = (e) => {
    const { name, value } = e.target;
    setNote((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Show the title field when user starts typing in the text field
    if (name === "text" && value.length > 0 && !showTextField) {
      setShowTextField(true);
    }
  };

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
          id: "",
          heading: "",
          text: "",
          color: "",
          created: new Date(),
          pinned: false,
          locked: false,
          password: "",
        });
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }

    setShowTextField(false);
  };

  const togglePin = () => {
    setNote((prevState) => ({
      ...prevState,
      pinned: !prevState.pinned,
    }));
  };

  const changeColor = (color) => {
    setNote((prevState) => ({
      ...prevState,
      color,
    }));
  };

  const toggleLock = () => {
    setNote((prevState) => ({
      ...prevState,
      locked: !prevState.locked,
    }));
  };

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
    containerRef,
  };
};
