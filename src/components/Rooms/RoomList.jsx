import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, EditIcon, DeleteIcon } from '../common/Icons';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editingRoom, setEditingRoom] = useState(null);
  const [editFormData, setEditFormData] = useState({
    room_number: '',
    ward: '',
    type: 'General',
    Department: '',
    status: 'Available',
    assigned_patient_id: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rooms`);
      setRooms(response.data);
      console.log('Fetched rooms:', response.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/rooms/${roomId}`);
      toast.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room._id);
    setEditFormData({
      room_number: room.room_number,
      ward: room.ward || '',
      type: room.type,
      Department: room.Department?._id || '',
      status: room.status,
      assigned_patient_id: room.assigned_patient_id?._id || ''
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (roomId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/rooms/${roomId}`,
        editFormData
      );
      toast.success('Room updated successfully');
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      toast.error('Failed to update room');
    }
  };

  const cancelEdit = () => {
    setEditingRoom(null);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Available: 'bg-green-100 text-green-800',
      Occupied: 'bg-red-100 text-red-800'
    };
    return `px-3 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      ICU: 'bg-red-100 text-red-800',
      Private: 'bg-blue-100 text-blue-800',
      General: 'bg-gray-100 text-gray-800'
    };
    return `px-3 py-1 text-xs font-medium rounded-full ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`;
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.ward?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesType = filterType === 'all' || room.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
            <p className="text-gray-600 mt-1">Manage hospital rooms and their status</p>
          </div>
          <Button variant="primary" onClick={() => window.location.href = '/rooms/add'}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by room number or ward..." 
            className="flex-1"
          />
          <div className="flex gap-2">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Types</option>
              <option value="General">General</option>
              <option value="ICU">ICU</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ward</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRooms.map((room) => (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingRoom === room._id ? (
                    <input
                      type="text"
                      name="room_number"
                      value={editFormData.room_number}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{room.room_number}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingRoom === room._id ? (
                    <input
                      type="text"
                      name="ward"
                      value={editFormData.ward}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{room.ward || '-'}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingRoom === room._id ? (
                    <select
                      name="type"
                      value={editFormData.type}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="General">General</option>
                      <option value="ICU">ICU</option>
                      <option value="Private">Private</option>
                    </select>
                  ) : (
                    <span className={getTypeBadge(room.type)}>
                      {room.type}
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingRoom === room._id ? (
                    <input
                      type="text"
                      name="Department"
                      value={editFormData.Department}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Department ID"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{room.Department?.name || '-'}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingRoom === room._id ? (
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  ) : (
                    <span className={getStatusBadge(room.status)}>
                      {room.status}
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingRoom === room._id ? (
                    <input
                      type="text"
                      name="assigned_patient_id"
                      value={editFormData.assigned_patient_id}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Patient ID"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {room.assigned_patient_id ? `${room.assigned_patient_id.first_name} ${room.assigned_patient_id.last_name}` : '-'}
                    </span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {editingRoom === room._id ? (
                      <>
                        <button
                          onClick={() => handleEditSubmit(room._id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="Cancel"
                        >
                          ✗
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">No rooms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first room.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomList;