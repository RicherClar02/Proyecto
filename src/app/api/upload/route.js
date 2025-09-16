import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre único para la imagen
    const timestamp = Date.now();
    const filename = `product-${timestamp}.jpg`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Guardar imagen en el sistema de archivos
    await writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading image' },
      { status: 500 }
    );
  }
}