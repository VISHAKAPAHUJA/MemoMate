import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create theme with DEFAULT MUI values first to verify it works
const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap App in React.StrictMode ONLY after verifying styles work
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);