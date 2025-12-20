import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaCalendarTimes, 
  FaTrash, 
  FaExclamationTriangle,
  FaBox,
  FaRupeeSign,
  FaChevronRight,
  FaDownload,
  FaFilter,
  FaSortAmountDown,
  FaClipboardList,
  FaHistory,
  FaFileExport,
  FaBan,
  FaCheckCircle,
  FaEye,
  FaFileMedical,
  FaSkullCrossbones
} from 'react-icons/fa';
import {
  AlertTriangle,
  AlertCircle,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trash2,
  Download,
  Filter,
  SortAsc,
  Eye,
  Calendar,
  Clock,
  XCircle,
  BarChart3,
  RefreshCw,
  FileText,
  Shield,
  CheckCircle,
  ChevronRight,
  Archive
} from 'lucide-react';

const ExpiredMedicines = () => {
  const [expiredMedicines, setExpiredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [sortBy, setSortBy] = useState('expiry');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchExpiredMedicines = async () => {
      try {
        const response = await apiClient.get('/medicines/expired');
        setExpiredMedicines(response.data || []);
      } catch (err) {
        setError('Failed to fetch expired medicines. Please try again later.');
        console.error('Error fetching expired medicines:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredMedicines();
  }, []);

  const handleDispose = async (medicineId) => {
    if (!window.confirm('Are you sure you want to dispose of this expired medicine? This action cannot be undone.')) {
      return;
    }

    try {
      const medicine = expiredMedicines.find(m => m._id === medicineId);
      await apiClient.post('/stock-adjustments', {
        medicine_id: medicineId,
        adjustment_type: 'Expiry',
        quantity: medicine.stock_quantity || 0,
        reason: 'Disposal of expired medicine',
        notes: 'Automated disposal process - Regulatory compliance'
      });

      // Remove from local state
      setExpiredMedicines(prev => prev.filter(med => med._id !== medicineId));
      setSelectedMedicines(prev => prev.filter(id => id !== medicineId));
      
      alert('Medicine disposed successfully and recorded in audit trail');
    } catch (err) {
      alert('Failed to dispose medicine. Please try again.');
      console.error('Error disposing medicine:', err);
    }
  };

  const handleBulkDispose = async () => {
    if (selectedMedicines.length === 0) {
      alert('Please select medicines to dispose');
      return;
    }

    if (!window.confirm(`Are you sure you want to dispose ${selectedMedicines.length} expired medicines? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const medicineId of selectedMedicines) {
        const medicine = expiredMedicines.find(m => m._id === medicineId);
        await apiClient.post('/stock-adjustments', {
          medicine_id: medicineId,
          adjustment_type: 'Expiry',
          quantity: medicine.stock_quantity || 0,
          reason: 'Bulk disposal of expired medicines',
          notes: 'Bulk disposal process - Regulatory compliance'
        });
      }

      // Remove all selected medicines
      setExpiredMedicines(prev => prev.filter(med => !selectedMedicines.includes(med._id)));
      setSelectedMedicines([]);
      
      alert(`${selectedMedicines.length} medicines disposed successfully`);
    } catch (err) {
      alert('Failed to dispose medicines. Please try again.');
      console.error('Error disposing medicines:', err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMedicines.length === expiredMedicines.length) {
      setSelectedMedicines([]);
    } else {
      setSelectedMedicines(expiredMedicines.map(m => m._id));
    }
  };

  const toggleSelectMedicine = (medicineId) => {
    if (selectedMedicines.includes(medicineId)) {
      setSelectedMedicines(prev => prev.filter(id => id !== medicineId));
    } else {
      setSelectedMedicines(prev => [...prev, medicineId]);
    }
  };

  const totalLoss = expiredMedicines.reduce((sum, med) => {
    return sum + ((med.price_per_unit || 0) * (med.stock_quantity || 0));
  }, 0);

  const totalQuantity = expiredMedicines.reduce((sum, med) => sum + (med.stock_quantity || 0), 0);

  const daysSinceExpiry = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((today - expiry) / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const sortedMedicines = [...expiredMedicines].sort((a, b) => {
    let aVal, bVal;
    
    switch(sortBy) {
      case 'expiry':
        aVal = new Date(a.expiry_date);
        bVal = new Date(b.expiry_date);
        break;
      case 'quantity':
        aVal = a.stock_quantity || 0;
        bVal = b.stock_quantity || 0;
        break;
      case 'value':
        aVal = (a.price_per_unit || 0) * (a.stock_quantity || 0);
        bVal = (b.price_per_unit || 0) * (b.stock_quantity || 0);
        break;
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      default:
        aVal = new Date(a.expiry_date);
        bVal = new Date(b.expiry_date);
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading expired medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-sm">
            <FaCalendarTimes className="text-red-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Expired Medicines</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and dispose of expired stock</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            <FaDownload /> Export Report
          </button>
          {selectedMedicines.length > 0 && (
            <button
              onClick={handleBulkDispose}
              className="flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
            >
              <FaTrash /> Dispose {selectedMedicines.length} Items
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Banner */}
      {expiredMedicines.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FaSkullCrossbones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">CRITICAL: Expired Medicines Detected</h3>
                <p className="opacity-90">
                  Immediate action required. {expiredMedicines.length} expired items totaling {formatCurrency(totalLoss)} must be disposed.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">Regulatory Compliance Risk</p>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">HIGH</span>
                <button
                  onClick={handleBulkDispose}
                  className="px-4 py-2.5 bg-white text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors"
                >
                  Bulk Dispose
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Expired</p>
              <h3 className="text-3xl font-bold text-red-700">{expiredMedicines.length}</h3>
              <p className="text-xs text-slate-500 mt-2">Items to dispose</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <XCircle className="text-red-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Quantity</p>
              <h3 className="text-3xl font-bold text-amber-700">{totalQuantity}</h3>
              <p className="text-xs text-slate-500 mt-2">Units to dispose</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <Package className="text-amber-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-2xl border border-rose-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Financial Loss</p>
              <h3 className="text-3xl font-bold text-rose-700">{formatCurrency(totalLoss)}</h3>
              <p className="text-xs text-slate-500 mt-2">Total value</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50">
              <DollarSign className="text-rose-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Expired</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {expiredMedicines.length > 0 
                  ? Math.round(expiredMedicines.reduce((sum, med) => 
                      sum + daysSinceExpiry(med.expiry_date), 0) / expiredMedicines.length)
                  : 0} days
              </h3>
              <p className="text-xs text-slate-500 mt-2">Since expiry</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <Clock className="text-slate-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMedicines.length === expiredMedicines.length && expiredMedicines.length > 0}
                onChange={toggleSelectAll}
                className="h-5 w-5 text-red-600 border-slate-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-slate-600">
                Select all ({selectedMedicines.length} of {expiredMedicines.length})
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
            >
              <option value="expiry">Sort by Expiry Date</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="value">Sort by Value</option>
              <option value="name">Sort by Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-xl hover:bg-red-100 transition-colors">
              <FaFileExport /> Compliance Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              <FaHistory /> Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Expired Medicines Grid */}
      {sortedMedicines.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-300 mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No expired medicines found!</h3>
          <p className="text-emerald-600 font-medium mt-1">All medicines are within validity period</p>
          <p className="text-slate-500 text-sm mt-2">Great inventory management!</p>
          <div className="mt-6">
            <button className="flex items-center gap-2 mx-auto px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              <FaEye /> View Expiring Soon
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {sortedMedicines.map((medicine) => {
            const daysExpired = daysSinceExpiry(medicine.expiry_date);
            const medicineValue = (medicine.price_per_unit || 0) * (medicine.stock_quantity || 0);
            const isSelected = selectedMedicines.includes(medicine._id);
            
            return (
              <div key={medicine._id} className={`bg-white p-6 rounded-2xl shadow-sm border ${isSelected ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Selection & Medicine Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectMedicine(medicine._id)}
                      className="h-5 w-5 text-red-600 border-slate-300 rounded focus:ring-red-500 mt-1"
                    />
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 text-lg">{medicine.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 ring-1 ring-inset ring-red-500/30">
                          <XCircle className="w-3 h-3" />
                          Expired {daysExpired} days ago
                        </span>
                      </div>
                      {medicine.generic_name && (
                        <p className="text-sm text-slate-500 mt-1">Generic: {medicine.generic_name}</p>
                      )}
                      {medicine.batch_number && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                            Batch: {medicine.batch_number}
                          </span>
                          {medicine.category && (
                            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                              {medicine.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium">Quantity</p>
                      <p className="text-lg font-bold text-slate-800">{medicine.stock_quantity || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium">Expiry Date</p>
                      <p className="text-sm font-medium text-red-600">
                        {new Date(medicine.expiry_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium">Unit Price</p>
                      <div className="flex items-center justify-center gap-1">
                        <FaRupeeSign className="text-slate-400 text-xs" />
                        <span className="font-medium">{medicine.price_per_unit?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium">Total Value</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(medicineValue)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDispose(medicine._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Dispose
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compliance & Safety Section */}
      {sortedMedicines.length > 0 && (
        <div className="space-y-6">
          {/* Safety Warning */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 text-lg mb-2">⚠️ Regulatory Compliance Notice</h3>
                <p className="text-red-700 mb-3">
                  According to pharmacy regulations, expired medicines must be disposed of immediately and recorded in the disposal register. 
                  Selling or dispensing expired medications is illegal and can result in severe penalties.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/70 p-4 rounded-xl border border-red-100">
                    <h4 className="font-semibold text-red-900 text-sm mb-2">Required Actions</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                        Dispose all expired items within 7 days
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                        Maintain disposal records for 5 years
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                        Notify regulatory body if required
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white/70 p-4 rounded-xl border border-red-100">
                    <h4 className="font-semibold text-red-900 text-sm mb-2">Disposal Guidelines</h4>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></div>
                        Use authorized disposal agencies
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt=1.5"></div>
                        Segregate hazardous materials
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt=1.5"></div>
                        Obtain disposal certificates
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Disposal Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Selected Items</span>
                  <span className="font-bold text-slate-800">{selectedMedicines.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Selected Quantity</span>
                  <span className="font-bold text-slate-800">
                    {selectedMedicines.reduce((sum, id) => {
                      const med = expiredMedicines.find(m => m._id === id);
                      return sum + (med?.stock_quantity || 0);
                    }, 0)} units
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Selected Value</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(selectedMedicines.reduce((sum, id) => {
                      const med = expiredMedicines.find(m => m._id === id);
                      return sum + ((med?.price_per_unit || 0) * (med?.stock_quantity || 0));
                    }, 0))}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={handleBulkDispose}
                    disabled={selectedMedicines.length === 0}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${selectedMedicines.length > 0 
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    {selectedMedicines.length > 0 
                      ? `Dispose ${selectedMedicines.length} Selected Items` 
                      : 'Select Items to Dispose'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Prevention Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Regular Expiry Checks</h4>
                    <p className="text-xs text-slate-600">Schedule monthly expiry audits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white rounded-lg">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Stock Rotation</h4>
                    <p className="text-xs text-slate-600">Implement FIFO (First-In, First-Out)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Minimum Stock Levels</h4>
                    <p className="text-xs text-slate-600">Set appropriate reorder points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredMedicines;