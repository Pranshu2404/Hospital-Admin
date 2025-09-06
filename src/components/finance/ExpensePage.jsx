import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter,
  FaDownload,
  FaPlus,
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaUserMd,
  FaBox,
  FaTools,
  FaBolt,
  FaUser,
  FaFileInvoice,
  FaShoppingCart,
  FaReceipt,
  FaFileMedical
} from 'react-icons/fa';

const ExpensePage = () => {
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'purchase-orders', 'salaries'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    period: 'monthly',
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: 'all',
    status: 'all'
  });
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [purchaseOrderSummary, setPurchaseOrderSummary] = useState(null);
  const [salarySummary, setSalarySummary] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters.period, filters.category, filters.status, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'expenses') {
        await fetchExpenseData();
        await fetchExpenseSummary();
      } else if (activeTab === 'purchase-orders') {
        await fetchPurchaseOrders();
        await fetchPurchaseOrderSummary();
      } else if (activeTab === 'salaries') {
        await fetchSalaryData();
        await fetchSalarySummary();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseData = async () => {
    try {
      let endpoint = '';
      let params = {
        category: filters.category !== 'all' ? filters.category : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      switch (filters.period) {
        case 'daily':
          endpoint = '/api/expenses/daily';
          params.date = filters.date;
          break;
        case 'monthly':
          endpoint = '/api/expenses/monthly';
          params.year = filters.year;
          params.month = filters.month;
          break;
        default:
          endpoint = '/api/expenses';
      }

      const response = await apiClient.get(endpoint, { params });
      
      // Transform the API response to match our UI structure
      if (filters.period === 'daily') {
        setExpenseRecords(transformDailyData(response.data));
      } else if (filters.period === 'monthly') {
        setExpenseRecords(transformMonthlyData(response.data));
      } else {
        setExpenseRecords(transformGeneralData(response.data));
      }
    } catch (err) {
      console.error('Error fetching expense data:', err);
      // Mock data for demonstration
      setExpenseRecords([
        {
          id: 1,
          date: '2024-01-15',
          category: 'Medical Equipment',
          vendor: 'MedTech Solutions',
          description: 'X-Ray Machine Maintenance',
          amount: 2500.00,
          approvedBy: 'Dr. Sarah Wilson',
          department: 'Radiology',
          status: 'Paid',
          paymentMethod: 'Bank Transfer',
          receiptNo: 'RCP-001'
        },
        {
          id: 2,
          date: '2024-01-14',
          category: 'Medical Supplies',
          vendor: 'HealthCare Supplies Inc.',
          description: 'Surgical instruments and consumables',
          amount: 1200.00,
          approvedBy: 'Dr. Michael Chen',
          department: 'Surgery',
          status: 'Paid',
          paymentMethod: 'Credit Card',
          receiptNo: 'RCP-002'
        }
      ]);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const { status, page = 1, limit = 50 } = filters;
      
      const params = {};
      if (status && status !== 'all') params.status = status;
      
      const response = await apiClient.get('/api/orders/purchase', { params });
      setPurchaseOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      // Mock data for demonstration
      setPurchaseOrders([
        {
          _id: '1',
          order_number: 'PO-001',
          order_date: '2024-01-15',
          supplier_id: { name: 'MedSupply Co.' },
          items: [
            { medicine_id: { name: 'Paracetamol' }, quantity: 100, unit_cost: 5.00 }
          ],
          total_amount: 500.00,
          status: 'Received',
          expected_delivery: '2024-01-20',
          notes: 'Urgent order'
        },
        {
          _id: '2',
          order_number: 'PO-002',
          order_date: '2024-01-10',
          supplier_id: { name: 'PharmaDistributors' },
          items: [
            { medicine_id: { name: 'Amoxicillin' }, quantity: 50, unit_cost: 8.00 }
          ],
          total_amount: 400.00,
          status: 'Pending',
          expected_delivery: '2024-01-25',
          notes: 'Regular supply'
        }
      ]);
    }
  };

  const fetchSalaryData = async () => {
    try {
      const { status, periodType, page = 1, limit = 50 } = filters;
      
      const params = {};
      if (status && status !== 'all') params.status = status;
      if (periodType && periodType !== 'all') params.periodType = periodType;
      
      const response = await apiClient.get('/api/salaries', { params });
      setSalaryRecords(response.data.salaries || []);
    } catch (err) {
      console.error('Error fetching salary data:', err);
      // Mock data for demonstration
      setSalaryRecords([
        {
          _id: '1',
          doctor_id: { first_name: 'John', last_name: 'Doe' },
          period_type: 'monthly',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          amount: 5000.00,
          net_amount: 5000.00,
          status: 'Paid',
          payment_method: 'Bank Transfer',
          paid_date: '2024-02-05',
          appointment_count: 25
        },
        {
          _id: '2',
          doctor_id: { first_name: 'Jane', last_name: 'Smith' },
          period_type: 'monthly',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
          amount: 4500.00,
          net_amount: 4500.00,
          status: 'Pending',
          payment_method: null,
          paid_date: null,
          appointment_count: 20
        }
      ]);
    }
  };

  const fetchExpenseSummary = async () => {
    try {
      const response = await apiClient.get('/api/expenses/summary', {
        params: {
          period: filters.period,
          ...(filters.period === 'monthly' && { 
            year: filters.year,
            month: filters.month 
          }),
          ...(filters.period === 'daily' && { date: filters.date })
        }
      });
      setExpenseSummary(response.data);
    } catch (err) {
      console.error('Error fetching expense summary:', err);
    }
  };

  const fetchPurchaseOrderSummary = async () => {
    try {
      const response = await apiClient.get('/api/orders/purchase/stats');
      setPurchaseOrderSummary(response.data);
    } catch (err) {
      console.error('Error fetching purchase order summary:', err);
      // Mock data
      setPurchaseOrderSummary({
        totalOrders: 15,
        totalAmount: 12500.00,
        averageOrderValue: 833.33,
        statusBreakdown: [
          { status: 'Pending', count: 5, amount: 3500.00 },
          { status: 'Received', count: 8, amount: 7500.00 },
          { status: 'Cancelled', count: 2, amount: 1500.00 }
        ]
      });
    }
  };

  const fetchSalarySummary = async () => {
    try {
      const response = await apiClient.get('/api/salaries/stats');
      setSalarySummary(response.data);
    } catch (err) {
      console.error('Error fetching salary summary:', err);
      // Mock data
      setSalarySummary({
        byStatus: [
          { _id: 'Paid', count: 12, totalAmount: 48000.00 },
          { _id: 'Pending', count: 5, totalAmount: 22500.00 }
        ],
        overall: {
          totalRecords: 17,
          totalAmount: 70500.00,
          averageSalary: 4147.06
        }
      });
    }
  };

  const transformDailyData = (data) => {
    return data.map(item => ({
      id: item._id,
      date: new Date(item.date).toISOString().split('T')[0],
      category: item.category,
      vendor: item.vendor,
      description: item.description,
      amount: item.amount,
      approvedBy: item.approvedBy,
      department: item.department,
      status: item.status,
      paymentMethod: item.paymentMethod,
      receiptNo: item.receiptNo
    }));
  };

  const transformMonthlyData = (data) => {
    return data.map(item => ({
      id: item._id,
      date: new Date(item.date).toISOString().split('T')[0],
      category: item.category,
      vendor: item.vendor,
      description: item.description,
      amount: item.amount,
      approvedBy: item.approvedBy,
      department: item.department,
      status: item.status,
      paymentMethod: item.paymentMethod,
      receiptNo: item.receiptNo
    }));
  };

  const transformGeneralData = (data) => {
    return data.map(item => ({
      id: item._id,
      date: new Date(item.date).toISOString().split('T')[0],
      category: item.category,
      vendor: item.vendor,
      description: item.description,
      amount: item.amount,
      approvedBy: item.approvedBy,
      department: item.department,
      status: item.status,
      paymentMethod: item.paymentMethod,
      receiptNo: item.receiptNo
    }));
  };

  const filteredExpenseRecords = expenseRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filters.category === 'all' || record.category === filters.category;
    const matchesStatus = filters.status === 'all' || record.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredPurchaseOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.supplier_id && order.supplier_id.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const filteredSalaryRecords = salaryRecords.filter(salary => {
    const doctorName = salary.doctor_id ? 
      `${salary.doctor_id.first_name || ''} ${salary.doctor_id.last_name || ''}`.toLowerCase() : '';
    
    const matchesSearch = doctorName.includes(searchTerm.toLowerCase()) ||
                         salary.period_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (salary.notes && salary.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filters.status === 'all' || salary.status === filters.status;
    const matchesPeriod = !filters.periodType || filters.periodType === 'all' || salary.period_type === filters.periodType;
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const totalExpenses = filteredExpenseRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidExpenses = filteredExpenseRecords
    .filter(record => record.status === 'Paid')
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingExpenses = filteredExpenseRecords
    .filter(record => record.status === 'Pending')
    .reduce((sum, record) => sum + record.amount, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Received': 'bg-green-100 text-green-800',
      'Partially Received': 'bg-blue-100 text-blue-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Medical Equipment': FaTools,
      'Medical Supplies': FaBox,
      'Utilities': FaBolt,
      'Staff Salaries': FaUser,
      'Pharmaceuticals': FaFileMedical,
      'Maintenance': FaTools,
      'Insurance': FaFileInvoice,
      'Rent': FaFileInvoice,
      'Other': FaMoneyBillWave
    };
    
    const IconComponent = icons[category] || FaMoneyBillWave;
    return <IconComponent className="text-teal-600" />;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'expenses') {
      csvContent += "Date,Category,Vendor,Description,Amount,Status,Payment Method,Approved By,Department,Receipt No\n";
      
      filteredExpenseRecords.forEach(record => {
        csvContent += `${record.date},${record.category},${record.vendor},${record.description},${record.amount},${record.status},${record.paymentMethod},${record.approvedBy},${record.department},${record.receiptNo}\n`;
      });
    } else if (activeTab === 'purchase-orders') {
      csvContent += "Order Number,Order Date,Supplier,Total Amount,Status,Expected Delivery,Notes\n";
      
      filteredPurchaseOrders.forEach(order => {
        csvContent += `${order.order_number},${order.order_date},${order.supplier_id?.name || 'N/A'},${order.total_amount},${order.status},${order.expected_delivery || 'N/A'},${order.notes || ''}\n`;
      });
    } else if (activeTab === 'salaries') {
      csvContent += "Doctor,Period Type,Period Start,Period End,Amount,Net Amount,Status,Payment Method,Appointments\n";
      
      filteredSalaryRecords.forEach(salary => {
        const doctorName = salary.doctor_id ? 
          `${salary.doctor_id.first_name || ''} ${salary.doctor_id.last_name || ''}` : 'N/A';
        csvContent += `${doctorName},${salary.period_type},${salary.period_start},${salary.period_end},${salary.amount},${salary.net_amount},${salary.status},${salary.payment_method || 'N/A'},${salary.appointment_count || 0}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const categories = [
    'Medical Equipment',
    'Medical Supplies',
    'Utilities',
    'Staff Salaries',
    'Pharmaceuticals',
    'Maintenance',
    'Insurance',
    'Rent',
    'Other'
  ];

  const purchaseOrderStatuses = ['Pending', 'Approved', 'Partially Received', 'Received', 'Cancelled'];
  const salaryStatuses = ['Pending', 'Paid', 'Cancelled'];
  const periodTypes = ['daily', 'weekly', 'monthly'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMoneyBillWave className="text-teal-600" />
            Hospital Expense Management
          </h1>
          <p className="text-gray-600">Track and manage all hospital expenses, purchase orders, and salaries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaDownload /> Export Report
          </button>
          {activeTab === 'expenses' && (
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <FaPlus /> Add Expense
            </button>
          )}
          {activeTab === 'purchase-orders' && (
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <FaPlus /> Create Purchase Order
            </button>
          )}
          {activeTab === 'salaries' && (
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <FaPlus /> Process Salaries
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'expenses' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('expenses')}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Expenses
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'purchase-orders' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('purchase-orders')}
          >
            <FaShoppingCart className="inline mr-2" />
            Purchase Orders
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'salaries' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('salaries')}
          >
            <FaUser className="inline mr-2" />
            Salaries
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total {activeTab === 'salaries' ? 'Salaries' : 'Expenses'}</p>
              <p className="text-2xl font-bold text-gray-800">
                {activeTab === 'expenses' && formatCurrency(expenseSummary?.totalExpenses || totalExpenses)}
                {activeTab === 'purchase-orders' && formatCurrency(purchaseOrderSummary?.totalAmount || 0)}
                {activeTab === 'salaries' && formatCurrency(salarySummary?.overall?.totalAmount || 0)}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid {activeTab === 'salaries' ? 'Salaries' : 'Expenses'}</p>
              <p className="text-2xl font-bold text-green-600">
                {activeTab === 'expenses' && formatCurrency(expenseSummary?.paidExpenses || paidExpenses)}
                {activeTab === 'purchase-orders' && formatCurrency(
                  purchaseOrderSummary?.statusBreakdown?.find(s => s.status === 'Received')?.amount || 0
                )}
                {activeTab === 'salaries' && formatCurrency(
                  salarySummary?.byStatus?.find(s => s._id === 'Paid')?.totalAmount || 0
                )}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending {activeTab === 'salaries' ? 'Salaries' : 'Expenses'}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {activeTab === 'expenses' && formatCurrency(expenseSummary?.pendingExpenses || pendingExpenses)}
                {activeTab === 'purchase-orders' && formatCurrency(
                  purchaseOrderSummary?.statusBreakdown?.find(s => s.status === 'Pending')?.amount || 0
                )}
                {activeTab === 'salaries' && formatCurrency(
                  salarySummary?.byStatus?.find(s => s._id === 'Pending')?.totalAmount || 0
                )}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {activeTab === 'expenses' && 'Salary Expenses'}
                {activeTab === 'purchase-orders' && 'Completed Orders'}
                {activeTab === 'salaries' && 'Total Records'}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {activeTab === 'expenses' && formatCurrency(expenseSummary?.salaryExpenses || 0)}
                {activeTab === 'purchase-orders' && (
                  purchaseOrderSummary?.statusBreakdown?.find(s => s.status === 'Received')?.count || 0
                )}
                {activeTab === 'salaries' && (salarySummary?.overall?.totalRecords || 0)}
              </p>
            </div>
            <FaUser className="text-3xl text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'expenses' ? "Search by description, vendor, or category..." :
                activeTab === 'purchase-orders' ? "Search by order number, supplier, or notes..." :
                "Search by doctor name or period..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {activeTab === 'expenses' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {filters.period === 'daily' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {filters.period === 'monthly' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={filters.month}
                      onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              {activeTab === 'expenses' && (
                <>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              )}
              {activeTab === 'purchase-orders' && (
                purchaseOrderStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))
              )}
              {activeTab === 'salaries' && (
                salaryStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))
              )}
            </select>
          </div>

          {activeTab === 'salaries' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
              <select
                value={filters.periodType || 'all'}
                onChange={(e) => handleFilterChange('periodType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Periods</option>
                {periodTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === 'expenses' && 'Expense Records'}
            {activeTab === 'purchase-orders' && 'Purchase Orders'}
            {activeTab === 'salaries' && 'Salary Records'}
          </h3>
        </div>
        
        {activeTab === 'expenses' && (
          <ExpenseTable 
            records={filteredExpenseRecords} 
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
            getCategoryIcon={getCategoryIcon}
          />
        )}
        
        {activeTab === 'purchase-orders' && (
          <PurchaseOrderTable 
            orders={filteredPurchaseOrders} 
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        )}
        
        {activeTab === 'salaries' && (
          <SalaryTable 
            salaries={filteredSalaryRecords} 
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        )}
      </div>

      {/* Summary Sections */}
      {activeTab === 'expenses' && expenseSummary && (
        <ExpenseSummary expenseSummary={expenseSummary} formatCurrency={formatCurrency} />
      )}
      
      {activeTab === 'purchase-orders' && purchaseOrderSummary && (
        <PurchaseOrderSummary 
          purchaseOrderSummary={purchaseOrderSummary} 
          formatCurrency={formatCurrency} 
        />
      )}
      
      {activeTab === 'salaries' && salarySummary && (
        <SalarySummary 
          salarySummary={salarySummary} 
          formatCurrency={formatCurrency} 
        />
      )}
    </div>
  );
};

// Expense Table Component
const ExpenseTable = ({ records, formatCurrency, getStatusBadge, getCategoryIcon }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{record.date}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                {getCategoryIcon(record.category)}
                <span className="text-sm text-gray-900">{record.category}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">{record.description}</div>
              <div className="text-sm text-gray-500">{record.department}</div>
              {record.receiptNo && (
                <div className="text-xs text-gray-400">Receipt: {record.receiptNo}</div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{record.vendor}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-bold text-gray-900">
                {formatCurrency(record.amount)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{record.approvedBy}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(record.status)}>
                {record.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button className="text-teal-600 hover:text-teal-900 text-sm">
                  <FaEye className="inline mr-1" />
                  View
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm">
                  <FaEdit className="inline mr-1" />
                  Edit
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {records.length === 0 && (
      <div className="text-center py-12">
        <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No expense records found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search criteria or filters.
        </p>
      </div>
    )}
  </div>
);

// Purchase Order Table Component
const PurchaseOrderTable = ({ orders, formatCurrency, getStatusBadge }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {orders.map((order) => (
          <tr key={order._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{order.supplier_id?.name || 'N/A'}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{new Date(order.order_date).toLocaleDateString()}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-bold text-gray-900">
                {formatCurrency(order.total_amount)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(order.status)}>
                {order.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button className="text-teal-600 hover:text-teal-900 text-sm">
                  <FaEye className="inline mr-1" />
                  View
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm">
                  <FaEdit className="inline mr-1" />
                  Edit
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {orders.length === 0 && (
      <div className="text-center py-12">
        <FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No purchase orders found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search criteria or filters.
        </p>
      </div>
    )}
  </div>
);

// Salary Table Component
const SalaryTable = ({ salaries, formatCurrency, getStatusBadge }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {salaries.map((salary) => (
          <tr key={salary._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {salary.doctor_id ? `${salary.doctor_id.first_name} ${salary.doctor_id.last_name}` : 'N/A'}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900 capitalize">
                {salary.period_type}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(salary.period_start).toLocaleDateString()} to {new Date(salary.period_end).toLocaleDateString()}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-bold text-gray-900">
                {formatCurrency(salary.net_amount)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{salary.appointment_count || 0}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(salary.status)}>
                {salary.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button className="text-teal-600 hover:text-teal-900 text-sm">
                  <FaEye className="inline mr-1" />
                  View
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm">
                  <FaEdit className="inline mr-1" />
                  Edit
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {salaries.length === 0 && (
      <div className="text-center py-12">
        <FaUser className="text-4xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No salary records found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search criteria or filters.
        </p>
      </div>
    )}
  </div>
);

// Expense Summary Component
const ExpenseSummary = ({ expenseSummary, formatCurrency }) => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Expense Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Expenses:</span>
            <span className="font-medium text-red-600">
              {formatCurrency(expenseSummary.totalExpenses || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paid Expenses:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(expenseSummary.paidExpenses || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Expenses:</span>
            <span className="font-medium text-yellow-600">
              {formatCurrency(expenseSummary.pendingExpenses || 0)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Net Expenses:</span>
            <span className="font-bold text-red-600">
              {formatCurrency(expenseSummary.totalExpenses || 0)}
            </span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Salary Expenses:</span>
            <span className="font-medium">
              {formatCurrency(expenseSummary.salaryExpenses || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Medical Supplies:</span>
            <span className="font-medium">
              {formatCurrency(expenseSummary.medicalSupplies || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Utilities:</span>
            <span className="font-medium">
              {formatCurrency(expenseSummary.utilities || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Other Expenses:</span>
            <span className="font-medium">
              {formatCurrency(expenseSummary.otherExpenses || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Purchase Order Summary Component
const PurchaseOrderSummary = ({ purchaseOrderSummary, formatCurrency }) => {
  const getStatusAmount = (status) => {
    return purchaseOrderSummary.statusBreakdown?.find(s => s.status === status)?.amount || 0;
  };
  const getStatusCount = (status) => {
    return purchaseOrderSummary.statusBreakdown?.find(s => s.status === status)?.count || 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Order Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Order Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders:</span>
              <span className="font-medium text-gray-900">
                {purchaseOrderSummary.totalOrders || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(purchaseOrderSummary.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Order Value:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(purchaseOrderSummary.averageOrderValue || 0)}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Status Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Received Orders:</span>
              <span className="font-medium text-green-600">
                {getStatusCount('Received')} ({formatCurrency(getStatusAmount('Received'))})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Orders:</span>
              <span className="font-medium text-yellow-600">
                {getStatusCount('Pending')} ({formatCurrency(getStatusAmount('Pending'))})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cancelled Orders:</span>
              <span className="font-medium text-red-600">
                {getStatusCount('Cancelled')} ({formatCurrency(getStatusAmount('Cancelled'))})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Salary Summary Component
const SalarySummary = ({ salarySummary, formatCurrency }) => {
  const getStatusAmount = (status) => {
    return salarySummary.byStatus?.find(s => s._id === status)?.totalAmount || 0;
  };
  const getStatusCount = (status) => {
    return salarySummary.byStatus?.find(s => s._id === status)?.count || 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Overall Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Salary Records:</span>
              <span className="font-medium text-gray-900">
                {salarySummary.overall?.totalRecords || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount Paid/Pending:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(salarySummary.overall?.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Salary Amount:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(salarySummary.overall?.averageSalary || 0)}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Status Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Paid Salaries:</span>
              <span className="font-medium text-green-600">
                {getStatusCount('Paid')} ({formatCurrency(getStatusAmount('Paid'))})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Salaries:</span>
              <span className="font-medium text-yellow-600">
                {getStatusCount('Pending')} ({formatCurrency(getStatusAmount('Pending'))})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensePage;