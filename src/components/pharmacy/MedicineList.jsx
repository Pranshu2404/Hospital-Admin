import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaTimes, 
  FaSearch, 
  FaCapsules, 
  FaTag, 
  FaBuilding, 
  FaRupeeSign,
  FaWeightHanging, 
  FaHashtag, 
  FaCalendarAlt, 
  FaBoxes, 
  FaClipboardList,
  FaInfoCircle,
  FaPrescription,
  FaMapMarkerAlt,
  FaChartLine,
  FaBox
} from 'react-icons/fa';
import { navigate } from 'wouter/use-browser-location';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await apiClient.get('/api/medicines?limit=200');
        setMedicines(response.data.medicines || response.data);
      } catch (err) {
        setError('Failed to fetch medicines. Please try again later.');
        console.error('Error fetching medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(medicines.map(med => med.category))];
    return uniqueCategories.filter(cat => cat).sort();
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter ? med.category === categoryFilter : true;
      
      const matchesStock = stockFilter === 'low' ? (med.stock_quantity < (med.min_stock_level || 10)) :
                           stockFilter === 'out' ? med.stock_quantity === 0 :
                           stockFilter === 'adequate' ? (med.stock_quantity >= (med.min_stock_level || 10)) : true;
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [medicines, searchTerm, categoryFilter, stockFilter]);

  const getStockStatus = (quantity, minStock = 10) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (quantity < minStock) return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const stats = useMemo(() => ({
    total: medicines.length,
    inStock: medicines.filter(m => m.stock_quantity > 0).length,
    lowStock: medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < (m.min_stock_level || 10)).length,
    outOfStock: medicines.filter(m => m.stock_quantity === 0).length
  }), [medicines]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
          <p className="text-gray-600">Manage your pharmacy medicines and stock levels</p>
        </div>
        <Link 
          to="/dashboard/pharmacy/add-medicine"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <FaPlus /> Add New Medicine
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaCapsules className="text-2xl text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <FaBoxes className="text-2xl text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
            </div>
            <FaChartLine className="text-2xl text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <FaTimes className="text-2xl text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Stock Levels</option>
            <option value="adequate">Adequate Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredMedicines.length} of {medicines.length} medicines
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.stock_quantity, medicine.min_stock_level);
                return (
                  <tr key={medicine._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        {medicine.generic_name && (
                          <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                        )}
                        {medicine.brand && (
                          <div className="text-sm text-gray-500">Brand: {medicine.brand}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {medicine.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{medicine.stock_quantity || 0}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FaRupeeSign className="text-gray-400" />
                        <span className="font-medium">{medicine.price_per_unit?.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        medicine.is_active ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {medicine.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/dashboard/pharmacy/medicine-detail/${medicine._id}`)}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FaBox className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>No medicines found</p>
            {searchTerm || categoryFilter || stockFilter ? (
              <p className="text-sm">Try adjusting your filters</p>
            ) : (
              <Link 
                to="/dashboard/pharmacy/inventory/add-medicine"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Add your first medicine
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing {filteredMedicines.length} of {medicines.length} medicines
          </span>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">
              In Stock: {medicines.filter(m => m.stock_quantity > 0).length}
            </span>
            <span className="text-orange-600">
              Low Stock: {medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < (m.min_stock_level || 10)).length}
            </span>
            <span className="text-red-600">
              Out of Stock: {medicines.filter(m => m.stock_quantity === 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineList;