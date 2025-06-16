import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, DownloadIcon } from '../common/Icons';
import { useModal } from '../common/Modals';
import AddDonorModal from './AddDonorModal';

const BloodBankPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');
  const { isOpen, openModal, closeModal } = useModal();

  const [bloodInventory] = useState([
    { bloodType: 'A+', quantity: 45, unit: 'units', minLevel: 20, maxLevel: 100, status: 'Normal' },
    { bloodType: 'A-', quantity: 15, unit: 'units', minLevel: 10, maxLevel: 50, status: 'Low' },
    { bloodType: 'B+', quantity: 38, unit: 'units', minLevel: 20, maxLevel: 80, status: 'Normal' },
    { bloodType: 'B-', quantity: 8, unit: 'units', minLevel: 10, maxLevel: 40, status: 'Critical' },
    { bloodType: 'AB+', quantity: 22, unit: 'units', minLevel: 15, maxLevel: 60, status: 'Normal' },
    { bloodType: 'AB-', quantity: 5, unit: 'units', minLevel: 8, maxLevel: 30, status: 'Critical' },
    { bloodType: 'O+', quantity: 65, unit: 'units', minLevel: 30, maxLevel: 120, status: 'Normal' },
    { bloodType: 'O-', quantity: 18, unit: 'units', minLevel: 25, maxLevel: 80, status: 'Low' }
  ]);

  const [donors] = useState([
    {
      id: 1,
      name: 'John Smith',
      bloodType: 'O+',
      phone: '+1 234-567-8900',
      email: 'john.smith@email.com',
      lastDonation: '2024-01-10',
      totalDonations: 8,
      eligibleNext: '2024-04-10',
      status: 'Eligible'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      bloodType: 'A+',
      phone: '+1 234-567-8901',
      email: 'maria.garcia@email.com',
      lastDonation: '2023-12-15',
      totalDonations: 12,
      eligibleNext: '2024-03-15',
      status: 'Eligible'
    },
    {
      id: 3,
      name: 'David Johnson',
      bloodType: 'B-',
      phone: '+1 234-567-8902',
      email: 'david.johnson@email.com',
      lastDonation: '2024-01-05',
      totalDonations: 5,
      eligibleNext: '2024-04-05',
      status: 'Not Eligible'
    }
  ]);

  const [requests] = useState([
    {
      id: 1,
      patientName: 'Emergency Patient',
      bloodType: 'B-',
      unitsNeeded: 3,
      urgency: 'Critical',
      requestedBy: 'Dr. Sarah Wilson',
      date: '2024-01-15',
      status: 'Pending'
    },
    {
      id: 2,
      patientName: 'Robert Taylor',
      bloodType: 'A+',
      unitsNeeded: 2,
      urgency: 'High',
      requestedBy: 'Dr. Michael Chen',
      date: '2024-01-14',
      status: 'Fulfilled'
    }
  ]);

  const getStatusBadge = (status, type = 'general') => {
    if (type === 'blood') {
      const statusClasses = {
        'Normal': 'bg-green-100 text-green-800',
        'Low': 'bg-yellow-100 text-yellow-800',
        'Critical': 'bg-red-100 text-red-800'
      };
      return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    }
    
    if (type === 'donor') {
      const statusClasses = {
        'Eligible': 'bg-green-100 text-green-800',
        'Not Eligible': 'bg-red-100 text-red-800'
      };
      return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    }

    const statusClasses = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Fulfilled': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyClasses = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${urgencyClasses[urgency] || 'bg-gray-100 text-gray-800'}`;
  };

  const totalUnits = bloodInventory.reduce((sum, item) => sum + item.quantity, 0);
  const criticalTypes = bloodInventory.filter(item => item.status === 'Critical').length;
  const lowStockTypes = bloodInventory.filter(item => item.status === 'Low').length;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blood Bank Management</h2>
              <p className="text-gray-600 mt-1">Manage blood inventory, donors, and requests</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <DownloadIcon />
                Export
              </Button>
              <Button variant="primary" onClick={openModal}>
                <PlusIcon />
                Add Donor
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Units</div>
              <div className="text-2xl font-bold text-gray-900">{totalUnits}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Active Donors</div>
              <div className="text-2xl font-bold text-green-600">{donors.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Critical Stock</div>
              <div className="text-2xl font-bold text-red-600">{criticalTypes}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Low Stock</div>
              <div className="text-2xl font-bold text-yellow-600">{lowStockTypes}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Blood Inventory
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'donors'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Donors
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Blood Requests
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bloodInventory.map((item) => (
                <div key={item.bloodType} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{item.bloodType}</h3>
                      <p className="text-sm text-gray-500">Blood Type</p>
                    </div>
                    <span className={getStatusBadge(item.status, 'blood')}>
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min Level:</span>
                      <span>{item.minLevel} {item.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'Critical' ? 'bg-red-500' :
                          item.status === 'Low' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((item.quantity / item.maxLevel) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'donors' && (
            <div>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donors by name, blood type, or contact..."
                className="mb-4"
              />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Donation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Donations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donors.map((donor) => (
                      <tr key={donor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{donor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            {donor.bloodType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{donor.phone}</div>
                          <div className="text-sm text-gray-500">{donor.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donor.lastDonation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {donor.totalDonations}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(donor.status, 'donor')}>
                            {donor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-teal-600 hover:text-teal-900">
                              Contact
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Needed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          {request.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.unitsNeeded} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getUrgencyBadge(request.urgency)}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.requestedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(request.status)}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-teal-600 hover:text-teal-900">
                            Process
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            View
                          </button>
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

      <AddDonorModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default BloodBankPage;
