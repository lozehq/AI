import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Header from './components/Header'
import Hero from './components/Hero'
import ServiceForm from './components/ServiceForm'
import UserDashboard from './components/UserDashboard'
import Footer from './components/Footer'

// 导入全局样式
import './styles/global.css'

// Create a sci-fi themed dark mode
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f0ff', // Neon cyan
    },
    secondary: {
      main: '#ff00e4', // Neon pink
    },
    background: {
      default: '#050b1f', // Deep space blue
      paper: '#0a1229',   // Slightly lighter blue
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b7c4',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
          padding: '10px 20px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'all 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00f0ff 30%, #00a6ff 90%)',
          boxShadow: '0 0 10px #00f0ff',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ff00e4 30%, #ff0066 90%)',
          boxShadow: '0 0 10px #ff00e4',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 18, 41, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 240, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 240, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f0ff',
              boxShadow: '0 0 5px rgba(0, 240, 255, 0.5)',
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={
              <React.Fragment>
                <Hero />
                <ServiceForm />
              </React.Fragment>
            } />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Routes>
          <Footer />
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
