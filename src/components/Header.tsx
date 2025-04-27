"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useSession } from "next-auth/react";
import { mutate } from "swr";
import CreateProjectForm from "@/components/CreateProjectForm";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSuccess = async () => {
    setOpen(false);
    await mutate("/api/projects");
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#fff",
          color: "#000",
          boxShadow: 1,
          top: 0,
          zIndex: 1100,
        }}
      >
        <Toolbar>
          <Box
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              "&:hover .dot1": { transform: "translateY(2px)" },
              "&:hover .dot2": { transform: "translateY(-4px)" },
              "&:hover .dot3": { transform: "translateY(2px)" },
            }}
          >
            <Box
              className="dot1"
              sx={{
                width: 8,
                height: 8,
                bgcolor: "primary.main",
                borderRadius: "50%",
                mr: 0.5,
                transition: "transform 0.3s",
              }}
            />
            <Box
              className="dot2"
              sx={{
                width: 8,
                height: 8,
                bgcolor: "secondary.main",
                borderRadius: "50%",
                mr: 0.5,
                transition: "transform 0.3s",
              }}
            />
            <Box
              className="dot3"
              sx={{
                width: 8,
                height: 8,
                bgcolor: "error.main",
                borderRadius: "50%",
                mr: 1,
                transition: "transform 0.3s",
              }}
            />
            <Typography
              variant="h6"
              component="span"
              sx={{ color: "#000", fontWeight: "bold" }}
            >
              GUIDES NEXT
            </Typography>
          </Box>

          {!isLoading &&
            (isLoggedIn ? (
              <>
                <Button
                  component={Link}
                  href="/auth/account"
                  variant="outlined"
                  startIcon={<AccountCircleIcon />}
                  sx={{
                    borderColor: "#000",
                    color: "#000",
                    backgroundColor: "#fff",
                  }}
                >
                  Account
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  sx={{
                    borderColor: "#000",
                    color: "#000",
                    backgroundColor: "#fff",
                    mr: 1,
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="contained"
                  sx={{ backgroundColor: "#000", color: "#fff" }}
                >
                  Create Account
                </Button>
              </>
            ))}
        </Toolbar>
      </AppBar>
    </>
  );
}
