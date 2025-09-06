"use client";
import { useState } from "react";
import { testConnection } from '@/lib/db';

export default function TestDB() {
  const [connectionStatus, setConnectionStatus] = useState('');

  const testDBConnection = async () => {
    setConnectionStatus('Probando conexión...');
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? '✅ Conexión exitosa' : '❌ Error de conexión');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Prueba de conexión a PostgreSQL</h1>
      <button 
        onClick={testDBConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Probar Conexión
      </button>
      <p className="mt-4">{connectionStatus}</p>
    </div>
  );
}