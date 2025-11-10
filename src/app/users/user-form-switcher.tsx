"use client";

import { useState } from "react";
import { useAuth, Role } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function UserFormSwitcher() {
  const { login } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // LOGIN
    if (isLogin) {
      try {
        const res = await fetch("http://localhost:4000/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error("Credenciales inválidas");

        const data = await res.json();

        // Guardar token
        localStorage.setItem("authToken", data.access_token);

        // Guardar ID del usuario (ESTO ES CLAVE PARA RESERVAR)
        localStorage.setItem("userId", data.user.id);

        // Guardar rol del usuario
        localStorage.setItem("userRole", data.user.role);

        // Contesto al contexto si lo usás
        login(data.access_token, data.user.role as Role);

        setMessage("Login exitoso!");
        setEmail("");
        setPassword("");

        //  Redirección según rol
        if (data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/users/dashboard");
        }
      } catch (err: any) {
        setMessage(err.message || "Error al iniciar sesión");
      }

      return; 
    }

    //  REGISTRO
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
        throw new Error(errorData.message || "Error al crear el usuario");
      }

      const createdUser = await response.json();

      setMessage(`Usuario (${createdUser.role}) creado con éxito: ${createdUser.name}`);
      setName("");
      setEmail("");
      setPassword("");
      setIsAdmin(false);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
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
    </Box>
  );
}
