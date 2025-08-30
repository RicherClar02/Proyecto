// app/page.js

"use client"; // Marca este componente como "cliente" para usar hooks de React

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const validUsername = "admin";
    const validPassword = "123";

    if (username === validUsername && password === validPassword) {
      alert("¡Inicio de sesión exitoso!");
      setError(""); // Limpia el mensaje de error
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        
        <div className="flex flex-col gap-4 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-bold text-center mb-4">Iniciar Sesión</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-gray-700"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-gray-700"
              required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* Aquí puedes agregar un pie de página si es específico de esta página */}
      </footer>
    </div>
  );
}