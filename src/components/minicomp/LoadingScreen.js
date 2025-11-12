// React and related imports
import React from 'react';

// MUI components
import { Box, CircularProgress } from '@mui/material';

// ✅ Simplest and cleanest
export default function LoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        p: 3,
      }}
    >
      <CircularProgress color="success" size="3rem" />
    </Box>
  );
}
