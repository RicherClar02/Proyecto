export async function uploadImage(imageData) {
  try {
    // Convertir Data URL a Blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // Crear FormData para subir
    const formData = new FormData();
    formData.append('image', blob, 'product-image.jpg');
    
    // Subir a tu API
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Error al subir la imagen');
    }
    
    const data = await uploadResponse.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Alternativa: Guardar como Base64 en la base de datos
export function compressImage(imageData, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Redimensionar si es muy grande
      const maxWidth = 800;
      const maxHeight = 600;
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = imageData;
  });
}