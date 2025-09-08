"use client";
import { useState } from "react";

export default function TestConnection() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setMessage("Probando conexión...");
    
    try {
      const response = await fetch("/api/test-connection");
      const data = await response.json();
      
      if (data.success) {
        setMessage("✅ Conexión exitosa a PostgreSQL");
      } else {
        setMessage("❌ Error: " + data.message);
      }
    } catch (error) {
      setMessage("❌ Error de conexión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Prueba de Conexión a PostgreSQL</h1>
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Probando..." : "Probar Conexión"}
        </button>
        <p className="mt-4">{message}</p>
      </div>
    </div>
  );
}