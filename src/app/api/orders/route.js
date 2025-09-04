import { NextResponse } from 'next/server';

// Datos simulados (en producción se conectaría a PostgreSQL)
let orders = [];
let orderIdCounter = 1;

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    const newOrder = {
      id: orderIdCounter++,
      ...orderData,
      estado: 'pendiente',
      creado_en: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    return NextResponse.json(newOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}