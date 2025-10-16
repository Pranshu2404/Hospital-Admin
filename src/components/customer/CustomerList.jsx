import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, SearchInput } from '../common/FormElements';
import { 
  FaTimes, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaUser, 
  FaShoppingCart,
  FaFileMedical,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCopy,
  FaPrint,
  FaEdit,
  FaHistory,
  FaSearch
} from 'react-icons/fa';

// --- Enhanced Customer Profile Modal ---
const CustomerProfileModal = ({ customer, onClose }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!customer) return;

    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // Fetch detailed customer information
        const customerRes = await axios.get(`${base}/customers/${customer._id}`);
        setCustomerDetails(customerRes.data);

        // Fetch purchase history
        const purchasesRes = await axios.get(`${base}/sales/customer/${customer._id}`);
        setPurchaseHistory(purchasesRes.data.sales || []);

        // Fetch prescriptions if patient
        if (customer.isPatient) {
          try {
            const prescRes = await axios.get(`${base}/prescriptions/patient/${customer._id}`);
            setPrescriptions(prescRes.data.prescriptions || []);
          } catch (err) {
            console.debug('Prescriptions not available');
          }
        }

        // Fetch appointments if patient
        if (customer.isPatient) {
          try {
            const apptRes = await axios.get(`${base}/appointments/patient/${customer._id}`);
            setAppointments(apptRes.data.appointments || []);
          } catch (err) {
            console.debug('Appointments not available');
          }
        }

        // Fetch invoices
        try {
          const invRes = await axios.get(`${base}/invoices/customer/${customer._id}`);
          setInvoices(invRes.data.invoices || []);
        } catch (err) {
          console.debug('Invoices not available');
        }

      } catch (err) {
        console.error('Error fetching customer details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customer]);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.debug('Copy failed', e);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start md:items-center overflow-y-auto z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <FaUser className="text-teal-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
              <p className="text-sm text-gray-600">
                {customer.isPatient ? 'Patient' : 'Customer'} • 
                {customerDetails?.customer_type && ` ${customerDetails.customer_type}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['overview', 'purchases', 'prescriptions', 'appointments', 'invoices'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FaPhone className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{customer.phone}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(customer.phone, 'phone')}
                          className="ml-auto p-2 text-gray-400 hover:text-gray-600"
                          title="Copy phone number"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>

                      {customer.email && (
                        <div className="flex items-center gap-3">
                          <FaEnvelope className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{customer.email}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(customer.email, 'email')}
                            className="ml-auto p-2 text-gray-400 hover:text-gray-600"
                            title="Copy email"
                          >
                            <FaCopy size={14} />
                          </button>
                        </div>
                      )}

                      {customer.address && (
                        <div className="flex items-center gap-3">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">{customer.address}</p>
                          </div>
                          <button
                            onClick={() => handleCopy(customer.address, 'address')}
                            className="ml-auto p-2 text-gray-400 hover:text-gray-600"
                            title="Copy address"
                          >
                            <FaCopy size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {customerDetails && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Customer Details</h4>
                        {customerDetails.date_of_birth && (
                          <div>
                            <p className="text-sm text-gray-600">Date of Birth</p>
                            <p className="font-medium">{formatDate(customerDetails.date_of_birth)}</p>
                          </div>
                        )}
                        {customerDetails.gender && customerDetails.gender !== 'Prefer not to say' && (
                          <div>
                            <p className="text-sm text-gray-600">Gender</p>
                            <p className="font-medium">{customerDetails.gender}</p>
                          </div>
                        )}
                        {customerDetails.blood_group && customerDetails.blood_group !== 'Unknown' && (
                          <div>
                            <p className="text-sm text-gray-600">Blood Group</p>
                            <p className="font-medium">{customerDetails.blood_group}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Purchases</p>
                        <p className="text-2xl font-bold text-blue-800">{purchaseHistory.length}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Total Spent</p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(purchaseHistory.reduce((total, sale) => total + (sale.total_amount || 0), 0))}
                        </p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Recent Activity</h4>
                      <div className="space-y-2">
                        {purchaseHistory.slice(0, 3).map((purchase) => (
                          <div key={purchase._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">Purchase</p>
                              <p className="text-sm text-gray-600">{formatDate(purchase.sale_date)}</p>
                            </div>
                            <p className="font-semibold">{formatCurrency(purchase.total_amount)}</p>
                          </div>
                        ))}
                        {purchaseHistory.length === 0 && (
                          <p className="text-gray-500 text-sm">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchases Tab */}
              {activeTab === 'purchases' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Purchase History</h4>
                  {purchaseHistory.length > 0 ? (
                    <div className="space-y-3">
                      {purchaseHistory.map((purchase) => (
                        <div key={purchase._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Sale #{purchase.sale_number}</p>
                              <p className="text-sm text-gray-600">{formatDate(purchase.sale_date)}</p>
                            </div>
                            <p className="font-bold text-teal-600">{formatCurrency(purchase.total_amount)}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            {purchase.items?.length} items • {purchase.payment_method}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No purchase history found.</p>
                  )}
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Prescriptions</h4>
                  {prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((prescription) => (
                        <div key={prescription._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium">Prescription #{prescription.prescription_number}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(prescription.issue_date)} • {prescription.doctor_id?.name || 'Doctor'}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {prescription.status || 'Active'}
                            </span>
                          </div>
                          {prescription.prescription_image && (
                            <div className="mt-3">
                              <img
                                src={prescription.prescription_image}
                                alt="Prescription"
                                className="w-full max-w-sm border rounded"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No prescriptions found.</p>
                  )}
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Appointments</h4>
                  {appointments.length > 0 ? (
                    <div className="space-y-3">
                      {appointments.map((appointment) => (
                        <div key={appointment._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{appointment.type || 'Appointment'}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(appointment.appointment_date)} • {appointment.doctor_id?.name || 'Doctor'}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{appointment.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No appointments found.</p>
                  )}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Invoices</h4>
                  {invoices.length > 0 ? (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div key={invoice._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(invoice.issue_date)} • Due: {formatDate(invoice.due_date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-teal-600">{formatCurrency(invoice.total)}</p>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Balance: {formatCurrency(invoice.balance_due)} • {invoice.invoice_type}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No invoices found.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Customer since {formatDate(customerDetails?.createdAt || customer.raw?.created_at || new Date())}
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <FaEdit size={14} /> Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <FaPrint size={14} /> Print Summary
            </button>
          </div>
        </div>

        {/* Copy Success Notification */}
        {copiedField && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {copiedField} copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Customer List Component ---
const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${base}/customers`);
        console.log(response.data);
        
        // Transform API response to match expected format
        const customerData = response.data.customers || response.data || [];
        
        const formattedCustomers = customerData.map(customer => ({
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          customer_type: customer.customer_type,
          isPatient: customer.customer_type === 'Patient',
          total_spent: customer.total_spent || 0,
          loyalty_points: customer.loyalty_points || 0,
          created_at: customer.createdAt || customer.created_at,
          raw: customer
        }));

        setCustomers(formattedCustomers);
      } catch (err) {
        setError('Failed to fetch customers. Please try again later.');
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'patient' && customer.isPatient) ||
                         (filterType === 'regular' && !customer.isPatient);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: customers.length,
    patients: customers.filter(c => c.isPatient).length,
    regular: customers.filter(c => !c.isPatient).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.total_spent, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
            <p className="text-gray-600">Manage your pharmacy customers and patients</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaUser className="text-3xl text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-teal-600">{stats.patients}</p>
              </div>
              <FaFileMedical className="text-3xl text-teal-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regular Customers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.regular}</p>
              </div>
              <FaShoppingCart className="text-3xl text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(stats.totalRevenue)}
                </p>
              </div>
              <FaMoneyBillWave className="text-3xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Customers</option>
              <option value="patient">Patients Only</option>
              <option value="regular">Regular Customers</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-teal-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(customer.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400 text-sm" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400 text-sm" />
                            <span className="text-sm text-blue-600">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.isPatient 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {customer.isPatient ? 'Patient' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(customer.total_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="View Details"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <FaUser className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No customers found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerProfileModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </>
  );
};

export default CustomerList;