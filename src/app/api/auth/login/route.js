import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Simulación de consulta a la base de datos
    // En producción, conectarías con PostgreSQL aquí
    const users = [
      { id: 1, nombre: 'Administrador', email: 'admin@tienda.com', password: '123', rol: 'admin' },
      { id: 2, nombre: 'Empleado 1', email: 'empleado1@tienda.com', password: '123', rol: 'empleado' }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      return NextResponse.json({ 
        success: true, 
        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Credenciales incorrectas' 
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error en el servidor' 
    }, { status: 500 });
  }
}