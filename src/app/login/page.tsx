'use client';

import UserFormSwitcher from "../users/user-form-switcher";

export default function LoginPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        minHeight: "80vh", 
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>Bienvenido a MesaSegura</h1>
      <UserFormSwitcher />
    </div>
  );
}
