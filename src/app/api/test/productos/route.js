import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar conexión y datos
    const result = await query('SELECT COUNT(*) as count FROM productos');
    const productos = await query('SELECT * FROM productos LIMIT 5');
    
    return NextResponse.json({
      conexion: true,
      total_productos: result.rows[0].count,
      muestra: productos.rows,
      mensaje: 'Conexión exitosa a la base de datos'
    });
  } catch (error) {
    return NextResponse.json({
      conexion: false,
      error: error.message,
      mensaje: 'Error de conexión a la base de datos'
    }, { status: 500 });
  }
}