import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '../common/FormElements';
import { EditIcon } from '../common/Icons';
import { FaProcedures, FaMoneyBillWave, FaToggleOn, FaToggleOff, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { MdFreeCancellation } from 'react-icons/md';
import { RefreshCw, Save, Search } from 'lucide-react';

const ProcedureManagementTab = ({ hospitalData }) => {
  const [loading, setLoading] = useState(false);
  const [procedures, setProcedures] = useState([]);
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // Fetch procedures on component mount
  useEffect(() => {
    fetchProcedures();
  }, []);

  // Filter procedures when search or filters change
  useEffect(() => {
    filterProcedures();
  }, [procedures, searchTerm, categoryFilter, statusFilter, sortConfig]);

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/procedures`);
      
      if (response.data.success) {
        setProcedures(response.data.data || []);
      } else {
        setProcedures([]);
      }
    } catch (error) {
      console.error('Error fetching procedures:', error);
      toast.error('Failed to load procedures');
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProcedures = () => {
    let filtered = [...procedures];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(procedure => 
        procedure.code?.toLowerCase().includes(term) ||
        procedure.name?.toLowerCase().includes(term) ||
        procedure.description?.toLowerCase().includes(term) ||
        procedure.category?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(procedure => procedure.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(procedure => procedure.is_active === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(procedure => procedure.is_active === false);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'base_price') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProcedures(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-teal-600" /> : 
      <FaSortDown className="text-teal-600" />;
  };

  const handleEdit = (procedure) => {
    setEditingProcedure({ ...procedure });
  };

  const handleCancelEdit = () => {
    setEditingProcedure(null);
  };

  const handleSave = async () => {
    if (!editingProcedure) return;

    try {
      setLoading(true);
      
      // Update procedure
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/procedures/${editingProcedure._id}`,
        {
          base_price: Number(editingProcedure.base_price) || 0,
          is_active: editingProcedure.is_active,
          last_updated_by: 'admin_user_id' // Replace with actual user ID
        }
      );

      if (response.data.success) {
        toast.success('Procedure updated successfully');
        
        // Update local state
        setProcedures(prev => prev.map(proc => 
          proc._id === editingProcedure._id ? response.data.data : proc
        ));
        
        setEditingProcedure(null);
      }
    } catch (error) {
      console.error('Error updating procedure:', error);
      toast.error('Failed to update procedure');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (procedure) => {
    setEditingProcedure({
      ...procedure,
      is_active: !procedure.is_active
    });
  };

  const handleInputChange = (field, value) => {
    if (!editingProcedure) return;
    
    setEditingProcedure(prev => ({
      ...prev,
      [field]: field === 'base_price' ? Number(value) || 0 : value
    }));
  };

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(procedures.map(p => p.category).filter(Boolean))];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Procedure Management</h3>
          <p className="text-sm text-gray-500">
            Manage procedure base prices and activation status
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fetchProcedures}>
            <RefreshCw /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search procedures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            Showing {filteredProcedures.length} of {procedures.length} procedures
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && procedures.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading procedures...</p>
        </div>
      ) : filteredProcedures.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FaProcedures className="text-5xl text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Procedures Found</h4>
          <p className="text-gray-500">No procedures match your search criteria</p>
        </div>
      ) : (
        /* Procedures Table */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Code
                      <span className="ml-2">{getSortIcon('code')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Procedure Name
                      <span className="ml-2">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      <span className="ml-2">{getSortIcon('category')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('base_price')}
                  >
                    <div className="flex items-center">
                      Base Price (₹)
                      <span className="ml-2">{getSortIcon('base_price')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProcedures.map((procedure) => (
                  <tr key={procedure._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{procedure.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{procedure.name}</div>
                      {procedure.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {procedure.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {procedure.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProcedure && editingProcedure._id === procedure._id ? (
                        <div className="flex items-center">
                          <span className="mr-1 text-gray-600">₹</span>
                          <input
                            type="number"
                            value={editingProcedure.base_price}
                            onChange={(e) => handleInputChange('base_price', e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FaMoneyBillWave className="text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            ₹{procedure.base_price || 0}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {procedure.duration_minutes || 30} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProcedure && editingProcedure._id === procedure._id ? (
                        <button
                          onClick={() => handleToggleStatus(procedure)}
                          className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${editingProcedure.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {editingProcedure.is_active ? (
                            <>
                              <FaToggleOn className="mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="mr-1" /> Inactive
                            </>
                          )}
                        </button>
                      ) : (
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${procedure.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {procedure.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingProcedure && editingProcedure._id === procedure._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md bg-green-50 hover:bg-green-100 disabled:opacity-50"
                          >
                            <Save className="inline mr-1" /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md bg-red-50 hover:bg-red-100"
                          >
                            <MdFreeCancellation className="inline mr-1" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(procedure)}
                          className="text-teal-600 hover:text-teal-900 px-3 py-1 rounded-md bg-teal-50 hover:bg-teal-100"
                        >
                          <EditIcon className="inline mr-1" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Procedures</div>
          <div className="text-2xl font-bold text-gray-900">{procedures.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Active Procedures</div>
          <div className="text-2xl font-bold text-green-600">
            {procedures.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Base Value</div>
          <div className="text-2xl font-bold text-blue-600">
            ₹{procedures.reduce((sum, p) => sum + (p.base_price || 0), 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Avg. Price</div>
          <div className="text-2xl font-bold text-purple-600">
            ₹{procedures.length > 0 ? 
              Math.round(procedures.reduce((sum, p) => sum + (p.base_price || 0), 0) / procedures.length) : 
              0}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Instructions</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Click "Edit" to modify a procedure's base price or status</li>
          <li>• Inactive procedures won't appear in search results for prescriptions</li>
          <li>• Base price is used for billing calculations</li>
          <li>• Use filters to find specific procedures by category or status</li>
          <li>• Click on column headers to sort the table</li>
        </ul>
      </div>
    </div>
  );
};

export default ProcedureManagementTab;