"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CameraModal from '@/componentss/CameraModal';
import SearchBar from '@/componentss/SearchBar';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState({ total: 0, count: 0 });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ 
    nombre: "", descripcion: "", precio: "", stock: "", categoria: "", imagen: null 
  });
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.rol !== "admin") {
      router.push("/");
      return;
    }
    setUser(userData);
    loadData();
  }, [router]);

  // Filtro de productos
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoria?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, salesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/pedidos'),
        fetch('/api/sales/total')
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      
      if (salesRes.ok) {
        const sales = await salesRes.json();
        setSalesData({
          total: Number(sales.total) || 0,
          count: Number(sales.count) || 0
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = async (dataUrl, quality) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calcular nuevas dimensiones manteniendo la relación de aspecto
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handlePhotoTaken = async (photoData) => {
    try {
      // Comprimir imagen antes de guardar
      const compressedImage = await compressImage(photoData, 0.7);
      setNewProduct(prev => ({
        ...prev,
        imagen: compressedImage
      }));
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleAddProduct = async () => {
    try {
      // Validar campos obligatorios
      if (!newProduct.nombre || !newProduct.precio) {
        alert("Nombre y precio son campos obligatorios");
        return;
      }

      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? '/api/products' : '/api/products';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct ? { ...newProduct, id: editingProduct.id } : newProduct)
      });
      
      if (response.ok) {
        setShowProductForm(false);
        setEditingProduct(null);
        setNewProduct({ nombre: "", descripcion: "", precio: "", stock: "", categoria: "", imagen: null });
        loadData();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      nombre: product.nombre,
      descripcion: product.descripcion || "",
      precio: product.precio,
      stock: product.stock,
      categoria: product.categoria || "",
      imagen: product.imagen || null
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      const response = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (response.ok) loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const completeOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'completado' })
      });
      if (response.ok) loadData();
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (!user) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hola, {user.nombre}</span>
            <button
              onClick={() => { localStorage.removeItem("user"); router.push("/"); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen de ventas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Ventas Totales</h3>
            <p className="text-3xl font-bold text-indigo-600">
              ${typeof salesData.total === 'number' ? salesData.total.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Pedidos Totales</h3>
            <p className="text-3xl font-bold text-indigo-600">{salesData.count || 0}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Productos</h3>
            <p className="text-3xl font-bold text-indigo-600">{products.length}</p>
          </div>
        </div>

        {/* Barra de búsqueda y botones */}
        <div className="mb-6 flex justify-between items-center">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Buscar productos por nombre, categoría..."
          />
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCamera(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              📸 Tomar Foto
            </button>
            <button
              onClick={() => setShowProductForm(!showProductForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showProductForm ? 'Cancelar' : 'Agregar Producto'}
            </button>
          </div>
        </div>

        {/* Modal de cámara */}
        <CameraModal
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onPhotoTaken={handlePhotoTaken}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gestión de Productos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Gestión de Productos</h2>

            {showProductForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <div className="space-y-3">
                  {/* Campo de imagen */}
                  {newProduct.imagen && (
                    <div className="mb-4">
                      <img
                        src={newProduct.imagen}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setNewProduct(prev => ({ ...prev, imagen: null }))}
                        className="text-red-500 text-sm ml-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                  >
                    {newProduct.imagen ? 'Cambiar foto' : '📸 Tomar foto'}
                  </button>

                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={newProduct.nombre}
                    onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <textarea
                    placeholder="Descripción"
                    value={newProduct.descripcion}
                    onChange={(e) => setNewProduct({...newProduct, descripcion: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio *"
                    value={newProduct.precio}
                    onChange={(e) => setNewProduct({...newProduct, precio: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={newProduct.categoria}
                    onChange={(e) => setNewProduct({...newProduct, categoria: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={handleAddProduct}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {editingProduct ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <p>Cargando productos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(searchQuery ? filteredProducts : products).map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.imagen ? (
                            <img
                              src={product.imagen}
                              alt={product.nombre}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              📷
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{product.nombre}</div>
                          <div className="text-sm text-gray-500">{product.categoria}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">${product.precio}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Gestión de Pedidos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Pedidos Recientes</h2>
            
            {loading ? (
              <p>Cargando pedidos...</p>
            ) : orders.filter(order => order.estado === "pendiente").length === 0 ? (
              <p className="text-gray-500">No hay pedidos pendientes</p>
            ) : (
              <div className="space-y-4">
                {orders.filter(order => order.estado === "pendiente").map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Pedido #{order.id}</h3>
                        <p className="text-sm text-gray-500">Cliente: {order.cliente_nombre}</p>
                        <p className="text-sm text-gray-500">Total: ${order.total}</p>
                        <p className="text-sm text-gray-500">Fecha: {new Date(order.creado_en).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Completar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}