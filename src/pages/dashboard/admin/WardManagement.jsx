import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaHospitalUser, FaMapMarkerAlt } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { adminSidebar } from '@/constants/sidebarItems/adminSidebar';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const WardManagement = () => {
  const [wards, setWards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    floor: '',
    type: 'General',
    description: ''
  });

  useEffect(() => {
    fetchWards();
    fetchDepartments();
  }, []);

  const fetchWards = async () => {
    try {
      const response = await axios.get(`${API_URL}/wards`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
      toast.error('Failed to fetch wards');
    } finally {
      setLoading(false);
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWard) {
        await axios.put(`${API_URL}/wards/${editingWard._id}`, formData);
        toast.success('Ward updated successfully');
      } else {
        await axios.post(`${API_URL}/wards`, formData);
        toast.success('Ward created successfully');
      }
      setShowModal(false);
      setEditingWard(null);
      setFormData({ name: '', departmentId: '', floor: '', type: 'General', description: '' });
      fetchWards();
    } catch (error) {
      console.error('Error saving ward:', error);
      toast.error(error.response?.data?.error || 'Failed to save ward');
    }
  };

  const handleEdit = (ward) => {
    setEditingWard(ward);
    setFormData({
      name: ward.name,
      departmentId: ward.departmentId?._id || '',
      floor: ward.floor || '',
      type: ward.type,
      description: ward.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (wardId) => {
    if (!window.confirm('Are you sure you want to delete this ward? This will affect all rooms and beds under it.')) return;
    try {
      await axios.delete(`${API_URL}/wards/${wardId}`);
      toast.success('Ward deleted successfully');
      fetchWards();
    } catch (error) {
      console.error('Error deleting ward:', error);
      toast.error('Failed to delete ward');
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      'General': 'bg-blue-100 text-blue-700',
      'ICU': 'bg-red-100 text-red-700',
      'Emergency': 'bg-orange-100 text-orange-700',
      'Maternity': 'bg-pink-100 text-pink-700',
      'Pediatric': 'bg-green-100 text-green-700',
      'Surgical': 'bg-purple-100 text-purple-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FaBuilding className="text-teal-600" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Ward Management</h1>
          </div>
          <p className="text-slate-500">Manage hospital wards and their configurations</p>
        </div>
        <button
          onClick={() => { setEditingWard(null); setFormData({ name: '', departmentId: '', floor: '', type: 'General', description: '' }); setShowModal(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2"
        >
          <FaPlus size={14} /> Add Ward
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Ward Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Floor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div></td></tr>
            ) : wards.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-slate-400">No wards found. Click "Add Ward" to create one.</td></tr>
            ) : (
              wards.map((ward) => (
                <tr key={ward._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800">{ward.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{ward.name}</td>
                  <td className="px-6 py-4 text-slate-600">{ward.departmentId?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{ward.floor || '-'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(ward.type)}`}>{ward.type}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(ward)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit size={16} /></button>
                      <button onClick={() => handleDelete(ward._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FaTrash size={16} /></button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{editingWard ? 'Edit Ward' : 'Add New Ward'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ward Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Department</label><select name="departmentId" value={formData.departmentId} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Select Department</option>{departments.map(dept => (<option key={dept._id} value={dept._id}>{dept.name}</option>))}</select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Floor</label><input type="text" name="floor" value={formData.floor} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g., Ground Floor, 1st Floor" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ward Type</label><select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"><option value="General">General</option><option value="ICU">ICU</option><option value="Emergency">Emergency</option><option value="Maternity">Maternity</option><option value="Pediatric">Pediatric</option><option value="Surgical">Surgical</option></select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" rows="2" /></div>
              <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">{editingWard ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default WardManagement;