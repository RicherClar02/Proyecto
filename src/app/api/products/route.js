import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT id, nombre, descripcion, precio, stock, categoria, creado_en 
      FROM productos 
      ORDER BY nombre
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo productos' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { nombre, descripcion, precio, stock, categoria } = await request.json();
    
    // Validaciones
    if (!nombre || !precio) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [nombre, descripcion || '', parseFloat(precio), parseInt(stock) || 0, categoria || '']
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json(
      { error: 'Error creando producto: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, nombre, descripcion, precio, stock, categoria } = await request.json();
    
    const result = await query(
      `UPDATE productos 
       SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5 
       WHERE id = $6 
       RETURNING *`,
      [nombre, descripcion, parseFloat(precio), parseInt(stock), categoria, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { error: 'Error actualizando producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await query('DELETE FROM productos WHERE id = $1', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return NextResponse.json(
      { error: 'Error eliminando producto' },
      { status: 500 }
    );
  }
}