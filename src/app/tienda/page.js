"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Datos de ejemplo (en producción vendrían de la base de datos)
const initialProducts = [
  { id: 1, name: "Galletas", price: 2.50, stock: 50 },
  { id: 2, name: "Cereales", price: 3.75, stock: 30 },
  { id: 3, name: "Leche", price: 1.80, stock: 40 },
  { id: 4, name: "Pan", price: 1.20, stock: 25 },
  { id: 5, name: "Jugo", price: 2.00, stock: 35 },
];

export default function Tienda() {
  const [user, setUser] = useState(null);
  const [products] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = () => {
    if (cart.length === 0 || !customerName) return;
    
    // Generar nuevo ID de pedido
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const newId = existingOrders.length > 0 ? Math.max(...existingOrders.map(o => o.id)) + 1 : 1;
    
    const newOrder = {
      id: newId,
      customerName,
      items: cart,
      total: getTotal(),
      status: "pendiente",
      date: new Date().toISOString()
    };
    
    // Guardar pedido
    const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    // Limpiar carrito y mostrar confirmación
    setCart([]);
    setOrderPlaced(true);
    
    // Ocultar confirmación después de 3 segundos
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tienda</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hola, {user.username}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Productos Disponibles</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-gray-600">Precio: ${product.price.toFixed(2)}</p>
                  <p className="text-gray-600">Stock: {product.stock}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Agregar al carrito
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Carrito de Compras */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Tu Pedido</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">Tu carrito está vacío</p>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6">
                  <p className="text-lg font-semibold">Total: ${getTotal().toFixed(2)}</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre para el pedido:
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Ingresa tu nombre"
                  />
                </div>
                
                <button
                  onClick={placeOrder}
                  disabled={cart.length === 0 || !customerName}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded"
                >
                  Realizar Pedido
                </button>
                
                {orderPlaced && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
                    ¡Pedido realizado con éxito! Será atendido pronto.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}