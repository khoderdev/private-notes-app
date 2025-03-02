import { useNoteHandlers } from "../../hooks/useNoteHandlers";
import LockedNote from "./LockedNote";
import UnlockedNote from "./UnlockedNote";
import LockDialog from "../Dialogs/LockDialog";
import UnlockDialog from "../Dialogs/UnlockDialog";

const Note = ({ note, isDragging }) => {
  const {
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
  } = useNoteHandlers(note);

  if (note.isLocked && !isUnlocked) {
    return (
      <>
        <LockedNote
          note={note}
          isDragging={isDragging}
          setShowActions={setShowActions}
          unlockNote={unlockNote}
        />
        <UnlockDialog
          showUnlockDialog={showUnlockDialog}
          handleCloseUnlockDialog={handleCloseUnlockDialog}
          unlockPassword={unlockPassword}
          showPassword={showPassword}
          passwordError={passwordError}
          handleUnlockPasswordChange={handleUnlockPasswordChange}
          handleTogglePasswordVisibility={handleTogglePasswordVisibility}
          handleUnlock={handleUnlock}
        />
      </>
    );
  }

  return (
    <>
      <UnlockedNote
        note={note}
        isDragging={isDragging}
        setShowActions={setShowActions}
        showActions={showActions}
        lockNote={lockNote}
        handleLockAgain={handleLockAgain}
        handleRemoveLock={handleRemoveLock}
        archiveNote={archiveNote}
        deleteNote={deleteNote}
      />
      <LockDialog
        showLockDialog={showLockDialog}
        handleCloseLockDialog={handleCloseLockDialog}
        password={password}
        confirmPassword={confirmPassword}
        showPassword={showPassword}
        passwordError={passwordError}
        handlePasswordChange={handlePasswordChange}
        handleConfirmPasswordChange={handleConfirmPasswordChange}
        handleTogglePasswordVisibility={handleTogglePasswordVisibility}
        handleLock={handleLock}
      />
    </>
  );
};

export default Note;
