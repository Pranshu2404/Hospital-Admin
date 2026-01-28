import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaFilter,
  FaTimes,
  FaBoxOpen,
} from 'react-icons/fa';
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  User,
  UserCircle,
  Calendar,
  AlertTriangle,
  Eye,
  Pill,
  History,
  RefreshCw,
  SortAsc,
  X,
  CheckCircle,
  CalendarCheck,
  Printer,
  Phone,
  Info,
  ArrowRight,
  Hourglass,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { PrescriptionIcon } from '../common/Icons';

const PrescriptionQueue = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [sortBy, setSortBy] = useState('issue_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    today: 0,
    expired: 0
  });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchQueuePrescriptions();
    fetchDoctors();
  }, [priorityFilter, statusFilter, doctorFilter, sortBy, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Auto-refresh every 30 seconds
      if (!loading && !refreshing) {
        fetchQueuePrescriptions(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, refreshing]);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors?limit=100');
      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchQueuePrescriptions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);
      
      const params = { 
        status: 'Active',
        sort: sortBy,
        order: sortOrder,
        limit: 50
      };
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      if (doctorFilter) params.doctor_id = doctorFilter;
      
      const response = await apiClient.get('/prescriptions', { params });
      
      // Filter prescriptions that have undispensed items
      const queuePrescriptions = response.data.prescriptions.filter(prescription =>
        prescription.items.some(item => !item.is_dispensed)
      );
      
      setPrescriptions(queuePrescriptions);
      calculateStats(queuePrescriptions);
      
    } catch (err) {
      console.error('Error fetching queue prescriptions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (prescriptions) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const urgentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: prescriptions.length,
      urgent: prescriptions.filter(p => new Date(p.issue_date) < urgentDate).length,
      high: prescriptions.filter(p => p.priority === 'High').length,
      medium: prescriptions.filter(p => p.priority === 'Medium').length,
      low: prescriptions.filter(p => p.priority === 'Low').length,
      today: prescriptions.filter(p => new Date(p.issue_date) >= today).length,
      expired: prescriptions.filter(p => new Date(p.valid_until) < now).length
    };
    
    setStats(stats);
  };

  const handleDispense = (prescription) => {
    // Store the selected prescription in sessionStorage
    sessionStorage.setItem('selectedPrescription', JSON.stringify({
      _id: prescription._id,
      patient_id: prescription.patient_id,
      prescription_number: prescription.prescription_number,
      timestamp: new Date().toISOString()
    }));
    
    // Navigate to dispense page
    navigate('/dashboard/pharmacy/prescriptions/dispense');
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handlePrintPrescription = (prescription) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription #${prescription.prescription_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .medications { margin-top: 20px; }
            .footer { margin-top: 40px; text-align: right; font-size: 14px; color: #666; }
            .doctor-signature { margin-top: 40px; border-top: 1px solid #333; padding-top: 20px; }
            .warning { color: #e74c3c; font-weight: bold; }
            @media print { 
              body { margin: 0; padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDICAL PRESCRIPTION</h1>
            <h2>Prescription #${prescription.prescription_number}</h2>
            <p>Date: ${new Date(prescription.issue_date).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Patient Information</div>
            <div class="patient-info">
              <div>
                <p><strong>Name:</strong> ${prescription.patient_id?.first_name} ${prescription.patient_id?.last_name}</p>
                <p><strong>Patient ID:</strong> ${prescription.patient_id?.patientId}</p>
                <p><strong>Age/Gender:</strong> ${prescription.patient_id?.age || 'N/A'} / ${prescription.patient_id?.gender || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Contact:</strong> ${prescription.patient_id?.phone || 'N/A'}</p>
                <p><strong>Doctor:</strong> Dr. ${prescription.doctor_id?.firstName} ${prescription.doctor_id?.lastName}</p>
                <p><strong>Valid Until:</strong> ${new Date(prescription.valid_until).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <p>${prescription.diagnosis || 'Not specified'}</p>
          </div>
          
          <div class="section medications">
            <div class="section-title">Medications</div>
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${prescription.items.map(item => `
                  <tr>
                    <td>${item.medicine_name}</td>
                    <td>${item.dosage}</td>
                    <td>${item.frequency}</td>
                    <td>${item.duration}</td>
                    <td>${item.instructions || 'As directed'}</td>
                    <td class="${item.is_dispensed ? '' : 'warning'}">
                      ${item.is_dispensed ? '✓ Dispensed' : '⏳ Pending'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          ${prescription.follow_up_date ? `
            <div class="section">
              <div class="section-title">Follow-up Information</div>
              <p><strong>Follow-up Date:</strong> ${new Date(prescription.follow_up_date).toLocaleDateString()}</p>
              <p><strong>Follow-up Notes:</strong> ${prescription.follow_up_notes || 'None'}</p>
            </div>
          ` : ''}
          
          ${prescription.notes ? `
            <div class="section">
              <div class="section-title">Additional Notes</div>
              <p>${prescription.notes}</p>
            </div>
          ` : ''}
          
          <div class="doctor-signature">
            <p><strong>Dr. ${prescription.doctor_id?.firstName} ${prescription.doctor_id?.lastName}</strong></p>
            <p>${prescription.doctor_id?.qualification || 'MBBS'}</p>
            <p>License No: ${prescription.doctor_id?.licenseNumber || 'N/A'}</p>
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>This is a computer-generated prescription. Please verify with original if required.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      High: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertTriangle,
        bgColor: 'bg-red-500'
      },
      Medium: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        bgColor: 'bg-yellow-500'
      },
      Low: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        bgColor: 'bg-green-500'
      }
    };
    
    const config = priorities[priority] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Info,
      bgColor: 'bg-gray-500'
    };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {priority || 'Normal'}
      </span>
    );
  };

  const getUrgencyStatus = (issueDate) => {
    const issued = new Date(issueDate);
    const now = new Date();
    const diffTime = Math.abs(now - issued);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 5) return { text: 'text-red-600', label: 'Very Urgent', icon: AlertTriangle };
    if (diffDays > 3) return { text: 'text-orange-600', label: 'Urgent', icon: Clock };
    if (diffDays > 1) return { text: 'text-yellow-600', label: 'Recent', icon: Hourglass };
    return { text: 'text-green-600', label: 'Today', icon: CheckCircle };
  };

  const getValidityStatus = (validUntil) => {
    const expiry = new Date(validUntil);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'text-red-600', label: 'Expired', icon: X };
    if (diffDays < 3) return { text: 'text-orange-600', label: 'Expiring Soon', icon: AlertCircle };
    return { text: 'text-green-600', label: 'Valid', icon: Shield };
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      prescription.patient_id?.first_name?.toLowerCase().includes(searchLower) ||
      prescription.patient_id?.last_name?.toLowerCase().includes(searchLower) ||
      prescription.patient_id?.patientId?.toLowerCase().includes(searchLower) ||
      prescription.doctor_id?.firstName?.toLowerCase().includes(searchLower) ||
      prescription.doctor_id?.lastName?.toLowerCase().includes(searchLower) ||
      prescription.prescription_number?.toLowerCase().includes(searchLower) ||
      prescription.diagnosis?.toLowerCase().includes(searchLower) ||
      prescription.items.some(item => 
        item.medicine_name.toLowerCase().includes(searchLower)
      )
    );
  });

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
    setStatusFilter('');
    setDoctorFilter('');
    setSortBy('issue_date');
    setSortOrder('desc');
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading prescription queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl shadow-sm">
            <ClipboardList className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Prescription Queue</h1>
            <p className="text-gray-600 text-sm mt-1">Manage pending prescription medications</p>
          </div>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/pharmacy/prescriptions/dispense')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FaBoxOpen /> Go to Dispense
          </button>
          <button
            onClick={fetchQueuePrescriptions}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            {refreshing ? (
              <RefreshCw className="animate-spin w-4 h-4" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Total Queue</p>
              <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
              <p className="text-xs text-gray-500 mt-2">Prescriptions pending</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <ClipboardList className="text-blue-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Urgent</p>
              <h3 className="text-3xl font-bold text-red-700">{stats.urgent}</h3>
              <p className="text-xs text-gray-500 mt-2">Older than 5 days</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50">
              <AlertTriangle className="text-red-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-2xl border border-yellow-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Today's</p>
              <h3 className="text-3xl font-bold text-yellow-700">{stats.today}</h3>
              <p className="text-xs text-gray-500 mt-2">New prescriptions</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50">
              <CalendarCheck className="text-yellow-600" size={22} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">Expired</p>
              <h3 className="text-3xl font-bold text-green-700">{stats.expired}</h3>
              <p className="text-xs text-gray-500 mt-2">Prescriptions</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50">
              <Clock className="text-green-600" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.firstName} {doctor.lastName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="issue_date">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="patient_name">Sort by Patient</option>
            </select>
            <button
              onClick={() => toggleSort(sortBy)}
              className="p-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredPrescriptions.length}</span> of{' '}
            <span className="font-semibold text-gray-800">{stats.total}</span> prescriptions
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <FaTimes /> Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <FaFilter /> {showFilters ? 'Hide' : 'More'} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Prescriptions Grid */}
      {filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No prescriptions in queue</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm || priorityFilter || doctorFilter
              ? 'Try adjusting your filters'
              : 'All prescriptions have been processed'}
          </p>
          {(searchTerm || priorityFilter || doctorFilter) && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition-all"
            >
              <FaTimes /> Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-8">
          {filteredPrescriptions.map((prescription) => {
            const pendingItems = prescription.items.filter(item => !item.is_dispensed).length;
            const totalItems = prescription.items.length;
            const urgency = getUrgencyStatus(prescription.issue_date);
            const validity = getValidityStatus(prescription.valid_until);
            const UrgencyIcon = urgency.icon;
            const ValidityIcon = validity.icon;
            
            return (
              <div key={prescription._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column - Prescription Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                        <PrescriptionIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-800 text-lg">
                            #{prescription.prescription_number}
                          </h3>
                          {getPriorityBadge(prescription.priority)}
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${urgency.text}`}>
                            <UrgencyIcon className="w-3 h-3" />
                            {urgency.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${validity.text}`}>
                            <ValidityIcon className="w-3 h-3" />
                            {validity.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Patient Info */}
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Patient</p>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="font-semibold text-gray-800">
                                {prescription.patient_id?.first_name} {prescription.patient_id?.last_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 ml-6 mt-1">
                              <span>ID: {prescription.patient_id?.patientId}</span>
                              {prescription.patient_id?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {prescription.patient_id.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Doctor Info */}
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Doctor</p>
                            <div className="flex items-center gap-2 mt-1">
                              <UserCircle className="w-4 h-4 text-gray-400" />
                              <p className="font-semibold text-gray-800">
                                Dr. {prescription.doctor_id?.firstName} {prescription.doctor_id?.lastName}
                              </p>
                            </div>
                            {prescription.doctor_id?.licenseNumber && (
                              <p className="text-xs text-gray-500 ml-6 mt-1">
                                License: {prescription.doctor_id.licenseNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Issue Date</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(prescription.issue_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Valid Until</p>
                            <p className={`font-semibold ${validity.text}`}>
                              {new Date(prescription.valid_until).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </p>
                          </div>
                          {prescription.follow_up_date && (
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Follow-up</p>
                              <p className="font-semibold text-gray-800">
                                {new Date(prescription.follow_up_date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Actions & Stats */}
                  <div className="flex flex-col gap-4">
                    {/* Pending Items Indicator */}
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        pendingItems > 0 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {pendingItems}/{totalItems}
                      </div>
                      <div className="text-sm text-gray-500">
                        items pending
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full lg:w-48">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(((totalItems - pendingItems) / totalItems) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            pendingItems === 0 ? 'bg-green-500' :
                            pendingItems >= totalItems ? 'bg-red-500' :
                            'bg-teal-500'
                          }`}
                          style={{ width: `${((totalItems - pendingItems) / totalItems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnosis & Medications */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Diagnosis */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Diagnosis
                      </h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {prescription.diagnosis || 'Not specified'}
                      </p>
                    </div>
                    
                    {/* Pending Medications */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Pill className="w-4 h-4" /> Pending Medications ({pendingItems})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {prescription.items
                          .filter(item => !item.is_dispensed)
                          .map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-orange-50 border border-orange-100 rounded-lg">
                              <div>
                                <div className="font-medium text-sm text-orange-800">
                                  {item.medicine_name}
                                </div>
                                <div className="text-xs text-orange-600">
                                  {item.dosage} • {item.frequency} • {item.duration}
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                                {item.quantity || 1} unit{item.quantity > 1 ? 's' : ''}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    {prescription.appointment_id?.type && (
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3" />
                        {prescription.appointment_id.type} Appointment
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewDetails(prescription)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    
                    <button
                      onClick={() => handlePrintPrescription(prescription)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    
                    <button
                      onClick={() => handleDispense(prescription)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-sm rounded-xl hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/20 transition-all group/btn"
                      disabled={pendingItems === 0}
                    >
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      Dispense
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Urgent Notice */}
      {stats.urgent > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-2xl border border-red-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800">Attention Required</h4>
              <p className="text-red-700 text-sm mt-1">
                You have <span className="font-bold">{stats.urgent}</span> prescriptions that are older than 5 days. 
                Please prioritize these immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expired Notice */}
      {stats.expired > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-2xl border border-orange-200 mt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-orange-800">Expired Prescriptions</h4>
              <p className="text-orange-700 text-sm mt-1">
                You have <span className="font-bold">{stats.expired}</span> expired prescriptions. 
                These require doctor verification before dispensing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Prescription className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Prescription #{selectedPrescription.prescription_number}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getPriorityBadge(selectedPrescription.priority)}
                    <span className="text-sm text-gray-500">
                      {new Date(selectedPrescription.issue_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient and Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <h4 className="font-bold text-blue-800 text-sm mb-3">Patient Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold text-gray-800">
                        {selectedPrescription.patient_id?.first_name} {selectedPrescription.patient_id?.last_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 ml-6">
                      <div>ID: {selectedPrescription.patient_id?.patientId}</div>
                      <div>Age: {selectedPrescription.patient_id?.age || 'N/A'}</div>
                      <div>Gender: {selectedPrescription.patient_id?.gender || 'N/A'}</div>
                      <div>
                        <Phone className="inline w-3 h-3 mr-1" />
                        {selectedPrescription.patient_id?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-2xl border border-teal-200">
                  <h4 className="font-bold text-teal-800 text-sm mb-3">Doctor Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-teal-600" />
                      <p className="font-semibold text-gray-800">
                        Dr. {selectedPrescription.doctor_id?.firstName} {selectedPrescription.doctor_id?.lastName}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 ml-6 space-y-1">
                      {selectedPrescription.doctor_id?.qualification && (
                        <div>Qualification: {selectedPrescription.doctor_id.qualification}</div>
                      )}
                      {selectedPrescription.doctor_id?.licenseNumber && (
                        <div>License: {selectedPrescription.doctor_id.licenseNumber}</div>
                      )}
                      {selectedPrescription.doctor_id?.department && (
                        <div>Department: {selectedPrescription.doctor_id.department}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Diagnosis</h4>
                  <p className="text-gray-600">{selectedPrescription.diagnosis || 'Not specified'}</p>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Dates</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Issue Date</p>
                      <p className="font-semibold">
                        {new Date(selectedPrescription.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valid Until</p>
                      <p className={`font-semibold ${
                        getValidityStatus(selectedPrescription.valid_until).text
                      }`}>
                        {new Date(selectedPrescription.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medications Table */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Medications</h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructions</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPrescription.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{item.medicine_name}</td>
                          <td className="px-4 py-3">{item.dosage}</td>
                          <td className="px-4 py-3">{item.frequency}</td>
                          <td className="px-4 py-3">{item.duration}</td>
                          <td className="px-4 py-3 font-medium">{item.quantity || 1}</td>
                          <td className="px-4 py-3 text-gray-600">{item.instructions || 'As directed'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.is_dispensed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {item.is_dispensed ? 'Dispensed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handlePrintPrescription(selectedPrescription)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Printer /> Print Prescription
                </button>
                <button
                  onClick={() => {
                    handleDispense(selectedPrescription);
                    setShowDetailModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
                >
                  <ArrowRight /> Proceed to Dispense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionQueue;