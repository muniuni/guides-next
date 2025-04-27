"use client";
import { SessionProvider } from "next-auth/react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#000000",
      secondary: "#000000",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === "outlined" && {
            backgroundColor: "#FFFFFF",
            borderColor: "#000000",
            color: "#000000",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }),
          ...(ownerState.variant === "contained" && {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#222222",
            },
          }),
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#000000",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className={inter.className}>{children}</div>
      </ThemeProvider>
    </SessionProvider>
  );
}
