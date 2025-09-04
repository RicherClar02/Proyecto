import { NextResponse } from 'next/server';

// Datos simulados (en producción se conectaría a PostgreSQL)
let products = [
  { id: 1, nombre: 'Galletas', descripcion: 'Galletas de chocolate', precio: 2.50, stock: 100, categoria: 'Alimentos' },
  { id: 2, nombre: 'Cereales', descripcion: 'Cereales integrales', precio: 3.75, stock: 50, categoria: 'Alimentos' },
  { id: 3, nombre: 'Leche', descripcion: 'Leche entera 1L', precio: 1.80, stock: 80, categoria: 'Lácteos' },
  { id: 4, nombre: 'Pan', descripcion: 'Pan integral', precio: 1.20, stock: 40, categoria: 'Panadería' },
  { id: 5, nombre: 'Jugo', descripcion: 'Jugo de naranja', precio: 2.00, stock: 60, categoria: 'Bebidas' }
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request) {
  try {
    const newProduct = await request.json();
    newProduct.id = Math.max(...products.map(p => p.id)) + 1;
    products.push(newProduct);
    
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 });
  }
}