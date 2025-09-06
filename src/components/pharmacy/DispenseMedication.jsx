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
  FaMinus
} from 'react-icons/fa';

const DispenseMedication = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPrescriptions, setCustomerPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingSale, setCreatingSale] = useState(false);
  const [saleItems, setSaleItems] = useState([]);
  const [saleForm, setSaleForm] = useState({
    payment_method: 'Cash',
    customer_name: '',
    customer_phone: ''
  });

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchCustomers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchCustomers = async () => {
  setLoading(true);
  try {
    const [patientsRes, customersRes] = await Promise.all([
      apiClient.get(`/api/patients?search=${searchTerm}`)
        .catch(err => {
          console.error('Error fetching patients:', err.message);
          return { data: { patients: [] } }; // Return an empty array on error
        }),
      apiClient.get(`/api/customers?search=${searchTerm}`)
        .catch(err => {
          console.error('Error fetching customers:', err.message);
          return { data: { customers: [] } }; // Return an empty array on error
        })
    ]);

    console.log(patientsRes)
    
    // Defensive check to ensure data arrays exist
    const patientsData = patientsRes.data || [];
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
    console.log(combinedResults)
    setSearchResults(combinedResults);
  } catch (err) {
    console.error('Unhandled error searching customers:', err);
    // You might want to display a user-friendly error message here
  } finally {
    setLoading(false);
  }
};

  const selectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setSaleForm({
      payment_method: 'Cash',
      customer_name: customer.first_name ? `${customer.first_name} ${customer.last_name}` : customer.name,
      customer_phone: customer.phone
    });
    
    try {
      // Fetch prescriptions for this customer
      let endpoint = '';
      if (customer.type === 'Patient') {
        endpoint = `/api/prescriptions/patient/${customer._id}`;
      } else {
        endpoint = `/api/prescriptions?customerPhone=${customer.phone}`;
      }
      
      const response = await apiClient.get(endpoint);
      setCustomerPrescriptions(response.data.prescriptions || response.data);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  const addToSale = (prescription, item) => {
    // Check if item is already in sale
    const existingItem = saleItems.find(i => 
      i.medicine_id === item.medicine_id && i.prescription_id === prescription._id
    );
    
    if (existingItem) {
      // Increase quantity if already in cart
      setSaleItems(prev => prev.map(i => 
        i.medicine_id === item.medicine_id && i.prescription_id === prescription._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      // Add new item to sale
      setSaleItems(prev => [...prev, {
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        unit_price: 0, // Will need to fetch actual price
        quantity: item.quantity || 1,
        prescription_id: prescription._id,
        prescription_item: item
      }]);
    }
  };

  const removeFromSale = (index) => {
    setSaleItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    setSaleItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const createSale = async () => {
    try {
      setCreatingSale(true);
      
      // Prepare sale data
      const saleData = {
        items: saleItems.map(item => ({
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          unit_price: item.unit_price,
          quantity: item.quantity,
          prescription_id: item.prescription_id
        })),
        customer_name: saleForm.customer_name,
        customer_phone: saleForm.customer_phone,
        payment_method: saleForm.payment_method,
        patient_id: selectedCustomer.type === 'Patient' ? selectedCustomer._id : null
      };
      
      const response = await apiClient.post('/api/sales', saleData);
      
      // Reset form and show success
      setSaleItems([]);
      alert('Sale created successfully!');
      
    } catch (err) {
      console.error('Error creating sale:', err);
      alert('Error creating sale. Please try again.');
    } finally {
      setCreatingSale(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaPills className="text-teal-600" />
          Dispense Medication & Sales
        </h1>
        <p className="text-gray-600">Search customers, view prescriptions, and create sales</p>
      </div>

      {/* Customer Search */}
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

        {/* Selected Customer */}
        {selectedCustomer && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
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
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerPrescriptions([]);
                  setSaleItems([]);
                }}
                className="text-teal-600 hover:text-teal-800"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescriptions Column */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Prescriptions</h2>
          
          {customerPrescriptions.length > 0 ? (
            customerPrescriptions.map((prescription) => (
              <div key={prescription._id} className="bg-white p-4 rounded-lg shadow border">
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

                {/* Prescription Image */}
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

                {/* Diagnosis */}
                {prescription.diagnosis && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 text-sm">Diagnosis:</h4>
                    <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                  </div>
                )}

                {/* Medication Items */}
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
                      </div>
                      <button
                        onClick={() => addToSale(prescription, item)}
                        className="ml-2 px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700"
                        disabled={item.is_dispensed}
                      >
                        {item.is_dispensed ? 'Dispensed' : 'Add to Sale'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : selectedCustomer ? (
            <div className="text-center py-8 bg-white rounded-lg shadow border">
              <FaFilePrescription className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No prescriptions found for this customer</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow border">
              <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Search for a customer to view prescriptions</p>
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
                  {saleItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.medicine_name}</div>
                        <div className="text-xs text-gray-600">
                          From Prescription: #{item.prescription_id.slice(-6)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromSale(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Form */}
                <div className="space-y-3 pt-3 border-t">
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
                    disabled={creatingSale}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    <FaShoppingCart />
                    {creatingSale ? 'Processing...' : 'Create Sale'}
                  </button>
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
          {selectedCustomer && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DispenseMedication;