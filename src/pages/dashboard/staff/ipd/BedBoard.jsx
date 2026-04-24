import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBed, FaUser, FaStethoscope, FaClock, FaFilter, FaPlus, FaHospitalUser } from 'react-icons/fa';
import { RefreshCcw } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const BedBoard = () => {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingWards, setLoadingWards] = useState(true);
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchBeds();
    fetchWards();
  }, []);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/ipd/beds`);
      setBeds(response.data.beds || []);
    } catch (error) {
      console.error('Error fetching beds:', error);
      toast.error('Failed to load beds');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      setLoadingWards(true);
      const response = await axios.get(`${API_URL}/wards`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  const updateBedStatus = async (bedId, status) => {
    try {
      await axios.patch(`${API_URL}/ipd/beds/${bedId}/status`, { status });
      toast.success(`Bed status updated to ${status}`);
      fetchBeds();
    } catch (error) {
      console.error('Error updating bed status:', error);
      toast.error('Failed to update bed status');
    }
  };

  const filteredBeds = beds.filter(bed => {
    const matchesWard = selectedWard === 'all' || bed.wardId?._id === selectedWard || bed.wardId === selectedWard;
    const matchesStatus = selectedStatus === 'all' || bed.status === selectedStatus;
    return matchesWard && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Occupied': 'bg-red-50 text-red-700 border-red-200',
      'Reserved': 'bg-amber-50 text-amber-700 border-amber-200',
      'Cleaning': 'bg-blue-50 text-blue-700 border-blue-200',
      'Maintenance': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'Available').length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    cleaning: beds.filter(b => b.status === 'Cleaning').length,
    maintenance: beds.filter(b => b.status === 'Maintenance').length
  };

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-xl">
                <FaBed className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Bed Board</h1>
            </div>
            <p className="text-slate-500 text-sm">View and manage bed availability across wards</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center border border-slate-100">
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Total Beds</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center border border-emerald-100">
            <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-1">Available</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center border border-red-100">
            <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
            <p className="text-xs text-red-600 font-medium uppercase tracking-wider mt-1">Occupied</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center border border-blue-100">
            <p className="text-2xl font-bold text-blue-600">{stats.cleaning}</p>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mt-1">Cleaning</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center border border-slate-100">
            <p className="text-2xl font-bold text-slate-600">{stats.maintenance}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Maintenance</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <FaHospitalUser className="inline mr-1" size={14} /> Ward
              </label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                disabled={loadingWards}
              >
                <option value="all">All Wards</option>
                {wards.map(ward => (
                  <option key={ward._id} value={ward._id}>{ward.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <FaFilter className="inline mr-1" size={14} /> Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchBeds}
                className="w-full p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bed Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading beds...</p>
          </div>
        ) : filteredBeds.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100">
            <FaBed className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No beds found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredBeds.map((bed) => (
              <div
                key={bed._id}
                className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${getStatusColor(bed.status)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-bold">{bed.bedNumber}</span>
                  <FaBed className="opacity-60" />
                </div>
                <p className="text-sm font-medium">{bed.bedType}</p>
                <p className="text-xs opacity-70 mt-1">₹{bed.dailyCharge}/day</p>
                
                {bed.wardId && (
                  <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                    <FaHospitalUser size={10} /> {typeof bed.wardId === 'object' ? bed.wardId.name : 'Ward'}
                  </p>
                )}
                
                {bed.status === 'Occupied' && bed.currentAdmissionId && (
                  <div className="mt-3 pt-2 border-t border-current border-opacity-20">
                    <p className="text-xs flex items-center gap-1 truncate" title="Patient">
                      <FaUser size={10} /> {bed.currentAdmissionId.patientId?.first_name} {bed.currentAdmissionId.patientId?.last_name}
                    </p>
                    {bed.currentAdmissionId.primaryDoctorId && (
                      <p className="text-xs flex items-center gap-1 mt-1 truncate" title="Doctor">
                        <FaStethoscope size={10} /> Dr. {bed.currentAdmissionId.primaryDoctorId?.firstName}
                      </p>
                    )}
                    <p className="text-xs flex items-center gap-1 mt-1" title="Admission Date">
                      <FaClock size={10} /> {new Date(bed.currentAdmissionId.admissionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {bed.status !== 'Occupied' && (
                  <select
                    value={bed.status}
                    onChange={(e) => updateBedStatus(bed._id, e.target.value)}
                    className="mt-3 w-full text-xs p-1.5 rounded-lg border border-current bg-white bg-opacity-60 focus:outline-none focus:ring-1 focus:ring-current"
                  >
                    <option value="Available">Available</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BedBoard;