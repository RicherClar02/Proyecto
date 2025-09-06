import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM pedidos 
      WHERE estado = 'completado'
    `);
    
    // Asegurar que siempre devolvemos números
    const responseData = {
      count: Number(result.rows[0]?.count) || 0,
      total: Number(result.rows[0]?.total) || 0
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    
    // Devolver valores por defecto en caso de error
    return NextResponse.json({ 
      count: 0, 
      total: 0 
    });
  }
}