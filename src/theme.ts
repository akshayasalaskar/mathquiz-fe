import { createTheme } from '@mui/material/styles'

// Use ONLY the provided hex colors.
const PRIMARY = '#88BDF2'
const SECONDARY = '#6A89A7'
const TEXT = '#384959'

// Neutrals (additional) to avoid an all-blue UI.
const PAGE = '#F7FAFF'
const SURFACE = '#FFFFFF'
const BORDER = '#E3ECF7'

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: PAGE, paper: SURFACE },
    primary: { main: PRIMARY },
    secondary: { main: SECONDARY },
    text: { primary: TEXT, secondary: TEXT },
    divider: BORDER,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${BORDER}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { color: TEXT },
      },
    },
  },
})

