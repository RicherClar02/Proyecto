import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Obteniendo productos desde la base de datos...');
    
    const result = await query(`
      SELECT id, nombre, descripcion, precio, stock, categoria 
      FROM productos 
      WHERE stock > 0 
      ORDER BY nombre
    `);
    
    console.log('Productos encontrados:', result.rows.length);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo productos: ' + error.message },
      { status: 500 }
    );
  }
}