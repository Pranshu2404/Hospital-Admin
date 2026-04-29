import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaXRay,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTags,
  FaBrain,
  FaHeartbeat,
  FaBaby,
  FaFemale,
  FaProcedures,
  FaTachometerAlt,
  FaMicroscope
} from 'react-icons/fa';

// Category icons mapping
const categoryIcons = {
  'X-Ray': <FaProcedures className="text-blue-500" />,
  'CT Scan': <FaBrain className="text-purple-500" />,
  'MRI': <FaBrain className="text-indigo-500" />,
  'Ultrasound': <FaBaby className="text-pink-500" />,
  'ECG': <FaHeartbeat className="text-red-500" />,
  'Echocardiography': <FaHeartbeat className="text-rose-500" />,
  'Mammography': <FaFemale className="text-pink-600" />,
  'PET Scan': <FaTachometerAlt className="text-cyan-500" />,
  'DEXA Scan': <FaMicroscope className="text-teal-500" />,
  'Fluoroscopy': <FaProcedures className="text-orange-500" />,
  'Angiography': <FaHeartbeat className="text-red-600" />,
  'Other': <FaXRay className="text-gray-500" />
};

// Predefined categories
const predefinedCategories = [
  'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG',
  'Echocardiography', 'Mammography', 'PET Scan', 'DEXA Scan',
  'Fluoroscopy', 'Angiography', 'Other'
];

const ImagingTestCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [addModal, setAddModal] = useState({ show: false, name: '', description: '' });
  const [editModal, setEditModal] = useState({ show: false, id: null, name: '', description: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Fetch all imaging tests to extract unique categories
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/radiology/tests?limit=1000`);
      const tests = response.data.data || [];
      
      // Extract unique categories with counts
      const categoryMap = new Map();
      tests.forEach(test => {
        const cat = test.category || 'Other';
        if (categoryMap.has(cat)) {
          categoryMap.set(cat, {
            name: cat,
            count: categoryMap.get(cat).count + 1,
            tests: [...categoryMap.get(cat).tests, test]
          });
        } else {
          categoryMap.set(cat, {
            name: cat,
            count: 1,
            tests: [test]
          });
        }
      });
      
      // Also include predefined categories that might not have tests yet
      predefinedCategories.forEach(cat => {
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, {
            name: cat,
            count: 0,
            tests: []
          });
        }
      });
      
      setCategories(Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!addModal.name.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Since categories are derived from tests, we can't add a category without a test
      // Instead, we'll navigate to add test page with category pre-filled
      navigate('/dashboard/admin/imaging-tests/add', { 
        state: { prefillCategory: addModal.name.trim() }
      });
      setAddModal({ show: false, name: '', description: '' });
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorMessage('Failed to add category. Please add a test with this category instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editModal.name.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Update all tests with this category to the new name
      const categoryData = categories.find(c => c.name === editModal.name);
      if (categoryData && categoryData.tests.length > 0) {
        for (const test of categoryData.tests) {
          await axios.put(`${import.meta.env.VITE_BACKEND_URL}/radiology/tests/${test._id}`, {
            ...test,
            category: editModal.name.trim()
          });
        }
      }
      
      setSuccessMessage(`Category "${editModal.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditModal({ show: false, id: null, name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorMessage('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsSubmitting(true);
    
    try {
      const categoryData = categories.find(c => c.name === deleteModal.name);
      if (categoryData && categoryData.tests.length > 0) {
        // Move all tests to 'Other' category
        for (const test of categoryData.tests) {
          await axios.put(`${import.meta.env.VITE_BACKEND_URL}/radiology/tests/${test._id}`, {
            ...test,
            category: 'Other'
          });
        }
      }
      
      setSuccessMessage(`Category "${deleteModal.name}" deleted and tests moved to "Other"`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage('Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryCount = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName);
    return cat ? cat.count : 0;
  };

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaTags className="text-emerald-600" />
              Imaging Test Categories
            </h1>
            <p className="text-slate-500 mt-1">Manage radiology and imaging test categories</p>
          </div>
          
          <button
            onClick={() => setAddModal({ show: true, name: '', description: '' })}
            className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <FaPlus /> Add Category
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <FaCheckCircle className="text-green-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FaTags className="mx-auto text-5xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Categories Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchTerm ? 'No categories match your search.' : 'Get started by adding your first imaging test category.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setAddModal({ show: true, name: '', description: '' })}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2"
              >
                <FaPlus /> Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      {categoryIcons[category.name] || <FaXRay size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{category.name}</h3>
                      <p className="text-xs text-slate-500">{category.count} test(s)</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate('/dashboard/admin/imaging-tests/add', { 
                      state: { prefillCategory: category.name }
                    })}
                    className="flex-1 px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <FaPlus size={12} /> Add Test
                  </button>
                  <button
                    onClick={() => setEditModal({ show: true, id: category.name, name: category.name, description: '' })}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <FaEdit size={14} />
                  </button>
                  {category.name !== 'Other' && (
                    <button
                      onClick={() => setDeleteModal({ show: true, id: category.name, name: category.name })}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Category Modal */}
        {addModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Add New Category</h2>
                <button onClick={() => setAddModal({ show: false, name: '', description: '' })}>
                  <FaTimes className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addModal.name}
                    onChange={(e) => setAddModal({ ...addModal, name: e.target.value })}
                    placeholder="e.g., MRI, CT Scan, Ultrasound"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">New categories can be used when creating imaging tests</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <FaInfoCircle className="inline mr-1" />
                    After adding a category, you can create imaging tests under this category.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setAddModal({ show: false, name: '', description: '' })}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={isSubmitting || !addModal.name.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaPlus /> Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Edit Category</h2>
                <button onClick={() => setEditModal({ show: false, id: null, name: '', description: '' })}>
                  <FaTimes className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editModal.name}
                    onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <FaExclamationTriangle className="inline mr-1" />
                    Changing the category name will update all imaging tests in this category.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setEditModal({ show: false, id: null, name: '', description: '' })}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCategory}
                  disabled={isSubmitting || !editModal.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaSave /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Category Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Category?</h3>
                <p className="text-slate-600 mb-4">
                  Are you sure you want to delete the category "<span className="font-semibold">{deleteModal.name}</span>"?
                </p>
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                  All tests in this category will be moved to "Other" category.
                </p>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImagingTestCategories;