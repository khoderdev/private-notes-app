// import React from "react";
// import {
//   CardActions,
//   CardContent,
//   IconButton,
//   Typography,
//   Tooltip,
// } from "@mui/material";
// import {
//   ArchiveOutlined,
//   DeleteOutlineOutlined,
//   LockOutlined,
//   LockOpenOutlined,
//   DragIndicator,
// } from "@mui/icons-material";
// import { NoteContainer, DragHandle, UnlockedNoteCard } from "../../styles/note";

// const UnlockedNote = ({
//   note,
//   isDragging,
//   setShowActions,
//   showActions,
//   lockNote,
//   handleLockAgain,
//   handleRemoveLock,
//   archiveNote,
//   deleteNote,
// }) => (
//   <NoteContainer>
//     <DragHandle className="drag-handle">
//       <DragIndicator fontSize="small" />
//     </DragHandle>
//     <UnlockedNoteCard
//       isDragging={isDragging}
//       onMouseEnter={() => setShowActions(true)}
//       onMouseLeave={() => setShowActions(false)}
//     >
//       <CardContent sx={{ width: "100%", wordBreak: "break-word", flex: 1 }}>
//         {note.title && (
//           <Typography variant="h6" component="h2" gutterBottom>
//             {note.title}
//           </Typography>
//         )}
//         <Typography variant="body1">{note.text}</Typography>
//       </CardContent>
//       <CardActions
//         sx={{
//           display: "flex",
//           justifyContent: "flex-end",
//           marginTop: "auto",
//           padding: "8px",
//         }}
//       >
//         {note.isLocked ? (
//           <Tooltip title="Lock Again">
//             <IconButton onClick={handleLockAgain}>
//               <LockOpenOutlined fontSize="small" color="primary" />
//             </IconButton>
//           </Tooltip>
//         ) : (
//           <Tooltip title="Lock Note">
//             <IconButton
//               sx={{ visibility: showActions ? "visible" : "hidden" }}
//               onClick={lockNote}
//             >
//               <LockOutlined fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         )}
//         {note.isLocked && (
//           <Tooltip title="Remove Lock">
//             <IconButton
//               sx={{ visibility: showActions ? "visible" : "hidden" }}
//               onClick={handleRemoveLock}
//             >
//               <LockOutlined fontSize="small" color="disabled" />
//             </IconButton>
//           </Tooltip>
//         )}
//         <Tooltip title="Archive">
//           <IconButton
//             sx={{ visibility: showActions ? "visible" : "hidden" }}
//             onClick={() => archiveNote(note)}
//           >
//             <ArchiveOutlined fontSize="small" />
//           </IconButton>
//         </Tooltip>
//         <Tooltip title="Delete">
//           <IconButton
//             sx={{ visibility: showActions ? "visible" : "hidden" }}
//             onClick={() => deleteNote(note)}
//           >
//             <DeleteOutlineOutlined fontSize="small" />
//           </IconButton>
//         </Tooltip>
//       </CardActions>
//     </UnlockedNoteCard>
//   </NoteContainer>
// );

// export default UnlockedNote;
import React, { useState } from "react";
import {
  CardActions,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import {
  ArchiveOutlined,
  DeleteOutlineOutlined,
  LockOutlined,
  LockOpenOutlined,
  DragIndicator,
} from "@mui/icons-material";
import { NoteContainer, DragHandle, UnlockedNoteCard } from "../../styles/note";

const UnlockedNote = ({
  note,
  isDragging,
  setShowActions,
  showActions,
  lockNote,
  handleLockAgain,
  handleRemoveLock,
  archiveNote,
  deleteNote,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <NoteContainer>
      <DragHandle className="drag-handle">
        <DragIndicator fontSize="small" />
      </DragHandle>
      <UnlockedNoteCard
        isDragging={isDragging}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <CardContent sx={{ width: "100%", wordBreak: "break-word", flex: 1 }}>
          {note.title && (
            <Typography variant="h6" component="h2" gutterBottom>
              {note.title}
            </Typography>
          )}
          <Typography
            variant="body1"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              ...(isExpanded ? {} : { WebkitLineClamp: 3 }),
            }}
          >
            {note.text}
          </Typography>
          {note.text.length > 100 && !isExpanded && (
            <Button onClick={() => setIsExpanded(true)} sx={{ mt: 1 }}>
              Read more
            </Button>
          )}
          {isExpanded && (
            <Button onClick={() => setIsExpanded(false)} sx={{ mt: 1 }}>
              Show less
            </Button>
          )}
        </CardContent>
        <CardActions
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "auto",
            padding: "8px",
          }}
        >
          {note.isLocked ? (
            <Tooltip title="Lock Again">
              <IconButton onClick={handleLockAgain}>
                <LockOpenOutlined fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Lock Note">
              <IconButton
                sx={{ visibility: showActions ? "visible" : "hidden" }}
                onClick={lockNote}
              >
                <LockOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {note.isLocked && (
            <Tooltip title="Remove Lock">
              <IconButton
                sx={{ visibility: showActions ? "visible" : "hidden" }}
                onClick={handleRemoveLock}
              >
                <LockOutlined fontSize="small" color="disabled" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Archive">
            <IconButton
              sx={{ visibility: showActions ? "visible" : "hidden" }}
              onClick={() => archiveNote(note)}
            >
              <ArchiveOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              sx={{ visibility: showActions ? "visible" : "hidden" }}
              onClick={() => deleteNote(note)}
            >
              <DeleteOutlineOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </UnlockedNoteCard>
    </NoteContainer>
  );
};

export default UnlockedNote;
