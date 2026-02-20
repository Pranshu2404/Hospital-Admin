// LabTestsManagementTab.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '../common/FormElements';
import { EditIcon } from '../common/Icons';
import { 
  FaFlask, 
  FaMoneyBillWave, 
  FaToggleOn, 
  FaToggleOff, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaVial,
  FaClock,
  FaExclamationTriangle,
  FaDollarSign
} from 'react-icons/fa';
import { MdFreeCancellation } from 'react-icons/md';
import { RefreshCw, Save, Search } from 'lucide-react';

const LabTestsManagementTab = ({ hospitalData }) => {
  const [loading, setLoading] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specimenFilter, setSpecimenFilter] = useState('all');
  const [editingTest, setEditingTest] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // Fetch lab tests on component mount
  useEffect(() => {
    fetchLabTests();
  }, []);

  // Filter tests when search or filters change
  useEffect(() => {
    filterTests();
  }, [labTests, searchTerm, categoryFilter, statusFilter, specimenFilter, sortConfig]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      console.log('Fetched lab tests:', response.data);
      const tests = response.data.data || [];
      setLabTests(tests);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      toast.error('Failed to load lab tests');
      setLabTests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...labTests];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(test => 
        test.code?.toLowerCase().includes(term) ||
        test.name?.toLowerCase().includes(term) ||
        test.description?.toLowerCase().includes(term) ||
        test.category?.toLowerCase().includes(term) ||
        test.specimen_type?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(test => test.category === categoryFilter);
    }

    // Apply specimen type filter
    if (specimenFilter !== 'all') {
      filtered = filtered.filter(test => test.specimen_type === specimenFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(test => test.is_active === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(test => test.is_active === false);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'base_price' || sortConfig.key === 'usage_count' || sortConfig.key === 'turnaround_time_hours') {
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

    setFilteredTests(filtered);
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

  const handleEdit = (test) => {
    setEditingTest({ ...test });
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
  };

  const handleSave = async () => {
    if (!editingTest) return;

    try {
      setLoading(true);
      
      // Update lab test
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/labtests/${editingTest._id}`,
        {
          base_price: Number(editingTest.base_price) || 0,
          is_active: editingTest.is_active,
          turnaround_time_hours: Number(editingTest.turnaround_time_hours) || 24,
          fasting_required: editingTest.fasting_required,
          specimen_type: editingTest.specimen_type
        }
      );

      if (response.data.success) {
        toast.success('Lab test updated successfully');
        
        // Update local state
        setLabTests(prev => prev.map(test => 
          test._id === editingTest._id ? response.data.data : test
        ));
        
        setEditingTest(null);
      }
    } catch (error) {
      console.error('Error updating lab test:', error);
      toast.error('Failed to update lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (test) => {
    setEditingTest({
      ...test,
      is_active: !test.is_active
    });
  };

  const handleToggleFasting = (test) => {
    setEditingTest({
      ...test,
      fasting_required: !test.fasting_required
    });
  };

  const handleInputChange = (field, value) => {
    if (!editingTest) return;
    
    setEditingTest(prev => ({
      ...prev,
      [field]: field === 'base_price' || field === 'turnaround_time_hours' ? Number(value) || 0 : value
    }));
  };

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(labTests.map(t => t.category).filter(Boolean))];
  
  // Get unique specimen types for filter dropdown
  const specimenTypes = ['all', ...new Set(labTests.map(t => t.specimen_type).filter(Boolean))];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Lab Tests Management</h3>
          <p className="text-sm text-gray-500">
            Manage laboratory test pricing, turnaround time, and activation status
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fetchLabTests}>
            <RefreshCw className="mr-2" size={16} /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by code, name, category..."
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

          {/* Specimen Type Filter */}
          <select
            value={specimenFilter}
            onChange={(e) => setSpecimenFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Specimen Types</option>
            {specimenTypes.filter(type => type !== 'all').map(type => (
              <option key={type} value={type}>{type}</option>
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
        </div>

        {/* Stats Row */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredTests.length} of {labTests.length} lab tests
        </div>
      </div>

      {/* Loading State */}
      {loading && labTests.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading lab tests...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FaFlask className="text-5xl text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Lab Tests Found</h4>
          <p className="text-gray-500">No lab tests match your search criteria</p>
        </div>
      ) : (
        /* Lab Tests Table */
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
                      Test Name
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specimen
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('base_price')}
                  >
                    <div className="flex items-center">
                      Price (₹)
                      <span className="ml-2">{getSortIcon('base_price')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fasting
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
                {filteredTests.map((test) => (
                  <tr key={test._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {test.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{test.name}</div>
                      {test.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {test.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {test.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-wrap">
                      <div className="flex items-center">
                        <FaVial className="text-purple-500 mr-2" />
                        <span className="text-sm text-gray-600">{test.specimen_type || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTest && editingTest._id === test._id ? (
                        <div className="flex items-center">
                          <span className="mr-1 text-gray-600">₹</span>
                          <input
                            type="number"
                            value={editingTest.base_price}
                            onChange={(e) => handleInputChange('base_price', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <FaMoneyBillWave className="text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(test.base_price)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTest && editingTest._id === test._id ? (
                        <button
                          onClick={() => handleToggleFasting(test)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            editingTest.fasting_required
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {editingTest.fasting_required ? (
                            <>Fasting</>
                          ) : (
                            <>Non-Fasting</>
                          )}
                        </button>
                      ) : (
                        test.fasting_required ? (
                          <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            <FaExclamationTriangle className="mr-1" size={10} />
                            Fasting
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">No</span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingTest && editingTest._id === test._id ? (
                        <button
                          onClick={() => handleToggleStatus(test)}
                          className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            editingTest.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {editingTest.is_active ? (
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
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          test.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {test.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingTest && editingTest._id === test._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md bg-green-50 hover:bg-green-100 disabled:opacity-50 flex items-center"
                          >
                            <Save className="mr-1" size={14} /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md bg-red-50 hover:bg-red-100 flex items-center"
                          >
                            <MdFreeCancellation className="mr-1" size={14} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-teal-600 hover:text-teal-900 px-3 py-1 rounded-md bg-teal-50 hover:bg-teal-100 flex items-center"
                        >
                          <EditIcon className="mr-1" /> Edit
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
          <div className="text-sm text-gray-500">Total Tests</div>
          <div className="text-2xl font-bold text-gray-900">{labTests.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Active Tests</div>
          <div className="text-2xl font-bold text-green-600">
            {labTests.filter(t => t.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Base Value</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(labTests.reduce((sum, t) => sum + (t.base_price || 0), 0))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Categories</div>
          <div className="text-2xl font-bold text-purple-600">
            {new Set(labTests.map(t => t.category).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Instructions</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Click "Edit" to modify a lab test's price, turnaround time, or status</li>
          <li>• Toggle fasting requirement during edit mode</li>
          <li>• Inactive tests won't appear in search results for prescriptions</li>
          <li>• Base price is used for billing calculations and revenue estimates</li>
          <li>• Turnaround Time (TAT) is in hours and used for scheduling</li>
          <li>• Use filters to find specific tests by category, specimen type, or status</li>
          <li>• Click on column headers to sort the table</li>
        </ul>
      </div>
    </div>
  );
};

export default LabTestsManagementTab;