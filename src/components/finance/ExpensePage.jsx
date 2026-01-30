import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/apiClient';
import {
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPlus,
  FaEye,
  FaEdit,
  FaShoppingCart,
  FaUser,
  FaTools,
  FaBox,
  FaBolt,
  FaFileInvoice,
  FaFileMedical,
  FaTimes,
  FaCheckCircle
} from 'react-icons/fa';

/**
 * ✅ Updated ExpensePage
 * - Fixes salary API integration with your UPDATED backend:
 *   GET    /salaries
 *   GET    /salaries/stats
 *   GET    /salaries/pending
 *   PUT    /salaries/:id/status
 *   POST   /salaries/bulk-pay
 *   GET    /salaries/report?periodType&startDate&endDate&format=csv
 *
 * - Fixes common runtime errors:
 *   null-safe search, correct doctor fields (firstName/lastName),
 *   correct salary status casing (backend uses lowercase: paid/pending),
 *   adds pay salary modal + bulk pay for admins.
 *
 * NOTE: Expenses & Purchase Orders APIs are kept as-is (since not provided fully),
 * but now guarded so UI doesn’t crash if response shapes differ.
 */

const ExpensePage = () => {
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);

  const [expenseSummary, setExpenseSummary] = useState(null);
  const [purchaseOrderSummary, setPurchaseOrderSummary] = useState(null);
  const [salarySummary, setSalarySummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'purchase-orders' | 'salaries'
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Salary payment UI
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null); // salary record
  const [payForm, setPayForm] = useState({
    payment_method: 'bank_transfer',
    paid_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Bulk select (salaries tab)
  const [selectedSalaryIds, setSelectedSalaryIds] = useState(new Set());
  const [bulkPayOpen, setBulkPayOpen] = useState(false);
  const [bulkPayForm, setBulkPayForm] = useState({
    payment_method: 'bank_transfer',
    paid_date: new Date().toISOString().split('T')[0],
    notes: 'Bulk payment processed'
  });

  // Unified filters (kept simple; only relevant keys used per tab)
  const [filters, setFilters] = useState({
    // Expenses period filter
    period: 'monthly', // daily | monthly | all
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: 'all',

    // Shared status filter (each tab maps values)
    status: 'all',

    // Salaries
    periodType: 'all', // daily | weekly | monthly | all
    startDate: '', // for salaries report/list overlap filter
    endDate: '',
    page: 1,
    limit: 50
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== 'page') {
      // reset pagination on most filter changes
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  };

  // ---------- helpers ----------
  const safeLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');
  const toTitle = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const normalizeSalaryStatus = (status) => safeLower(status); // backend uses lowercase
  const normalizeExpenseStatus = (status) => status; // unknown, keep as-is
  const normalizePOStatus = (status) => status; // unknown, keep as-is

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount || 0));

  const getStatusBadge = (statusRaw) => {
    const status = safeLower(statusRaw);

    const statusClasses = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      received: 'bg-green-100 text-green-800',
      'partially received': 'bg-blue-100 text-blue-800',
      hold: 'bg-orange-100 text-orange-800'
    };

    const cls = statusClasses[status] || 'bg-gray-100 text-gray-800';
    return `px-2 py-1 text-xs font-medium rounded-full ${cls}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Medical Equipment': FaTools,
      'Medical Supplies': FaBox,
      Utilities: FaBolt,
      'Staff Salaries': FaUser,
      Pharmaceuticals: FaFileMedical,
      Maintenance: FaTools,
      Insurance: FaFileInvoice,
      Rent: FaFileInvoice,
      Other: FaMoneyBillWave
    };
    const IconComponent = icons[category] || FaMoneyBillWave;
    return <IconComponent className="text-teal-600" />;
  };

  // ---------- fetchers ----------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    filters.period,
    filters.category,
    filters.status,
    filters.month,
    filters.year,
    filters.date,
    filters.periodType,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'expenses') {
        await Promise.all([fetchExpenseData(), fetchExpenseSummary()]);
      } else if (activeTab === 'purchase-orders') {
        await Promise.all([fetchPurchaseOrders(), fetchPurchaseOrderSummary()]);
      } else if (activeTab === 'salaries') {
        await Promise.all([fetchSalaryData(), fetchSalarySummary()]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ----- Expenses (kept as your existing endpoints, but now safe) -----
  const fetchExpenseData = async () => {
    try {
      let endpoint = '';
      const params = {};

      if (filters.category !== 'all') params.category = filters.category;
      if (filters.status !== 'all') params.status = filters.status;

      if (filters.period === 'daily') {
        endpoint = '/api/expenses/daily';
        params.date = filters.date;
      } else if (filters.period === 'monthly') {
        endpoint = '/api/expenses/monthly';
        params.year = filters.year;
        params.month = filters.month;
      } else {
        endpoint = '/api/expenses';
      }

      const response = await apiClient.get(endpoint, { params });
      const raw = Array.isArray(response.data) ? response.data : response.data?.records || response.data?.data || [];
      setExpenseRecords(transformExpenseData(raw));
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setExpenseRecords([]); // don’t crash
    }
  };

  const fetchExpenseSummary = async () => {
    try {
      const params = { period: filters.period };
      if (filters.period === 'monthly') {
        params.year = filters.year;
        params.month = filters.month;
      }
      if (filters.period === 'daily') params.date = filters.date;

      const response = await apiClient.get('/api/expenses/summary', { params });
      setExpenseSummary(response.data || null);
    } catch (err) {
      console.error('Error fetching expense summary:', err);
      setExpenseSummary(null);
    }
  };

  const transformExpenseData = (arr) =>
    (Array.isArray(arr) ? arr : []).map((item) => ({
      id: item._id || item.id,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      category: item.category || 'Other',
      vendor: item.vendor || item.supplier || 'N/A',
      description: item.description || item.notes || 'N/A',
      amount: Number(item.amount || item.total || 0),
      approvedBy: item.approvedBy || item.approved_by || 'N/A',
      department: item.department || 'N/A',
      status: item.status || 'Pending',
      paymentMethod: item.paymentMethod || item.payment_method || 'N/A',
      receiptNo: item.receiptNo || item.receipt_no || ''
    }));

  // ----- Purchase Orders (kept as-is, safe-guarded) -----
  const fetchPurchaseOrders = async () => {
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;

      const response = await apiClient.get('/api/orders/purchase', { params });
      const orders = response.data?.orders || response.data?.data || response.data || [];
      setPurchaseOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setPurchaseOrders([]);
    }
  };

  const fetchPurchaseOrderSummary = async () => {
    try {
      const response = await apiClient.get('/api/orders/purchase/stats');
      setPurchaseOrderSummary(response.data || null);
    } catch (err) {
      console.error('Error fetching purchase order summary:', err);
      setPurchaseOrderSummary(null);
    }
  };

  // ----- Salaries (UPDATED to your backend) -----
  const fetchSalaryData = async () => {
    try {
      const params = {
        page: filters.page,
        limit: filters.limit
      };

      if (filters.status !== 'all') params.status = normalizeSalaryStatus(filters.status); // e.g. "paid"
      if (filters.periodType && filters.periodType !== 'all') params.periodType = filters.periodType;

      // overlap filter (supported by updated backend)
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get('/salaries', { params });
      setSalaryRecords(response.data?.salaries || []);
    } catch (err) {
      console.error('Error fetching salary data:', err);
      setSalaryRecords([]);
    }
  };

  const fetchSalarySummary = async () => {
    try {
      // optional: you can pass period/startDate/endDate to stats too, backend supports it
      const params = {};
      if (filters.periodType && filters.periodType !== 'all') params.period = filters.periodType;
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get('/salaries/stats', { params });
      setSalarySummary(response.data || null);
    } catch (err) {
      console.error('Error fetching salary summary:', err);
      setSalarySummary(null);
    }
  };

  // ---------- filtering/search (client-side extra filtering) ----------
  const filteredExpenseRecords = useMemo(() => {
    const q = safeLower(searchTerm);
    return expenseRecords.filter((r) => {
      const matchesSearch =
        safeLower(r.description).includes(q) || safeLower(r.vendor).includes(q) || safeLower(r.category).includes(q);

      const matchesCategory = filters.category === 'all' || r.category === filters.category;
      const matchesStatus = filters.status === 'all' || r.status === filters.status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenseRecords, filters.category, filters.status, searchTerm]);

  const filteredPurchaseOrders = useMemo(() => {
    const q = safeLower(searchTerm);
    return purchaseOrders.filter((o) => {
      const orderNum = safeLower(o.order_number);
      const supplierName = safeLower(o.supplier_id?.name);
      const notes = safeLower(o.notes);

      const matchesSearch = orderNum.includes(q) || supplierName.includes(q) || notes.includes(q);
      const matchesStatus = filters.status === 'all' || o.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, filters.status, searchTerm]);

  const filteredSalaryRecords = useMemo(() => {
    const q = safeLower(searchTerm);

    return salaryRecords.filter((s) => {
      const doc = s.doctor_id || {};
      const doctorName = safeLower(
        `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim()
      );

      const periodType = safeLower(s.period_type);
      const notes = safeLower(s.notes);

      const matchesSearch = doctorName.includes(q) || periodType.includes(q) || notes.includes(q);

      // status filter already applied server-side, but keep safe
      const matchesStatus =
        filters.status === 'all' || normalizeSalaryStatus(s.status) === normalizeSalaryStatus(filters.status);

      const matchesPeriod = !filters.periodType || filters.periodType === 'all' || s.period_type === filters.periodType;

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [salaryRecords, filters.status, filters.periodType, searchTerm]);

  const totals = useMemo(() => {
    const totalExpenses = filteredExpenseRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const paidExpenses = filteredExpenseRecords
      .filter((r) => safeLower(r.status) === 'paid')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const pendingExpenses = filteredExpenseRecords
      .filter((r) => safeLower(r.status) === 'pending')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return { totalExpenses, paidExpenses, pendingExpenses };
  }, [filteredExpenseRecords]);

  // ---------- salary pay actions ----------
  const openPayModal = (salary) => {
    setPayTarget(salary);
    setPayForm({
      payment_method: salary?.payment_method || 'bank_transfer',
      paid_date: new Date().toISOString().split('T')[0],
      notes: salary?.notes || ''
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setPayTarget(null);
  };

  const submitPaySalary = async () => {
    if (!payTarget?._id) return;
    try {
      setLoading(true);
      await apiClient.put(`/salaries/${payTarget._id}/status`, {
        status: 'paid',
        payment_method: payForm.payment_method,
        paid_date: payForm.paid_date,
        notes: payForm.notes
      });
      closePayModal();
      await fetchSalaryData();
      await fetchSalarySummary();
    } catch (err) {
      console.error('Pay salary failed:', err);
      alert(err?.response?.data?.error || err.message || 'Failed to pay salary');
    } finally {
      setLoading(false);
    }
  };

  const toggleSalarySelect = (salaryId) => {
    setSelectedSalaryIds((prev) => {
      const next = new Set(prev);
      if (next.has(salaryId)) next.delete(salaryId);
      else next.add(salaryId);
      return next;
    });
  };

  const clearSelectedSalaries = () => setSelectedSalaryIds(new Set());

  const submitBulkPay = async () => {
    const ids = Array.from(selectedSalaryIds);
    if (!ids.length) return;

    try {
      setLoading(true);
      await apiClient.post('/salaries/bulk-pay', {
        salaryIds: ids,
        payment_method: bulkPayForm.payment_method,
        paid_date: bulkPayForm.paid_date,
        notes: bulkPayForm.notes
      });
      setBulkPayOpen(false);
      clearSelectedSalaries();
      await fetchSalaryData();
      await fetchSalarySummary();
    } catch (err) {
      console.error('Bulk pay failed:', err);
      alert(err?.response?.data?.error || err.message || 'Failed to bulk pay salaries');
    } finally {
      setLoading(false);
    }
  };

  // ---------- export ----------
  const exportReport = async () => {
    try {
      if (activeTab === 'salaries') {
        // Use backend CSV report
        const periodType = filters.periodType && filters.periodType !== 'all' ? filters.periodType : 'monthly';
        const startDate = filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = filters.endDate || new Date().toISOString().split('T')[0];

        const res = await apiClient.get('/salaries/report', {
          params: { periodType, startDate, endDate, format: 'csv' },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `salary-report-${startDate}-to-${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // Fallback: client-side CSV for expenses/purchase-orders (kept)
      let csvContent = 'data:text/csv;charset=utf-8,';

      if (activeTab === 'expenses') {
        csvContent += 'Date,Category,Vendor,Description,Amount,Status,Payment Method,Approved By,Department,Receipt No\n';
        filteredExpenseRecords.forEach((r) => {
          csvContent += `${r.date},${r.category},${safeCsv(r.vendor)},${safeCsv(r.description)},${r.amount},${r.status},${safeCsv(
            r.paymentMethod
          )},${safeCsv(r.approvedBy)},${safeCsv(r.department)},${safeCsv(r.receiptNo)}\n`;
        });
      } else if (activeTab === 'purchase-orders') {
        csvContent += 'Order Number,Order Date,Supplier,Total Amount,Status,Expected Delivery,Notes\n';
        filteredPurchaseOrders.forEach((o) => {
          csvContent += `${o.order_number},${o.order_date},${safeCsv(o.supplier_id?.name || 'N/A')},${o.total_amount},${
            o.status
          },${o.expected_delivery || 'N/A'},${safeCsv(o.notes || '')}\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${activeTab}_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      alert(err?.response?.data?.error || err.message || 'Export failed');
    }
  };

  const safeCsv = (v) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('\n') || s.includes('"')) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  // ---------- derived summary numbers ----------
  const paidSalaryAmount = useMemo(() => {
    const paid = salarySummary?.byStatus?.find((x) => safeLower(x._id) === 'paid');
    return paid?.totalAmount || 0;
  }, [salarySummary]);

  const pendingSalaryAmount = useMemo(() => {
    const pending = salarySummary?.byStatus?.find((x) => safeLower(x._id) === 'pending');
    return pending?.totalAmount || 0;
  }, [salarySummary]);

  const purchaseReceivedAmount = useMemo(() => {
    return purchaseOrderSummary?.statusBreakdown?.find((s) => s.status === 'Received')?.amount || 0;
  }, [purchaseOrderSummary]);

  const purchasePendingAmount = useMemo(() => {
    return purchaseOrderSummary?.statusBreakdown?.find((s) => s.status === 'Pending')?.amount || 0;
  }, [purchaseOrderSummary]);

  // ---------- UI ----------
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

  const salaryStatuses = ['all', 'pending', 'paid', 'cancelled', 'hold'];
  const periodTypes = ['daily', 'weekly', 'monthly'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
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
          <p className="text-gray-600">Track and manage expenses, purchase orders, and doctor salaries</p>
          {errorMsg ? <p className="text-sm text-red-600 mt-1">{errorMsg}</p> : null}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            <FaDownload /> Export
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
            <>
              <button
                onClick={() => setBulkPayOpen(true)}
                disabled={selectedSalaryIds.size === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  selectedSalaryIds.size === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FaCheckCircle /> Pay Selected ({selectedSalaryIds.size})
              </button>
              <button
                onClick={() => {
                  clearSelectedSalaries();
                  setFilters((prev) => ({ ...prev, status: 'pending' }));
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaFilter /> Show Pending
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'expenses' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('expenses');
              setSelectedSalaryIds(new Set());
            }}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Expenses
          </button>

          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'purchase-orders'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('purchase-orders');
              setSelectedSalaryIds(new Set());
            }}
          >
            <FaShoppingCart className="inline mr-2" />
            Purchase Orders
          </button>

          <button
            className={`px-6 py-3 font-medium ${
              activeTab === 'salaries' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('salaries');
            }}
          >
            <FaUser className="inline mr-2" />
            Salaries
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title={`Total ${activeTab === 'salaries' ? 'Salaries' : activeTab === 'purchase-orders' ? 'Orders' : 'Expenses'}`}
          value={
            activeTab === 'expenses'
              ? formatCurrency(expenseSummary?.totalExpenses ?? totals.totalExpenses)
              : activeTab === 'purchase-orders'
              ? formatCurrency(purchaseOrderSummary?.totalAmount || 0)
              : formatCurrency(salarySummary?.overall?.totalAmount || 0)
          }
          icon={<FaMoneyBillWave className="text-3xl text-blue-600" />}
        />

        <SummaryCard
          title={`Paid ${activeTab === 'salaries' ? 'Salaries' : activeTab === 'purchase-orders' ? 'Received' : 'Expenses'}`}
          value={
            activeTab === 'expenses'
              ? formatCurrency(expenseSummary?.paidExpenses ?? totals.paidExpenses)
              : activeTab === 'purchase-orders'
              ? formatCurrency(purchaseReceivedAmount)
              : formatCurrency(paidSalaryAmount)
          }
          icon={<FaMoneyBillWave className="text-3xl text-green-600" />}
          valueClass="text-green-600"
        />

        <SummaryCard
          title={`Pending ${activeTab === 'salaries' ? 'Salaries' : activeTab === 'purchase-orders' ? 'Orders' : 'Expenses'}`}
          value={
            activeTab === 'expenses'
              ? formatCurrency(expenseSummary?.pendingExpenses ?? totals.pendingExpenses)
              : activeTab === 'purchase-orders'
              ? formatCurrency(purchasePendingAmount)
              : formatCurrency(pendingSalaryAmount)
          }
          icon={<FaMoneyBillWave className="text-3xl text-yellow-600" />}
          valueClass="text-yellow-600"
        />

        <SummaryCard
          title={
            activeTab === 'expenses'
              ? 'Salary Expenses'
              : activeTab === 'purchase-orders'
              ? 'Completed Orders'
              : 'Total Records'
          }
          value={
            activeTab === 'expenses'
              ? formatCurrency(expenseSummary?.salaryExpenses || 0)
              : activeTab === 'purchase-orders'
              ? String(purchaseOrderSummary?.statusBreakdown?.find((s) => s.status === 'Received')?.count || 0)
              : String(salarySummary?.overall?.totalRecords || 0)
          }
          icon={<FaUser className="text-3xl text-purple-600" />}
          valueClass="text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center gap-2 mb-3 text-gray-700">
          <FaFilter />
          <span className="font-semibold text-sm">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'expenses'
                  ? 'Search expenses...'
                  : activeTab === 'purchase-orders'
                  ? 'Search purchase orders...'
                  : 'Search salaries (doctor/period/notes)...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Expenses period */}
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
                      onChange={(e) => handleFilterChange('month', parseInt(e.target.value, 10))}
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
                      onChange={(e) => handleFilterChange('year', parseInt(e.target.value, 10))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {Array.from({ length: 6 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        );
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
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Salary-specific filters */}
          {activeTab === 'salaries' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
                <select
                  value={filters.periodType}
                  onChange={(e) => handleFilterChange('periodType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All</option>
                  {periodTypes.map((t) => (
                    <option key={t} value={t}>
                      {toTitle(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* Status (shared but options differ) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>

            {activeTab === 'purchase-orders' ? (
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                {purchaseOrderStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : activeTab === 'salaries' ? (
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {salaryStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'all' ? 'All' : toTitle(s)}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </div>

          {/* Apply */}
          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Salaries pagination */}
        {activeTab === 'salaries' && (
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="text-sm text-gray-600">
              Records: <span className="font-semibold">{filteredSalaryRecords.length}</span>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600">Per page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value, 10))}
                className="p-2 border border-gray-300 rounded-lg text-sm"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Prev
              </button>
              <div className="text-sm text-gray-700">Page {filters.page}</div>
              <button
                onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === 'expenses' && 'Expense Records'}
            {activeTab === 'purchase-orders' && 'Purchase Orders'}
            {activeTab === 'salaries' && 'Salary Records'}
          </h3>

          {activeTab === 'salaries' && selectedSalaryIds.size > 0 && (
            <button
              onClick={() => clearSelectedSalaries()}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Clear Selection
            </button>
          )}
        </div>

        {activeTab === 'expenses' && (
          <ExpenseTable records={filteredExpenseRecords} formatCurrency={formatCurrency} getStatusBadge={getStatusBadge} getCategoryIcon={getCategoryIcon} />
        )}

        {activeTab === 'purchase-orders' && (
          <PurchaseOrderTable orders={filteredPurchaseOrders} formatCurrency={formatCurrency} getStatusBadge={getStatusBadge} />
        )}

        {activeTab === 'salaries' && (
          <SalaryTable
            salaries={filteredSalaryRecords}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
            onPay={openPayModal}
            selectedSalaryIds={selectedSalaryIds}
            toggleSelect={toggleSalarySelect}
          />
        )}
      </div>

      {/* Summary sections */}
      {activeTab === 'expenses' && expenseSummary && <ExpenseSummary expenseSummary={expenseSummary} formatCurrency={formatCurrency} />}
      {activeTab === 'purchase-orders' && purchaseOrderSummary && <PurchaseOrderSummary purchaseOrderSummary={purchaseOrderSummary} formatCurrency={formatCurrency} />}
      {activeTab === 'salaries' && salarySummary && <SalarySummary salarySummary={salarySummary} formatCurrency={formatCurrency} />}

      {/* Pay salary modal */}
      {payModalOpen && (
        <Modal title="Pay Salary" onClose={closePayModal}>
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <div className="font-semibold">
                Doctor:{' '}
                {payTarget?.doctor_id
                  ? `${payTarget.doctor_id.firstName || payTarget.doctor_id.first_name || ''} ${
                      payTarget.doctor_id.lastName || payTarget.doctor_id.last_name || ''
                    }`
                  : 'N/A'}
              </div>
              <div className="text-gray-600 capitalize">
                Period: {payTarget?.period_type} •{' '}
                {payTarget?.period_start ? new Date(payTarget.period_start).toLocaleDateString() : 'N/A'} to{' '}
                {payTarget?.period_end ? new Date(payTarget.period_end).toLocaleDateString() : 'N/A'}
              </div>
              <div className="mt-1 font-bold">{formatCurrency(payTarget?.net_amount || 0)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={payForm.payment_method}
                onChange={(e) => setPayForm((p) => ({ ...p, payment_method: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label>
              <input
                type="date"
                value={payForm.paid_date}
                onChange={(e) => setPayForm((p) => ({ ...p, paid_date: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={payForm.notes}
                onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={closePayModal} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submitPaySalary}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Mark Paid
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk pay modal */}
      {bulkPayOpen && (
        <Modal
          title={`Bulk Pay Salaries (${selectedSalaryIds.size})`}
          onClose={() => setBulkPayOpen(false)}
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              This will mark all selected salary records as <span className="font-semibold">paid</span>.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={bulkPayForm.payment_method}
                onChange={(e) => setBulkPayForm((p) => ({ ...p, payment_method: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label>
              <input
                type="date"
                value={bulkPayForm.paid_date}
                onChange={(e) => setBulkPayForm((p) => ({ ...p, paid_date: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={bulkPayForm.notes}
                onChange={(e) => setBulkPayForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setBulkPayOpen(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submitBulkPay}
                disabled={selectedSalaryIds.size === 0}
                className={`px-4 py-2 rounded-lg ${
                  selectedSalaryIds.size === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                Pay Selected
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ----------------------- components -----------------------

const SummaryCard = ({ title, value, icon, valueClass = 'text-gray-800' }) => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
          <FaTimes />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

// Expense Table
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
        {records.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.date || '—'}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                {getCategoryIcon(r.category)}
                <span className="text-sm text-gray-900">{r.category}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">{r.description}</div>
              <div className="text-sm text-gray-500">{r.department}</div>
              {r.receiptNo ? <div className="text-xs text-gray-400">Receipt: {r.receiptNo}</div> : null}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.vendor}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(r.amount)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.approvedBy}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(r.status)}>{r.status}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
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
      <EmptyState icon={<FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-4" />} title="No expense records found" />
    )}
  </div>
);

// Purchase Orders Table
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
        {orders.map((o) => (
          <tr key={o._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.order_number}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.supplier_id?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {formatCurrency(o.total_amount || o.totalAmount || 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(o.status)}>{o.status}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
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
      <EmptyState icon={<FaShoppingCart className="text-4xl text-gray-300 mx-auto mb-4" />} title="No purchase orders found" />
    )}
  </div>
);

// Salaries Table (with pay + select)
const SalaryTable = ({ salaries, formatCurrency, getStatusBadge, onPay, selectedSalaryIds, toggleSelect }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {salaries.map((s) => {
          const doc = s.doctor_id || {};
          const doctorName = `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim() || 'N/A';
          const statusLower = (s.status || '').toString().toLowerCase();
          const isPaid = statusLower === 'paid';

          return (
            <tr key={s._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedSalaryIds.has(s._id)}
                  disabled={isPaid}
                  onChange={() => toggleSelect(s._id)}
                  className="h-4 w-4"
                  title={isPaid ? 'Already paid' : 'Select for bulk pay'}
                />
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{doctorName}</div>
                {doc.paymentType ? <div className="text-xs text-gray-500">{doc.paymentType}</div> : null}
              </td>

              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 capitalize">{s.period_type || '—'}</div>
                <div className="text-xs text-gray-500">
                  {s.period_start ? new Date(s.period_start).toLocaleDateString() : '—'} to{' '}
                  {s.period_end ? new Date(s.period_end).toLocaleDateString() : '—'}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900">{formatCurrency(s.net_amount || s.amount || 0)}</div>
                {!isPaid && s.payment_method ? <div className="text-xs text-gray-500">{s.payment_method}</div> : null}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.appointment_count || 0}</td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(s.status)}>{(s.status || '').toString()}</span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button className="text-teal-600 hover:text-teal-900 text-sm">
                    <FaEye className="inline mr-1" />
                    View
                  </button>

                  {!isPaid ? (
                    <button
                      onClick={() => onPay(s)}
                      className="text-white bg-teal-600 hover:bg-teal-700 text-sm px-3 py-1 rounded-lg"
                    >
                      Pay
                    </button>
                  ) : (
                    <span className="text-xs text-green-600 font-semibold">Paid</span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {salaries.length === 0 && (
      <EmptyState icon={<FaUser className="text-4xl text-gray-300 mx-auto mb-4" />} title="No salary records found" />
    )}
  </div>
);

const EmptyState = ({ icon, title }) => (
  <div className="text-center py-12">
    {icon}
    <p className="text-gray-500">{title}</p>
    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
  </div>
);

// Expense Summary
const ExpenseSummary = ({ expenseSummary, formatCurrency }) => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Expense Breakdown</h4>
        <div className="space-y-2">
          <Row label="Total Expenses" value={formatCurrency(expenseSummary.totalExpenses || 0)} valueClass="text-red-600" />
          <Row label="Paid Expenses" value={formatCurrency(expenseSummary.paidExpenses || 0)} valueClass="text-green-600" />
          <Row label="Pending Expenses" value={formatCurrency(expenseSummary.pendingExpenses || 0)} valueClass="text-yellow-600" />
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Net Expenses:</span>
            <span className="font-bold text-red-600">{formatCurrency(expenseSummary.totalExpenses || 0)}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Category Breakdown</h4>
        <div className="space-y-2">
          <Row label="Salary Expenses" value={formatCurrency(expenseSummary.salaryExpenses || 0)} />
          <Row label="Medical Supplies" value={formatCurrency(expenseSummary.medicalSupplies || 0)} />
          <Row label="Utilities" value={formatCurrency(expenseSummary.utilities || 0)} />
          <Row label="Other Expenses" value={formatCurrency(expenseSummary.otherExpenses || 0)} />
        </div>
      </div>
    </div>
  </div>
);

// Purchase Order Summary
const PurchaseOrderSummary = ({ purchaseOrderSummary, formatCurrency }) => {
  const getStatusAmount = (status) => purchaseOrderSummary.statusBreakdown?.find((s) => s.status === status)?.amount || 0;
  const getStatusCount = (status) => purchaseOrderSummary.statusBreakdown?.find((s) => s.status === status)?.count || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Order Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Order Breakdown</h4>
          <div className="space-y-2">
            <Row label="Total Orders" value={purchaseOrderSummary.totalOrders || 0} />
            <Row label="Total Amount" value={formatCurrency(purchaseOrderSummary.totalAmount || 0)} valueClass="text-red-600" />
            <Row label="Average Order Value" value={formatCurrency(purchaseOrderSummary.averageOrderValue || 0)} />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-3">Status Breakdown</h4>
          <div className="space-y-2">
            <Row
              label="Received Orders"
              value={`${getStatusCount('Received')} (${formatCurrency(getStatusAmount('Received'))})`}
              valueClass="text-green-600"
            />
            <Row
              label="Pending Orders"
              value={`${getStatusCount('Pending')} (${formatCurrency(getStatusAmount('Pending'))})`}
              valueClass="text-yellow-600"
            />
            <Row
              label="Cancelled Orders"
              value={`${getStatusCount('Cancelled')} (${formatCurrency(getStatusAmount('Cancelled'))})`}
              valueClass="text-red-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Salary Summary (UPDATED for lowercase statuses)
const SalarySummary = ({ salarySummary, formatCurrency }) => {
  const getStatusAmount = (status) =>
    salarySummary.byStatus?.find((s) => (s._id || '').toString().toLowerCase() === status)?.totalAmount || 0;

  const getStatusCount = (status) =>
    salarySummary.byStatus?.find((s) => (s._id || '').toString().toLowerCase() === status)?.count || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Overall Statistics</h4>
          <div className="space-y-2">
            <Row label="Total Salary Records" value={salarySummary.overall?.totalRecords || 0} />
            <Row label="Total Amount (Paid + Pending)" value={formatCurrency(salarySummary.overall?.totalAmount || 0)} valueClass="text-red-600" />
            <Row label="Average Salary Amount" value={formatCurrency(salarySummary.overall?.averageSalary || 0)} />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-3">Status Breakdown</h4>
          <div className="space-y-2">
            <Row
              label="Paid Salaries"
              value={`${getStatusCount('paid')} (${formatCurrency(getStatusAmount('paid'))})`}
              valueClass="text-green-600"
            />
            <Row
              label="Pending Salaries"
              value={`${getStatusCount('pending')} (${formatCurrency(getStatusAmount('pending'))})`}
              valueClass="text-yellow-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, valueClass = 'text-gray-900' }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default ExpensePage;
