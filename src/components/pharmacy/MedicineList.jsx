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
  FaBox,
  FaEye,
  FaEdit,
  FaFilter,
  FaChevronRight,
  FaFileExport,
  FaSortAmountDown,
  FaEllipsisH
} from 'react-icons/fa';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Package,
  Calendar,
  DollarSign,
  RefreshCw,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronRight,
  Filter,
  SortAsc,
  MoreVertical,
  Pill,
  Package2
} from 'lucide-react';
import { navigate } from 'wouter/use-browser-location';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await apiClient.get('/medicines?limit=200');
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

  const sortedAndFilteredMedicines = useMemo(() => {
    let filtered = medicines.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter ? med.category === categoryFilter : true;
      
      const matchesStock = stockFilter === 'low' ? (med.stock_quantity < (med.min_stock_level || 10)) :
                           stockFilter === 'out' ? med.stock_quantity === 0 :
                           stockFilter === 'adequate' ? (med.stock_quantity >= (med.min_stock_level || 10)) : true;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'stock':
          aVal = a.stock_quantity || 0;
          bVal = b.stock_quantity || 0;
          break;
        case 'price':
          aVal = a.price_per_unit || 0;
          bVal = b.price_per_unit || 0;
          break;
        case 'category':
          aVal = a.category || '';
          bVal = b.category || '';
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [medicines, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  const getStockStatus = (quantity, minStock = 10) => {
    if (quantity === 0) return { 
      text: 'Out of Stock', 
      color: 'text-red-600', 
      bg: 'bg-red-50 text-red-700 border-red-200 ring-red-500/30' 
    };
    if (quantity < minStock) return { 
      text: 'Low Stock', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30' 
    };
    return { 
      text: 'In Stock', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30' 
    };
  };

  const stats = useMemo(() => ({
    total: medicines.length,
    inStock: medicines.filter(m => m.stock_quantity > 0).length,
    lowStock: medicines.filter(m => m.stock_quantity > 0 && m.stock_quantity < (m.min_stock_level || 10)).length,
    outOfStock: medicines.filter(m => m.stock_quantity === 0).length,
    totalValue: medicines.reduce((sum, med) => 
      sum + ((med.price_per_unit || 0) * (med.stock_quantity || 0)), 0)
  }), [medicines]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading medicine inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medicine Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage pharmacy medicines and stock levels</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            <FaFileExport /> Export
          </button>
          <Link 
            to="/dashboard/pharmacy/add-medicine"
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <FaPlus /> Add New Medicine
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Medicines</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
              <p className="text-xs text-slate-500 mt-2">Active inventory items</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <Package className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">In Stock</p>
              <h3 className="text-3xl font-bold text-emerald-700">{stats.inStock}</h3>
              <p className="text-xs text-slate-500 mt-2">Available for sale</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <FaBoxes className="text-emerald-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Low Stock</p>
              <h3 className="text-3xl font-bold text-amber-700">{stats.lowStock}</h3>
              <p className="text-xs text-slate-500 mt-2">Need restocking</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <AlertCircle className="text-amber-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Value</p>
              <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalValue)}</h3>
              <p className="text-xs text-slate-500 mt-2">Inventory worth</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <DollarSign className="text-slate-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search by name, generic, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Stock Levels</option>
            <option value="adequate">Adequate Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-800">{sortedAndFilteredMedicines.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{medicines.length}</span> medicines
          </span>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              In Stock: <span className="font-semibold text-slate-700">{stats.inStock}</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              Low Stock: <span className="font-semibold text-slate-700">{stats.lowStock}</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Out of Stock: <span className="font-semibold text-slate-700">{stats.outOfStock}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {sortedAndFilteredMedicines.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Package2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No medicines found</h3>
            <p className="text-slate-500 mt-1">
              {searchTerm || categoryFilter || stockFilter 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first medicine'}
            </p>
            {!(searchTerm || categoryFilter || stockFilter) && (
              <Link 
                to="/dashboard/pharmacy/add-medicine"
                className="mt-4 flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all"
              >
                <FaPlus /> Add First Medicine
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Medicine Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock Level</th>
                  <th className="px-6 py-4">Pricing</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedAndFilteredMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine.stock_quantity, medicine.min_stock_level);
                  return (
                    <tr key={medicine._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{medicine.name}</div>
                            {medicine.generic_name && (
                              <div className="text-xs text-slate-400 font-medium">Generic: {medicine.generic_name}</div>
                            )}
                            {medicine.brand && (
                              <div className="text-xs text-slate-400">Brand: {medicine.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {medicine.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{medicine.stock_quantity || 0} units</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${stockStatus.bg}`}>
                              {stockStatus.text}
                            </span>
                          </div>
                          {medicine.min_stock_level && (
                            <div className="text-xs text-slate-500">
                              Min: {medicine.min_stock_level} units
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <FaRupeeSign className="text-slate-400 text-sm" />
                            <span className="font-bold text-slate-800">{medicine.price_per_unit?.toFixed(2) || '0.00'}</span>
                            <span className="text-xs text-slate-500">/unit</span>
                          </div>
                          {medicine.mrp && (
                            <div className="text-xs text-slate-500">
                              MRP: ₹{medicine.mrp}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${
                          medicine.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/30'
                        }`}>
                          {medicine.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/pharmacy/medicine-detail/${medicine._id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/pharmacy/edit-medicine/${medicine._id}`)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transition-opacity" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="More">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination/Footer */}
      {sortedAndFilteredMedicines.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-800">1</span> of{' '}
            <span className="font-semibold text-slate-800">1</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              1
            </button>
            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              2
            </button>
            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              3
            </button>
            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineList;