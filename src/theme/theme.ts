import { createTheme, alpha } from '@mui/material/styles';
import type { Components, Theme } from '@mui/material/styles';

// ─────────────────────────────────────────────
// Palette tokens
// ─────────────────────────────────────────────
const PRIMARY = {
  main: '#5D87FF',
  light: '#ECF2FF',
  dark: '#4570EA',
  contrastText: '#ffffff',
};
const SECONDARY = {
  main: '#49BEFF',
  light: '#E8F7FF',
  dark: '#23afdb',
  contrastText: '#ffffff',
};
const SUCCESS = {
  main: '#13DEB9',
  light: '#E6FFFA',
  dark: '#02b3a9',
  contrastText: '#ffffff',
};
const INFO = {
  main: '#539BFF',
  light: '#EBF3FE',
  dark: '#1682d4',
  contrastText: '#ffffff',
};
const WARNING = {
  main: '#FFAE1F',
  light: '#FEF5E5',
  dark: '#ae8e59',
  contrastText: '#ffffff',
};
const ERROR = {
  main: '#FA896B',
  light: '#FDEDE8',
  dark: '#f3704d',
  contrastText: '#ffffff',
};

// ─────────────────────────────────────────────
// Component overrides
// ─────────────────────────────────────────────
const componentOverrides: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box',
      },
      html: {
        scrollBehavior: 'smooth',
      },
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#c1cdd8',
        borderRadius: '4px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#a0aec0',
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: 'none',
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.02em',
        padding: '8px 20px',
        '&:hover': {
          boxShadow: 'none',
        },
        '&.MuiButton-containedPrimary:hover': {
          backgroundColor: PRIMARY.dark,
        },
      },
      sizeSmall: {
        padding: '6px 14px',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '10px 28px',
        fontSize: '1rem',
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 7px 30px 0px rgba(90, 114, 123, 0.11)',
        border: '1px solid rgba(0,0,0,0.04)',
      },
    },
  },

  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '24px',
        '&:last-child': {
          paddingBottom: '24px',
        },
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.04)',
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: '1px solid rgba(0,0,0,0.06)',
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        marginBottom: 2,
        '&.Mui-selected': {
          backgroundColor: PRIMARY.light,
          color: PRIMARY.main,
          '& .MuiListItemIcon-root': {
            color: PRIMARY.main,
          },
          '&:hover': {
            backgroundColor: alpha(PRIMARY.main, 0.12),
          },
        },
        '&:hover': {
          backgroundColor: alpha(PRIMARY.main, 0.06),
        },
      },
    },
  },

  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 36,
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY.main,
          },
        },
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 600,
        fontSize: '0.75rem',
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 700,
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          backgroundColor: '#F4F6F9',
          color: '#5A6A85',
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '12px 16px',
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: alpha(PRIMARY.main, 0.03),
        },
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'rgba(0,0,0,0.06)',
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        fontSize: '0.75rem',
        fontWeight: 500,
      },
    },
  },

  MuiSkeleton: {
    defaultProps: {
      animation: 'wave',
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600,
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: 12,
      },
    },
  },

  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        '& .MuiBreadcrumbs-separator': {
          color: '#a0aec0',
        },
      },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
      },
    },
  },
};

// ─────────────────────────────────────────────
// Theme export
// ─────────────────────────────────────────────
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: PRIMARY,
    secondary: SECONDARY,
    success: SUCCESS,
    info: INFO,
    warning: WARNING,
    error: ERROR,
    background: {
      default: '#F4F6F9',
      paper: '#ffffff',
    },
    text: {
      primary: '#2A3547',
      secondary: '#5A6A85',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.3125rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
    overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem' },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 4px 8px rgba(0, 0, 0, 0.06)',
    '0px 6px 12px rgba(0, 0, 0, 0.06)',
    '0px 8px 16px rgba(0, 0, 0, 0.07)',
    '0px 10px 20px rgba(0, 0, 0, 0.07)',
    '0px 12px 24px rgba(0, 0, 0, 0.08)',
    '0px 14px 28px rgba(0, 0, 0, 0.08)',
    '0px 7px 30px rgba(90, 114, 123, 0.11)',
    '0px 7px 30px rgba(90, 114, 123, 0.14)',
    '0px 7px 30px rgba(90, 114, 123, 0.18)',
    '0px 7px 30px rgba(90, 114, 123, 0.22)',
    '0px 14px 36px rgba(90, 114, 123, 0.14)',
    '0px 14px 36px rgba(90, 114, 123, 0.18)',
    '0px 14px 36px rgba(90, 114, 123, 0.22)',
    '0px 18px 40px rgba(90, 114, 123, 0.18)',
    '0px 18px 40px rgba(90, 114, 123, 0.22)',
    '0px 20px 44px rgba(90, 114, 123, 0.22)',
    '0px 20px 44px rgba(90, 114, 123, 0.28)',
    '0px 24px 48px rgba(90, 114, 123, 0.24)',
    '0px 24px 48px rgba(90, 114, 123, 0.28)',
    '0px 28px 52px rgba(90, 114, 123, 0.28)',
    '0px 28px 52px rgba(90, 114, 123, 0.32)',
    '0px 32px 56px rgba(90, 114, 123, 0.32)',
    '0px 32px 56px rgba(90, 114, 123, 0.36)',
  ],
  components: componentOverrides,
});
