"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "../../context/AuthContext";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

declare global {
  interface Window {
    google: any;
  }
}

export default function UserFormSwitcher() {
  const { login } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = (access_token: string, userRole: Role, userId: string) => {
    localStorage.setItem("authToken", access_token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userId", userId);

    login(access_token, userRole);

    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else router.push("/users/pages");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (isLogin) {
      try {
        const res = await fetch("http://192.168.1.6:4000/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error("Credenciales inválidas");

        const data = await res.json();
        handleLogin(data.access_token, data.user.role as Role, data.user.id);

        setMessage("Login exitoso!");
        setEmail("");
        setPassword("");
      } catch (err: any) {
        setMessage(err.message || "Error al iniciar sesión");
      }
      return;
    }

    const userData = {
      name,
      email,
      password,
      role: isAdmin ? "ADMIN" : "USER",
    };

    try {
      const response = await fetch("http://192.168.1.6:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.message?.includes("email")) {
          throw new Error("El correo ya está registrado. Probá iniciando sesión.");
        }

        throw new Error(errorData.message || "Error al crear el usuario");
      }

      const createdUser = await response.json();
      handleLogin(createdUser.access_token, createdUser.role as Role, createdUser.id);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;

    try {
      const res = await fetch("http://192.168.1.6:4000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: isAdmin ? "ADMIN" : "USER" }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        if (errorData.message?.includes("email")) {
          setMessage("El correo ya está registrado. Iniciá sesión en vez de registrarte.");
          return;
        }

        throw new Error("Error en el login con Google");
      }

      const data = await res.json();
      handleLogin(data.access_token, data.user.role as Role, data.user.id);
    } catch (error: any) {
      console.error("Error al enviar token al backend:", error.message);
    }
  };

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv")!,
      { theme: "outline", size: "large" }
    );
  }, [isAdmin]);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: "100%",
        maxWidth: 420,
        mx: "auto",
        mt: { xs: 3, sm: 5 },
        border: "1px solid white",
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, md: 3 },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          color: "white",
          fontSize: { xs: "1.5rem", sm: "1.7rem" },
        }}
      >
        {isLogin ? "Iniciar Sesión" : "Crear Nuevo Usuario"}
      </Typography>

      {!isLogin && (
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          InputLabelProps={{ style: { color: "white" } }}
          inputProps={{ style: { color: "white" } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "#ff9800" },
            },
          }}
        />
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ style: { color: "white" } }}
        inputProps={{ style: { color: "white" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "#ff9800" },
          },
        }}
      />

      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ style: { color: "white" } }}
        inputProps={{ style: { color: "white" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "#ff9800" },
          },
        }}
      />

      {!isLogin && (
        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              sx={{ color: "white" }}
            />
          }
          label={<Typography sx={{ color: "white" }}>Registrarse como Administrador</Typography>}
        />
      )}

      {message && (
        <Typography
          align="center"
          sx={{
            color: message.includes("éxito") || message.includes("Login")
              ? "success.main"
              : "error.main",
          }}
        >
          {message}
        </Typography>
      )}

      {/* BOTÓN NARANJA */}
      <Button
        type="submit"
        fullWidth
        onClick={handleSubmit}
        sx={{
          backgroundColor: "#ff9800",
          color: "white",
          py: 1.2,
          fontSize: { xs: "1rem", sm: "1.05rem" },
          borderRadius: 2,
          "&:hover": {
            backgroundColor: "#e56f00",
          },
        }}
      >
        {isLogin ? "Iniciar sesión" : "Registrar"}
      </Button>

      {/* Alternar */}
      <Button
        variant="text"
        sx={{
          mt: 1,
          color: "white",
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage("");
        }}
      >
        {isLogin ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciar sesión"}
      </Button>

      {/* GOOGLE BUTTON */}
      <div
        id="googleSignInDiv"
        style={{
          marginTop: 15,
          display: "flex",
          justifyContent: "center",
        }}
      ></div>
    </Box>
  );
}
