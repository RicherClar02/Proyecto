"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Datos de ejemplo (en producción vendrían de la base de datos)
const initialProducts = [
  { id: 1, name: "Galletas", price: 2.50, stock: 50 },
  { id: 2, name: "Cereales", price: 3.75, stock: 30 },
  { id: 3, name: "Leche", price: 1.80, stock: 40 },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || (userData.role !== "admin" && userData.role !== "empleado")) {
      router.push("/");
      return;
    }
    setUser(userData);
    
    // Cargar pedidos desde localStorage
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(savedOrders);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      if (editingProduct) {
        // Editar producto existente
        setProducts(products.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }
            : p
        ));
        setEditingProduct(null);
      } else {
        // Agregar nuevo producto
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        setProducts([...products, {
          id: newId,
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        }]);
      }
      setNewProduct({ name: "", price: "", stock: "" });
      setShowProductForm(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const completeOrder = (orderId) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: "completado" } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hola, {user.username} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    placeholder="Nombre"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
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
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Editar
                        </button>
                        {user.role === "admin" && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gestión de Pedidos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Gestión de Pedidos</h2>
            
            <div className="space-y-4">
              {orders.filter(order => order.status === "pendiente").length === 0 ? (
                <p className="text-gray-500">No hay pedidos pendientes</p>
              ) : (
                orders.filter(order => order.status === "pendiente").map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Pedido #{order.id}</h3>
                        <p className="text-sm text-gray-500">Cliente: {order.customerName}</p>
                        <ul className="mt-2 text-sm">
                          {order.items.map((item, index) => (
                            <li key={index}>{item.name} - {item.quantity} x ${item.price.toFixed(2)}</li>
                          ))}
                        </ul>
                        <p className="mt-2 font-medium">Total: ${order.total.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Completar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}