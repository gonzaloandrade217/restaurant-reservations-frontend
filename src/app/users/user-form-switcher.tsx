"use client";

import { useState } from "react";
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

import { auth, googleProvider } from "../../firebase";  
import { signInWithPopup } from "firebase/auth";

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

        if (errorData.message?.includes("email")) {
          throw new Error("El correo ya está registrado. Iniciá sesión.");
        }

        throw new Error(errorData.message || "Error al crear usuario");
      }

      const createdUser = await response.json();
      handleLogin(createdUser.access_token, createdUser.role as Role, createdUser.id);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // ----------------------------
  // LOGIN CON GOOGLE - FIREBASE
  // ----------------------------
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      // Obtenemos idToken REAL de Firebase
      const idToken = await user.getIdToken(true);
      console.log("🔥 ID TOKEN DE FIREBASE:", idToken);

      // Mandamos token al backend Nest
      const res = await fetch("http://localhost:4000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          role: isAdmin ? "ADMIN" : "USER",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error en el login con Google");
      }

      const data = await res.json();
      handleLogin(data.access_token, data.user.role as Role, data.user.id);
    } catch (err: any) {
      console.error("Google SignIn error:", err);
      setMessage(err.message || "Error en login con Google");
    }
  };

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
      <Typography variant="h5" align="center">
        {isLogin ? "Iniciar Sesión" : "Crear Usuario"}
      </Typography>

      {!isLogin && (
        <TextField
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
      )}

      <TextField
        label="Email"
        value={email}
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="Contraseña"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
      />

      {!isLogin && (
        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          }
          label="¿Registrarse como Admin?"
        />
      )}

      {message && (
        <Typography color="error" align="center">
          {message}
        </Typography>
      )}

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        {isLogin ? "Iniciar sesión" : "Registrar"}
      </Button>

      <Button
        variant="text"
        fullWidth
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage("");
        }}
      >
        {isLogin ? "¿No tenés cuenta? Registrarse" : "¿Ya tenés cuenta? Iniciar sesión"}
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={handleGoogleSignIn}
        sx={{ backgroundColor: "#DB4437" }}
      >
        Ingresar con Google
      </Button>
    </Box>
  );
}
