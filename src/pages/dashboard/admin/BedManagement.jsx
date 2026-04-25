import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBed, FaPlus, FaEdit, FaTrash, FaBuilding, FaDoorOpen, FaMoneyBillWave } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    bedNumber: '',
    roomId: '',
    wardId: '',
    bedType: 'General',
    dailyCharge: 0,
    features: []
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchBeds();
    fetchRooms();
    fetchWards();
  }, []);

  // Auto-populate ward when room changes
  useEffect(() => {
    if (formData.roomId && rooms.length > 0) {
      const selectedRoomObj = rooms.find(room => room._id === formData.roomId);
      if (selectedRoomObj) {
        setSelectedRoom(selectedRoomObj);
        // Auto-populate wardId from the selected room
        if (selectedRoomObj.wardId) {
          const wardId = typeof selectedRoomObj.wardId === 'object' 
            ? selectedRoomObj.wardId._id 
            : selectedRoomObj.wardId;
          setFormData(prev => ({ ...prev, wardId }));
        }
      }
    } else {
      setSelectedRoom(null);
    }
  }, [formData.roomId, rooms]);

  const fetchBeds = async () => {
    try {
      const response = await axios.get(`${API_URL}/ipd/beds`);
      setBeds(response.data.beds || []);
    } catch (error) {
      console.error('Error fetching beds:', error);
      toast.error('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      console.log('Fetched rooms:', response.data);
      setRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await axios.get(`${API_URL}/wards`);
      console.log('Fetched wards:', response.data);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId) {
      toast.error('Please select a room');
      return;
    }
    if (!formData.bedNumber) {
      toast.error('Please enter a bed number');
      return;
    }
    try {
      if (editingBed) {
        await axios.put(`${API_URL}/ipd/beds/${editingBed._id}`, formData);
        toast.success('Bed updated successfully');
      } else {
        await axios.post(`${API_URL}/ipd/beds`, formData);
        toast.success('Bed created successfully');
      }
      setShowModal(false);
      setEditingBed(null);
      setSelectedRoom(null);
      setFormData({ bedNumber: '', roomId: '', wardId: '', bedType: 'General', dailyCharge: 0, features: [] });
      fetchBeds();
    } catch (error) {
      console.error('Error saving bed:', error);
      toast.error(error.response?.data?.error || 'Failed to save bed');
    }
  };

  const handleEdit = (bed) => {
    setEditingBed(bed);
    setFormData({
      bedNumber: bed.bedNumber,
      roomId: bed.roomId?._id || '',
      wardId: bed.wardId?._id || '',
      bedType: bed.bedType,
      dailyCharge: bed.dailyCharge,
      features: bed.features || []
    });
    setShowModal(true);
  };

  const handleDelete = async (bedId) => {
    if (!window.confirm('Are you sure you want to delete this bed?')) return;
    try {
      await axios.delete(`${API_URL}/ipd/beds/${bedId}`);
      toast.success('Bed deleted successfully');
      fetchBeds();
    } catch (error) {
      console.error('Error deleting bed:', error);
      toast.error('Failed to delete bed');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-green-100 text-green-700',
      'Occupied': 'bg-red-100 text-red-700',
      'Cleaning': 'bg-yellow-100 text-yellow-700',
      'Maintenance': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getBedTypeColor = (type) => {
    const colors = {
      'General': 'bg-blue-100 text-blue-700',
      'Semi Private': 'bg-cyan-100 text-cyan-700',
      'Private': 'bg-purple-100 text-purple-700',
      'ICU': 'bg-red-100 text-red-700',
      'Emergency': 'bg-orange-100 text-orange-700',
      'NICU': 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Get the ward name for display
  const getWardDisplayName = () => {
    if (selectedRoom && selectedRoom.wardId) {
      const wardName = typeof selectedRoom.wardId === 'object' 
        ? selectedRoom.wardId.name 
        : wards.find(w => w._id === selectedRoom.wardId)?.name;
      return wardName || 'Select a room first';
    }
    return 'Select a room first';
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-xl">
                <FaBed className="text-teal-600" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Bed Management</h1>
            </div>
            <p className="text-slate-500">Manage individual beds within rooms</p>
          </div>
          <button 
            onClick={() => { 
              setEditingBed(null); 
              setSelectedRoom(null);
              setFormData({ bedNumber: '', roomId: '', wardId: '', bedType: 'General', dailyCharge: 0, features: [] }); 
              setShowModal(true); 
            }} 
            className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2"
          >
            <FaPlus size={14} /> Add Bed
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Bed Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Bed Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ward</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Daily Charge</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div></td></tr>
              ) : beds.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-400">No beds found. Click "Add Bed" to create one.</td></tr>
              ) : (
                beds.map((bed) => (
                  <tr key={bed._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">{bed.bedCode}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{bed.bedNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{bed.roomId?.room_number || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{bed.wardId?.name || '-'}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getBedTypeColor(bed.bedType)}`}>{bed.bedType}</span></td>
                    <td className="px-6 py-4 text-slate-600">₹{bed.dailyCharge}/day</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bed.status)}`}>{bed.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(bed)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit size={16} /></button>
                        <button onClick={() => handleDelete(bed._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">{editingBed ? 'Edit Bed' : 'Add New Bed'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bed Number *</label>
                  <input 
                    type="text" 
                    value={formData.bedNumber} 
                    onChange={(e) => setFormData({...formData, bedNumber: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                    required 
                    placeholder="e.g., 101-A" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room *</label>
                  <select 
                    value={formData.roomId} 
                    onChange={(e) => setFormData({...formData, roomId: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room._id} value={room._id}>
                        {room.room_number} ({room.type}) - {room.wardId?.name || 'No Ward'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ward (Auto-filled)</label>
                  <input 
                    type="text" 
                    value={getWardDisplayName()} 
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed" 
                    disabled 
                    readOnly
                  />
                  <p className="text-xs text-slate-400 mt-1">Ward is automatically populated based on selected room</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bed Type</label>
                  <select 
                    value={formData.bedType} 
                    onChange={(e) => setFormData({...formData, bedType: e.target.value})} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="General">General</option>
                    <option value="Semi Private">Semi Private</option>
                    <option value="Private">Private</option>
                    <option value="ICU">ICU</option>
                    <option value="Emergency">Emergency</option>
                    <option value="NICU">NICU</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Daily Charge (₹)</label>
                  <input 
                    type="number" 
                    value={formData.dailyCharge} 
                    onChange={(e) => setFormData({...formData, dailyCharge: parseInt(e.target.value) || 0})} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                    min="0" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Features</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={featureInput} 
                      onChange={(e) => setFeatureInput(e.target.value)} 
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                      placeholder="e.g., Oxygen, Call Bell" 
                    />
                    <button type="button" onClick={addFeature} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-slate-100 rounded-full flex items-center gap-1">
                        {feature}
                        <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">{editingBed ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BedManagement;