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

const MEDICINE_CATEGORIES = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Injection',
  'Cream',
  'Ointment',
  'Powder',
  'Drops',
  'Suspension',
  'Gel',
  'Lotion',
  'Spray',
  'Inhalant',
  'Patch',
  'Suppository'
];

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [detailMedicine, setDetailMedicine] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Open detail card. If `toEdit` true, open in edit mode.
  const openDetail = (med, toEdit = false) => {
    setDetailMedicine(med);
    setFormState({
      name: med.name || '',
      generic_name: med.generic_name || '',
      brand: med.brand || '',
      category: med.category || '',
      strength: med.strength || '',
      description: med.description || '',
      min_stock_level: med.min_stock_level || 10,
      prescription_required: !!med.prescription_required,
      location: med.location || {},
      is_active: med.is_active,
    });
    setEditMode(toEdit);
    setShowDetailCard(true);
  };

  const closeDetail = () => {
    setShowDetailCard(false);
    setDetailMedicine(null);
    setEditMode(false);
    setFormState({});
    setDeleteTarget(null);
    setActionLoading(false);
    setShowDeleteConfirm(false);
  };

  const startEdit = (med) => openDetail(med, true);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    if (!detailMedicine) return;
    setActionLoading(true);
    try {
      const res = await apiClient.put(`/medicines/${detailMedicine._id}`, formState);
      const updated = res.data;
      setMedicines(prev => prev.map(m => m._id === updated._id ? updated : m));
      setDetailMedicine(updated);
      setEditMode(false);
    } catch (err) {
      console.error('Update failed', err);
      alert('Failed to update medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (med) => {
    setDeleteTarget(med);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const med = deleteTarget || detailMedicine;
    if (!med) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/medicines/${med._id}`);
      setMedicines(prev => prev.filter(m => m._id !== med._id));
      setShowDeleteConfirm(false);
      closeDetail();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete medicine.');
    } finally {
      setActionLoading(false);
    }
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

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
                  {/* <th className="px-6 py-4">Pricing</th> */}
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
                      {/* <td className="px-6 py-4">
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
                      </td> */}
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
                            onClick={() => openDetail(medicine)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEdit(medicine)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmDelete(medicine)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg  group-hover:opacity-100 transition-opacity" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {/* <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="More">
                            <MoreVertical className="w-4 h-4" />
                          </button> */}
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

      {/* Detail Card (View / Edit / Delete) */}
      {showDetailCard && detailMedicine && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-12 pb-6 overflow-y-auto ">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetail}></div>
          <div className="relative z-50 w-full max-w-2xl mx-4 my-auto">
            <div className="bg-white border border-slate-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-slate-200 px-6 py-5 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{editMode ? '✎ Edit Medicine' : '📋 Medicine Details'}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-semibold">{detailMedicine.name}</p>
                </div>
                <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
                {!editMode ? (
                  <div className="space-y-4">
                    {/* View Mode Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Name</p>
                        <p className="text-sm font-semibold text-slate-800">{detailMedicine.name}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Category</p>
                        <p className="text-sm font-semibold text-slate-800">{detailMedicine.category || '-'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Generic Name</p>
                        <p className="text-sm font-semibold text-slate-800">{detailMedicine.generic_name || '-'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Brand</p>
                        <p className="text-sm font-semibold text-slate-800">{detailMedicine.brand || '-'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Strength</p>
                        <p className="text-sm font-semibold text-slate-800">{detailMedicine.strength || '-'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Min Stock Level</p>
                        <p className="text-sm font-semibold text-slate-800">{detailMedicine.min_stock_level ?? 10} units</p>
                      </div>
                    </div>
                    {detailMedicine.description && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Description</p>
                        <p className="text-sm text-slate-700">{detailMedicine.description}</p>
                      </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-semibold text-blue-700">
                        Prescription Required: <span className="text-blue-900">{detailMedicine.prescription_required ? 'Yes' : 'No'}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Edit Mode Form */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600 font-bold uppercase">Name *</label>
                        <input name="name" value={formState.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="Medicine name" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 font-bold uppercase">Generic Name</label>
                        <input name="generic_name" value={formState.generic_name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 font-bold uppercase">Brand</label>
                        <input name="brand" value={formState.brand} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 font-bold uppercase">Category</label>
                        <select name="category" value={formState.category} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                          <option value="">Select Category</option>
                          {MEDICINE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 font-bold uppercase">Strength</label>
                        <input name="strength" value={formState.strength} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="e.g., 500mg" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 font-bold uppercase">Min Stock Level</label>
                        <input name="min_stock_level" type="number" value={formState.min_stock_level} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 font-bold uppercase">Description</label>
                      <textarea name="description" value={formState.description} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" rows="3" />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <input id="prescription_required" name="prescription_required" type="checkbox" checked={!!formState.prescription_required} onChange={handleFormChange} className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer" />
                      <label htmlFor="prescription_required" className="text-sm font-semibold text-slate-700 cursor-pointer">Prescription Required</label>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!editMode && (
                    <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors text-sm">✎ Edit</button>
                  )}
                  <button onClick={closeDetail} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm">Close</button>
                </div>
                <div className="flex items-center gap-2">
                  {editMode && (
                    <>
                      <button disabled={actionLoading} onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm">{actionLoading ? '⏳ Saving...' : '✓ Save'}</button>
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm">Cancel</button>
                    </>
                  )}
                  <button onClick={() => confirmDelete(detailMedicine)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm">🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteConfirm}></div>
          <div className="relative z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md mx-4 overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 px-6 py-5">
              <h3 className="text-lg font-bold text-red-700">🗑️ Delete Medicine</h3>
              <p className="text-sm text-red-600 mt-1">This action cannot be undone</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-slate-700">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteTarget.name}"</span>? This medicine will be deactivated and removed from the inventory.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-2">
              <button onClick={closeDeleteConfirm} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
              <button disabled={actionLoading} onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{actionLoading ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

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