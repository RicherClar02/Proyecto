"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState({ total: 0, count: 0 });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ 
    nombre: "", descripcion: "", precio: "", stock: "", categoria: "" 
  });
  const [loading, setLoading] = useState(true);
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

  

  const handleAddProduct = async () => {
    try {
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
        setNewProduct({ nombre: "", descripcion: "", precio: "", stock: "", categoria: "" });
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
      categoria: product.categoria || ""
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
        {/* Resumen de ventas - CORREGIDO */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gestión de Productos */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Gestión de Productos</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {showProductForm ? 'Cancelar' : 'Agregar Producto'}
              </button>
            </div>

            {showProductForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-3">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={newProduct.nombre}
                    onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                    className="w-full p-2 border rounded"
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
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