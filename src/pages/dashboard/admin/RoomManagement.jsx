import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBed, FaPlus, FaEdit, FaTrash, FaBuilding, FaHospitalUser } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [wards, setWards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    wardId: '',
    type: 'General',
    Department: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchRooms();
    fetchWards();
    fetchDepartments();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      setRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await axios.get(`${API_URL}/wards`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await axios.put(`${API_URL}/rooms/${editingRoom._id}`, formData);
        toast.success('Room updated successfully');
      } else {
        await axios.post(`${API_URL}/rooms`, formData);
        toast.success('Room created successfully');
      }
      setShowModal(false);
      setEditingRoom(null);
      setFormData({ room_number: '', wardId: '', type: 'General', Department: '', status: 'Available' });
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error(error.response?.data?.error || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      wardId: room.wardId?._id || '',
      type: room.type,
      Department: room.Department?._id || '',
      status: room.status
    });
    setShowModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? All beds in this room will also be affected.')) return;
    try {
      await axios.delete(`${API_URL}/rooms/${roomId}`);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getTypeBadge = (type) => {
    const colors = { 'General': 'bg-blue-100 text-blue-700', 'ICU': 'bg-red-100 text-red-700', 'Private': 'bg-purple-100 text-purple-700' };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-teal-100 rounded-xl"><FaBed className="text-teal-600" size={20} /></div><h1 className="text-2xl font-bold text-slate-800">Room Management</h1></div><p className="text-slate-500">Manage hospital rooms within wards</p></div>
        <button onClick={() => { setEditingRoom(null); setFormData({ room_number: '', wardId: '', type: 'General', Department: '', status: 'Available' }); setShowModal(true); }} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2"><FaPlus size={14} /> Add Room</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Room Number</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ward</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Department</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th><th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (<tr><td colSpan="6" className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div></td></tr>) : rooms.length === 0 ? (<tr><td colSpan="6" className="text-center py-8 text-slate-400">No rooms found. Click "Add Room" to create one.</td></tr>) : (rooms.map((room) => (<tr key={room._id} className="hover:bg-slate-50"><td className="px-6 py-4 font-medium text-slate-800">{room.room_number}</td><td className="px-6 py-4 text-slate-600">{room.wardId?.name || '-'}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(room.type)}`}>{room.type}</span></td><td className="px-6 py-4 text-slate-600">{room.Department?.name || '-'}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(room.status)}`}>{room.status}</span></td><td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => handleEdit(room)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit size={16} /></button><button onClick={() => handleDelete(room._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash size={16} /></button></div></td></tr>)))}
          </tbody>
        </table>
      </div>

      {showModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-lg"><div className="p-6 border-b border-slate-100"><h2 className="text-xl font-bold text-slate-800">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Room Number *</label><input type="text" name="room_number" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Ward</label><select name="wardId" value={formData.wardId} onChange={(e) => setFormData({...formData, wardId: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Select Ward</option>{wards.map(ward => (<option key={ward._id} value={ward._id}>{ward.name}</option>))}</select></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label><select name="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="General">General</option><option value="ICU">ICU</option><option value="Private">Private</option></select></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Department</label><select name="Department" value={formData.Department} onChange={(e) => setFormData({...formData, Department: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Select Department</option>{departments.map(dept => (<option key={dept._id} value={dept._id}>{dept.name}</option>))}</select></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="Available">Available</option><option value="Occupied">Occupied</option></select></div><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">{editingRoom ? 'Update' : 'Create'}</button></div></form></div></div>)}
    </div>
    </Layout>
  );
};

export default RoomManagement;