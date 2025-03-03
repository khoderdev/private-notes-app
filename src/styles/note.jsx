import { Card, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

// Base card styles using theme for consistency across all card types
const baseCardStyles = (theme) => ({
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(["box-shadow", "transform"], {
    duration: theme.transitions.duration.short, // 250ms
    easing: theme.transitions.easing.easeInOut,
  }),
  minHeight: "220px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "visible",
});

// Hover effect using theme shadows and optimized transform
const hoverEffect = (theme) => ({
  boxShadow: theme.shadows[3],
  transform: "translateY(-2px)",
});

// Dragging effect with enhanced shadow and subtle scaling
const draggingEffect = (theme) => ({
  boxShadow: theme.shadows[6],
  transform: "scale(1.03)",
  zIndex: 100,
});

export const NoteCard = styled(Card)(({ theme, isDragging }) => ({
  ...baseCardStyles(theme),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: isDragging ? draggingEffect(theme).boxShadow : theme.shadows[1],
  transform: isDragging ? draggingEffect(theme).transform : "none",
  "&:hover": {
    ...hoverEffect(theme),
  },
}));

export const LockedNoteCard = styled(Card)(({ theme, isDragging }) => ({
  ...baseCardStyles(theme),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.action.disabledBackground,
  backgroundImage: "linear-gradient(to bottom right, #f8f9fa, #f1f3f5)",
  boxShadow: isDragging ? draggingEffect(theme).boxShadow : theme.shadows[1],
  transform: isDragging ? draggingEffect(theme).transform : "none",
  "&:hover": {
    ...hoverEffect(theme),
  },
}));

export const UnlockedNoteCard = styled(Card)(({ theme, isDragging }) => ({
  ...baseCardStyles(theme),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: isDragging ? draggingEffect(theme).boxShadow : theme.shadows[1],
  transform: isDragging ? draggingEffect(theme).transform : "none",
  "&:hover": {
    ...hoverEffect(theme),
  },
}));

export const DragHandle = styled("div")(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  opacity: 0,
  transition: theme.transitions.create(["opacity", "transform"], {
    duration: theme.transitions.duration.shortest,
  }),
  color: theme.palette.text.secondary,
  cursor: "grab",
  zIndex: 10,
  "&:active": {
    cursor: "grabbing",
    transform: "scale(1.1)",
  },
}));

export const NoteContainer = styled("div")(({ theme }) => ({
  position: "relative",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover .drag-handle": {
    opacity: 0.7,
  },
}));

export const Container = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  margin: "auto",
  transition: theme.transitions.create("box-shadow", {
    duration: theme.transitions.duration.short, // 250ms
  }),
  width: "100%",
  maxWidth: "70%",
  // padding: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    maxWidth: "90%",
  },
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  },
}));

export const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  marginTop: theme.spacing(1),
  padding: theme.spacing(0.5, 0),
  opacity: 0.8,
  transition: theme.transitions.create("opacity", {
    duration: theme.transitions.duration.shortest, // 200ms
  }),
  "&:hover": {
    opacity: 1,
  },
}));

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100vh",
  flexDirection: "column",
  gap: theme.spacing(2), // 16px
}));

export const StatusIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: "16px",
  fontSize: "0.875rem",
  marginLeft: "auto",
  marginRight: theme.spacing(2),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const MainContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(3),
}));

export const NotesContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: 0,
}));
