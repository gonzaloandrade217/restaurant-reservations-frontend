'use client';

import { Box, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundColor: "#121212",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      px: 2,
    }}>
      <Typography sx={{
        fontSize: "6rem",
        fontWeight: 700,
        color: "#ff9800",
        lineHeight: 1,
      }}>
        404
      </Typography>

      <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
        Página no encontrada
      </Typography>

      <Typography sx={{ color: "rgba(255,255,255,0.45)", textAlign: "center", maxWidth: 340 }}>
        La página que buscás no existe o fue movida.
      </Typography>

      <Button
        variant="contained"
        onClick={() => router.push("/")}
        sx={{ mt: 2, backgroundColor: "#ff9800", "&:hover": { backgroundColor: "#e65100" }, fontWeight: 700, px: 4 }}
      >
        Volver al inicio
      </Button>
    </Box>
  );
}