import { Pool } from 'pg';

// Configuración de la conexión
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'r_admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'tienda_db',
  password: process.env.POSTGRES_PASSWORD || 'admin123',
  port: 5432,
});

// Conexión para empleados (permisos limitados)
const employeePool = new Pool({
  user: 'empleado_tienda',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'tienda_db',
  password: 'empleado123',
  port: 5432,
});

// Función para probar la conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
}

// Función para ejecutar queries
export async function query(text, params, isEmployee = false) {
  const usePool = isEmployee ? employeePool : pool;
  
  try {
    const start = Date.now();
    const res = await usePool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Query ejecutado en', duration, 'ms');
    return res;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
}

export { pool, employeePool };