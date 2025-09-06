import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query('SELECT * FROM clientes ORDER BY nombre');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return NextResponse.json(
      { error: 'Error obteniendo clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { nombre, email, telefono, direccion } = await request.json();
    
    const result = await query(
      `INSERT INTO clientes (nombre, email, telefono, direccion) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nombre, email, telefono, direccion]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creando cliente:', error);
    return NextResponse.json(
      { error: 'Error creando cliente' },
      { status: 500 }
    );
  }
}