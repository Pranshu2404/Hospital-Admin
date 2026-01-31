import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaUserMd,
  FaRupeeSign,
  FaReceipt,
  FaUserInjured,
  FaBuilding,
  FaFileInvoice,
  FaChartBar,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaSpinner
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const toISODate = (d) => new Date(d).toISOString().split('T')[0];

const RevenueStats = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState('');
  const [data, setData] = useState(null);

  // IMPORTANT: department filter is now DEPARTMENT_ID (string) or 'all'
  const [filters, setFilters] = useState({
    startDate: toISODate(new Date(new Date().setDate(new Date().getDate() - 30))),
    endDate: toISODate(new Date()),
    doctorId: 'all',
    departmentId: 'all',
    patientType: 'all',
    invoiceType: 'all',
    paymentMethod: 'all',
    invoiceStatus: 'all',
    minAmount: '',
    maxAmount: '',

    // Daily
    date: toISODate(new Date()),

    // Monthly
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,

    // Detailed
    page: 1,
    limit: 10,

    // Doctor/Department specific tabs
    selectedDoctor: '',
    selectedDepartment: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // ---------- Helpers ----------
  const formatCurrency = (amount) => {
    const n = Number(amount || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(n);
  };

  const safeDiv = (a, b) => {
    const x = Number(a || 0);
    const y = Number(b || 0);
    if (!y) return 0;
    return x / y;
  };

  const getDeptName = (deptIdOrUnknown) => {
    if (!deptIdOrUnknown || deptIdOrUnknown === 'Unknown') return 'Unknown';
    const found = departments.find((d) => String(d._id) === String(deptIdOrUnknown));
    return found?.name || 'Unknown';
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      // Reset pagination if changing filters relevant to detailed report
      if (
        ['startDate', 'endDate', 'doctorId', 'departmentId', 'invoiceType', 'invoiceStatus', 'minAmount', 'maxAmount'].includes(
          key
        )
      ) {
        next.page = 1;
      }
      return next;
    });
  };

  // ---------- Fetch dropdown options ----------
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${baseUrl}/doctors`);
      // support both array response or {data: []}
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDoctors(list);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${baseUrl}/departments`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDepartments(list);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Build API call ----------
  const buildRequest = () => {
    let url = '';
    let params = {};

    switch (activeTab) {
      case 'overview':
        url = `${baseUrl}/revenue`;
        params = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          doctorId: filters.doctorId,
          department: filters.departmentId,
          patientType: filters.patientType,
          invoiceType: filters.invoiceType,
          paymentMethod: filters.paymentMethod,
          invoiceStatus: filters.invoiceStatus,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount
        };
        break;

      case 'daily':
        url = `${baseUrl}/revenue/daily`;
        params = {
          date: filters.date,
          doctorId: filters.doctorId,
          department: filters.departmentId,
          invoiceType: filters.invoiceType,
          paymentMethod: filters.paymentMethod
        };
        break;

      case 'monthly':
        url = `${baseUrl}/revenue/monthly`;
        params = {
          year: filters.year,
          month: filters.month,
          doctorId: filters.doctorId,
          department: filters.departmentId,
          invoiceType: filters.invoiceType,
          paymentMethod: filters.paymentMethod,
          patientType: filters.patientType
        };
        break;

      case 'doctor':
        url = `${baseUrl}/revenue/doctor`;
        params = {
          doctorId: filters.selectedDoctor,
          startDate: filters.startDate,
          endDate: filters.endDate,
          invoiceType: filters.invoiceType
        };
        break;

      case 'department':
        url = `${baseUrl}/revenue/department`;
        params = {
          department: filters.selectedDepartment,
          startDate: filters.startDate,
          endDate: filters.endDate
        };
        break;

      case 'detailed':
        url = `${baseUrl}/revenue/detailed`;
        params = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          doctorId: filters.doctorId,
          department: filters.departmentId,
          invoiceType: filters.invoiceType,
          status: filters.invoiceStatus,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          page: filters.page,
          limit: filters.limit
        };
        break;

      default:
        url = `${baseUrl}/revenue`;
        params = {};
    }

    // Remove empty/unset values
    Object.keys(params).forEach((k) => {
      const v = params[k];
      if (v === '' || v === 'all' || v === undefined || v === null) delete params[k];
    });

    return { url, params };
  };

  const fetchData = async () => {
    // prevent errors: doctor tab requires doctor selected
    if (activeTab === 'doctor' && !filters.selectedDoctor) {
      setData(null);
      return;
    }
    // prevent errors: department tab requires department selected
    if (activeTab === 'department' && !filters.selectedDepartment) {
      setData(null);
      return;
    }

    setLoading(true);
    try {
      const { url, params } = buildRequest();
      const res = await axios.get(url, { params });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      alert(`Failed to load revenue data: ${err.response?.data?.error || err.message}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when tab changes OR pagination changes in detailed
  useEffect(() => {
    if (activeTab === 'detailed') {
      fetchData();
      return;
    }
    // for other tabs, do not auto-fetch on every filter keystroke. Only on tab change.
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters.page]);

  // ---------- Export Functions ----------
  const exportData = async (type) => {
    if (exportLoading) return;
    
    setExportLoading(true);
    setExportType(type);
    
    try {
      let exportUrl = '';
      let exportParams = {};
      let filename = '';
      
      // Build export parameters based on active tab
      switch (activeTab) {
        case 'overview':
          exportUrl = `${baseUrl}/revenue/export/overview`;
          exportParams = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            doctorId: filters.doctorId,
            department: filters.departmentId,
            patientType: filters.patientType,
            invoiceType: filters.invoiceType,
            paymentMethod: filters.paymentMethod,
            invoiceStatus: filters.invoiceStatus,
            minAmount: filters.minAmount,
            maxAmount: filters.maxAmount,
            exportType: type,
            includeBifurcation: true // Include hospital vs doctor revenue split
          };
          filename = `Revenue_Overview_${filters.startDate}_to_${filters.endDate}`;
          break;
          
        case 'daily':
          exportUrl = `${baseUrl}/revenue/export/daily`;
          exportParams = {
            date: filters.date,
            doctorId: filters.doctorId,
            department: filters.departmentId,
            invoiceType: filters.invoiceType,
            paymentMethod: filters.paymentMethod,
            exportType: type
          };
          filename = `Daily_Revenue_${filters.date}`;
          break;
          
        case 'monthly':
          exportUrl = `${baseUrl}/revenue/export/monthly`;
          exportParams = {
            year: filters.year,
            month: filters.month,
            doctorId: filters.doctorId,
            department: filters.departmentId,
            invoiceType: filters.invoiceType,
            paymentMethod: filters.paymentMethod,
            patientType: filters.patientType,
            exportType: type
          };
          filename = `Monthly_Revenue_${filters.year}_${filters.month}`;
          break;
          
        case 'doctor':
          if (!filters.selectedDoctor) {
            alert('Please select a doctor first');
            return;
          }
          exportUrl = `${baseUrl}/revenue/export/doctor`;
          exportParams = {
            doctorId: filters.selectedDoctor,
            startDate: filters.startDate,
            endDate: filters.endDate,
            invoiceType: filters.invoiceType,
            exportType: type
          };
          const selectedDoctor = doctors.find(d => d._id === filters.selectedDoctor);
          const doctorName = selectedDoctor ? `${selectedDoctor.firstName}_${selectedDoctor.lastName}` : 'Doctor';
          filename = `${doctorName}_Revenue_${filters.startDate}_to_${filters.endDate}`;
          break;
          
        case 'department':
          if (!filters.selectedDepartment) {
            alert('Please select a department first');
            return;
          }
          exportUrl = `${baseUrl}/revenue/export/department`;
          exportParams = {
            department: filters.selectedDepartment,
            startDate: filters.startDate,
            endDate: filters.endDate,
            exportType: type
          };
          const deptName = getDeptName(filters.selectedDepartment).replace(/\s+/g, '_');
          filename = `${deptName}_Revenue_${filters.startDate}_to_${filters.endDate}`;
          break;
          
        case 'detailed':
          exportUrl = `${baseUrl}/revenue/export/detailed`;
          exportParams = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            doctorId: filters.doctorId,
            department: filters.departmentId,
            invoiceType: filters.invoiceType,
            status: filters.invoiceStatus,
            minAmount: filters.minAmount,
            maxAmount: filters.maxAmount,
            exportType: type,
            includeCommissionSplit: true // Include commission calculations
          };
          filename = `Detailed_Revenue_${filters.startDate}_to_${filters.endDate}`;
          break;
          
        default:
          exportUrl = `${baseUrl}/revenue/export/overview`;
          exportParams = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            exportType: type
          };
          filename = `Revenue_Report_${filters.startDate}_to_${filters.endDate}`;
      }
      
      // Remove empty values
      Object.keys(exportParams).forEach((k) => {
        if (exportParams[k] === '' || exportParams[k] === 'all' || exportParams[k] === undefined) {
          delete exportParams[k];
        }
      });
      
      // Set response type based on export type
      const config = {
        params: exportParams,
        responseType: type === 'pdf' ? 'blob' : 'blob'
      };
      
      const res = await axios.get(exportUrl, config);
      
      // Create download
      const blob = new Blob([res.data], {
        type: type === 'pdf' ? 'application/pdf' : 
               type === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
               'text/csv'
      });
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setExportLoading(false);
      setExportType('');
    }
  };

  // Quick export function for CSV
  const quickExport = async () => {
    await exportData('csv');
  };

  // ---------- Charts colors ----------
  const pieColors = useMemo(
    () => ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
    []
  );

  // ---------- Revenue Bifurcation Display ----------
  const renderRevenueBifurcation = () => {
    if (!data || !data.summary) return null;
    
    const totalRevenue = data.summary.totalRevenue || 0;
    const doctorRevenue = data.summary.doctorRevenue || 0;
    const hospitalRevenue = data.summary.hospitalRevenue || 0;
    const expenses = data.summary.totalSalaryExpenses || 0;
    const netHospitalRevenue = hospitalRevenue - expenses;
    
    // If no bifurcation data, calculate based on typical splits
    const displayDoctorRevenue = doctorRevenue > 0 ? doctorRevenue : totalRevenue * 0.3; // 30% to doctor if not specified
    const displayHospitalRevenue = hospitalRevenue > 0 ? hospitalRevenue : totalRevenue * 0.7; // 70% to hospital
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <FaMoneyBillWave /> Revenue Bifurcation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Revenue</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">100%</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Doctor's Share</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                {totalRevenue > 0 ? ((displayDoctorRevenue / totalRevenue) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(displayDoctorRevenue)}</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: totalRevenue > 0 ? `${(displayDoctorRevenue / totalRevenue) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Hospital's Share</span>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                {totalRevenue > 0 ? ((displayHospitalRevenue / totalRevenue) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(displayHospitalRevenue)}</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full" 
                style={{ width: totalRevenue > 0 ? `${(displayHospitalRevenue / totalRevenue) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-teal-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Net Hospital Revenue</span>
              <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded">
                After Expenses
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(netHospitalRevenue)}</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full" 
                style={{ width: totalRevenue > 0 ? `${(Math.max(0, netHospitalRevenue) / totalRevenue) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Detailed breakdown */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-bold text-blue-700 mb-2">Detailed Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Doctor Commission (Consultants)</span>
                <span className="font-medium text-gray-800">
                  {data.summary.partTimeDoctorCommission 
                    ? formatCurrency(data.summary.partTimeDoctorCommission)
                    : formatCurrency(displayDoctorRevenue * 0.8)} {/* 80% of doctor share */}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Full-time Doctor Salaries</span>
                <span className="font-medium text-gray-800">
                  {data.summary.fullTimeSalaryExpenses 
                    ? formatCurrency(data.summary.fullTimeSalaryExpenses)
                    : formatCurrency(displayDoctorRevenue * 0.2)} {/* 20% of doctor share */}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hospital Operational Expenses</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(expenses)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Net Profit Margin</span>
                <span className={`font-medium ${netHospitalRevenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalRevenue > 0 ? ((netHospitalRevenue / totalRevenue) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render: Overview ----------
  const renderOverview = () => {
    if (!data) return null;

    const totalRevenue = data.summary?.totalRevenue || 0;

    const pieData = [
      { name: 'Appointments', value: data.summary?.appointmentRevenue || 0 },
      { name: 'Pharmacy', value: data.summary?.pharmacyRevenue || 0 },
      { name: 'Procedures', value: data.summary?.procedureRevenue || 0 },
      { name: 'Other', value: data.summary?.otherRevenue || 0 }
    ].filter((x) => Number(x.value) > 0);

    return (
      <div className="space-y-6">
        {/* Revenue Bifurcation Section */}
        {renderRevenueBifurcation()}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <FaMoneyBillWave className="text-blue-500 text-2xl" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {data.counts?.totalInvoices || 0} invoices
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Net Revenue</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(data.summary?.netRevenue || 0)}
                </p>
              </div>
              <FaChartLine className="text-green-500 text-2xl" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Profit margin: {Number(data.metrics?.profitMargin || 0).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Expenses</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {formatCurrency(data.summary?.totalSalaryExpenses || 0)}
                </p>
              </div>
              <FaReceipt className="text-purple-500 text-2xl" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {data.counts?.salariesPaid || 0} salaries paid
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {Number(data.summary?.collectionRate || 0).toFixed(1)}%
                </p>
              </div>
              <FaRupeeSign className="text-teal-500 text-2xl" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Paid invoices: {data.breakdown?.byStatus?.paid?.invoices || 0}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-gray-800 mb-4">Revenue by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData.length ? pieData : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {(pieData.length ? pieData : [{ name: 'No Data', value: 1 }]).map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-gray-800 mb-4">Daily Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.breakdown?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserMd className="text-blue-500" /> Top Performing Doctors
            </h3>
            <div className="space-y-3">
              {(data.topPerformers?.doctors || []).map((doctor, index) => (
                <div
                  key={doctor.doctorId || index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{doctor.name}</p>
                      <p className="text-xs text-gray-500">
                        {doctor.department && doctor.department !== 'Unknown'
                          ? getDeptName(doctor.department)
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(doctor.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      {doctor.commission 
                        ? `Commission: ${formatCurrency(doctor.commission)}`
                        : doctor.specialization || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
              {!data.topPerformers?.doctors?.length && (
                <div className="text-sm text-gray-500">No doctor data for selected filters.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserInjured className="text-purple-500" /> Top Patients
            </h3>
            <div className="space-y-3">
              {(data.topPerformers?.patients || []).map((patient, index) => (
                <div
                  key={patient.patientId || index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{patient.name}</p>
                      <p className="text-xs text-gray-500">
                        {patient.type || 'Unknown'} • {patient.visits || 0} visits
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(patient.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      Avg:{' '}
                      {formatCurrency(
                        safeDiv(patient.revenue, patient.visits || 0)
                      )}
                    </p>
                  </div>
                </div>
              ))}
              {!data.topPerformers?.patients?.length && (
                <div className="text-sm text-gray-500">No patient data for selected filters.</div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Avg. Invoice Value</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(data.metrics?.averageInvoiceValue || 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Avg. Daily Revenue</p>
              <p className="text-xl font-bold text-gray-800">
                {formatCurrency(data.metrics?.averageDailyRevenue || 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Expense Ratio</p>
              <p className="text-xl font-bold text-gray-800">
                {Number(data.metrics?.expenseRatio || 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Unique Patients</p>
              <p className="text-xl font-bold text-gray-800">{data.counts?.uniquePatients || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render: Daily ----------
  const renderDailyReport = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Revenue Bifurcation for Daily */}
        {renderRevenueBifurcation()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(data.summary?.totalRevenue || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Net Income</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(data.summary?.netRevenue || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <p className="text-sm text-gray-600">Profit Margin</p>
            <p className="text-2xl font-bold text-gray-800">
              {Number(data.summary?.profitMargin || 0).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-4">Hourly Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.breakdown?.byHour || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-4">Doctor Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor's Share</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital's Share</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data.breakdown?.byDoctor || []).map((doc, idx) => (
                  <tr key={doc.doctorId || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {doc.department && doc.department !== 'Unknown'
                        ? getDeptName(doc.department)
                        : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {formatCurrency(doc.revenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      {formatCurrency(doc.commission || doc.revenue * 0.3)}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      {formatCurrency(doc.hospitalShare || doc.revenue * 0.7)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{doc.invoices || 0}</td>
                  </tr>
                ))}
                {!data.breakdown?.byDoctor?.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-sm text-gray-500">
                      No doctor breakdown for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {(data.invoices || []).slice(0, 5).map((inv, idx) => (
              <div
                key={inv.invoice_number || idx}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">{inv.invoice_number}</p>
                  <p className="text-xs text-gray-500">
                    {inv.patient} • {inv.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(inv.amount)}</p>
                  <p className="text-xs text-gray-500">
                    {inv.status} • {inv.payment_method}
                    {inv.commission_percentage && (
                      <span className="ml-2 text-green-600">
                        (Doctor: {inv.commission_percentage}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {!data.invoices?.length && (
              <div className="text-sm text-gray-500">No invoices for selected day/filters.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render: Monthly ----------
  const renderMonthlyReport = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Revenue Bifurcation for Monthly */}
        {renderRevenueBifurcation()}

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(data.summary?.totalRevenue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(data.summary?.netRevenue || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expense Ratio</p>
              <p className="text-2xl font-bold text-gray-800">
                {Number(data.summary?.expenseRatio || 0).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Business Days</p>
              <p className="text-2xl font-bold text-gray-800">{data.counts?.businessDays || 0}</p>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Weekly Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {(data.breakdown?.weekly || []).map((week) => (
                <div key={week.week} className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm font-medium text-gray-700">Week {week.week}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(week.revenue)}</p>
                  <p className="text-xs text-gray-500">
                    Days {week.startDay}-{week.endDay}
                  </p>
                </div>
              ))}
              {!data.breakdown?.weekly?.length && (
                <div className="text-sm text-gray-500">No weekly data.</div>
              )}
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-4">Daily Revenue</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.breakdown?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#00C49F" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Doctors in Month */}
          <div className="bg-white p-4 rounded-lg border mt-6">
            <h4 className="font-semibold text-gray-800 mb-4">Top Doctors (Month)</h4>
            <div className="space-y-2">
              {(data.breakdown?.byDoctor || []).slice(0, 8).map((d) => (
                <div key={d.doctorId} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      {d.department && d.department !== 'Unknown' ? getDeptName(d.department) : 'Unknown'} •{' '}
                      {d.specialization || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(d.revenue)}</div>
                    <div className="text-xs text-gray-500">
                      <span className="text-green-600">Doctor: {formatCurrency(d.commission || d.revenue * 0.3)}</span>
                      {' • '}
                      <span className="text-blue-600">Hospital: {formatCurrency(d.hospitalShare || d.revenue * 0.7)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!data.breakdown?.byDoctor?.length && (
                <div className="text-sm text-gray-500">No doctor data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render: Doctor ----------
  const renderDoctorRevenue = () => {
    if (!filters.selectedDoctor) {
      return (
        <div className="bg-white p-4 rounded-lg border text-sm text-gray-600">
          Please select a doctor and click <b>Apply Filters</b>.
        </div>
      );
    }

    if (!data || !data.doctor) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{data.doctor.name}</h2>
              <p className="text-gray-600">
                {data.doctor.department && data.doctor.department !== 'Unknown'
                  ? getDeptName(data.doctor.department)
                  : 'Unknown'}{' '}
                • {data.doctor.specialization || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">License: {data.doctor.licenseNumber || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.summary?.totalRevenue || 0)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>

          {/* Doctor Revenue Bifurcation */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-bold text-blue-800 mb-4">Revenue Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Doctor's Commission</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary?.doctorCommission || data.summary?.totalRevenue * 0.3)}
                </p>
                <p className="text-xs text-gray-500">
                  {data.doctor.revenuePercentage 
                    ? `${data.doctor.revenuePercentage}% of revenue`
                    : '30% of revenue (estimated)'}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Hospital's Share</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.summary?.hospitalShare || data.summary?.totalRevenue * 0.7)}
                </p>
                <p className="text-xs text-gray-500">
                  {data.doctor.revenuePercentage 
                    ? `${100 - data.doctor.revenuePercentage}% of revenue`
                    : '70% of revenue (estimated)'}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.doctor.revenuePercentage || 30}%
                </p>
                <p className="text-xs text-gray-500">
                  {data.doctor.isFullTime ? 'Full-time Salary' : 'Part-time Commission'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-600">Total Invoices</p>
              <p className="text-xl font-bold text-gray-800">{data.summary?.totalInvoices || 0}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-sm text-green-600">Unique Patients</p>
              <p className="text-xl font-bold text-gray-800">{data.summary?.uniquePatients || 0}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-600">Avg/Patient</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.summary?.averageRevenuePerPatient || 0)}</p>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded">
              <p className="text-sm text-teal-600">Avg/Visit</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.summary?.averageRevenuePerVisit || 0)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-4">Service Breakdown</h4>
            <div className="space-y-2">
              {(data.breakdown?.byService || []).map((s, idx) => (
                <div key={`${s.service}-${idx}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{s.service}</span>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(s.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      {s.percentage}% of total • 
                      <span className="ml-2 text-green-600">
                        Doctor: {formatCurrency(s.revenue * (data.doctor.revenuePercentage || 30) / 100)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              {!data.breakdown?.byService?.length && (
                <div className="text-sm text-gray-500">No service breakdown found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render: Department ----------
  const renderDepartmentRevenue = () => {
    if (!filters.selectedDepartment) {
      return (
        <div className="bg-white p-4 rounded-lg border text-sm text-gray-600">
          Please select a department and click <b>Apply Filters</b>.
        </div>
      );
    }

    if (!data) return null;

    const deptName = getDeptName(filters.selectedDepartment);

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{deptName}</h2>
              <p className="text-sm text-gray-500">
                Period: {filters.startDate} to {filters.endDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.summary?.totalRevenue || 0)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>

          {/* Department Revenue Bifurcation */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-bold text-blue-800 mb-4">Department Revenue Split</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Total Doctors Commission</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary?.totalDoctorCommission || data.summary?.totalRevenue * 0.35)}
                </p>
                <p className="text-xs text-gray-500">
                  Combined commission for all doctors
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Hospital Net Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.summary?.hospitalNetRevenue || data.summary?.totalRevenue * 0.65)}
                </p>
                <p className="text-xs text-gray-500">
                  After deducting doctor commissions
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">Avg Commission Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.summary?.averageCommissionRate || 35}%
                </p>
                <p className="text-xs text-gray-500">
                  Average across all doctors
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-600">Total Invoices</p>
              <p className="text-xl font-bold text-gray-800">{data.summary?.totalInvoices || 0}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-sm text-green-600">Active Doctors</p>
              <p className="text-xl font-bold text-gray-800">{data.summary?.activeDoctors || 0}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-600">Avg/Doctor</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.summary?.averageRevenuePerDoctor || 0)}</p>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded">
              <p className="text-sm text-teal-600">Total Doctors</p>
              <p className="text-xl font-bold text-gray-800">{data.summary?.totalDoctors || 0}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-4">Doctors Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(data.breakdown?.byDoctor || []).map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{d.specialization || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(d.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(d.commission || d.revenue * 0.3)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{d.commissionPercentage || '30%'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{d.invoices || 0}</td>
                    </tr>
                  ))}
                  {!data.breakdown?.byDoctor?.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-sm text-gray-500">
                        No doctor data found for this department/period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Render: Detailed ----------
  const renderDetailedReport = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Revenue Bifurcation for Detailed */}
        {renderRevenueBifurcation()}

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.summary?.totalRevenue || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.summary?.totalPaid || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.summary?.totalPending || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Invoices (page)</p>
              <p className="text-xl font-bold text-gray-800">{data.summary?.totalInvoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(data.transactions || []).map((t, idx) => (
                  <tr key={t.invoice_number || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {t.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.issue_date ? new Date(t.issue_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.patient?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.doctor?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          t.invoice_type === 'Appointment'
                            ? 'bg-blue-100 text-blue-800'
                            : t.invoice_type === 'Pharmacy'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {t.invoice_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          t.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(t.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {t.commission 
                        ? `${formatCurrency(t.commission)} (${t.commission_percentage || '30'}%)`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.payment_method || 'N/A'}
                    </td>
                  </tr>
                ))}
                {!data.transactions?.length && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-sm text-gray-500">
                      No transactions found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.pagination && (
            <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                  className={`px-3 py-1 text-sm rounded border ${
                    filters.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page >= data.pagination.totalPages}
                  className={`px-3 py-1 text-sm rounded border ${
                    filters.page >= data.pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'daily':
        return renderDailyReport();
      case 'monthly':
        return renderMonthlyReport();
      case 'doctor':
        return renderDoctorRevenue();
      case 'department':
        return renderDepartmentRevenue();
      case 'detailed':
        return renderDetailedReport();
      default:
        return renderOverview();
    }
  };

  // ---------- Filters UI ----------
  const commonFilters = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
        <select
          value={filters.doctorId}
          onChange={(e) => handleFilterChange('doctorId', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Doctors</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.firstName} {d.lastName}{' '}
              {d.department ? `(${getDeptName(d.department)})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          value={filters.departmentId}
          onChange={(e) => handleFilterChange('departmentId', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
        <select
          value={filters.invoiceType}
          onChange={(e) => handleFilterChange('invoiceType', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="Appointment">Appointment</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Procedure">Procedure</option>
        </select>
      </div>
    </>
  );

  const renderFilters = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {commonFilters}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Type</label>
              <select
                value={filters.patientType}
                onChange={(e) => handleFilterChange('patientType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Patients</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.invoiceStatus}
                onChange={(e) => handleFilterChange('invoiceStatus', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Issued">Issued</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            {commonFilters}
          </div>
        );

      case 'monthly':
        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value, 10))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value, 10))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                min="2020"
                max="2035"
              />
            </div>
            {commonFilters}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Type</label>
              <select
                value={filters.patientType}
                onChange={(e) => handleFilterChange('patientType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Patients</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <select
                value={filters.selectedDoctor}
                onChange={(e) => handleFilterChange('selectedDoctor', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.firstName} {d.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
              <select
                value={filters.invoiceType}
                onChange={(e) => handleFilterChange('invoiceType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="Appointment">Appointment</option>
                <option value="Procedure">Procedure</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>
          </div>
        );

      case 'department':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
              <select
                value={filters.selectedDepartment}
                onChange={(e) => handleFilterChange('selectedDepartment', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value, 10))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {commonFilters}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.invoiceStatus}
                onChange={(e) => handleFilterChange('invoiceStatus', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Issued">Issued</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ---------- Reset ----------
  const resetFilters = () => {
    setFilters({
      startDate: toISODate(new Date(new Date().setDate(new Date().getDate() - 30))),
      endDate: toISODate(new Date()),
      doctorId: 'all',
      departmentId: 'all',
      patientType: 'all',
      invoiceType: 'all',
      paymentMethod: 'all',
      invoiceStatus: 'all',
      minAmount: '',
      maxAmount: '',
      date: toISODate(new Date()),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      page: 1,
      limit: 10,
      selectedDoctor: '',
      selectedDepartment: ''
    });
    setData(null);
  };

  // ---------- Export Dropdown Component ----------
  const ExportDropdown = () => (
    <div className="relative group">
      <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
        {exportLoading ? (
          <>
            <FaSpinner className="animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FaDownload />
            Export
          </>
        )}
      </button>
      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-2">
          <button
            onClick={() => exportData('csv')}
            disabled={exportLoading}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FaFileCsv className="text-green-600" />
            Export as CSV
          </button>
          <button
            onClick={() => exportData('excel')}
            disabled={exportLoading}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FaFileExcel className="text-green-700" />
            Export as Excel
          </button>
          <button
            onClick={() => exportData('pdf')}
            disabled={exportLoading}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FaFilePdf className="text-red-600" />
            Export as PDF
          </button>
          <div className="border-t border-gray-200 mt-1 pt-1">
            <button
              onClick={quickExport}
              disabled={exportLoading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <FaDownload className="text-teal-600" />
              Quick Export (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-teal-600" />
            Revenue Analytics Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive revenue analysis with income bifurcation and export options</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {/* Tabs */}
        <div className="flex flex-wrap border-b">
          {[
            { id: 'overview', label: 'Overview', icon: <FaChartBar /> },
            { id: 'daily', label: 'Daily Report', icon: <FaCalendarAlt /> },
            { id: 'monthly', label: 'Monthly Report', icon: <FaChartLine /> },
            { id: 'doctor', label: 'Doctor Wise', icon: <FaUserMd /> },
            { id: 'department', label: 'Department Wise', icon: <FaBuilding /> },
            { id: 'detailed', label: 'Detailed Report', icon: <FaFileInvoice /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                handleFilterChange('page', 1);
              }}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600 bg-teal-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter /> Filters
            </h3>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Apply Filters'}
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>

          {renderFilters()}
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Export Status */}
      {exportLoading && (
        <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <FaSpinner className="animate-spin" />
          <span>Exporting {exportType.toUpperCase()} report...</span>
        </div>
      )}
    </div>
  );
};

export default RevenueStats;