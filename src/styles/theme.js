import { createTheme } from '@mui/material/styles';

// 创建高端科技风格主题
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3CFFDC', // 霓虹青色
      light: '#7AFFEA',
      dark: '#00D6B4',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF3CAA', // 霓虹粉色
      light: '#FF7AC5',
      dark: '#D60077',
      contrastText: '#000000',
    },
    background: {
      default: '#030B17', // 深空蓝黑色
      paper: '#051326',
      darker: '#020810',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B7C4',
      disabled: '#6B7280',
    },
    divider: 'rgba(60, 255, 220, 0.12)',
    action: {
      active: '#3CFFDC',
      hover: 'rgba(60, 255, 220, 0.08)',
      selected: 'rgba(60, 255, 220, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    error: {
      main: '#FF4D6A',
    },
    warning: {
      main: '#FFAA3C',
    },
    info: {
      main: '#3C9EFF',
    },
    success: {
      main: '#3CFF88',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      letterSpacing: '0.02em',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '0.02em',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '0.02em',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '0.02em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.05em',
      lineHeight: 1.75,
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      letterSpacing: '0.03em',
      lineHeight: 1.66,
    },
    overline: {
      fontFamily: '"Rajdhani", sans-serif',
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#3CFFDC #051326",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#051326",
            width: 8,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#3CFFDC",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#7AFFEA",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#7AFFEA",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#7AFFEA",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(5, 19, 38, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(60, 255, 220, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '10px 24px',
          position: 'relative',
          overflow: 'hidden',
          textTransform: 'none',
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
          background: 'linear-gradient(135deg, #3CFFDC 0%, #00D6B4 100%)',
          boxShadow: '0 0 20px rgba(60, 255, 220, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #7AFFEA 0%, #3CFFDC 100%)',
            boxShadow: '0 0 25px rgba(60, 255, 220, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FF3CAA 0%, #D60077 100%)',
          boxShadow: '0 0 20px rgba(255, 60, 170, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF7AC5 0%, #FF3CAA 100%)',
            boxShadow: '0 0 25px rgba(255, 60, 170, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
          },
        },
        outlinedPrimary: {
          borderColor: '#3CFFDC',
          color: '#3CFFDC',
          boxShadow: '0 0 10px rgba(60, 255, 220, 0.1)',
          '&:hover': {
            borderColor: '#7AFFEA',
            boxShadow: '0 0 15px rgba(60, 255, 220, 0.3)',
            backgroundColor: 'rgba(60, 255, 220, 0.08)',
          },
        },
        outlinedSecondary: {
          borderColor: '#FF3CAA',
          color: '#FF3CAA',
          boxShadow: '0 0 10px rgba(255, 60, 170, 0.1)',
          '&:hover': {
            borderColor: '#FF7AC5',
            boxShadow: '0 0 15px rgba(255, 60, 170, 0.3)',
            backgroundColor: 'rgba(255, 60, 170, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(5, 19, 38, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(60, 255, 220, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1), 0 0 10px rgba(60, 255, 220, 0.05)',
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15), 0 0 15px rgba(60, 255, 220, 0.1)',
            borderColor: 'rgba(60, 255, 220, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(5, 19, 38, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 10px rgba(60, 255, 220, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 10px rgba(60, 255, 220, 0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(60, 255, 220, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(60, 255, 220, 0.3)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(60, 255, 220, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3CFFDC',
              boxShadow: '0 0 10px rgba(60, 255, 220, 0.3)',
            },
            '&.Mui-error fieldset': {
              borderColor: '#FF4D6A',
              boxShadow: '0 0 10px rgba(255, 77, 106, 0.3)',
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#3CFFDC',
          height: 8,
          '& .MuiSlider-track': {
            border: 'none',
            background: 'linear-gradient(90deg, #3CFFDC 0%, #00D6B4 100%)',
          },
          '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#051326',
            border: '2px solid #3CFFDC',
            boxShadow: '0 0 15px rgba(60, 255, 220, 0.5)',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: '0 0 20px rgba(60, 255, 220, 0.7)',
            },
            '&::before': {
              display: 'none',
            },
          },
          '& .MuiSlider-valueLabel': {
            lineHeight: 1.2,
            fontSize: 12,
            background: 'unset',
            padding: 0,
            width: 32,
            height: 32,
            borderRadius: '50% 50% 50% 0',
            backgroundColor: '#3CFFDC',
            color: '#000000',
            transformOrigin: 'bottom left',
            transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
            '&:before': { display: 'none' },
            '&.MuiSlider-valueLabelOpen': {
              transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
            },
            '& > *': {
              transform: 'rotate(45deg)',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            backgroundColor: '#3CFFDC',
            height: 3,
            borderRadius: 3,
            boxShadow: '0 0 10px rgba(60, 255, 220, 0.5)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: '#B0B7C4',
          '&.Mui-selected': {
            color: '#3CFFDC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        filled: {
          backgroundColor: 'rgba(60, 255, 220, 0.1)',
          color: '#3CFFDC',
          '&:hover': {
            backgroundColor: 'rgba(60, 255, 220, 0.2)',
          },
        },
        outlined: {
          borderColor: 'rgba(60, 255, 220, 0.3)',
          color: '#3CFFDC',
          '&:hover': {
            backgroundColor: 'rgba(60, 255, 220, 0.05)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(60, 255, 220, 0.12)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(60, 255, 220, 0.1)',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(90deg, #3CFFDC 0%, #00D6B4 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          strokeLinecap: 'round',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: 'rgba(60, 255, 136, 0.1)',
          color: '#3CFF88',
        },
        standardInfo: {
          backgroundColor: 'rgba(60, 158, 255, 0.1)',
          color: '#3C9EFF',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 170, 60, 0.1)',
          color: '#FFAA3C',
        },
        standardError: {
          backgroundColor: 'rgba(255, 77, 106, 0.1)',
          color: '#FF4D6A',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(60, 255, 220, 0.1)',
          color: '#3CFFDC',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(5, 19, 38, 0.9)',
          border: '1px solid rgba(60, 255, 220, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(60, 255, 220, 0.1)',
          fontSize: '0.75rem',
        },
        arrow: {
          color: 'rgba(5, 19, 38, 0.9)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(3, 11, 23, 0.8)',
          backdropFilter: 'blur(5px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(5, 19, 38, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(60, 255, 220, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(60, 255, 220, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(5, 19, 38, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(60, 255, 220, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(60, 255, 220, 0.1)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#3CFFDC',
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#3CFFDC',
              border: '6px solid #fff',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.3,
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
          },
          '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            opacity: 1,
          },
        },
      },
    },
  },
});

export default theme;
