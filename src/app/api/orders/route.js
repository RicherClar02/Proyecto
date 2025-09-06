import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT p.*, c.nombre as cliente_nombre 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      ORDER BY p.creado_en DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo pedidos' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { cliente_id, usuario_id, productos } = await request.json();
    
    // Usar el PROCEDURE de PostgreSQL
    await query('CALL registrar_pedido($1, $2, $3)', [
      cliente_id, 
      usuario_id, 
      JSON.stringify(productos)
    ]);

    // Obtener el último pedido insertado
    const result = await query(`
      SELECT p.*, c.nombre as cliente_nombre 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      ORDER BY p.id DESC 
      LIMIT 1
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json(
      { error: 'Error creando pedido' }, 
      { status: 500 }
    );
  }
}