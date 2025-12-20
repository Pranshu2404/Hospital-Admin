import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaPills, 
  FaSearch, 
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaUserMd,
  FaCalendarAlt,
  FaBoxOpen,
  FaFilePrescription,
  FaImage,
  FaShoppingCart,
  FaMoneyBillWave,
  FaPlus,
  FaMinus,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaTrash,
  FaEye,
  FaFileInvoice,
  FaRupeeSign,
  FaPercentage,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity,
  FaShieldAlt,
  FaTag,
  FaInfoCircle,
  FaCalculator,
  FaPrint,
  FaDownload,
  FaHistory,
  FaStar,
  FaBell,
  FaClock,
  FaCheck,
  FaTimes,
  FaFilter,
  FaSort,
  FaRedo
} from 'react-icons/fa';
import {
  Search,
  User,
  Pill,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  DollarSign,
  Plus,
  Minus,
  AlertTriangle,
  Loader,
  ArrowLeft,
  Trash2,
  Eye,
  FileText,
  CreditCard,
  Smartphone,
  Building,
  Shield,
  Tag,
  Info,
  Calculator,
  Printer,
  Download,
  History,
  Star,
  Bell,
  Filter,
  SortAsc,
  RefreshCw,
  ChevronRight,
  Package,
  TrendingUp,
  Percent,
  Receipt
} from 'lucide-react';

const DispenseMedication = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPrescriptions, setCustomerPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creatingSale, setCreatingSale] = useState(false);
  const [saleItems, setSaleItems] = useState([]);
  const [saleForm, setSaleForm] = useState({
    payment_method: 'Cash',
    customer_name: '',
    customer_phone: '',
    discount: 0,
    discount_type: 'percentage', // percentage or amount
    tax_rate: 0,
    notes: ''
  });
  const [batchInfo, setBatchInfo] = useState({});
  const [batchLoading, setBatchLoading] = useState({});
  const [medicineSearchLoading, setMedicineSearchLoading] = useState({});
  const [medicineMatches, setMedicineMatches] = useState({});
  const [autoSelected, setAutoSelected] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [createdSale, setCreatedSale] = useState(null);
  const [customerStats, setCustomerStats] = useState({
    totalPurchases: 0,
    lastPurchaseDate: null,
    averagePurchase: 0
  });
  const [expandedPrescriptions, setExpandedPrescriptions] = useState({});
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const searchInputRef = useRef(null);

  useEffect(() => {
    // Check if there's a prescription selected from the queue
    const storedPrescription = sessionStorage.getItem('selectedPrescription');
    if (storedPrescription && !autoSelected) {
      const prescriptionData = JSON.parse(storedPrescription);
      handleAutoSelectPrescription(prescriptionData);
      setAutoSelected(true);
      // Clear the stored prescription
      sessionStorage.removeItem('selectedPrescription');
    }
  }, [autoSelected]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 1) {
        searchCustomers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerStats();
    }
  }, [selectedCustomer]);

  const handleAutoSelectPrescription = async (prescriptionData) => {
    try {
      setLoading(true);
      
      // Fetch the full prescription details
      const prescriptionResponse = await apiClient.get(`/prescriptions/${prescriptionData._id}`);
      const prescription = prescriptionResponse.data.prescription || prescriptionResponse.data;
      
      // Set the patient as selected customer
      const patient = prescription.patient_id;
      if (patient) {
        setSelectedCustomer({
          ...patient,
          type: 'Patient',
          displayName: `${patient.first_name} ${patient.last_name}`,
          idDisplay: `Patient ID: ${patient.patientId}`
        });
        
        setSaleForm({
          payment_method: 'Cash',
          customer_name: `${patient.first_name} ${patient.last_name}`,
          customer_phone: patient.phone,
          discount: 0,
          discount_type: 'percentage',
          tax_rate: 0,
          notes: ''
        });
        
        // Fetch patient prescriptions
        const prescriptionsResponse = await apiClient.get(`/prescriptions/patient/${patient._id}`);
        setCustomerPrescriptions(prescriptionsResponse.data.prescriptions || prescriptionsResponse.data);
        
        // Auto-select the prescription
        setSelectedPrescription(prescription._id);
        
        // Auto-add all pending items to sale
        const pendingItems = prescription.items.filter(item => !item.is_dispensed);
        for (const item of pendingItems) {
          await addToSale(prescription, item);
        }
        
        setSuccessMessage('Prescription auto-loaded from queue');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error auto-selecting prescription:', err);
      setErrorMessage('Failed to load prescription from queue');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    setSearchLoading(true);
    try {
      const [patientsRes, customersRes] = await Promise.all([
        apiClient.get(`/patients?search=${searchTerm}`)
          .catch(err => {
            console.error('Error fetching patients:', err.message);
            return { data: { patients: [] } };
          }),
        apiClient.get(`/customers?search=${searchTerm}`)
          .catch(err => {
            console.error('Error fetching customers:', err.message);
            return { data: { customers: [] } };
          })
      ]);

      const patientsData = patientsRes.data.patients || [];
      const customersData = customersRes.data.customers || [];
      
      const combinedResults = [
        ...patientsData.map(p => ({ 
          ...p, 
          type: 'Patient',
          displayName: `${p.first_name} ${p.last_name}`,
          idDisplay: `Patient ID: ${p.patientId}`,
          icon: User
        })),
        ...customersData.map(c => ({ 
          ...c, 
          type: 'Customer',
          displayName: c.name,
          idDisplay: `Phone: ${c.phone}`,
          icon: ShoppingCart
        }))
      ];
      
      setSearchResults(combinedResults);
    } catch (err) {
      console.error('Unhandled error searching customers:', err);
      setErrorMessage('Error searching customers');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const response = await apiClient.get(`/orders/sale/stats/${selectedCustomer.type === 'Patient' ? selectedCustomer._id : selectedCustomer.phone}`);
      setCustomerStats(response.data);
    } catch (err) {
      console.error('Error fetching customer stats:', err);
    }
  };

  const searchMedicineByName = async (medicineName) => {
    setMedicineSearchLoading(prev => ({ ...prev, [medicineName]: true }));
    try {
      const response = await apiClient.get(`/medicines/search?query=${encodeURIComponent(medicineName)}`);
      console.log('Fetched medicines:', response.data);
      return response.data;
    } catch (err) {
      console.error(`Error searching for medicine ${medicineName}:`, err);
      return [];
    } finally {
      setMedicineSearchLoading(prev => ({ ...prev, [medicineName]: false }));
    }
  };

  const fetchMedicineBatches = async (medicineId) => {
    setBatchLoading(prev => ({ ...prev, [medicineId]: true }));
    try {
      const response = await apiClient.get(`/batches/medicine/${medicineId}`);
      console.log('Fetched batches:', response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching batches for medicine ${medicineId}:`, err);
      return [];
    } finally {
      setBatchLoading(prev => ({ ...prev, [medicineId]: false }));
    }
  };

  const selectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    setSelectedPrescription(null);
    setSaleItems([]);
    setSaleForm({
      payment_method: 'Cash',
      customer_name: customer.first_name ? `${customer.first_name} ${customer.last_name}` : customer.name,
      customer_phone: customer.phone,
      discount: 0,
      discount_type: 'percentage',
      tax_rate: 0,
      notes: ''
    });
    setSearchTerm('');
    setErrorMessage('');
    
    try {
      let endpoint = '';
      if (customer.type === 'Patient') {
        endpoint = `/prescriptions/patient/${customer._id}`;
      } else {
        endpoint = `/prescriptions?customerPhone=${customer.phone}`;
      }
      
      const response = await apiClient.get(endpoint);
      setCustomerPrescriptions(response.data.prescriptions || response.data);
      setSuccessMessage(`Loaded ${customer.displayName}'s prescriptions`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setErrorMessage('Failed to load prescriptions');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const addToSale = async (prescription, item) => {
    // First, search for the medicine by name to get the correct ID
    if (!medicineMatches[item.medicine_name]) {
      const matchedMedicines = await searchMedicineByName(item.medicine_name);
      
      if (matchedMedicines.length === 0) {
        setErrorMessage(`No medicine found with name: ${item.medicine_name}`);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Store the matches for future reference
      setMedicineMatches(prev => ({
        ...prev,
        [item.medicine_name]: matchedMedicines
      }));

      // If multiple matches, let the user choose
      if (matchedMedicines.length > 1) {
        // For simplicity, we'll take the first match, but you could implement a selection UI
        const selectedMedicine = matchedMedicines[0];
        console.log(`Multiple matches found for ${item.medicine_name}, using:`, selectedMedicine.name);
        
        // Continue with the first match
        await processMedicineAddition(prescription, item, selectedMedicine);
      } else {
        // Single match found
        await processMedicineAddition(prescription, item, matchedMedicines[0]);
      }
    } else {
      // We already have matches for this medicine name
      const matches = medicineMatches[item.medicine_name];
      if (matches.length > 0) {
        await processMedicineAddition(prescription, item, matches[0]);
      } else {
        setErrorMessage(`No medicine found with name: ${item.medicine_name}`);
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const processMedicineAddition = async (prescription, item, matchedMedicine) => {
    console.log('Matched medicine:', matchedMedicine);
    const medicineId = matchedMedicine._id;
    const medicineName = matchedMedicine.name;

    let batches = [];
    
    // Fetch batches for the matched medicine if not already in batchInfo
    if (!batchInfo[medicineId]) {
      batches = await fetchMedicineBatches(medicineId);
      console.log('Fetched batches:', batches);
      
      // Update batchInfo state
      setBatchInfo(prev => ({
        ...prev,
        [medicineId]: batches // Store the entire array of batches
      }));
    } else {
      // Use existing batches from batchInfo
      batches = batchInfo[medicineId];
    }

    // Check if item is already in sale
    const existingItem = saleItems.find(i => 
      i.medicine_id === medicineId && i.prescription_id === prescription._id
    );
    
    if (existingItem) {
      setSaleItems(prev => prev.map(i => 
        i.medicine_id === medicineId && i.prescription_id === prescription._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
      setSuccessMessage(`Increased quantity of ${medicineName}`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } else {
      // Add new item to sale with default batch selection
      const defaultBatch = batches.length > 0 ? batches[0] : null;
      
      setSaleItems(prev => [...prev, {
        medicine_id: medicineId,
        medicine_name: medicineName,
        original_prescription_name: item.medicine_name,
        unit_price: defaultBatch ? defaultBatch.selling_price : 0,
        quantity: item.quantity || 1,
        prescription_id: prescription._id,
        prescription_item: item,
        batch_id: defaultBatch ? defaultBatch._id : null,
        batch_number: defaultBatch ? defaultBatch.batch_number : 'N/A',
        available_batches: batches,
        mrp: matchedMedicine.mrp || defaultBatch?.mrp || defaultBatch?.selling_price || 0
      }]);
      setSuccessMessage(`Added ${medicineName} to sale`);
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const updateBatchSelection = (index, batchId) => {
    const batch = saleItems[index].available_batches.find(b => b._id === batchId);
    if (batch) {
      setSaleItems(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          batch_id: batch._id,
          batch_number: batch.batch_number,
          unit_price: batch.selling_price,
          mrp: batch.mrp || batch.selling_price
        } : item
      ));
      setSuccessMessage('Batch updated');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const removeFromSale = (index) => {
    const itemName = saleItems[index].medicine_name;
    setSaleItems(prev => prev.filter((_, i) => i !== index));
    setErrorMessage(`Removed ${itemName} from sale`);
    setTimeout(() => setErrorMessage(''), 2000);
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    
    const item = saleItems[index];
    const selectedBatch = item.available_batches.find(b => b._id === item.batch_id);
    const maxQuantity = selectedBatch ? selectedBatch.quantity : 0;
    
    if (quantity > maxQuantity) {
      setErrorMessage(`Only ${maxQuantity} items available in selected batch`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setSaleItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    let discount = 0;
    if (saleForm.discount_type === 'percentage') {
      discount = subtotal * (saleForm.discount / 100);
    } else {
      discount = Math.min(saleForm.discount, subtotal);
    }
    
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (saleForm.tax_rate / 100);
    const total = afterDiscount + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const createSale = async () => {
    try {
      setCreatingSale(true);
      setErrorMessage('');
      
      // Validate all items have batches
      const itemsWithoutBatches = saleItems.filter(item => !item.batch_id);
      if (itemsWithoutBatches.length > 0) {
        setErrorMessage('Please select batches for all medications');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Check stock availability
      const outOfStockItems = [];
      saleItems.forEach(item => {
        const selectedBatch = item.available_batches.find(b => b._id === item.batch_id);
        if (selectedBatch && item.quantity > selectedBatch.quantity) {
          outOfStockItems.push({
            medicine: item.medicine_name,
            available: selectedBatch.quantity,
            requested: item.quantity
          });
        }
      });

      if (outOfStockItems.length > 0) {
        const message = outOfStockItems.map(item => 
          `${item.medicine}: ${item.requested} requested, ${item.available} available`
        ).join('\n');
        setErrorMessage(`Insufficient stock:\n${message}`);
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }

      // Calculate totals
      const totals = calculateTotals();

      // Prepare sale data
      const saleData = {
        items: saleItems.map(item => ({
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          batch_id: item.batch_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
          prescription_id: item.prescription_id,
          mrp: item.mrp
        })),
        customer_name: saleForm.customer_name,
        customer_phone: saleForm.customer_phone,
        payment_method: saleForm.payment_method,
        prescription_id: saleItems[0]?.prescription_id,
        patient_id: selectedCustomer.type === 'Patient' ? selectedCustomer._id : null,
        discount: saleForm.discount,
        discount_type: saleForm.discount_type,
        tax_rate: saleForm.tax_rate,
        notes: saleForm.notes,
        subtotal: totals.subtotal,
        discount_amount: totals.discount,
        tax_amount: totals.tax,
        total_amount: totals.total
      };

      console.log('Creating sale with data:', saleData);
      
      const response = await apiClient.post('/orders/sale', saleData);
      console.log('Sale created:', response.data);
      
      setCreatedSale(response.data.sale);
      
      // Reset form and show success
      setSaleItems([]);
      setMedicineMatches({});
      setBatchInfo({});
      setSelectedPrescription(null);
      setSaleForm(prev => ({
        ...prev,
        discount: 0,
        notes: ''
      }));
      
      setSuccessMessage('Sale created successfully!');
      setShowReceiptModal(true);
      
      // Refresh customer stats
      fetchCustomerStats();
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      console.error('Error creating sale:', err);
      setErrorMessage(err.response?.data?.message || 'Error creating sale. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setCreatingSale(false);
    }
  };

  const clearSelection = () => {
    setSelectedCustomer(null);
    setCustomerPrescriptions([]);
    setSelectedPrescription(null);
    setSaleItems([]);
    setBatchInfo({});
    setMedicineMatches({});
    setSearchTerm('');
    setSaleForm({
      payment_method: 'Cash',
      customer_name: '',
      customer_phone: '',
      discount: 0,
      discount_type: 'percentage',
      tax_rate: 0,
      notes: ''
    });
    setErrorMessage('');
    setSuccessMessage('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const togglePrescriptionExpansion = (prescriptionId) => {
    setExpandedPrescriptions(prev => ({
      ...prev,
      [prescriptionId]: !prev[prescriptionId]
    }));
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash':
        return DollarSign;
      case 'Card':
        return CreditCard;
      case 'UPI':
        return Smartphone;
      case 'Bank Transfer':
        return Building;
      case 'Insurance':
        return Shield;
      default:
        return DollarSign;
    }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sale Receipt #${createdSale?.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .totals { margin-top: 20px; text-align: right; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
            @media print { 
              body { margin: 0; padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PHARMACY RECEIPT</h2>
            <h3>Invoice #${createdSale?.invoice_number}</h3>
          </div>
          <div class="info">
            <p><strong>Date:</strong> ${new Date(createdSale?.createdAt).toLocaleString()}</p>
            <p><strong>Customer:</strong> ${createdSale?.customer_name}</p>
            <p><strong>Phone:</strong> ${createdSale?.customer_phone}</p>
            <p><strong>Payment Method:</strong> ${createdSale?.payment_method}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${createdSale?.items?.map(item => `
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
            <p>Subtotal: ₹${createdSale?.subtotal}</p>
            <p>Discount: -₹${createdSale?.discount_amount}</p>
            <p>Tax: ₹${createdSale?.tax_amount}</p>
            <p class="total">Total: ₹${createdSale?.total_amount}</p>
          </div>
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>Please keep this receipt for returns/exchanges</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadReceipt = () => {
    const receiptContent = `
      PHARMACY RECEIPT
      Invoice #${createdSale?.invoice_number}
      Date: ${new Date(createdSale?.createdAt).toLocaleString()}
      
      Customer: ${createdSale?.customer_name}
      Phone: ${createdSale?.customer_phone}
      Payment: ${createdSale?.payment_method}
      
      ITEMS:
      ${createdSale?.items?.map(item => 
        `${item.medicine_name.padEnd(30)} ${item.quantity.toString().padStart(3)} x ₹${item.unit_price.toFixed(2).padStart(8)} = ₹${(item.unit_price * item.quantity).toFixed(2)}`
      ).join('\n')}
      
      --------------------------------
      Subtotal: ₹${createdSale?.subtotal}
      Discount: -₹${createdSale?.discount_amount}
      Tax: ₹${createdSale?.tax_amount}
      Total: ₹${createdSale?.total_amount}
      
      Thank you for your purchase!
      Please keep this receipt for returns/exchanges
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${createdSale?.invoice_number}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
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
            <Pill className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dispense Medication</h1>
            <p className="text-gray-600 text-sm mt-1">Manage prescriptions and create sales</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/pharmacy/prescriptions/queue')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FaHistory /> View Queue
          </button>
          <button
            onClick={() => navigate('/dashboard/pharmacy/history')}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
          >
            <Receipt /> Sales History
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Customer Search */}
      {!selectedCustomer && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by patient name, ID, phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Search Results */}
          {searchLoading ? (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto text-gray-400" size={24} />
              <p className="mt-2 text-gray-500">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((customer) => {
                const Icon = customer.icon;
                return (
                  <div
                    key={`${customer.type}-${customer._id}`}
                    onClick={() => selectCustomer(customer)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-teal-50 group-hover:bg-teal-100">
                        <Icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{customer.displayName}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.type === 'Patient' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {customer.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{customer.idDisplay}</p>
                        {customer.phone && (
                          <p className="text-sm text-gray-500 mt-1">📞 {customer.phone}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <User className="mx-auto text-gray-300" size={48} />
              <p className="mt-2 text-gray-500">No customers found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="mx-auto text-gray-300" size={48} />
              <p className="mt-2 text-gray-500">Search for patients or customers</p>
            </div>
          )}
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      {selectedCustomer && (
        <>
          {/* Customer Info Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-50">
                  {selectedCustomer.type === 'Patient' ? (
                    <User className="w-6 h-6 text-teal-600" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{selectedCustomer.displayName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedCustomer.type === 'Patient'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedCustomer.type}
                    </span>
                    <span className="text-sm text-gray-600">📞 {selectedCustomer.phone}</span>
                    <span className="text-sm text-gray-600">🆔 {selectedCustomer.patientId || 'Customer'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Customer Stats */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{customerStats.totalPurchases}</div>
                    <div className="text-xs text-gray-500">Total Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {customerStats.lastPurchaseDate 
                        ? new Date(customerStats.lastPurchaseDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Last Purchase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      ₹{customerStats.averagePurchase?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-500">Avg. Purchase</div>
                  </div>
                </div>
                
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Change Customer
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prescriptions Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Prescriptions</h2>
                <span className="text-sm text-gray-500">
                  {customerPrescriptions.length} prescription{customerPrescriptions.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {customerPrescriptions.length > 0 ? (
                <div className="space-y-4">
                  {customerPrescriptions.map((prescription) => (
                    <div 
                      key={prescription._id} 
                      className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 ${
                        expandedPrescriptions[prescription._id] 
                          ? 'border-teal-300 ring-1 ring-teal-100'
                          : 'border-gray-200 hover:border-teal-200'
                      }`}
                    >
                      {/* Prescription Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-teal-600 text-lg">
                              #{prescription.prescription_number}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                              prescription.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              prescription.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {prescription.status}
                            </span>
                            {prescription.is_urgent && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="inline w-3 h-3 mr-1" /> Urgent
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Dr. {prescription.doctor_id?.firstName} {prescription.doctor_id?.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(prescription.issue_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(prescription.valid_until).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => togglePrescriptionExpansion(prescription._id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          {expandedPrescriptions[prescription._id] ? (
                            <FaMinus className="w-4 h-4" />
                          ) : (
                            <FaPlus className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Prescription Image */}
                      {prescription.prescription_image && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-2">
                            <FaImage /> Prescription Image
                          </div>
                          <div 
                            className="relative w-full h-48 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => window.open(prescription.prescription_image, '_blank')}
                          >
                            <img
                              src={prescription.prescription_image}
                              alt="Prescription"
                              className="w-full h-full object-contain p-2 group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                              <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Diagnosis */}
                      {prescription.diagnosis && expandedPrescriptions[prescription._id] && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 text-sm mb-2">Diagnosis:</h4>
                          <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                            {prescription.diagnosis}
                          </p>
                        </div>
                      )}

                      {/* Medications */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700 text-sm">Medications:</h4>
                        {prescription.items.map((item, index) => {
                          const isDispensed = item.is_dispensed;
                          const isLoading = medicineSearchLoading[item.medicine_name] || batchLoading[item.medicine_id];
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-3 rounded-lg border ${
                                isDispensed 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200 hover:border-teal-200'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Pill className={`w-4 h-4 ${isDispensed ? 'text-green-600' : 'text-gray-600'}`} />
                                    <span className={`font-medium ${isDispensed ? 'text-green-700' : 'text-gray-800'}`}>
                                      {item.medicine_name}
                                    </span>
                                    {isDispensed && (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 ml-6">
                                    <div>💊 {item.dosage}</div>
                                    <div>⏰ {item.frequency}</div>
                                    <div>📅 {item.duration}</div>
                                    <div>📋 {item.quantity} units</div>
                                  </div>
                                  
                                  {item.instructions && expandedPrescriptions[prescription._id] && (
                                    <div className="text-xs text-gray-500 mt-2 ml-6 p-2 bg-white rounded border">
                                      📝 {item.instructions}
                                    </div>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => !isDispensed && addToSale(prescription, item)}
                                  disabled={isDispensed || isLoading}
                                  className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                                    isDispensed
                                      ? 'bg-green-100 text-green-700 cursor-default'
                                      : isLoading
                                      ? 'bg-gray-100 text-gray-500 cursor-wait'
                                      : 'bg-teal-600 text-white hover:bg-teal-700 hover:-translate-y-0.5'
                                  }`}
                                >
                                  {isLoading ? (
                                    <>
                                      <Loader className="animate-spin w-3 h-3" /> Loading...
                                    </>
                                  ) : isDispensed ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" /> Dispensed
                                    </>
                                  ) : (
                                    'Add to Cart'
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
                  <FileText className="mx-auto text-gray-300" size={48} />
                  <h3 className="mt-4 text-lg font-bold text-gray-800">No prescriptions found</h3>
                  <p className="text-gray-500 mt-1">
                    This customer doesn't have any prescriptions yet
                  </p>
                </div>
              )}
            </div>

            {/* Sales Cart Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">Sales Cart</h2>
                <span className="text-sm text-gray-500">
                  {saleItems.length} item{saleItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                {saleItems.length > 0 ? (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {saleItems.map((item, index) => {
                        const selectedBatch = item.available_batches.find(b => b._id === item.batch_id);
                        const maxQuantity = selectedBatch ? selectedBatch.quantity : 0;
                        const isBatchExpiring = selectedBatch && 
                          new Date(selectedBatch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        
                        return (
                          <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-teal-200 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-800">{item.medicine_name}</span>
                                  {item.mrp > item.unit_price && (
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                      Save ₹{(item.mrp - item.unit_price).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                {item.original_prescription_name !== item.medicine_name && (
                                  <div className="text-xs text-gray-500 mb-2">
                                    Matched from: {item.original_prescription_name}
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>Prescription: #{item.prescription_id.slice(-6)}</span>
                                  <span>MRP: ₹{item.mrp.toFixed(2)}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromSale(index)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Batch Selection */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Batch
                              </label>
                              <select
                                value={item.batch_id || ''}
                                onChange={(e) => updateBatchSelection(index, e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              >
                                <option value="">Select a batch</option>
                                {item.available_batches.map(batch => (
                                  <option key={batch._id} value={batch._id}>
                                    {batch.batch_number} • 
                                    Qty: {batch.quantity} • 
                                    Exp: {new Date(batch.expiry_date).toLocaleDateString()} • 
                                    Price: ₹{batch.selling_price}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quantity Control */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-200 rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="px-4 py-1.5 text-center font-medium min-w-[40px]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                    disabled={item.quantity >= maxQuantity}
                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                  Max: {maxQuantity}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-800">
                                  ₹{(item.unit_price * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ₹{item.unit_price} × {item.quantity}
                                </div>
                              </div>
                            </div>

                            {/* Warnings */}
                            {isBatchExpiring && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                                <AlertTriangle className="w-3 h-3" />
                                Batch expires soon: {selectedBatch && new Date(selectedBatch.expiry_date).toLocaleDateString()}
                              </div>
                            )}
                            {!item.batch_id && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                <Info className="w-3 h-3" />
                                Please select a batch
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Payment & Totals Section */}
                    <div className="pt-6 border-t border-gray-200 space-y-6">
                      {/* Discount Input */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowDiscountInput(!showDiscountInput)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                            >
                              <Tag className="w-4 h-4" />
                              {showDiscountInput ? 'Hide Discount' : 'Add Discount/Tax'}
                            </button>
                          </div>
                        </div>

                        {showDiscountInput && (
                          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                            {/* Discount */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={saleForm.discount}
                                  onChange={(e) => setSaleForm({...saleForm, discount: parseFloat(e.target.value) || 0})}
                                  className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                                  placeholder="0"
                                  min="0"
                                />
                                <select
                                  value={saleForm.discount_type}
                                  onChange={(e) => setSaleForm({...saleForm, discount_type: e.target.value})}
                                  className="p-2 border border-gray-200 rounded-lg text-sm"
                                >
                                  <option value="percentage">%</option>
                                  <option value="amount">₹</option>
                                </select>
                              </div>
                            </div>

                            {/* Tax */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tax Rate
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={saleForm.tax_rate}
                                  onChange={(e) => setSaleForm({...saleForm, tax_rate: parseFloat(e.target.value) || 0})}
                                  className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span className="text-gray-500">%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={saleForm.notes}
                            onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            rows="2"
                            placeholder="Add any notes for this sale..."
                          />
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{calculateTotals().subtotal}</span>
                        </div>
                        
                        {saleForm.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-medium text-green-600">
                              -₹{calculateTotals().discount}
                            </span>
                          </div>
                        )}
                        
                        {saleForm.tax_rate > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax ({saleForm.tax_rate}%)</span>
                            <span className="font-medium">₹{calculateTotals().tax}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold pt-3 border-t">
                          <span>Total</span>
                          <span className="text-teal-600">₹{calculateTotals().total}</span>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {['Cash', 'Card', 'UPI', 'Bank Transfer', 'Insurance'].map((method) => {
                            const Icon = getPaymentIcon(method);
                            return (
                              <button
                                key={method}
                                onClick={() => setSaleForm({...saleForm, payment_method: method})}
                                className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                                  saleForm.payment_method === method
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

                      {/* Create Sale Button */}
                      <button
                        onClick={createSale}
                        disabled={creatingSale || saleItems.some(item => !item.batch_id)}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingSale ? (
                          <>
                            <Loader className="animate-spin w-5 h-5" />
                            Processing Sale...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Create Sale (₹{calculateTotals().total})
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto text-gray-300" size={64} />
                    <h3 className="mt-4 text-lg font-bold text-gray-800">Your cart is empty</h3>
                    <p className="text-gray-500 mt-1">
                      Add medications from prescriptions to create a sale
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && createdSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Sale Complete!</h3>
                  <p className="text-sm text-teal-600">Invoice #{createdSale.invoice_number}</p>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Success Message */}
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-800 mb-2">Payment Successful</h4>
                <p className="text-gray-600">Sale has been processed successfully</p>
              </div>

              {/* Receipt Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(createdSale.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{createdSale.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{createdSale.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-xl font-bold text-teal-600">₹{createdSale.total_amount}</span>
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
                  onClick={downloadReceipt}
                  className="flex items-center justify-center gap-2 p-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  clearSelection();
                }}
                className="w-full p-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispenseMedication;