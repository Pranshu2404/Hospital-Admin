import React, { useState, useEffect, useRef } from 'react';
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
  FaTimes,
  FaTrash,
  FaBarcode,
  FaQrcode,
  FaHistory,
  FaRupeeSign,
  FaPercent,
  FaTags,
  FaBell,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaRedo,
  FaCalculator,
  FaIdCard,
  FaPrescriptionBottle,
  FaPills,
  FaUserMd,
  FaRegCopy,
  FaSave,
  FaFileInvoiceDollar,
  FaShoppingBag,
  FaBox,
  FaWarehouse,
  FaSortAmountDown,
  FaFilter,
  FaList
} from 'react-icons/fa';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  User,
  Phone,
  DollarSign,
  Printer,
  X,
  Trash2,
  Barcode,
  QrCode,
  History,
  Percent,
  Tag,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
  Calculator,
  CreditCard,
  Smartphone,
  Building,
  Shield,
  Package,
  Pill,
  UserCircle,
  Copy,
  Save,
  Receipt,
  ShoppingBag,
  Box,
  Warehouse,
  SortAsc,
  Filter,
  List,
  Grid,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Package2,
  Scan,
  FileText,
  ExternalLink,
  ScanBarcode,
  Camera,
  Divide,
  Hash,
  PackageOpen,
  ArrowRight,
  Check,
  AlertCircle,
  Info,
  BarChart3,
  TrendingUp as TrendingUpIcon,
  Download
} from 'lucide-react';

const PointOfSale = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    patient_id: '',
    customer_name: '',
    customer_phone: '',
    customer_type: 'walkin' // walkin, patient, customer
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [batchSelection, setBatchSelection] = useState({});
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [showCart, setShowCart] = useState(true);
  const [quickActions, setQuickActions] = useState([]);
  const [keyboardShortcut, setKeyboardShortcut] = useState(null);
  const [scanningMode, setScanningMode] = useState(false);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    averageSale: 0,
    topSelling: '',
    lowStock: 0
  });

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    fetchMedicines();
    fetchStats();
    initializeQuickActions();
    setupKeyboardShortcuts();

    // Auto-focus search input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    return () => {
      // Clean up keyboard shortcuts
      if (keyboardShortcut) {
        document.removeEventListener('keydown', keyboardShortcut);
      }
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 1) {
        searchMedicines();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl+F
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      
      // Clear cart on Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        clearCart();
      }
      
      // Process sale on Ctrl+Enter
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (cart.length > 0) {
          handleCheckout();
        }
      }
      
      // Toggle patient search on Ctrl+P
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setShowPatientSearch(!showPatientSearch);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    setKeyboardShortcut(() => handleKeyDown);
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/medicines?is_active=true&stock_quantity[gt]=0&limit=200');
      setMedicines(response.data || []);
      
      // Check for low stock medicines
      const lowStock = response.data.filter(med => 
        med.stock_quantity <= 10 && med.stock_quantity > 0
      );
      setStockAlerts(lowStock);
      
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/sales/stats/today');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const searchMedicines = async () => {
    try {
      const response = await apiClient.get(`/medicines/search?query=${encodeURIComponent(searchTerm)}&limit=20`);
      setSearchResults(response.data || []);
    } catch (err) {
      console.error('Error searching medicines:', err);
      setSearchResults([]);
    }
  };

  const searchPatients = async (query) => {
    try {
      const response = await apiClient.get(`/patients/search?query=${encodeURIComponent(query)}`);
      return response.data.patients || [];
    } catch (err) {
      console.error('Error searching patients:', err);
      return [];
    }
  };

  const initializeQuickActions = () => {
    const actions = [
      { id: 1, name: 'Pain Relief', icon: Pill, category: 'OTC', shortcut: 'F1' },
      { id: 2, name: 'Cold & Cough', icon: Pill, category: 'OTC', shortcut: 'F2' },
      { id: 3, name: 'Antibiotics', icon: Pill, category: 'Rx', shortcut: 'F3' },
      { id: 4, name: 'Vitamins', icon: Pill, category: 'Health', shortcut: 'F4' },
      { id: 5, name: 'First Aid', icon: Package, category: 'Emergency', shortcut: 'F5' },
      { id: 6, name: 'Diabetes', icon: Pill, category: 'Chronic', shortcut: 'F6' },
      { id: 7, name: 'Blood Pressure', icon: Pill, category: 'Chronic', shortcut: 'F7' },
      { id: 8, name: 'Topicals', icon: Package, category: 'External', shortcut: 'F8' }
    ];
    setQuickActions(actions);
  };

  const addToCart = (medicine) => {
    // Check if medicine has batches
    const hasBatches = medicine.batches && medicine.batches.length > 0;
    
    if (hasBatches && medicine.batches.length > 1) {
      // Show batch selection modal or prompt
      setBatchSelection({
        medicine,
        show: true,
        batches: medicine.batches
      });
      return;
    }

    const selectedBatch = hasBatches ? medicine.batches[0] : null;
    const existingItem = cart.find(item => 
      item.medicine_id === medicine._id && 
      item.batch_id === (selectedBatch?._id || null)
    );
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicine_id === medicine._id && item.batch_id === (selectedBatch?._id || null)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        medicine_id: medicine._id,
        medicine_name: medicine.name,
        generic_name: medicine.generic_name,
        strength: medicine.strength,
        batch_id: selectedBatch?._id || null,
        batch_number: selectedBatch?.batch_number || 'N/A',
        unit_price: selectedBatch?.selling_price || medicine.price_per_unit || 0,
        mrp: selectedBatch?.mrp || medicine.mrp || 0,
        quantity: 1,
        stock_quantity: selectedBatch?.quantity || medicine.stock_quantity,
        expiry_date: selectedBatch?.expiry_date,
        category: medicine.category,
        requires_prescription: medicine.requires_prescription
      }]);
    }
    
    // Clear search and focus
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const updateQuantity = (medicineId, batchId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(medicineId, batchId);
      return;
    }

    setCart(cart.map(item => {
      if (item.medicine_id === medicineId && item.batch_id === batchId) {
        const maxQuantity = item.stock_quantity;
        const finalQuantity = Math.min(newQuantity, maxQuantity);
        
        if (finalQuantity === newQuantity) {
          return { ...item, quantity: finalQuantity };
        } else {
          // Show alert for max quantity reached
          setStockAlerts(prev => [...prev, {
            type: 'max_stock',
            message: `Only ${maxQuantity} units available for ${item.medicine_name}`,
            medicine: item.medicine_name
          }]);
          return { ...item, quantity: finalQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId, batchId) => {
    setCart(cart.filter(item => 
      !(item.medicine_id === medicineId && item.batch_id === batchId)
    ));
  };

  const clearCart = () => {
    if (cart.length > 0) {
      if (window.confirm('Are you sure you want to clear the cart?')) {
        setCart([]);
        setDiscount(0);
        setNotes('');
      }
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setCustomer(prev => ({
      ...prev,
      patient_id: patient._id,
      customer_name: `${patient.first_name} ${patient.last_name}`,
      customer_phone: patient.phone,
      customer_type: 'patient'
    }));
    setShowPatientSearch(false);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = Math.min(discount, subtotal);
    }
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    
    return {
      subtotal: subtotal.toFixed(2),
      discount: discountAmount.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setStockAlerts(prev => [...prev, {
        type: 'empty_cart',
        message: 'Please add items to cart',
        level: 'warning'
      }]);
      return;
    }

    // Check for prescription-required medicines
    const prescriptionMedicines = cart.filter(item => item.requires_prescription);
    if (prescriptionMedicines.length > 0 && !selectedPatient?.patient_id) {
      if (!window.confirm('Some items require prescription. Continue with walk-in customer?')) {
        return;
      }
    }

    setProcessing(true);

    try {
      const totals = calculateTotals();
      
      const saleData = {
        items: cart.map(item => ({
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          batch_id: item.batch_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
          mrp: item.mrp
        })),
        patient_id: customer.patient_id || undefined,
        customer_name: customer.customer_name,
        customer_phone: customer.customer_phone,
        customer_type: customer.customer_type,
        payment_method: paymentMethod,
        discount: discount,
        discount_type: discountType,
        tax_rate: taxRate,
        notes: notes,
        subtotal: totals.subtotal,
        discount_amount: totals.discount,
        tax_amount: totals.tax,
        total_amount: totals.total
      };

      const response = await apiClient.post('/sales', saleData);
      
      setGeneratedReceipt(response.data.sale);
      setSaleSuccess(true);
      
      // Play success sound (optional)
      playSuccessSound();
      
      // Reset form after delay
      setTimeout(() => {
        resetForm();
      }, 3000);
      
    } catch (err) {
      console.error('Error:', err.response?.data || err);
      setStockAlerts(prev => [...prev, {
        type: 'error',
        message: err.response?.data?.message || 'Failed to complete sale',
        level: 'error'
      }]);
    } finally {
      setProcessing(false);
    }
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (err) {
      // Sound playback failed, continue silently
    }
  };

  const resetForm = () => {
    setCart([]);
    setCustomer({
      patient_id: '',
      customer_name: '',
      customer_phone: '',
      customer_type: 'walkin'
    });
    setSelectedPatient(null);
    setPaymentMethod('Cash');
    setDiscount(0);
    setDiscountType('percentage');
    setTaxRate(0);
    setNotes('');
    setSaleSuccess(false);
    setGeneratedReceipt(null);
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const printReceipt = () => {
    if (!generatedReceipt) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${generatedReceipt.sale_number}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; }
            .receipt { width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { font-size: 18px; margin: 5px 0; }
            .header h2 { font-size: 14px; margin: 5px 0; }
            .info { margin-bottom: 10px; }
            .info p { margin: 2px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 3px; text-align: left; font-size: 11px; }
            th { border-bottom: 1px dashed #000; }
            .total-row { border-top: 2px solid #000; }
            .totals { text-align: right; margin-top: 10px; }
            .totals p { margin: 3px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            .thank-you { font-weight: bold; margin: 10px 0; }
            @media print { 
              body { margin: 0; padding: 5px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>PHARMACY STORE</h1>
              <h2>RECEIPT</h2>
              <p>Sale #${generatedReceipt.sale_number}</p>
              <p>${new Date(generatedReceipt.sale_date).toLocaleString()}</p>
            </div>
            
            <div class="info">
              <p><strong>Customer:</strong> ${generatedReceipt.customer_name || 'Walk-in Customer'}</p>
              ${generatedReceipt.customer_phone ? `<p><strong>Phone:</strong> ${generatedReceipt.customer_phone}</p>` : ''}
              <p><strong>Payment:</strong> ${generatedReceipt.payment_method}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${generatedReceipt.items.map(item => `
                  <tr>
                    <td>${item.medicine_name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.unit_price}</td>
                    <td>₹${(item.unit_price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <p>Subtotal: ₹${generatedReceipt.subtotal}</p>
              ${generatedReceipt.discount_amount > 0 ? `<p>Discount: -₹${generatedReceipt.discount_amount}</p>` : ''}
              ${generatedReceipt.tax_amount > 0 ? `<p>Tax: ₹${generatedReceipt.tax_amount}</p>` : ''}
              <p class="total">Total: ₹${generatedReceipt.total_amount}</p>
            </div>
            
            <div class="footer">
              <div class="thank-you">Thank you for your purchase!</div>
              <p>Please keep this receipt for returns/exchanges</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash':
        return DollarSign;
      case 'Card':
        return CreditCard;
      case 'UPI':
        return Smartphone;
      case 'Net Banking':
        return Building;
      case 'Insurance':
        return Shield;
      default:
        return DollarSign;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading POS system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl shadow-sm">
            <ShoppingCart className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
            <p className="text-gray-600 text-sm mt-1">Process customer sales quickly and efficiently</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/pharmacy/sales')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <History /> Sales History
          </button>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Trash2 /> Clear Cart
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Sales</p>
              <p className="text-xl font-bold text-gray-800">{stats.todaySales}</p>
            </div>
            <Activity className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Sale</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.averageSale)}</p>
            </div>
            <BarChart3 className="text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Selling</p>
              <p className="text-xl font-bold text-gray-800 truncate">{stats.topSelling || 'N/A'}</p>
            </div>
            <TrendingUpIcon className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-bold text-gray-800">{stockAlerts.length}</p>
            </div>
            <AlertTriangle className="text-red-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search medicines by name, generic name, or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setScanningMode(!scanningMode)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  scanningMode 
                    ? 'bg-teal-600 text-white border-teal-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title={scanningMode ? 'Exit Scan Mode' : 'Scan Barcode'}
              >
                <Barcode className="w-5 h-5" />
              </button>
            </div>

            {/* Scan Mode */}
            {scanningMode && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ScanBarcode className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Barcode Scanner Active</span>
                  </div>
                  <button
                    onClick={() => setScanningMode(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode or enter manually..."
                  className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      // Handle barcode scan
                      const barcode = e.target.value;
                      // Find medicine by barcode
                      const medicine = medicines.find(m => 
                        m.barcode === barcode || m.batches?.some(b => b.barcode === barcode)
                      );
                      if (medicine) {
                        addToCart(medicine);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <p className="text-xs text-blue-600 mt-2">
                  Press Enter after scanning barcode. Click outside to exit scan mode.
                </p>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map(medicine => (
                    <button
                      key={medicine._id}
                      onClick={() => addToCart(medicine)}
                      disabled={medicine.stock_quantity === 0}
                      className="w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{medicine.name}</div>
                          {medicine.generic_name && (
                            <div className="text-sm text-gray-600">{medicine.generic_name}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">{medicine.strength} • {medicine.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-teal-600">{formatCurrency(medicine.price_per_unit)}</div>
                          <div className={`text-xs ${
                            medicine.stock_quantity > 10 ? 'text-green-600' : 
                            medicine.stock_quantity > 0 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            Stock: {medicine.stock_quantity}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions & Categories */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Quick Actions</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                  <SortAsc className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      // Filter medicines by category
                      const categoryMedicines = medicines.filter(m => 
                        m.category === action.category || 
                        m.tags?.includes(action.name.toLowerCase())
                      );
                      // Add first medicine or show category
                      if (categoryMedicines.length > 0) {
                        addToCart(categoryMedicines[0]);
                      }
                    }}
                    className="p-3 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-teal-50 rounded-lg">
                        <Icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-800">{action.name}</div>
                        <div className="text-xs text-gray-500">{action.category}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Available Medicines</h3>
                <div className="text-sm text-gray-500">
                  {medicines.length} items in stock
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-h-[400px] overflow-y-auto">
              {medicines.slice(0, 32).map(medicine => {
                const isLowStock = medicine.stock_quantity <= 10 && medicine.stock_quantity > 0;
                const isOutOfStock = medicine.stock_quantity === 0;
                const requiresPrescription = medicine.requires_prescription;
                
                return (
                  <button
                    key={medicine._id}
                    onClick={() => addToCart(medicine)}
                    disabled={isOutOfStock}
                    className="p-3 border border-gray-200 rounded-xl text-left hover:border-teal-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="space-y-2">
                      {/* Medicine Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {medicine.name}
                          </div>
                          {medicine.generic_name && (
                            <div className="text-xs text-gray-500 truncate">
                              {medicine.generic_name}
                            </div>
                          )}
                        </div>
                        {requiresPrescription && (
                          <div className="p-1 bg-red-50 rounded" title="Requires Prescription">
                            <FileText className="w-3 h-3 text-red-600" />
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="text-xs text-gray-500">
                        {medicine.strength} • {medicine.category}
                      </div>
                      
                      {/* Price & Stock */}
                      <div className="flex justify-between items-end">
                        <div className="font-bold text-teal-600">
                          {formatCurrency(medicine.price_per_unit)}
                        </div>
                        <div className={`text-xs ${
                          isOutOfStock ? 'text-red-600' :
                          isLowStock ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : `${medicine.stock_quantity} in stock`}
                        </div>
                      </div>
                      
                      {/* Warnings */}
                      {isLowStock && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          Low stock
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-4">
          {/* Customer Information */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Information
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomer({
                    patient_id: '',
                    customer_name: '',
                    customer_phone: '',
                    customer_type: 'walkin'
                  })}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Patient/Customer Type */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setCustomer(prev => ({ ...prev, customer_type: 'walkin' }))}
                  className={`p-2 text-center rounded-lg border transition-colors ${
                    customer.customer_type === 'walkin'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Walk-in
                </button>
                <button
                  onClick={() => setShowPatientSearch(true)}
                  className={`p-2 text-center rounded-lg border transition-colors ${
                    customer.customer_type === 'patient'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Patient
                </button>
              </div>

              {/* Patient Search Modal */}
              {showPatientSearch && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Search Patient</span>
                    <button
                      onClick={() => setShowPatientSearch(false)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or patient ID..."
                    className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                    onChange={async (e) => {
                      const patients = await searchPatients(e.target.value);
                      // Handle patient search results
                    }}
                  />
                </div>
              )}

              {selectedPatient && (
                <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-blue-800">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </div>
                      <div className="text-sm text-blue-600">
                        ID: {selectedPatient.patientId} • {selectedPatient.phone}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatient(null);
                        setCustomer(prev => ({ ...prev, patient_id: '', customer_type: 'walkin' }));
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={customer.customer_name}
                    onChange={(e) => setCustomer(prev => ({ ...prev, customer_name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={customer.customer_phone}
                    onChange={(e) => setCustomer(prev => ({ ...prev, customer_phone: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-600" />
                  Cart ({cart.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCart(!showCart)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    {showCart ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {showCart && (
              <div className="p-5">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto text-gray-300" size={48} />
                    <p className="text-gray-500 mt-2">Cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Add medicines to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {cart.map((item, index) => {
                        const totalPrice = item.unit_price * item.quantity;
                        const savings = (item.mrp - item.unit_price) * item.quantity;
                        
                        return (
                          <div key={index} className="p-3 border border-gray-200 rounded-xl hover:border-teal-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-800">{item.medicine_name}</div>
                                <div className="text-xs text-gray-500">
                                  {item.generic_name && `${item.generic_name} • `}{item.strength}
                                </div>
                                {item.batch_number !== 'N/A' && (
                                  <div className="text-xs text-gray-500">Batch: {item.batch_number}</div>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.medicine_id, item.batch_id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-200 rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(item.medicine_id, item.batch_id, item.quantity - 1)}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-3 py-1 text-center font-medium min-w-[40px]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.medicine_id, item.batch_id, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock_quantity}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500">
                                  Max: {item.stock_quantity}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-800 text-lg">
                                  {formatCurrency(totalPrice)}
                                </div>
                                {savings > 0 && (
                                  <div className="text-xs text-green-600">
                                    Save {formatCurrency(savings)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pricing Summary */}
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(parseFloat(calculateTotals().subtotal))}</span>
                      </div>
                      
                      {/* Discount */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newDiscount = prompt('Enter discount amount:');
                              if (newDiscount) {
                                setDiscount(parseFloat(newDiscount) || 0);
                              }
                            }}
                            className="text-xs text-teal-600 hover:text-teal-800 hover:bg-teal-50 px-2 py-1 rounded"
                          >
                            <Tag className="inline w-3 h-3 mr-1" />
                            Add Discount
                          </button>
                        </div>
                        {discount > 0 && (
                          <div className="text-red-600 font-medium">
                            -{formatCurrency(parseFloat(calculateTotals().discount))}
                          </div>
                        )}
                      </div>
                      
                      {/* Tax */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax ({taxRate}%)</span>
                        <span className="font-medium">{formatCurrency(parseFloat(calculateTotals().tax))}</span>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">Total</span>
                          <span className="text-2xl font-bold text-teal-600">
                            {formatCurrency(parseFloat(calculateTotals().total))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Payment & Checkout */}
          {cart.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="space-y-4">
                {/* Payment Method */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Payment Method</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'Card', 'UPI'].map((method) => {
                      const Icon = getPaymentIcon(method);
                      return (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                            paymentMethod === method
                              ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-100'
                              : 'border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Icon className="w-4 h-4" />
                            <span>{method}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    rows="2"
                    placeholder="Add any notes for this sale..."
                  />
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin w-5 h-5" />
                      Processing Sale...
                    </>
                  ) : saleSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Sale Completed!
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      Complete Sale ({formatCurrency(parseFloat(calculateTotals().total))})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {saleSuccess && generatedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Sale Complete!</h3>
                  <p className="text-sm text-teal-600">Receipt #{generatedReceipt.sale_number}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Payment Successful</h4>
                <p className="text-gray-600">Sale has been processed successfully</p>
              </div>

              {/* Receipt Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(generatedReceipt.sale_date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{generatedReceipt.customer_name || 'Walk-in Customer'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{generatedReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-xl font-bold text-teal-600">
                    {formatCurrency(generatedReceipt.total_amount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={printReceipt}
                  className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setSaleSuccess(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" /> New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {stockAlerts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          {stockAlerts.map((alert, index) => (
            <div
              key={index}
              className={`mb-2 p-4 rounded-xl shadow-lg border ${
                alert.level === 'error' 
                  ? 'bg-red-50 border-red-200' 
                  : alert.level === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              } animate-slide-up`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 ${
                  alert.level === 'error' 
                    ? 'text-red-600' 
                    : alert.level === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className={`font-medium ${
                    alert.level === 'error' 
                      ? 'text-red-800' 
                      : alert.level === 'warning'
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStockAlerts(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointOfSale;