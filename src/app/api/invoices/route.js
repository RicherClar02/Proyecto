import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { pedido_id, metodo_pago } = await request.json();
    
    // Obtener información del pedido
    const pedidoResult = await query(
      `SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email
       FROM pedidos p 
       JOIN clientes c ON p.cliente_id = c.id 
       WHERE p.id = $1`,
      [pedido_id]
    );
    
    if (pedidoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }
    
    const pedido = pedidoResult.rows[0];
    
    // Obtener items del pedido
    const itemsResult = await query(
      `SELECT pi.*, pr.nombre as producto_nombre
       FROM pedido_items pi
       JOIN productos pr ON pi.producto_id = pr.id
       WHERE pi.pedido_id = $1`,
      [pedido_id]
    );
    
    // Generar código de factura único
    const codigo_factura = 'FACT-' + Date.now();
    
    // Crear factura
    const facturaResult = await query(
      `INSERT INTO facturas (pedido_id, codigo_factura, total, metodo_pago) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [pedido_id, codigo_factura, pedido.total, metodo_pago]
    );
    
    // Actualizar estado del pedido
    await query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2',
      ['completado', pedido_id]
    );
    
    return NextResponse.json({
      factura: facturaResult.rows[0],
      pedido: pedido,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error creando factura:', error);
    return NextResponse.json(
      { error: 'Error creando factura' },
      { status: 500 }
    );
  }
}