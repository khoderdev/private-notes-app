import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { LoadingContainer } from '../styles/note';

const LoadingIndicator = ({ message = 'Loading...' }) => {
  return (
    <LoadingContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress 
          size={40} 
          thickness={4} 
          sx={{ 
            color: 'primary.main',
            animation: 'spin 1.5s linear infinite'
          }} 
        />
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </LoadingContainer>
  );
};

export default LoadingIndicator;
