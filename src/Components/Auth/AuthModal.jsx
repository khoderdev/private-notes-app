import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  IconButton, 
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AuthForm from './AuthForm';

const AuthModal = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : '12px',
          maxWidth: '450px',
          width: '100%'
        }
      }}
    >
      <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <AuthForm />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
