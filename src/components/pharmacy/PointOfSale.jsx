import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaPlus, 
  FaMinus,
  FaUser,
  FaPhone,
  FaMoneyBillWave,
  FaPrint,
  FaTimes
} from 'react-icons/fa';

const PointOfSale = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    patient_id: '',
    customer_name: '',
    customer_phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await apiClient.get('/medicines?is_active=true&stock_quantity[gt]=0');
      setMedicines(response.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.medicine_id === medicine._id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicine_id === medicine._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        medicine_id: medicine._id,
        medicine_name: medicine.name,
        batch_id: medicine.batches?.[0]?._id,
        batch_number: medicine.batches?.[0]?.batch_number,
        unit_price: medicine.price_per_unit,
        quantity: 1,
        stock_quantity: medicine.stock_quantity
      }]);
    }
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(medicineId);
      return;
    }

    setCart(cart.map(item =>
      item.medicine_id === medicineId
        ? { ...item, quantity: Math.min(newQuantity, item.stock_quantity) }
        : item
    ));
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.medicine_id !== medicineId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    setProcessing(true);

    try {
      const response = await apiClient.post('/sales', {
        items: cart,
        patient_id: customer.patient_id || undefined,
        customer_name: customer.customer_name,
        customer_phone: customer.customer_phone,
        payment_method: paymentMethod
      });

      alert('Sale completed successfully!');
      
      // Print receipt or show success message
      if (window.confirm('Would you like to print the receipt?')) {
        window.print();
      }
      
      // Reset form
      setCart([]);
      setCustomer({ patient_id: '', customer_name: '', customer_phone: '' });
      setPaymentMethod('Cash');
      
    } catch (err) {
      alert('Failed to complete sale');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-teal-600" />
            Point of Sale
          </h1>
          <p className="text-gray-600">Process customer sales quickly and efficiently</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-h-96 overflow-y-auto">
              {filteredMedicines.map(medicine => (
                <button
                  key={medicine._id}
                  onClick={() => addToCart(medicine)}
                  disabled={medicine.stock_quantity === 0}
                  className="p-3 border rounded-lg text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-sm">{medicine.name}</div>
                  {medicine.generic_name && (
                    <div className="text-xs text-gray-500">{medicine.generic_name}</div>
                  )}
                  <div className="text-xs text-gray-500">{medicine.strength}</div>
                  <div className="font-bold text-teal-600 mt-1">₹{medicine.price_per_unit}</div>
                  <div className={`text-xs ${medicine.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Stock: {medicine.stock_quantity}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Customer Name"
                value={customer.customer_name}
                onChange={(e) => setCustomer(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customer.customer_phone}
                onChange={(e) => setCustomer(prev => ({ ...prev, customer_phone: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-gray-800 mb-3">Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.medicine_name}</div>
                      <div className="text-xs text-gray-500">₹{item.unit_price} × {item.quantity}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_quantity}
                        className="p-1 text-gray-500 hover:text-green-600 disabled:opacity-50"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.medicine_id)}
                        className="p-1 text-red-600 hover:text-red-800 ml-2"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            {cart.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total:</span>
                  <span className="text-lg text-teal-600">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          {cart.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Payment Method
              </h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-3"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
              </select>

              <button
                onClick={handleCheckout}
                disabled={processing || cart.length === 0}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaPrint />
                {processing ? 'Processing...' : `Complete Sale - ₹${calculateTotal().toFixed(2)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;