import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
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
  FaCheckCircle,
  FaMoneyCheckAlt,
  FaCalendar,
  FaFileAlt,
  FaReceipt,
  FaBuilding,
  FaPercent,
  FaClock,
  FaExclamationCircle,
  FaRupeeSign,
  FaUserMd,
  FaChartLine
} from 'react-icons/fa';
import AddExpenseModal from './AddExpenseModal';

const ExpensePage = () => {
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [commissionRecords, setCommissionRecords] = useState([]);
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [pendingSalaries, setPendingSalaries] = useState([]);

  const [expenseSummary, setExpenseSummary] = useState(null);
  const [purchaseOrderSummary, setPurchaseOrderSummary] = useState(null);
  const [salarySummary, setSalarySummary] = useState(null);
  const [commissionSummary, setCommissionSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'purchase-orders' | 'salaries' | 'commissions'
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Payment UI
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [payType, setPayType] = useState('salary'); // 'salary' or 'commission'
  const [payForm, setPayForm] = useState({
    payment_method: 'bank_transfer',
    paid_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Bulk select
  const [selectedSalaryIds, setSelectedSalaryIds] = useState(new Set());
  const [selectedCommissionIds, setSelectedCommissionIds] = useState(new Set());
  const [bulkPayOpen, setBulkPayOpen] = useState(false);
  const [bulkPayType, setBulkPayType] = useState('salary');
  const [bulkPayForm, setBulkPayForm] = useState({
    payment_method: 'bank_transfer',
    paid_date: new Date().toISOString().split('T')[0],
    notes: 'Bulk payment processed'
  });

  // Add Expense Modal
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    description: '',
    amount: '',
    vendor: '',
    payment_method: 'Cash',
    department: '',
    notes: '',
    tax_rate: 0,
    receipt_number: ''
  });

  // Navigation hook
  const navigate = useNavigate();

  // Doctors list for filters
  const [doctors, setDoctors] = useState([]);

  // Unified filters
  const [filters, setFilters] = useState({
    period: 'monthly',
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: 'all',
    status: 'all',
    periodType: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
    doctorId: 'all'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/doctors');
      setDoctors(response.data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== 'page') {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  };

  // ---------- helpers ----------
  const safeLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');
  const toTitle = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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
      hold: 'bg-orange-100 text-orange-800',
      'partially paid': 'bg-blue-100 text-blue-800',
      issued: 'bg-purple-100 text-purple-800',
      processing: 'bg-indigo-100 text-indigo-800'
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
      Rent: FaBuilding,
      Other: FaMoneyBillWave
    };
    const IconComponent = icons[category] || FaMoneyBillWave;
    return <IconComponent className="text-teal-600" />;
  };

  // ---------- fetchers ----------
  useEffect(() => {
    fetchData();
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
    filters.limit,
    filters.doctorId
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
        await Promise.all([fetchSalaryData(), fetchSalarySummary(), fetchPendingSalaries()]);
      } else if (activeTab === 'commissions') {
        await Promise.all([fetchCommissionData(), fetchCommissionSummary(), fetchPendingCommissions()]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ----- Expense API calls -----
  const fetchExpenseData = async () => {
    try {
      let endpoint = '/expenses';
      const params = {};

      if (filters.category !== 'all') params.category = filters.category;
      if (filters.status !== 'all') params.status = filters.status;

      if (filters.period === 'daily') {
        endpoint = '/expenses/daily';
        params.date = filters.date;
      } else if (filters.period === 'monthly') {
        endpoint = '/expenses/monthly';
        params.year = filters.year;
        params.month = filters.month;
      } else if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get(endpoint, { params });
      
      let raw = [];
      if (response.data?.expenses) {
        raw = response.data.expenses;
      } else if (response.data?.data) {
        raw = response.data.data;
      } else if (Array.isArray(response.data)) {
        raw = response.data;
      }
      
      setExpenseRecords(transformExpenseData(raw));
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setExpenseRecords([]);
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
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get('/expenses/summary', { params });
      setExpenseSummary(response.data || null);
    } catch (err) {
      console.error('Error fetching expense summary:', err);
      setExpenseSummary(null);
    }
  };

  const transformExpenseData = (arr) =>
    (Array.isArray(arr) ? arr : []).map((item) => ({
      id: item._id || item.id,
      expense_number: item.expense_number || 'N/A',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      category: item.category || 'Other',
      vendor: item.vendor || 'N/A',
      description: item.description || item.notes || 'N/A',
      amount: Number(item.amount || 0),
      total_amount: Number(item.total_amount || item.amount || 0),
      approved_by: item.approved_by?.name || item.approvedBy || 'N/A',
      department: item.department || 'N/A',
      status: item.payment_status || item.status || 'Pending',
      approval_status: item.approval_status || 'Pending',
      payment_method: item.payment_method || 'N/A',
      receipt_number: item.receipt_number || item.receiptNo || ''
    }));

  // ----- Purchase Order API calls -----
  const fetchPurchaseOrders = async () => {
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get('/orders/purchase', { params });
      const orders = response.data?.purchaseOrders || response.data?.orders || response.data?.data || response.data || [];
      setPurchaseOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setPurchaseOrders([]);
    }
  };

  const fetchPurchaseOrderSummary = async () => {
    try {
      const params = {};
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }
      const response = await apiClient.get('/orders/purchase/stats', { params });
      setPurchaseOrderSummary(response.data || null);
    } catch (err) {
      console.error('Error fetching purchase order summary:', err);
      setPurchaseOrderSummary(null);
    }
  };

  // ----- Salary API calls (from Salary model - paid records) -----
  const fetchSalaryData = async () => {
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        earningType: 'salary'
      };

      if (filters.status !== 'all') params.status = safeLower(filters.status);
      if (filters.periodType && filters.periodType !== 'all') params.periodType = filters.periodType;
      if (filters.doctorId && filters.doctorId !== 'all') params.doctorId = filters.doctorId;

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
      const params = { earningType: 'salary' };
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

  // ----- Commission API calls (from invoices - pending commissions) -----
  const fetchCommissionData = async () => {
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        earningType: 'commission'
      };

      if (filters.status !== 'all') params.status = safeLower(filters.status);
      if (filters.periodType && filters.periodType !== 'all') params.periodType = filters.periodType;
      if (filters.doctorId && filters.doctorId !== 'all') params.doctorId = filters.doctorId;

      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get('/salaries', { params });
      setCommissionRecords(response.data?.salaries || []);
    } catch (err) {
      console.error('Error fetching commission data:', err);
      setCommissionRecords([]);
    }
  };

  const fetchCommissionSummary = async () => {
    try {
      const params = { earningType: 'commission' };
      if (filters.periodType && filters.periodType !== 'all') params.period = filters.periodType;
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const response = await apiClient.get('/salaries/stats', { params });
      setCommissionSummary(response.data || null);
    } catch (err) {
      console.error('Error fetching commission summary:', err);
      setCommissionSummary(null);
    }
  };

  // ----- Pending Salaries (from doctors who are full-time) -----
  const fetchPendingSalaries = async () => {
    try {
      // Fetch all full-time doctors
      const doctorsRes = await apiClient.get('/doctors', {
        params: { isFullTime: true }
      });
      const fullTimeDoctors = doctorsRes.data || [];

      // Fetch existing paid salaries for the period
      const salaryParams = {
        earningType: 'salary',
        status: 'paid',
        startDate: filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: filters.endDate || new Date().toISOString().split('T')[0]
      };
      const salariesRes = await apiClient.get('/salaries', { params: salaryParams });
      const paidSalaries = salariesRes.data?.salaries || [];

      // Create a map of doctors who already have paid salaries in this period
      const paidDoctorMap = {};
      paidSalaries.forEach(s => {
        if (s.doctor_id?._id) {
          paidDoctorMap[s.doctor_id._id] = true;
        }
      });

      // Generate pending salaries for doctors without paid records
      const pending = [];
      fullTimeDoctors.forEach(doctor => {
        if (!paidDoctorMap[doctor._id] && doctor.amount > 0) {
          pending.push({
            _id: `pending-salary-${doctor._id}`,
            doctor_id: doctor,
            period_type: filters.periodType || 'monthly',
            period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            amount: doctor.amount,
            net_amount: doctor.amount,
            status: 'pending',
            is_pending: true
          });
        }
      });

      setPendingSalaries(pending);
    } catch (err) {
      console.error('Error fetching pending salaries:', err);
    }
  };

  // ----- Pending Commissions (from invoices) -----
  const fetchPendingCommissions = async () => {
    try {
      // Fetch all part-time doctors
      const doctorsRes = await apiClient.get('/doctors', {
        params: { isFullTime: false }
      });
      const partTimeDoctors = doctorsRes.data || [];

      // Fetch completed appointments for these doctors
      const appointmentsParams = {
        status: 'Completed',
        startDate: filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: filters.endDate || new Date().toISOString().split('T')[0],
        limit: 1000
      };
      
      const appointmentsRes = await apiClient.get('/appointments', { params: appointmentsParams });
      const appointments = appointmentsRes.data || appointmentsRes.data || [];

      // Fetch invoices for these appointments
      const invoiceParams = {
        invoice_type: 'Appointment',
        startDate: filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: filters.endDate || new Date().toISOString().split('T')[0],
        limit: 1000
      };
      
      const invoicesRes = await apiClient.get('/invoices', { params: invoiceParams });
      const invoices = invoicesRes.data?.invoices || invoicesRes.data || [];
      console.log('Fetched invoices for commission calculation:', invoices);
      // Create doctor map for quick lookup
      const doctorMap = {};
      partTimeDoctors.forEach(doc => {
        doctorMap[doc._id] = doc;
      });

      // Fetch existing paid commissions
      const commissionParams = {
        earningType: 'commission',
        status: 'paid',
        startDate: filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: filters.endDate || new Date().toISOString().split('T')[0]
      };
      const commissionsRes = await apiClient.get('/salaries', { params: commissionParams });
      const paidCommissions = commissionsRes.data?.salaries || [];

      // Create a set of paid appointment IDs
      const paidAppointmentSet = new Set();
      paidCommissions.forEach(comm => {
        if (comm.appointments) {
          comm.appointments.forEach(apptId => paidAppointmentSet.add(apptId.toString()));
        }
      });

      // Process invoices to generate pending commissions
      const pending = [];
      
      for (const invoice of invoices) {
        // Find appointment for this invoice
        const appointment = appointments.find(a => a._id === invoice.appointment_id);
        if (!appointment) continue;

        // Skip if already paid
        if (paidAppointmentSet.has(appointment._id)) continue;

        const doctor = doctorMap[appointment.doctor_id?._id || appointment.doctor_id];
        if (!doctor) continue;

        // Calculate commission from consultation fees
        let consultationFee = 0;
        let registrationFee = 0;

        (invoice.service_items || []).forEach(item => {
          const desc = (item.description || '').toLowerCase();
          if (desc.includes('consultation') || desc.includes('doctor consultation')) {
            consultationFee += item.total_price || 0;
          } else {
            registrationFee += item.total_price || 0;
          }
        });

        if (consultationFee === 0) {
          consultationFee = invoice.total || 0;
        }

        const commissionAmount = (consultationFee * (doctor.revenuePercentage || 0)) / 100;

        pending.push({
          _id: `pending-commission-${invoice._id}`,
          invoice_id: invoice._id,
          invoice_number: invoice.invoice_number,
          doctor_id: doctor,
          appointment_date: appointment.appointment_date,
          patient_name: appointment.patient_name || 'Unknown',
          consultation_fee: consultationFee,
          registration_fee: registrationFee,
          total_amount: invoice.total || 0,
          amount: commissionAmount,
          net_amount: commissionAmount,
          status: 'pending',
          is_pending: true,
          period_type: 'daily',
          period_start: new Date(appointment.appointment_date),
          period_end: new Date(appointment.appointment_date)
        });
      }

      setPendingCommissions(pending);
    } catch (err) {
      console.error('Error fetching pending commissions:', err);
      setPendingCommissions([]);
    }
  };

  // ---------- filtering/search ----------
  const filteredExpenseRecords = useMemo(() => {
    const q = safeLower(searchTerm);
    return expenseRecords.filter((r) => {
      const matchesSearch =
        safeLower(r.description).includes(q) || 
        safeLower(r.vendor).includes(q) || 
        safeLower(r.category).includes(q) ||
        safeLower(r.expense_number).includes(q);

      const matchesCategory = filters.category === 'all' || r.category === filters.category;
      const matchesStatus = filters.status === 'all' || safeLower(r.status) === safeLower(filters.status);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenseRecords, filters.category, filters.status, searchTerm]);

  const filteredPurchaseOrders = useMemo(() => {
    const q = safeLower(searchTerm);
    return purchaseOrders.filter((o) => {
      const orderNum = safeLower(o.order_number || '');
      const supplierName = safeLower(o.supplier_name || o.supplier_id?.name || '');
      const notes = safeLower(o.notes || '');

      const matchesSearch = orderNum.includes(q) || supplierName.includes(q) || notes.includes(q);
      const matchesStatus = filters.status === 'all' || o.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, filters.status, searchTerm]);

  const filteredSalaryRecords = useMemo(() => {
    const q = safeLower(searchTerm);
    // Combine paid salaries from model and pending salaries from doctors
    const allSalaries = [...salaryRecords, ...pendingSalaries];

    return allSalaries.filter((s) => {
      const doc = s.doctor_id || {};
      const doctorName = safeLower(
        `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim()
      );

      const periodType = safeLower(s.period_type || '');
      const notes = safeLower(s.notes || '');

      const matchesSearch = doctorName.includes(q) || periodType.includes(q) || notes.includes(q);

      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'pending' && s.status === 'pending') ||
        (filters.status === 'paid' && s.status === 'paid');

      const matchesPeriod = !filters.periodType || filters.periodType === 'all' || s.period_type === filters.periodType;

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [salaryRecords, pendingSalaries, filters.status, filters.periodType, searchTerm]);

  const filteredCommissionRecords = useMemo(() => {
    const q = safeLower(searchTerm);
    // Combine paid commissions from model and pending commissions from invoices
    const allCommissions = [...commissionRecords, ...pendingCommissions];

    return allCommissions.filter((c) => {
      const doc = c.doctor_id || {};
      const doctorName = safeLower(
        `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim()
      );

      const patientName = safeLower(c.patient_name || '');
      const invoiceNum = safeLower(c.invoice_number || '');
      const notes = safeLower(c.notes || '');

      const matchesSearch = doctorName.includes(q) || patientName.includes(q) || invoiceNum.includes(q) || notes.includes(q);

      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'pending' && c.status === 'pending') ||
        (filters.status === 'paid' && c.status === 'paid');

      const matchesDoctor = filters.doctorId === 'all' || c.doctor_id?._id === filters.doctorId;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [commissionRecords, pendingCommissions, filters.status, filters.doctorId, searchTerm]);

  // ---------- expense actions ----------
  const handleAddExpense = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/expenses', newExpense);
      
      if (response.data) {
        setAddExpenseModalOpen(false);
        setNewExpense({
          date: new Date().toISOString().split('T')[0],
          category: 'Other',
          description: '',
          amount: '',
          vendor: '',
          payment_method: 'Cash',
          department: '',
          notes: '',
          tax_rate: 0,
          receipt_number: ''
        });
        fetchData();
        alert('Expense added successfully!');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      alert(err?.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // ---------- pay actions ----------
  const openPayModal = (record, type) => {
    setPayTarget(record);
    setPayType(type);
    setPayForm({
      payment_method: record?.payment_method || 'bank_transfer',
      paid_date: new Date().toISOString().split('T')[0],
      notes: record?.notes || ''
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setPayTarget(null);
  };

  const submitPayment = async () => {
    if (!payTarget?._id) return;
    
    try {
      setLoading(true);
      
      if (payType === 'salary') {
        // For pending salaries (from doctors), create new salary record
        if (payTarget.is_pending) {
          await apiClient.post('/salaries', {
            doctor_id: payTarget.doctor_id._id,
            period_type: payTarget.period_type,
            period_start: payTarget.period_start,
            period_end: payTarget.period_end,
            amount: payTarget.amount,
            net_amount: payTarget.amount,
            earning_type: 'salary',
            status: 'paid',
            payment_method: payForm.payment_method,
            paid_date: payForm.paid_date,
            notes: payForm.notes
          });
        } else {
          // Update existing salary record
          await apiClient.put(`/salaries/${payTarget._id}/status`, {
            status: 'paid',
            payment_method: payForm.payment_method,
            paid_date: payForm.paid_date,
            notes: payForm.notes
          });
        }
      } else if (payType === 'commission') {
        // For pending commissions, create new commission record
        if (payTarget.is_pending) {
          await apiClient.post('/salaries', {
            doctor_id: payTarget.doctor_id._id,
            period_type: 'daily',
            period_start: payTarget.period_start,
            period_end: payTarget.period_end,
            amount: payTarget.amount,
            net_amount: payTarget.amount,
            earning_type: 'commission',
            appointment_count: 1,
            appointments: [payTarget._id.replace('pending-commission-', '')],
            gross_amount: payTarget.total_amount,
            doctor_share: payTarget.amount,
            hospital_share: payTarget.total_amount - payTarget.amount,
            revenue_percentage: payTarget.doctor_id.revenuePercentage,
            status: 'paid',
            payment_method: payForm.payment_method,
            paid_date: payForm.paid_date,
            notes: payForm.notes
          });
        } else {
          // Update existing commission record
          await apiClient.put(`/salaries/${payTarget._id}/status`, {
            status: 'paid',
            payment_method: payForm.payment_method,
            paid_date: payForm.paid_date,
            notes: payForm.notes
          });
        }
      }

      closePayModal();
      await fetchData();
      alert(`${payType === 'salary' ? 'Salary' : 'Commission'} paid successfully!`);
    } catch (err) {
      console.error('Payment failed:', err);
      alert(err?.response?.data?.error || err.message || `Failed to pay ${payType}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk select toggles
  const toggleSalarySelect = (salaryId) => {
    setSelectedSalaryIds((prev) => {
      const next = new Set(prev);
      if (next.has(salaryId)) next.delete(salaryId);
      else next.add(salaryId);
      return next;
    });
  };

  const toggleCommissionSelect = (commissionId) => {
    setSelectedCommissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(commissionId)) next.delete(commissionId);
      else next.add(commissionId);
      return next;
    });
  };

  const clearSelectedSalaries = () => setSelectedSalaryIds(new Set());
  const clearSelectedCommissions = () => setSelectedCommissionIds(new Set());

  const openBulkPayModal = (type) => {
    setBulkPayType(type);
    setBulkPayOpen(true);
  };

  const submitBulkPay = async () => {
    const ids = bulkPayType === 'salary' 
      ? Array.from(selectedSalaryIds) 
      : Array.from(selectedCommissionIds);
    
    if (!ids.length) return;

    try {
      setLoading(true);
      
      // Filter out pending records (those with is_pending flag)
      const recordsToPay = bulkPayType === 'salary' 
        ? filteredSalaryRecords.filter(r => selectedSalaryIds.has(r._id) && !r.is_pending)
        : filteredCommissionRecords.filter(r => selectedCommissionIds.has(r._id) && !r.is_pending);

      if (recordsToPay.length > 0) {
        await apiClient.post('/salaries/bulk-pay', {
          salaryIds: recordsToPay.map(r => r._id),
          payment_method: bulkPayForm.payment_method,
          paid_date: bulkPayForm.paid_date,
          notes: bulkPayForm.notes
        });
      }

      // Handle pending records separately (create new salary records)
      const pendingRecords = bulkPayType === 'salary'
        ? filteredSalaryRecords.filter(r => selectedSalaryIds.has(r._id) && r.is_pending)
        : filteredCommissionRecords.filter(r => selectedCommissionIds.has(r._id) && r.is_pending);

      for (const record of pendingRecords) {
        if (bulkPayType === 'salary') {
          await apiClient.post('/salaries', {
            doctor_id: record.doctor_id._id,
            period_type: record.period_type,
            period_start: record.period_start,
            period_end: record.period_end,
            amount: record.amount,
            net_amount: record.amount,
            earning_type: 'salary',
            status: 'paid',
            payment_method: bulkPayForm.payment_method,
            paid_date: bulkPayForm.paid_date,
            notes: bulkPayForm.notes
          });
        } else {
          await apiClient.post('/salaries', {
            doctor_id: record.doctor_id._id,
            period_type: 'daily',
            period_start: record.period_start,
            period_end: record.period_end,
            amount: record.amount,
            net_amount: record.amount,
            earning_type: 'commission',
            appointment_count: 1,
            appointments: [record._id.replace('pending-commission-', '')],
            gross_amount: record.total_amount,
            doctor_share: record.amount,
            hospital_share: record.total_amount - record.amount,
            revenue_percentage: record.doctor_id.revenuePercentage,
            status: 'paid',
            payment_method: bulkPayForm.payment_method,
            paid_date: bulkPayForm.paid_date,
            notes: bulkPayForm.notes
          });
        }
      }

      setBulkPayOpen(false);
      if (bulkPayType === 'salary') {
        clearSelectedSalaries();
      } else {
        clearSelectedCommissions();
      }
      await fetchData();
      alert(`Bulk payment processed successfully!`);
    } catch (err) {
      console.error('Bulk pay failed:', err);
      alert(err?.response?.data?.error || err.message || 'Failed to bulk pay');
    } finally {
      setLoading(false);
    }
  };

  // ---------- export ----------
  const exportReport = async () => {
    try {
      if (activeTab === 'salaries' || activeTab === 'commissions') {
        const periodType = filters.periodType && filters.periodType !== 'all' ? filters.periodType : 'monthly';
        const startDate = filters.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = filters.endDate || new Date().toISOString().split('T')[0];
        const earningType = activeTab === 'salaries' ? 'salary' : 'commission';

        const res = await apiClient.get('/salaries/report', {
          params: { periodType, startDate, endDate, earningType, format: 'csv' },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeTab}-report-${startDate}-to-${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      // Client-side CSV for expenses/purchase-orders
      let csvContent = 'data:text/csv;charset=utf-8,';

      if (activeTab === 'expenses') {
        csvContent += 'Expense Number,Date,Category,Vendor,Description,Amount,Total Amount,Payment Status,Payment Method,Department,Receipt No\n';
        filteredExpenseRecords.forEach((r) => {
          csvContent += `${safeCsv(r.expense_number)},${r.date},${r.category},${safeCsv(r.vendor)},${safeCsv(r.description)},${r.amount},${r.total_amount},${r.status},${safeCsv(r.payment_method)},${safeCsv(r.department)},${safeCsv(r.receipt_number)}\n`;
        });
      } else if (activeTab === 'purchase-orders') {
        csvContent += 'Order Number,Order Date,Supplier,Total Amount,Status,Expected Delivery,Notes\n';
        filteredPurchaseOrders.forEach((o) => {
          csvContent += `${o.order_number},${o.order_date},${safeCsv(o.supplier_name || o.supplier_id?.name || 'N/A')},${o.total_amount},${o.status},${o.expected_delivery || 'N/A'},${safeCsv(o.notes || '')}\n`;
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
    return pendingSalaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [pendingSalaries]);

  const paidCommissionAmount = useMemo(() => {
    const paid = commissionSummary?.byStatus?.find((x) => safeLower(x._id) === 'paid');
    return paid?.totalAmount || 0;
  }, [commissionSummary]);

  const pendingCommissionAmount = useMemo(() => {
    return pendingCommissions.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [pendingCommissions]);

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

  const purchaseOrderStatuses = ['Draft', 'Pending', 'Approved', 'Ordered', 'Partially Received', 'Received', 'Cancelled'];

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
          <p className="text-gray-600">Track and manage expenses, purchase orders, and doctor salaries/commissions</p>
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
            <button 
              onClick={() => setAddExpenseModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Add Expense
            </button>
          )}

          {activeTab === 'purchase-orders' && (
            <button 
              onClick={() => navigate('/dashboard/admin/purchase-orders/new')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Create Purchase Order
            </button>
          )}

          {activeTab === 'salaries' && (
            <>
              <button
                onClick={() => openBulkPayModal('salary')}
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

          {activeTab === 'commissions' && (
            <>
              <button
                onClick={() => openBulkPayModal('commission')}
                disabled={selectedCommissionIds.size === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  selectedCommissionIds.size === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FaCheckCircle /> Pay Selected ({selectedCommissionIds.size})
              </button>
              <button
                onClick={() => {
                  clearSelectedCommissions();
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
        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'expenses' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('expenses')}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Expenses
          </button>

          <button
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'purchase-orders'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('purchase-orders')}
          >
            <FaShoppingCart className="inline mr-2" />
            Purchase Orders
          </button>

          <button
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'salaries' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('salaries')}
          >
            <FaUser className="inline mr-2" />
            Salaries
          </button>

          <button
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === 'commissions' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('commissions')}
          >
            <FaPercent className="inline mr-2" />
            Commissions
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {activeTab === 'expenses' && (
          <>
            <SummaryCard
              title="Total Expenses"
              value={formatCurrency(expenseSummary?.overall?.totalExpenses || 0)}
              icon={<FaMoneyBillWave className="text-3xl text-blue-600" />}
            />
            <SummaryCard
              title="Paid Expenses"
              value={formatCurrency(expenseSummary?.overall?.paidExpenses || 0)}
              icon={<FaCheckCircle className="text-3xl text-green-600" />}
              valueClass="text-green-600"
            />
            <SummaryCard
              title="Pending Expenses"
              value={formatCurrency(expenseSummary?.overall?.pendingExpenses || 0)}
              icon={<FaClock className="text-3xl text-yellow-600" />}
              valueClass="text-yellow-600"
            />
            <SummaryCard
              title="Salary Expenses"
              value={formatCurrency(expenseSummary?.salaryExpenses || 0)}
              icon={<FaUser className="text-3xl text-purple-600" />}
              valueClass="text-purple-600"
            />
          </>
        )}

        {activeTab === 'purchase-orders' && (
          <>
            <SummaryCard
              title="Total Orders"
              value={purchaseOrderSummary?.totalOrders || 0}
              icon={<FaShoppingCart className="text-3xl text-blue-600" />}
            />
            <SummaryCard
              title="Total Amount"
              value={formatCurrency(purchaseOrderSummary?.totalAmount || 0)}
              icon={<FaMoneyBillWave className="text-3xl text-red-600" />}
              valueClass="text-red-600"
            />
            <SummaryCard
              title="Received"
              value={formatCurrency(purchaseReceivedAmount)}
              icon={<FaCheckCircle className="text-3xl text-green-600" />}
              valueClass="text-green-600"
            />
            <SummaryCard
              title="Pending"
              value={formatCurrency(purchasePendingAmount)}
              icon={<FaClock className="text-3xl text-yellow-600" />}
              valueClass="text-yellow-600"
            />
          </>
        )}

        {activeTab === 'salaries' && (
          <>
            <SummaryCard
              title="Total Salaries"
              value={formatCurrency((salarySummary?.overall?.totalAmount || 0) + pendingSalaryAmount)}
              icon={<FaUser className="text-3xl text-blue-600" />}
            />
            <SummaryCard
              title="Paid Salaries"
              value={formatCurrency(paidSalaryAmount)}
              icon={<FaCheckCircle className="text-3xl text-green-600" />}
              valueClass="text-green-600"
            />
            <SummaryCard
              title="Pending Salaries"
              value={formatCurrency(pendingSalaryAmount)}
              icon={<FaClock className="text-3xl text-yellow-600" />}
              valueClass="text-yellow-600"
            />
            <SummaryCard
              title="Records"
              value={salarySummary?.overall?.totalRecords || 0}
              icon={<FaFileAlt className="text-3xl text-purple-600" />}
              valueClass="text-purple-600"
            />
          </>
        )}

        {activeTab === 'commissions' && (
          <>
            <SummaryCard
              title="Total Commissions"
              value={formatCurrency((commissionSummary?.overall?.totalAmount || 0) + pendingCommissionAmount)}
              icon={<FaPercent className="text-3xl text-blue-600" />}
            />
            <SummaryCard
              title="Paid Commissions"
              value={formatCurrency(paidCommissionAmount)}
              icon={<FaCheckCircle className="text-3xl text-green-600" />}
              valueClass="text-green-600"
            />
            <SummaryCard
              title="Pending Commissions"
              value={formatCurrency(pendingCommissionAmount)}
              icon={<FaClock className="text-3xl text-yellow-600" />}
              valueClass="text-yellow-600"
            />
            <SummaryCard
              title="Appointments"
              value={pendingCommissions.length}
              icon={<FaUserMd className="text-3xl text-purple-600" />}
              valueClass="text-purple-600"
            />
          </>
        )}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <FaSearch className="absolute left-3 top-3/4 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'expenses'
                  ? 'Search expenses...'
                  : activeTab === 'purchase-orders'
                  ? 'Search purchase orders...'
                  : activeTab === 'salaries'
                  ? 'Search salaries (doctor/period)...'
                  : 'Search commissions (doctor/patient/invoice)...'
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

          {/* Salary/Commission filters */}
          {(activeTab === 'salaries' || activeTab === 'commissions') && (
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <select
                  value={filters.doctorId}
                  onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Doctors</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.firstName} {doc.lastName} {doc.isFullTime ? '(Full-time)' : '(Part-time)'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Status */}
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
            ) : activeTab === 'salaries' || activeTab === 'commissions' ? (
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
                <option value="Partially Paid">Partially Paid</option>
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
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === 'expenses' && 'Expense Records'}
            {activeTab === 'purchase-orders' && 'Purchase Orders'}
            {activeTab === 'salaries' && 'Salary Records'}
            {activeTab === 'commissions' && 'Commission Records'}
          </h3>

          {activeTab === 'salaries' && selectedSalaryIds.size > 0 && (
            <button
              onClick={clearSelectedSalaries}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Clear Selection
            </button>
          )}

          {activeTab === 'commissions' && selectedCommissionIds.size > 0 && (
            <button
              onClick={clearSelectedCommissions}
              className="text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Clear Selection
            </button>
          )}
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
            onPay={(record) => openPayModal(record, 'salary')}
            selectedIds={selectedSalaryIds}
            toggleSelect={toggleSalarySelect}
            type="salary"
          />
        )}

        {activeTab === 'commissions' && (
          <CommissionTable
            commissions={filteredCommissionRecords}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
            onPay={(record) => openPayModal(record, 'commission')}
            selectedIds={selectedCommissionIds}
            toggleSelect={toggleCommissionSelect}
          />
        )}
      </div>

      {/* Pay modal */}
      {payModalOpen && (
        <Modal title={`Pay ${payType === 'salary' ? 'Salary' : 'Commission'}`} onClose={closePayModal}>
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              {payType === 'salary' ? (
                <>
                  <div className="font-semibold">
                    Doctor:{' '}
                    {payTarget?.doctor_id
                      ? `${payTarget.doctor_id.firstName || ''} ${payTarget.doctor_id.lastName || ''}`
                      : 'N/A'}
                  </div>
                  <div className="text-gray-600 capitalize">
                    Period: {payTarget?.period_type} •{' '}
                    {payTarget?.period_start ? new Date(payTarget.period_start).toLocaleDateString() : 'N/A'} to{' '}
                    {payTarget?.period_end ? new Date(payTarget.period_end).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="mt-1 font-bold">{formatCurrency(payTarget?.net_amount || 0)}</div>
                </>
              ) : (
                <>
                  <div className="font-semibold">
                    Doctor:{' '}
                    {payTarget?.doctor_id
                      ? `${payTarget.doctor_id.firstName || ''} ${payTarget.doctor_id.lastName || ''}`
                      : 'N/A'}
                  </div>
                  <div className="text-gray-600">
                    Patient: {payTarget?.patient_name || 'N/A'} • Invoice: {payTarget?.invoice_number || 'N/A'}
                  </div>
                  <div className="text-gray-600">
                    Consultation Fee: {formatCurrency(payTarget?.consultation_fee || 0)}
                  </div>
                  <div className="mt-1 font-bold">
                    Commission ({payTarget?.doctor_id?.revenuePercentage || 0}%): {formatCurrency(payTarget?.net_amount || 0)}
                  </div>
                </>
              )}
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
                <option value="cheque">Cheque</option>
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
                placeholder="Add payment notes..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={closePayModal} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submitPayment}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Process Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk pay modal */}
      {bulkPayOpen && (
        <Modal
          title={`Bulk Pay ${bulkPayType === 'salary' ? 'Salaries' : 'Commissions'} (${bulkPayType === 'salary' ? selectedSalaryIds.size : selectedCommissionIds.size})`}
          onClose={() => setBulkPayOpen(false)}
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              This will mark all selected {bulkPayType === 'salary' ? 'salary' : 'commission'} records as paid.
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
                <option value="cheque">Cheque</option>
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
                placeholder="Add payment notes..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setBulkPayOpen(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={submitBulkPay}
                disabled={(bulkPayType === 'salary' ? selectedSalaryIds.size : selectedCommissionIds.size) === 0}
                className={`px-4 py-2 rounded-lg ${
                  (bulkPayType === 'salary' ? selectedSalaryIds.size : selectedCommissionIds.size) === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                Process Bulk Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Expense Modal */}
      {addExpenseModalOpen && (
        <Modal title="Add New Expense" onClose={() => setAddExpenseModalOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Expense description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={newExpense.tax_rate}
                  onChange={(e) => setNewExpense({...newExpense, tax_rate: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={newExpense.payment_method}
                  onChange={(e) => setNewExpense({...newExpense, payment_method: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={newExpense.department}
                onChange={(e) => setNewExpense({...newExpense, department: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Department (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input
                type="text"
                value={newExpense.receipt_number}
                onChange={(e) => setNewExpense({...newExpense, receipt_number: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Receipt number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newExpense.notes}
                onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                className="w-full p-2 border rounded-lg"
                rows={2}
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddExpenseModalOpen(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={loading || !newExpense.description || !newExpense.amount}
                className={`px-4 py-2 rounded-lg ${
                  loading || !newExpense.description || !newExpense.amount
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {loading ? 'Adding...' : 'Add Expense'}
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
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense #</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {records.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.expense_number}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.date || '—'}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-2">
                {getCategoryIcon(r.category)}
                <span className="text-sm text-gray-900">{r.category}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">{r.description}</div>
              {r.department && <div className="text-sm text-gray-500">{r.department}</div>}
              {r.receipt_number && <div className="text-xs text-gray-400">Receipt: {r.receipt_number}</div>}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.vendor}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(r.total_amount)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(r.status)}>{r.status}</span>
              {r.approval_status !== 'Approved' && r.approval_status !== 'Pending' && (
                <div className="text-xs text-gray-500 mt-1">{r.approval_status}</div>
              )}
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.supplier_name || o.supplier_id?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {formatCurrency(o.total_amount || o.totalAmount || 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={getStatusBadge(o.status)}>{o.status}</span>
              {o.expected_delivery && o.status === 'Ordered' && (
                <div className="text-xs text-gray-500 mt-1">
                  Expected: {new Date(o.expected_delivery).toLocaleDateString()}
                </div>
              )}
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

// Salaries Table
const SalaryTable = ({ salaries, formatCurrency, getStatusBadge, onPay, selectedIds, toggleSelect, type }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
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
          const isPending = s.is_pending || statusLower === 'pending';

          return (
            <tr key={s._id} className={`hover:bg-gray-50 ${isPending ? 'bg-yellow-50' : ''}`}>
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.has(s._id)}
                  disabled={isPaid}
                  onChange={() => toggleSelect(s._id)}
                  className="h-4 w-4"
                  title={isPaid ? 'Already paid' : 'Select for bulk pay'}
                />
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{doctorName}</div>
                {doc.paymentType && (
                  <div className="text-xs text-gray-500">{doc.paymentType}</div>
                )}
                {isPending && (
                  <div className="text-xs text-yellow-600 font-medium mt-1">Pending</div>
                )}
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
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(s.status)}>{(s.status || '').toString()}</span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button className="text-teal-600 hover:text-teal-900 text-sm">
                    <FaEye className="inline mr-1" />
                    View
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => onPay(s)}
                      className="text-white bg-teal-600 hover:bg-teal-700 text-sm px-3 py-1 rounded-lg"
                    >
                      Pay
                    </button>
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

// Commissions Table
const CommissionTable = ({ commissions, formatCurrency, getStatusBadge, onPay, selectedIds, toggleSelect }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultation Fee</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {commissions.map((c) => {
          const doc = c.doctor_id || {};
          const doctorName = `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim() || 'N/A';
          const statusLower = (c.status || '').toString().toLowerCase();
          const isPaid = statusLower === 'paid';
          const isPending = c.is_pending || statusLower === 'pending';

          return (
            <tr key={c._id} className={`hover:bg-gray-50 ${isPending ? 'bg-yellow-50' : ''}`}>
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.has(c._id)}
                  disabled={isPaid}
                  onChange={() => toggleSelect(c._id)}
                  className="h-4 w-4"
                  title={isPaid ? 'Already paid' : 'Select for bulk pay'}
                />
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{doctorName}</div>
                <div className="text-xs text-gray-500">{doc.revenuePercentage || 0}%</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-600">{c.invoice_number || 'N/A'}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{c.patient_name || 'N/A'}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                  {c.appointment_date ? new Date(c.appointment_date).toLocaleDateString() : '—'}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700">{formatCurrency(c.consultation_fee || 0)}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-emerald-600">{formatCurrency(c.net_amount || c.amount || 0)}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(c.status)}>{(c.status || '').toString()}</span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <button className="text-teal-600 hover:text-teal-900 text-sm">
                    <FaEye className="inline mr-1" />
                    View
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => onPay(c)}
                      className="text-white bg-teal-600 hover:bg-teal-700 text-sm px-3 py-1 rounded-lg"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {commissions.length === 0 && (
      <EmptyState icon={<FaPercent className="text-4xl text-gray-300 mx-auto mb-4" />} title="No commission records found" />
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

const Row = ({ label, value, valueClass = 'text-gray-900' }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default ExpensePage;