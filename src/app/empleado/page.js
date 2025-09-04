"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Empleado() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orders, setOrders] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || userData.rol !== "empleado") {
      router.push("/");
      return;
    }
    setUser(userData);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      // Simular carga de datos desde la API
      const productsResponse = await fetch('/api/products');
      const customersResponse = await fetch('/api/customers');
      const ordersResponse = await fetch('/api/orders');
      
      const productsData = await productsResponse.json();
      const customersData = await customersResponse.json();
      const ordersData = await ordersResponse.json();
      
      setProducts(productsData);
      setCustomers(customersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, cantidad: item.cantidad + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newCantidad) => {
    if (newCantidad < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId ? { ...item, cantidad: newCantidad } : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !selectedCustomer) {
      alert("Debe seleccionar un cliente y agregar productos al carrito");
      return;
    }
    
    try {
      const orderData = {
        cliente_id: parseInt(selectedCustomer),
        usuario_id: user.id,
        productos: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio: item.precio
        }))
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (response.ok) {
        const order = await response.json();
        setCurrentOrder(order);
        setShowInvoice(true);
        setCart([]);
        setSelectedCustomer("");
        loadData(); // Recargar datos
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const generateInvoice = () => {
    // Lógica para generar factura y código QR
    alert("Generando factura y código QR de pago...");
  };

  if (!user) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Empleado</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hola, {user.nombre}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">Productos Disponibles</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-lg">{product.nombre}</h3>
                  <p className="text-gray-600">Precio: ${product.precio}</p>
                  <p className="text-gray-600">Stock: {product.stock}</p>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Agregar al carrito
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Carrito de Compras */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Nuevo Pedido</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Cliente:
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccione un cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.nombre} - {customer.email}
                  </option>
                ))}
              </select>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-gray-500">El carrito está vacío</p>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium">{item.nombre}</h3>
                        <p className="text-sm text-gray-600">${item.precio} c/u</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6"
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
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
                
                <button
                  onClick={placeOrder}
                  disabled={cart.length === 0 || !selectedCustomer}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded"
                >
                  Realizar Pedido
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Factura */}
        {showInvoice && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Factura #{(currentOrder.id || '').toString().padStart(6, '0')}</h2>
              
              <div className="mb-4">
                <p><strong>Cliente:</strong> {currentOrder.cliente_nombre}</p>
                <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Total:</strong> ${currentOrder.total}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Productos:</h3>
                <ul className="space-y-1">
                  {currentOrder.items && currentOrder.items.map((item, index) => (
                    <li key={index}>{item.nombre} - {item.cantidad} x ${item.precio}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowInvoice(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cerrar
                </button>
                <button
                  onClick={generateInvoice}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Generar Pago
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}