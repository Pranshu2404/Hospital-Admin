


import { useState } from 'react';
import { PersonIcon, PaymentIcon } from '../common/Icons';

const CustomerProfile = ({ selectedCustomer, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('info');

  if (!selectedCustomer) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">No customer selected</p>
          <button
            onClick={() => setCurrentPage('CustomerList')}
            className="mt-4 text-teal-600 hover:text-teal-800"
          >
            Go back to customer list
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'info',
      label: 'Customer Info',
      icon: <PersonIcon />,
    },
    {
      id: 'payment',
      label: 'Payment Info',
      icon: <PaymentIcon />,
    },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-teal-600 font-bold text-xl">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCustomer.name}
                </h1>
                <div className="text-sm text-gray-500 mt-1 space-x-4">
                  <span>ID: {selectedCustomer.id}</span>
                  <span>•</span>
                  <span>{selectedCustomer.phone}</span>
                  <span>•</span>
                  <span>{selectedCustomer.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('CustomerList')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Back to List
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {selectedCustomer.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {selectedCustomer.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {selectedCustomer.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {selectedCustomer.address}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="text-gray-600 italic">
              Payment tab content coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
