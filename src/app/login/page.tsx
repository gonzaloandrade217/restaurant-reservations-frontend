"use client";

import UserFormSwitcher from "../users/user-form-switcher";

export default function LoginPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1>Login</h1>
      <UserFormSwitcher />
    </div>
  );
}
