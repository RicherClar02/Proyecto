"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";

export default function Empleado() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("clientes");
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
  if (activeTab === "historial") {
    // Recargar pedidos automáticamente cuando se ve el historial
    const interval = setInterval(() => {
      loadData();
    }, 5000); // Recargar cada 5 segundos

    return () => clearInterval(interval);
  }
  }, [activeTab]);

  const loadData = async () => {
  try {
    setLoading(true);
    console.log("Cargando datos...");
    
    const [clientesRes, productosRes, pedidosRes] = await Promise.all([
      fetch('/api/clientes?t=' + Date.now()),
      fetch('/api/productos?t=' + Date.now()),
      fetch('/api/pedidos?t=' + Date.now())
    ]);

    if (clientesRes.ok) {
      const clientesData = await clientesRes.json();
      setClientes(clientesData);
    }

    if (productosRes.ok) {
      const productosData = await productosRes.json();
      setProductos(productosData);
    }

    if (pedidosRes.ok) {
      const pedidosData = await pedidosRes.json();
      console.log("Pedidos cargados:", pedidosData);
      setPedidos(pedidosData);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
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
        {/* Navegación por pestañas */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("clientes")}
            className={`py-2 px-4 font-medium ${
              activeTab === "clientes"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Gestión de Clientes
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`py-2 px-4 font-medium ${
              activeTab === "pedidos"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Realizar Pedidos
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`py-2 px-4 font-medium ${
              activeTab === "historial"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Historial de Pedidos
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === "clientes" && (
          <GestionClientes 
            clientes={clientes} 
            loading={loading} 
            onUpdate={loadData} 
          />
        )}

        {activeTab === "pedidos" && (
          <RealizarPedidos 
            clientes={clientes}
            productos={productos}
            loading={loading}
            onUpdate={loadData}
            empleadoId={user.id}
          />
        )}

        {activeTab === "historial" && (
          <HistorialPedidos 
            pedidos={pedidos}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}

// Componente para gestión de clientes
function GestionClientes({ clientes, loading, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones básicas
    if (!formData.nombre || !formData.email) {
      setError("Nombre y email son obligatorios");
      return;
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Cliente registrado exitosamente");
        setShowForm(false);
        setFormData({ nombre: "", email: "", telefono: "", direccion: "" });
        onUpdate(); // Recargar la lista de clientes
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Error al crear cliente");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
    }
  };

  if (loading) return <p className="text-gray-600">Cargando clientes...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de Clientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancelar' : 'Nuevo Cliente'}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Registrar Nuevo Cliente</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Dirección completa"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Registrar Cliente
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-medium">Lista de Clientes</h3>
          <p className="text-sm text-gray-600">{clientes.length} clientes registrados</p>
        </div>
        
        {clientes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay clientes registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{cliente.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{cliente.telefono || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(cliente.creado_en).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para realizar pedidos
function RealizarPedidos({ clientes, productos, loading, onUpdate, empleadoId }) {
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const agregarAlCarrito = (producto) => {
    // Verificar stock disponible
    if (producto.stock <= 0) {
      setError("❌ Producto sin stock disponible");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      // Verificar que no exceda el stock
      if (existe.cantidad + 1 > producto.stock) {
        setError("❌ No hay suficiente stock disponible");
        setTimeout(() => setError(""), 3000);
        return;
      }
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { 
        ...producto, 
        cantidad: 1,
        producto_id: producto.id
      }]);
    }
    setError("");
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    const producto = productos.find(p => p.id === id);
    
    if (nuevaCantidad > producto.stock) {
      setError("❌ No hay suficiente stock disponible");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (nuevaCantidad < 1) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
    setError("");
  };

  const removerDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Dentro del componente RealizarPedidos, modifica la función realizarPedido:
const realizarPedido = async () => {
  if (!clienteSeleccionado) {
    setError("❌ Selecciona un cliente primero");
    setTimeout(() => setError(""), 3000);
    return;
  }

  if (carrito.length === 0) {
    setError("❌ Agrega productos al carrito");
    setTimeout(() => setError(""), 3000);
    return;
  }

  try {
    setError("");
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliente_id: parseInt(clienteSeleccionado),
        empleado_id: empleadoId,
        productos: carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio: item.precio
        }))
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess("✅ Pedido realizado exitosamente");
      setCarrito([]);
      setClienteSeleccionado("");
      setMostrarProductos(false);
      
      // Forzar recarga completa de datos
      await onUpdate();
      
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(data.error || "❌ Error al realizar el pedido");
      setTimeout(() => setError(""), 5000);
    }
  } catch (error) {
    console.error("Error:", error);
    setError("❌ Error de conexión con el servidor");
    setTimeout(() => setError(""), 3000);
  }
};
  if (loading) return <p className="text-gray-600">Cargando...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Realizar Pedido</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selección de cliente y productos */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Cliente *
            </label>
            <select
              value={clienteSeleccionado}
              onChange={(e) => {
                setClienteSeleccionado(e.target.value);
                setError("");
              }}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => setMostrarProductos(!mostrarProductos)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
            >
              {mostrarProductos ? '▲ Ocultar Productos' : '▼ Mostrar Productos'}
            </button>

            {mostrarProductos && (
              <div>
                <h4 className="font-medium mb-3 text-gray-700">Productos Disponibles</h4>
                {productos.length === 0 ? (
                  <p className="text-gray-500 p-4 bg-gray-50 rounded-lg">
                    No hay productos disponibles en este momento
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                    {productos.map((producto) => (
                      <div key={producto.id} className="bg-white p-3 rounded-lg shadow border hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-sm text-gray-900">{producto.nombre}</h4>
                        <p className="text-green-600 font-semibold text-sm">${producto.precio}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {producto.categoria} | Stock: {producto.stock}
                        </p>
                        {producto.descripcion && (
                          <p className="text-xs text-gray-600 mb-2">{producto.descripcion}</p>
                        )}
                        <button
                          onClick={() => agregarAlCarrito(producto)}
                          disabled={producto.stock <= 0}
                          className={`w-full py-1 px-2 rounded text-xs font-medium ${
                            producto.stock > 0
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {producto.stock > 0 ? '➕ Agregar al carrito' : '⛔ Sin stock'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Carrito de compras */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">🛒 Carrito de Compra</h3>
          
          {carrito.length === 0 ? (
            <p className="text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
              El carrito está vacío. Agrega productos desde la lista.
            </p>
          ) : (
            <div className="space-y-3">
              {carrito.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{item.nombre}</h4>
                    <p className="text-sm text-gray-600">${item.precio} c/u</p>
                    <p className="text-xs text-gray-500">Subtotal: ${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      className="bg-gray-200 hover:bg-gray-300 rounded w-6 h-6 text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      className="bg-gray-200 hover:bg-gray-300 rounded w-6 h-6 text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removerDelCarrito(item.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 rounded w-6 h-6 text-sm flex items-center justify-center ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${calcularTotal().toFixed(2)}
                  </span>
                </div>
                
                {clienteSeleccionado && (
                  <div className="mb-3 p-2 bg-blue-50 rounded">
                    <p className="text-sm text-blue-700">
                      Cliente: {clientes.find(c => c.id == clienteSeleccionado)?.nombre}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={realizarPedido}
                  disabled={!clienteSeleccionado || carrito.length === 0}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  ✅ Realizar Pedido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para historial de pedidos
function HistorialPedidos({ pedidos, loading }) {
  if (loading) return <p className="text-gray-600">Cargando historial...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">📋 Historial de Pedidos</h2>
      
      {pedidos.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay pedidos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">#{pedido.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pedido.cliente_nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ${pedido.total}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pedido.estado === 'completado' 
                          ? 'bg-green-100 text-green-800'
                          : pedido.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(pedido.creado_en).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}