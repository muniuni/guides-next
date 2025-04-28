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
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSession, signOut } from "next-auth/react";
import { mutate } from "swr";
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const [open, setOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

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
          bgcolor: "#ffffff",
          color: "#000",
          boxShadow: 0.5,
          top: 0,
          pt: 0.5,
          pb: 0.5,
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
              variant="h4"
              component="span"
              sx={{ color: "#000", fontWeight: "bold", ml: 0.2 }}
            >
              GUIDES-NEXT
            </Typography>
          </Box>

          {!isLoading &&
            (isLoggedIn ? (
              <>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={openMenu}
                  sx={{ color: "#000", mr: 0.1 }}
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={closeMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    component={Link}
                    href="/auth/account"
                    onClick={closeMenu}
                  >
                    <PermIdentityOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    Account settings
                  </MenuItem>
                  <MenuItem component={Link} href="/about" onClick={closeMenu}>
                    <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    About GUIDES-NEXT
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Log out
                    </ListItemIcon>
                  </MenuItem>
                </Menu>
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
