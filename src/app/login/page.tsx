'use client';

import UserFormSwitcher from "../users/user-form-switcher";

export default function LoginPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,            
        padding: "10px",      
        alignItems: "center", 
      }}
    >
      <h1 style={{ fontSize: "1.6rem", textAlign: "center", margin: 0 }}>
        Bienvenido a MesaSegura
      </h1>
      <UserFormSwitcher />
    </div>
  );
}
