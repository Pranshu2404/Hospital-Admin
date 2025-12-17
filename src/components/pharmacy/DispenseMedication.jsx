import React, { useState, useEffect } from 'react';
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
  FaArrowLeft
} from 'react-icons/fa';

const DispenseMedication = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPrescriptions, setCustomerPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creatingSale, setCreatingSale] = useState(false);
  const [saleItems, setSaleItems] = useState([]);
  const [saleForm, setSaleForm] = useState({
    payment_method: 'Cash',
    customer_name: '',
    customer_phone: ''
  });
  const [batchInfo, setBatchInfo] = useState({});
  const [batchLoading, setBatchLoading] = useState({});
  const [medicineSearchLoading, setMedicineSearchLoading] = useState({});
  const [medicineMatches, setMedicineMatches] = useState({});
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    // Check if there's a prescription selected from the queue
    const storedPrescription = sessionStorage.getItem('selectedPrescription');
    console.log()
    if (storedPrescription && !autoSelected) {
      const prescriptionData = JSON.parse(storedPrescription);
      handleAutoSelectPrescription(prescriptionData);
      setAutoSelected(true);
      // Clear the stored prescription
      sessionStorage.removeItem('selectedPrescription');
    }
  }, [autoSelected]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchCustomers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

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
          displayName: `${patient.first_name} ${patient.last_name} (Patient ID: ${patient.patientId})`
        });
        
        setSaleForm({
          payment_method: 'Cash',
          customer_name: `${patient.first_name} ${patient.last_name}`,
          customer_phone: patient.phone
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
      }
    } catch (err) {
      console.error('Error auto-selecting prescription:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    setLoading(true);
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
          displayName: `${p.first_name} ${p.last_name} (Patient ID: ${p.patientId})`
        })),
        ...customersData.map(c => ({ 
          ...c, 
          type: 'Customer',
          displayName: `${c.name} (Customer - ${c.phone})`
        }))
      ];
      
      setSearchResults(combinedResults);
    } catch (err) {
      console.error('Unhandled error searching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search for medicine by name to get the correct medicine ID
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

  // Fetch available batches for a medicine
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
      customer_phone: customer.phone
    });
    
    try {
      let endpoint = '';
      if (customer.type === 'Patient') {
        endpoint = `/prescriptions/patient/${customer._id}`;
      } else {
        endpoint = `/prescriptions?customerPhone=${customer.phone}`;
      }
      
      const response = await apiClient.get(endpoint);
      setCustomerPrescriptions(response.data.prescriptions || response.data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  const addToSale = async (prescription, item) => {
    // First, search for the medicine by name to get the correct ID
    if (!medicineMatches[item.medicine_name]) {
      const matchedMedicines = await searchMedicineByName(item.medicine_name);
      
      if (matchedMedicines.length === 0) {
        alert(`No medicine found with name: ${item.medicine_name}`);
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
        alert(`No medicine found with name: ${item.medicine_name}`);
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
        available_batches: batches
      }]);
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
          unit_price: batch.selling_price
        } : item
      ));
    }
  };

  const removeFromSale = (index) => {
    setSaleItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    
    const item = saleItems[index];
    const selectedBatch = item.available_batches.find(b => b._id === item.batch_id);
    const maxQuantity = selectedBatch ? selectedBatch.quantity : 0;
    
    if (quantity > maxQuantity) {
      alert(`Only ${maxQuantity} items available in selected batch`);
      return;
    }
    
    setSaleItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const createSale = async () => {
    try {
      setCreatingSale(true);
      
      // Validate all items have batches
      const itemsWithoutBatches = saleItems.filter(item => !item.batch_id);
      if (itemsWithoutBatches.length > 0) {
        alert('Please select batches for all medications');
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
        alert(`Insufficient stock:\n${message}`);
        return;
      }

      // Prepare sale data
      const saleData = {
        items: saleItems.map(item => ({
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          batch_id: item.batch_id,
          unit_price: item.unit_price,
          quantity: item.quantity,
          prescription_id: item.prescription_id
        })),
        customer_name: saleForm.customer_name,
        customer_phone: saleForm.customer_phone,
        payment_method: saleForm.payment_method,
        prescription_id: saleItems[0]?.prescription_id,
        patient_id: selectedCustomer.type === 'Patient' ? selectedCustomer._id : null
      };

      console.log('Creating sale with data:', saleData);
      
      const response = await apiClient.post('/orders/sale', saleData);
      console.log('Sale created:', response.data);
      
      // Reset form and show success
      setSaleItems([]);
      setMedicineMatches({});
      setBatchInfo({});
      setSelectedPrescription(null);
      alert('Sale created successfully!');
      
    } catch (err) {
      console.error('Error creating sale:', err);
      alert('Error creating sale. Please try again.');
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
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaPills className="text-teal-600" />
            Dispense Medication & Sales
          </h1>
          {selectedCustomer && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaArrowLeft /> Clear
            </button>
          )}
        </div>
        <p className="text-gray-600">Search customers, view prescriptions, and create sales</p>
      </div>

      {/* Customer Search */}
      {!selectedCustomer && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map((customer) => (
                <div
                  key={`${customer.type}-${customer._id}`}
                  onClick={() => selectCustomer(customer)}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    <span className="font-medium">{customer.displayName}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {customer.type}
                    </span>
                  </div>
                  {customer.phone && (
                    <div className="text-sm text-gray-600 ml-6">Phone: {customer.phone}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Customer */}
      {selectedCustomer && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-teal-800">
                Selected: {selectedCustomer.displayName}
              </h3>
              <p className="text-sm text-teal-600">
                {selectedCustomer.type} • {selectedCustomer.phone}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="text-teal-600 hover:text-teal-800"
            >
              Change Customer
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      {selectedCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prescriptions Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Prescriptions</h2>
            
            {customerPrescriptions.length > 0 ? (
              customerPrescriptions.map((prescription) => (
                <div 
                  key={prescription._id} 
                  className={`bg-white p-4 rounded-lg shadow border ${
                    selectedPrescription === prescription._id ? 'ring-2 ring-teal-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-teal-600">
                        Prescription #{prescription.prescription_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Dr. {prescription.doctor_id?.firstName} {prescription.doctor_id?.lastName} • 
                        {new Date(prescription.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>

                  {prescription.prescription_image && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FaImage /> Prescription Image:
                      </div>
                      <img
                        src={prescription.prescription_image}
                        alt="Prescription"
                        className="w-full h-40 object-contain border rounded"
                        onClick={() => window.open(prescription.prescription_image, '_blank')}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  )}

                  {prescription.diagnosis && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-700 text-sm">Diagnosis:</h4>
                      <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 text-sm">Medications:</h4>
                    {prescription.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.medicine_name}</div>
                          <div className="text-xs text-gray-600">
                            {item.dosage} • {item.frequency} • {item.duration}
                          </div>
                          {item.instructions && (
                            <div className="text-xs text-gray-500">{item.instructions}</div>
                          )}
                          <div className={`text-xs ${
                            item.is_dispensed ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {item.is_dispensed ? '✓ Dispensed' : '⏳ Pending'}
                          </div>
                        </div>
                        <button
                          onClick={() => addToSale(prescription, item)}
                          className="ml-2 px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 flex items-center gap-1 disabled:opacity-50"
                          disabled={item.is_dispensed || medicineSearchLoading[item.medicine_name] || batchLoading[item.medicine_id]}
                        >
                          {medicineSearchLoading[item.medicine_name] ? (
                            <>
                              <FaSpinner className="animate-spin" /> Searching...
                            </>
                          ) : batchLoading[item.medicine_id] ? (
                            <>
                              <FaSpinner className="animate-spin" /> Loading...
                            </>
                          ) : item.is_dispensed ? (
                            'Dispensed'
                          ) : (
                            'Add to Sale'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow border">
                <FaFilePrescription className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No prescriptions found for this customer</p>
              </div>
            )}
          </div>

          {/* Sales Cart Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Sales Cart</h2>
            
            <div className="bg-white p-4 rounded-lg shadow border">
              {saleItems.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {saleItems.map((item, index) => {
                      const selectedBatch = item.available_batches.find(b => b._id === item.batch_id);
                      const maxQuantity = selectedBatch ? selectedBatch.quantity : 0;
                      
                      return (
                        <div key={index} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.medicine_name}</div>
                              {item.original_prescription_name !== item.medicine_name && (
                                <div className="text-xs text-gray-500">
                                  (Matched from: {item.original_prescription_name})
                                </div>
                              )}
                              <div className="text-xs text-gray-600">
                                From Prescription: #{item.prescription_id.slice(-6)}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromSale(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <FaTimesCircle />
                            </button>
                          </div>

                          {/* Batch Selection */}
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Select Batch:
                            </label>
                            <select
                              value={item.batch_id || ''}
                              onChange={(e) => updateBatchSelection(index, e.target.value)}
                              className="w-full p-1 text-xs border border-gray-300 rounded"
                            >
                              <option value="">Select a batch</option>
                              {item.available_batches.map(batch => (
                                <option key={batch._id} value={batch._id}>
                                  {batch.batch_number} - 
                                  Exp: {new Date(batch.expiry_date).toLocaleDateString()} - 
                                  Qty: {batch.quantity} - 
                                  ₹{batch.selling_price}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Control */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <FaMinus size={10} />
                              </button>
                              <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                disabled={item.quantity >= maxQuantity}
                              >
                                <FaPlus size={10} />
                              </button>
                              <span className="text-xs text-gray-500 ml-2">
                                Max: {maxQuantity}
                              </span>
                            </div>
                            <div className="text-sm font-medium">
                              ₹{(item.unit_price * item.quantity).toFixed(2)}
                            </div>
                          </div>

                          {selectedBatch && new Date(selectedBatch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-orange-600">
                              <FaExclamationTriangle />
                              Batch expires soon: {new Date(selectedBatch.expiry_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Total and Payment */}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center mb-3 font-medium">
                      <span>Total:</span>
                      <span>
                        ₹{saleItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={saleForm.payment_method}
                          onChange={(e) => setSaleForm({...saleForm, payment_method: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Insurance">Insurance</option>
                        </select>
                      </div>

                      <button
                        onClick={createSale}
                        disabled={creatingSale || saleItems.some(item => !item.batch_id)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                      >
                        <FaShoppingCart />
                        {creatingSale ? 'Processing...' : 'Create Sale'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Add medications from prescriptions to create a sale</p>
                </div>
              )}
            </div>

            {/* Customer Info Summary */}
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-medium text-gray-800 mb-2">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{saleForm.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{saleForm.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{selectedCustomer.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispenseMedication;