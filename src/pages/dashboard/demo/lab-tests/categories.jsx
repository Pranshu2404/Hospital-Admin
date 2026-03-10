// pages/dashboard/admin/lab-tests/categories.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../../components/Layout';
import { adminSidebar } from '../../../../constants/sidebarItems/adminSidebar';
import {
  FaFlask,
  FaHeartbeat,
  FaDna,
  FaMicroscope,
  FaStethoscope,
  FaThermometerHalf,
  FaEye,
  FaChartPie,
  FaArrowLeft,
  FaCalendarAlt,
  FaDollarSign,
  FaVial
} from 'react-icons/fa';

// Category icons mapping
const categoryIcons = {
  'Hematology': <FaHeartbeat className="text-red-500 text-2xl" />,
  'Biochemistry': <FaDna className="text-green-500 text-2xl" />,
  'Microbiology': <FaMicroscope className="text-purple-500 text-2xl" />,
  'Immunology': <FaFlask className="text-blue-500 text-2xl" />,
  'Pathology': <FaStethoscope className="text-amber-500 text-2xl" />,
  'Radiology': <FaEye className="text-indigo-500 text-2xl" />,
  'Endocrinology': <FaThermometerHalf className="text-orange-500 text-2xl" />,
  'Cardiology': <FaHeartbeat className="text-pink-500 text-2xl" />,
  'Other': <FaFlask className="text-gray-500 text-2xl" />
};

// Category colors for charts
const categoryColors = {
  'Hematology': 'bg-red-50 border-red-200',
  'Biochemistry': 'bg-green-50 border-green-200',
  'Microbiology': 'bg-purple-50 border-purple-200',
  'Immunology': 'bg-blue-50 border-blue-200',
  'Pathology': 'bg-amber-50 border-amber-200',
  'Radiology': 'bg-indigo-50 border-indigo-200',
  'Endocrinology': 'bg-orange-50 border-orange-200',
  'Cardiology': 'bg-pink-50 border-pink-200',
  'Other': 'bg-gray-50 border-gray-200'
};

const LabTestCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryTests, setCategoryTests] = useState([]);

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      const tests = response.data.data || [];

      // Group by category
      const categoryMap = {};
      tests.forEach(test => {
        const cat = test.category || 'Other';
        if (!categoryMap[cat]) {
          categoryMap[cat] = {
            name: cat,
            count: 0,
            activeCount: 0,
            totalRevenue: 0,
            tests: [],
            avgPrice: 0,
            usageCount: 0
          };
        }
        categoryMap[cat].count++;
        if (test.is_active) categoryMap[cat].activeCount++;
        categoryMap[cat].totalRevenue += (test.base_price || 0) * (test.usage_count || 0);
        categoryMap[cat].usageCount += (test.usage_count || 0);
        categoryMap[cat].tests.push({
          id: test._id,
          code: test.code,
          name: test.name,
          price: test.base_price,
          usage: test.usage_count,
          is_active: test.is_active
        });
      });

      // Calculate averages
      Object.values(categoryMap).forEach(cat => {
        cat.avgPrice = cat.count > 0 ? cat.tests.reduce((sum, t) => sum + (t.price || 0), 0) / cat.count : 0;
      });

      const sortedCategories = Object.values(categoryMap).sort((a, b) => b.count - a.count);
      setCategories(sortedCategories);

      if (sortedCategories.length > 0) {
        setSelectedCategory(sortedCategories[0].name);
        setCategoryTests(sortedCategories[0].tests);
      }
    } catch (error) {
      console.error('Error fetching category stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setCategoryTests(category.tests);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <Layout sidebarItems={adminSidebar} section="Admin">
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard/admin/lab-tests')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FaChartPie className="text-emerald-600" />
              Lab Test Categories
            </h1>
            <p className="text-slate-500 mt-1">Overview of tests by category</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories List */}
            <div className="lg:col-span-1 space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedCategory === cat.name
                    ? `${categoryColors[cat.name]} border-emerald-500 shadow-md`
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {categoryIcons[cat.name] || <FaFlask className="text-slate-400 text-2xl" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-slate-600">{cat.count} tests</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-emerald-600">{cat.activeCount} active</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{cat.usageCount}</div>
                      <div className="text-xs text-slate-500">Total Tests Conducted</div>
                    </div>
                  </div>
                </button>
              ))}

              {categories.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
                  <FaFlask className="mx-auto text-4xl text-slate-300 mb-3" />
                  <p className="text-slate-500">No categories found</p>
                </div>
              )}
            </div>

            {/* Category Details */}
            <div className="lg:col-span-2">
              {selectedCategory && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Category Header */}
                  <div className={`p-6 border-b border-slate-200 ${categoryColors[selectedCategory]}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {categoryIcons[selectedCategory] || <FaFlask className="text-4xl text-slate-500" />}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedCategory}</h2>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-slate-600">Total Tests</p>
                            <p className="text-xl font-bold text-slate-900">
                              {categories.find(c => c.name === selectedCategory)?.count || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Total Uses</p>
                            <p className="text-xl font-bold text-slate-900">
                              {categories.find(c => c.name === selectedCategory)?.usageCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Active Tests</p>
                            <p className="text-xl font-bold text-slate-900">
                              {categories.find(c => c.name === selectedCategory)?.activeCount || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tests List */}
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Tests in this Category</h3>

                    {categoryTests.length > 0 ? (
                      <div className="space-y-3">
                        {categoryTests.map((test) => (
                          <div
                            key={test.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  {test.code}
                                </span>
                                <span className="font-medium text-slate-900">{test.name}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="text-slate-600">Uses: {test.usage || 0}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className={`px-2 py-0.5 rounded text-xs ${test.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                  {test.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900">{formatCurrency(test.price)}</div>
                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/admin/lab-tests/${test.id}`);
                                }}
                                className="text-sm text-emerald-600 hover:underline"
                              >
                                View Details
                              </button> */}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No tests found in this category
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LabTestCategories;