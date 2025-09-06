import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.*, 
        c.nombre as cliente_nombre,
        c.email as cliente_email,
        u.nombre as empleado_nombre
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      LEFT JOIN usuarios u ON p.empleado_id = u.id
      ORDER BY p.creado_en DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    return NextResponse.json(
      { error: 'Error obteniendo pedidos: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { cliente_id, empleado_id, productos } = await request.json();
    
    console.log('Creando pedido para cliente:', cliente_id);
    console.log('Empleado:', empleado_id);
    console.log('Productos:', productos);

    const empleadoId = 1; // Temporal hasta implementar autenticación

    // Verificar que el cliente existe
    const clienteCheck = await query(
      'SELECT id, nombre FROM clientes WHERE id = $1',
      [cliente_id]
    );

    if (clienteCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'El cliente no existe' },
        { status: 400 }
      );
    }

    // Crear el pedido
    const pedidoResult = await query(
      `INSERT INTO pedidos (cliente_id, empleado_id, total, estado) 
       VALUES ($1, $2, 0, 'pendiente') 
       RETURNING *`,
      [cliente_id, empleadoId]
    );
    
    const pedido = pedidoResult.rows[0];
    let total = 0;

    console.log('Pedido creado con ID:', pedido.id);

    // Agregar items al pedido
    for (const item of productos) {
      // Verificar stock y obtener información del producto
      const productoCheck = await query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = $1',
        [item.producto_id]
      );

      if (productoCheck.rows.length === 0) {
        await query('DELETE FROM pedidos WHERE id = $1', [pedido.id]);
        return NextResponse.json(
          { error: `Producto ID ${item.producto_id} no existe` },
          { status: 400 }
        );
      }

      const producto = productoCheck.rows[0];
      const stockDisponible = producto.stock;
      
      if (stockDisponible < item.cantidad) {
        await query('DELETE FROM pedidos WHERE id = $1', [pedido.id]);
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto.nombre}. Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}` },
          { status: 400 }
        );
      }

      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      
      // Insertar item del pedido
      await query(
        `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, item.producto_id, item.cantidad, producto.precio, subtotal]
      );

      // Actualizar stock
      await query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.producto_id]
      );

      console.log(`Producto ${producto.nombre} agregado al pedido`);
    }

    // Actualizar total del pedido
    await query(
      'UPDATE pedidos SET total = $1 WHERE id = $2',
      [total, pedido.id]
    );

    await query(
  `INSERT INTO facturas (pedido_id, codigo_factura, total, metodo_pago, estado_pago)
   VALUES ($1, $2, $3, 'efectivo', 'pendiente')`,
  [pedido.id, 'FACT-' + String(pedido.id).padStart(6, '0'), total]
);

    console.log('Pedido completado. Total:', total);

    // Obtener el pedido completo con información del cliente
    const pedidoCompleto = await query(`
      SELECT 
        p.*, 
        c.nombre as cliente_nombre,
        c.email as cliente_email
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      WHERE p.id = $1
    `, [pedido.id]);

    return NextResponse.json({ 
      success: true, 
      pedido: pedidoCompleto.rows[0],
      total: total 
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json(
      { error: 'Error creando pedido: ' + error.message },
      { status: 500 }
    );
  }
}