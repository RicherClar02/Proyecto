import { query } from '@/lib/db';

export async function GET() {
  try {
    // Probamos una consulta simple
    const result = await query('SELECT NOW() as current_time');
    
    return Response.json({
      success: true,
      message: `Conexión exitosa. Hora del servidor: ${result.rows[0].current_time}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error de conexión:', error);
    
    return Response.json({
      success: false,
      message: error.message,
      error: error.toString()
    }, { status: 500 });
  }
}