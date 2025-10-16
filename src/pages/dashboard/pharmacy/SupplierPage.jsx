import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { 
  FaBuilding, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaFilter,
  FaEye,
  FaShoppingCart
} from 'react-icons/fa';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await apiClient.get('/suppliers');
        setSuppliers(response.data);
      } catch (err) {
        setError('Failed to fetch suppliers. Please try again later.');
        console.error('Error fetching suppliers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleDelete = async (supplierId, supplierName) => {
    if (!window.confirm(`Are you sure you want to delete ${supplierName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.delete(`/suppliers/${supplierId}`);
      setSuppliers(prev => prev.filter(s => s._id !== supplierId));
      alert('Supplier deleted successfully');
    } catch (err) {
      alert('Failed to delete supplier. Please try again.');
      console.error('Error deleting supplier:', err);
    }
  };

  const handleStatusToggle = async (supplierId, currentStatus) => {
    try {
      const response = await apiClient.patch(`/suppliers/${supplierId}`, {
        isActive: !currentStatus
      });
      
      setSuppliers(prev => prev.map(s => 
        s._id === supplierId ? response.data : s
      ));
    } catch (err) {
      alert('Failed to update supplier status.');
      console.error('Error updating supplier:', err);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter ? 
      (statusFilter === 'active' ? supplier.isActive :
       statusFilter === 'inactive' ? !supplier.isActive : true) : true;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.isActive).length,
    inactive: suppliers.filter(s => !s.isActive).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBuilding className="text-teal-600" />
            Suppliers Management
          </h1>
          <p className="text-gray-600">Manage your pharmacy suppliers and vendors</p>
        </div>
        <Link
          to="/dashboard/pharmacy/add-supplier"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaPlus /> Add New Supplier
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaBuilding className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <FaEye className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive Suppliers</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <FaFilter className="text-3xl text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone & Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      {supplier.address && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {supplier.address.length > 30 ? `${supplier.address.substring(0, 30)}...` : supplier.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      <span>{supplier.contactPerson || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span className="text-sm">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-sm text-blue-600">{supplier.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(supplier._id, supplier.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        supplier.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/dashboard/pharmacy/purchasing/create-order?supplier=${supplier._id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Create Purchase Order"
                      >
                        <FaShoppingCart />
                      </Link>
                      <Link
                        to={`/dashboard/pharmacy/purchasing/edit-supplier/${supplier._id}`}
                        className="text-teal-600 hover:text-teal-800"
                        title="Edit Supplier"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(supplier._id, supplier.name)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Supplier"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <FaBuilding className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No suppliers found</p>
            {searchTerm || statusFilter ? (
              <p className="text-sm text-gray-400">Try adjusting your search filters</p>
            ) : (
              <Link
                to="/dashboard/pharmacy/purchasing/add-supplier"
                className="text-teal-600 hover:text-teal-700 text-sm"
              >
                Add your first supplier
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/dashboard/pharmacy/add-supplier"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Supplier
          </Link>
          <Link
            to="/dashboard/pharmacy/orders"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            View Purchase Orders
          </Link>
          <button className="border border-gray-600 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">
            Export Suppliers List
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuppliersList;