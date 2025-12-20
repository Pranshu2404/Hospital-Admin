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
  FaShoppingCart,
  FaChevronRight,
  FaDownload,
  FaSortAmountDown,
  FaClipboardList,
  FaHistory,
  FaFileInvoiceDollar,
  FaTruck,
  FaChartLine,
  FaStar,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Package,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  SortAsc,
  MoreVertical,
  Building,
  User,
  ShoppingCart,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Truck,
  FileText,
  Shield
} from 'lucide-react';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await apiClient.get('/suppliers');
        setSuppliers(response.data || []);
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
      setSelectedSuppliers(prev => prev.filter(id => id !== supplierId));
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

  const categories = [...new Set(suppliers.map(s => s.category).filter(Boolean))].sort();

  const filteredAndSortedSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter ? 
        (statusFilter === 'active' ? supplier.isActive :
         statusFilter === 'inactive' ? !supplier.isActive : true) : true;
      
      const matchesCategory = categoryFilter ? supplier.category === categoryFilter : true;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'orders':
          aVal = a.totalOrders || 0;
          bVal = b.totalOrders || 0;
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'lastOrder':
          aVal = new Date(a.lastOrderDate || 0);
          bVal = new Date(b.lastOrderDate || 0);
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

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.isActive).length,
    inactive: suppliers.filter(s => !s.isActive).length,
    preferred: suppliers.filter(s => s.isPreferred).length,
    totalOrders: suppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0)
  };

  const toggleSelectAll = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(suppliers.map(s => s._id));
    }
  };

  const toggleSelectSupplier = (supplierId) => {
    if (selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers(prev => prev.filter(id => id !== supplierId));
    } else {
      setSelectedSuppliers(prev => [...prev, supplierId]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    if (status) {
      return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-inset ring-emerald-500/30';
    }
    return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border-slate-200 ring-1 ring-inset ring-slate-500/30';
  };

  const getRatingStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-amber-400' : 'text-slate-300'}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm">
            <Building className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Suppliers Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your pharmacy suppliers and vendors</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            <FaDownload /> Export
          </button>
          <Link
            to="/dashboard/pharmacy/add-supplier"
            className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <FaPlus /> Add New Supplier
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Suppliers</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.total}</h3>
              <p className="text-xs text-slate-500 mt-2">Registered vendors</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <Building className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl border border-emerald-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Suppliers</p>
              <h3 className="text-3xl font-bold text-emerald-700">{stats.active}</h3>
              <p className="text-xs text-slate-500 mt-2">Ready for orders</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <CheckCircle className="text-emerald-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Preferred</p>
              <h3 className="text-3xl font-bold text-amber-700">{stats.preferred}</h3>
              <p className="text-xs text-slate-500 mt-2">Top-rated vendors</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <FaStar className="text-amber-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.totalOrders}</h3>
              <p className="text-xs text-slate-500 mt-2">All-time purchases</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <ShoppingCart className="text-slate-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Search by name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

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

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="orders">Sort by Orders</option>
              <option value="rating">Sort by Rating</option>
              <option value="lastOrder">Sort by Last Order</option>
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
            Showing <span className="font-semibold text-slate-800">{filteredAndSortedSuppliers.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{suppliers.length}</span> suppliers
          </span>
          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
              <FaFilter className="inline mr-1" /> Advanced Filters
            </button>
            {selectedSuppliers.length > 0 && (
              <button className="text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                Delete {selectedSuppliers.length} Selected
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      {filteredAndSortedSuppliers.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No suppliers found</h3>
          <p className="text-slate-500 mt-1">
            {searchTerm || statusFilter || categoryFilter 
              ? 'Try adjusting your filters' 
              : 'Start by adding your first supplier'}
          </p>
          {!(searchTerm || statusFilter || categoryFilter) && (
            <Link
              to="/dashboard/pharmacy/add-supplier"
              className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all"
            >
              <FaPlus /> Add First Supplier
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSuppliers.map((supplier) => {
            const isSelected = selectedSuppliers.includes(supplier._id);
            
            return (
              <div 
                key={supplier._id} 
                className={`bg-white p-6 rounded-2xl shadow-sm border ${isSelected ? 'border-teal-300 bg-teal-50/30' : 'border-slate-200'} hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{supplier.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={getStatusBadge(supplier.isActive)}>
                          {supplier.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {supplier.isPreferred && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <FaStar className="w-3 h-3" /> Preferred
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectSupplier(supplier._id)}
                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-4">
                  {supplier.contactPerson && (
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{supplier.contactPerson}</p>
                        <p className="text-xs text-slate-500">Contact Person</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Phone className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{supplier.phone}</p>
                      <p className="text-xs text-slate-500">Phone</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Mail className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 truncate">{supplier.email}</p>
                      <p className="text-xs text-slate-500">Email</p>
                    </div>
                  </div>

                  {supplier.address && (
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg mt-0.5">
                        <MapPin className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{supplier.address}</p>
                        <p className="text-xs text-slate-500">Address</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Supplier Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {supplier.category && (
                    <div className="bg-slate-50/50 p-2 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium">Category</p>
                      <p className="text-sm font-semibold text-slate-800">{supplier.category}</p>
                    </div>
                  )}
                  
                  <div className="bg-slate-50/50 p-2 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium">Total Orders</p>
                    <p className="text-sm font-semibold text-slate-800">{supplier.totalOrders || 0}</p>
                  </div>
                  
                  {supplier.rating && (
                    <div className="bg-slate-50/50 p-2 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium">Rating</p>
                      <div className="flex items-center gap-1">
                        {getRatingStars(supplier.rating)}
                        <span className="text-xs font-semibold text-slate-800 ml-1">{supplier.rating}/5</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-50/50 p-2 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium">Last Order</p>
                    <p className="text-sm font-semibold text-slate-800">{formatDate(supplier.lastOrderDate)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusToggle(supplier._id, supplier.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        supplier.isActive 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {supplier.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      to={`/dashboard/pharmacy/purchasing/create-order?supplier=${supplier._id}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Create Order"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/pharmacy/purchasing/edit-supplier/${supplier._id}`}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(supplier._id, supplier.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary & Quick Actions */}
      {filteredAndSortedSuppliers.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <FaChartLine className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Selected Suppliers</p>
                  <p className="text-lg font-bold text-slate-800">{selectedSuppliers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-2xl border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <FaTruck className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active for Orders</p>
                  <p className="text-lg font-bold text-slate-800">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <FaFileInvoiceDollar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Avg. Rating</p>
                  <p className="text-lg font-bold text-slate-800">
                    {suppliers.length > 0 
                      ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.filter(s => s.rating).length).toFixed(1)
                      : '0.0'}/5
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-bold text-xl mb-2">Supplier Management Tools</h3>
                <p className="opacity-90">Access comprehensive supplier management features</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard/pharmacy/purchasing/orders"
                  className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                >
                  View Orders
                </Link>
                <Link
                  to="/dashboard/pharmacy/purchasing/supplier-performance"
                  className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                >
                  Performance Reports
                </Link>
                <button className="px-4 py-2.5 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors">
                  Bulk Actions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersList;