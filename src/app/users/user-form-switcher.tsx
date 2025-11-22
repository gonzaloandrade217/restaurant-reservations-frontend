"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "../../context/AuthContext";
import { Box, TextField, Button, Typography, Checkbox, FormControlLabel } from "@mui/material";

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

  // ----------------------------
  // Manejo de login + token
  // ----------------------------
  const handleLogin = (access_token: string, userRole: Role, userId: string) => {
    localStorage.setItem("authToken", access_token);
    localStorage.setItem("userRole", userRole);
    localStorage.setItem("userId", userId);

    login(access_token, userRole);

    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else router.push("/users/dashboard");
  };

  // ----------------------------
  // LOGIN / REGISTRO NORMAL
  // ----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (isLogin) {
      try {
        const res = await fetch("http://localhost:4000/users/login", {
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

    // REGISTRO NORMAL
    const userData = {
      name,
      email,
      password,
      role: isAdmin ? "ADMIN" : "USER",
    };

    try {
      const response = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.message?.includes("email") || errorData.message?.includes("Email")) {
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

  // ----------------------------
  // LOGIN CON GOOGLE
  // ----------------------------
  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;

    try {
      const res = await fetch("http://localhost:4000/auth/google", {
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

  // ----------------------------
  // Montaje del botón de Google
  // ----------------------------
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
        p: 4,
        maxWidth: 400,
        mx: "auto",
        border: "1px solid #ffffff",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        {isLogin ? "Iniciar Sesión" : "Crear Nuevo Usuario"}
      </Typography>

      {!isLogin && (
        <TextField
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          required
          sx={{
            "& .MuiInputBase-input": { color: "white" },
            "& .MuiInputLabel-root": { color: "white" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
          }}
        />
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant="outlined"
        fullWidth
        required
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
          },
        }}
      />

      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        fullWidth
        required
        sx={{
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiInputLabel-root": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "white" },
            "&.Mui-focused fieldset": { borderColor: "white" },
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
          label={<Typography sx={{ color: "white" }}>¿Registrarse como Administrador?</Typography>}
        />
      )}

      {message && (
        <Typography
          color={message.includes("éxito") || message.includes("Login") ? "success.main" : "error.main"}
          align="center"
        >
          {message}
        </Typography>
      )}

      <Button type="submit" variant="contained" color="primary" fullWidth onClick={handleSubmit}>
        {isLogin ? "Iniciar sesión" : "Registrar"}
      </Button>

      <Button
        variant="text"
        sx={{ mt: 1, color: "white" }}
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage("");
        }}
      >
        {isLogin ? "¿No tienes cuenta? Registrarse" : "¿Ya tienes cuenta? Iniciar sesión"}
      </Button>

      {/* Botón de Google */}
      <div id="googleSignInDiv" style={{ marginTop: 20, display: "flex", justifyContent: "center" }}></div>
    </Box>
  );
}
