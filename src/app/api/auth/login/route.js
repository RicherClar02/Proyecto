import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Intento de login:', email);
    
    if (!email || !password) {
      return Response.json({
        success: false,
        message: 'Email y contraseña son requeridos'
      }, { status: 400 });
    }

    // Consultar la base de datos
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE email = $1 AND password = $2',
      [email, password]
    );

    console.log('Resultado de la query:', result.rows);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      return Response.json({ 
        success: true, 
        user: { 
          id: user.id, 
          nombre: user.nombre, 
          email: user.email, 
          rol: user.rol 
        } 
      });
    } else {
      return Response.json({ 
        success: false, 
        message: 'Credenciales incorrectas' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en login API:', error);
    
    return Response.json({ 
      success: false, 
      message: 'Error en el servidor: ' + error.message,
      error: error.toString()
    }, { status: 500 });
  }
}