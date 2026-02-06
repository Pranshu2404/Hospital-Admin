import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { SearchInput, Button } from '../common/FormElements';
import { EditIcon, DeleteIcon, UploadIcon, XIcon, PlusIcon, DownloadIcon } from '../common/Icons';
import { useNavigate, useLocation } from 'react-router-dom';

const IpdOpdPatientList = ({ setCurrentPage, setSelectedPatient, updatePatientBasePath = '/dashboard/admin/update-patient' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine base path for adding patient based on current role
  const addPatientPath = location.pathname.includes('/dashboard/staff')
    ? '/dashboard/staff/add-patient'
    : '/dashboard/admin/add-patient';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [patients, setPatients] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // State for upload messages and a ref for the file input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // NEW: State for export loading and dropdown
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);

  // Fetch patient data from API
  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients?limit=100`);
      const data = response.data;
      const patientArray = data.patients || [];

      const formatted = patientArray.map(p => ({
        id: p._id,
        patientId: p.patientId || 'N/A',
        name: `${p.salutation ? p.salutation + ' ' : ''}${p.first_name} ${p.last_name}`,
        age: calculateAge(p.dob),
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        type: p.patient_type ? p.patient_type.toUpperCase() : 'OPD',
        bloodGroup: p.blood_group || 'N/A',
        lastVisit: p.lastVisitDate
          ? new Date(p.lastVisitDate).toISOString().split('T')[0]
          : (p.registered_at ? new Date(p.registered_at).toISOString().split('T')[0] : 'N/A'),
        status: 'Active',
        image: p.patient_image,
        aadhaar_number: p.aadhaar_number || 'N/A',
        address: p.address || 'N/A',
        dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : 'N/A',
        registrationDate: p.registered_at ? new Date(p.registered_at).toISOString().split('T')[0] : 'N/A',
        totalAppointments: p.totalAppointments || 0,
        totalCollection: p.totalCollection || 0,
        department: p.lastVisitedDepartment || 'N/A',
      }));

      setPatients(formatted);
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      setPatients([]);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // NEW: Export patients to CSV
  const exportToCSV = () => {
    setIsExporting(true);
    setShowExportDropdown(false);

    try {
      // Prepare data for export
      const exportData = patients.map(patient => ({
        'Type': patient.type,
        'Patient ID': patient.patientId,
        'Name': patient.name,
        'Email': patient.email || 'N/A',
        'Phone': patient.phone,
        'Age': patient.age,
        'Date of Birth': patient.dob,
        'Gender': patient.gender,
        'Blood Group': patient.bloodGroup,
        'Aadhaar Number': patient.aadhaar_number,
        'Address': patient.address,
        'Registration Date': patient.registrationDate,
        'Department': patient.department,
        'Last Visit': patient.lastVisit,
        'Status': patient.status,
        'Total Appointments': patient.totalAppointments,
        'Total Collection': patient.totalCollection,
      }));

      // Create CSV content
      const headers = [
        'Type','Patient ID', 'Name','Phone', 'Email', 'Age','Date of Birth', 'Gender', 
         'Blood Group', 'Aadhaar Number',
         'Address', 'Registration Date','Department','Last Visit','Status',
        'Total Appointments', 'Total Collection', 
      ];

      const csvRows = [
        headers.join(','),
        ...exportData.map(row =>
          headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `patients_export_${timestamp}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export patient list. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // NEW: Export patients to Excel (using CSV with .xlsx extension as fallback)
  const exportToExcel = async () => {
    setIsExporting(true);
    setShowExportDropdown(false);

    try {
      // For a proper Excel export, you would typically use a library like xlsx
      // Here's a fallback using CSV with .xls extension
      const exportData = patients.map(patient => ({
        'Patient ID': patient.patientId,
        'Name': patient.name,
        'Age': patient.age,
        'Gender': patient.gender,
        'Phone': patient.phone,
        'Email': patient.email || 'N/A',
        'Type': patient.type,
        'Blood Group': patient.bloodGroup,
        'Last Visit': patient.lastVisit,
        'Aadhaar Number': patient.aadhaar_number,
        'Date of Birth': patient.dob,
        'Address': patient.address,
        'Status': patient.status,
        'Registration Date': patient.registrationDate,
        'Total Appointments': patient.totalAppointments,
        'Total Collection': patient.totalCollection,
        'Department': patient.department,
      }));

      const headers = [
        'Patient ID', 'Name', 'Age', 'Gender', 'Phone', 'Email',
        'Type', 'Blood Group', 'Last Visit', 'Aadhaar Number',
        'Date of Birth', 'Address', 'Status', 'Registration Date',
        'Total Appointments', 'Total Collection', 'Department'
      ];

      const csvRows = [
        headers.join('\t'), // Use tab delimiter for better Excel compatibility
        ...exportData.map(row =>
          headers.map(header => row[header]).join('\t')
        )
      ];

      const content = csvRows.join('\n');
      const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `patients_export_${timestamp}.xls`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export patient list. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // File upload and demo download logic
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log("Uploading data:", results.data);

          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/patients/bulk-add`,
            results.data
          );
          setUploadSuccess(response.data.message || 'Patients uploaded successfully!');
          fetchPatients();
          setTimeout(() => {
            setIsModalOpen(false);
            setUploadSuccess('');
          }, 2000);
        } catch (apiError) {
          console.error("Upload failed", apiError);
          setUploadError(apiError.response?.data?.message || 'An error occurred during upload.');
        } finally {
          event.target.value = null;
        }
      },
      error: (error) => {
        setUploadError(`CSV Parsing Error: ${error.message}`);
        event.target.value = null;
      },
    });
  };

  const downloadDemoCSV = () => {
    const headers = [
      'salutation', 'first_name', 'middle_name', 'last_name', 'email', 'phone',
      'gender', 'dob', 'patient_type', 'blood_group', 'address', 'city', 'state',
      'zipCode', 'village', 'district', 'tehsil', 'aadhaar_number',
      'emergency_contact', 'emergency_phone', 'medical_history', 'allergies', 'medications'
    ];

    const sampleRow = [
      'Mr.', 'Amit', 'Kumar', 'Sharma', 'amit.sharma@example.com', '9876543210',
      'male', '1990-05-15', 'opd', 'O+', '"123 Shastri Nagar"', 'Kanpur', 'Uttar Pradesh',
      '208001', 'N/A', 'Kanpur Nagar', 'Kanpur', '123456789012',
      'Rajesh Sharma', '9876543211', 'Hypertension', 'Peanuts', 'Amlodipine'
    ];

    const csvContent = headers.join(',') + '\n' + sampleRow.join(',');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'demo_patients_new_model.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getDateRangeFromFilter = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return { start: new Date(today), end: new Date(today) };
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: new Date(today) };
    } else if (dateFilter === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: monthStart, end: new Date(today) };
    } else if (dateFilter === 'custom') {
      return {
        start: customStartDate ? new Date(customStartDate) : null,
        end: customEndDate ? new Date(customEndDate) : null,
      };
    }
    return { start: null, end: null };
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.type && patient.type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || patient.type === filterType;

    let matchesDateFilter = true;
    if (dateFilter !== 'all') {
      const { start, end } = getDateRangeFromFilter();
      if (patient.lastVisit !== 'N/A') {
        const patientDate = new Date(patient.lastVisit);
        patientDate.setHours(0, 0, 0, 0);
        if (start && patientDate < start) matchesDateFilter = false;
        if (end && patientDate > end) matchesDateFilter = false;
      }
    }

    return matchesSearch && matchesFilter && matchesDateFilter;
  });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentPage('PatientProfile');
  };

  const getStatusBadge = (status) =>
    status === 'Active'
      ? 'px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'
      : 'px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full';

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Patient List</h2>
              <p className="text-gray-600 mt-1">Manage all patient records</p>
            </div>
            <div className="flex items-center gap-2">
              {/* FIXED: Export Dropdown with proper hover handling */}
              <div className="relative" ref={exportDropdownRef}>
                <Button
                  variant="outline"
                  disabled={isExporting}
                  className="flex items-center gap-2"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  onMouseEnter={() => setShowExportDropdown(true)}
                >
                  <DownloadIcon />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
                {showExportDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                    onMouseEnter={() => setShowExportDropdown(true)}
                    onMouseLeave={() => setShowExportDropdown(false)}
                  >
                    <button
                      onClick={exportToCSV}
                      disabled={isExporting || patients.length === 0}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Export to CSV</div>
                          <div className="text-xs text-gray-500">{patients.length} records</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={exportToExcel}
                      disabled={isExporting || patients.length === 0}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Export to Excel</div>
                          <div className="text-xs text-gray-500">{patients.length} records</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setUploadError('');
                  setUploadSuccess('');
                  setIsModalOpen(true);
                }}
              >
                <UploadIcon />
                Bulk Upload
              </Button>

              <Button
                variant="primary"
                onClick={() => navigate(addPatientPath)}
              >
                <PlusIcon />
                Add New Patient
              </Button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".csv"
          />
          {uploadSuccess && <div className="mt-2 p-3 text-sm text-green-800 bg-green-100 rounded-md">{uploadSuccess}</div>}
          {uploadError && <div className="mt-2 p-3 text-sm text-red-800 bg-red-100 rounded-md">{uploadError}</div>}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Patient ID, name, email, or phone..."
                className="flex-1"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Types</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Table with Patient ID Column */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                      {patient.patientId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {patient.image ? (
                        <img src={patient.image} alt={patient.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center border border-teal-200">
                          <span className="text-teal-600 font-medium text-sm">
                            {patient.name.replace(/(Mr\.|Mrs\.|Ms\.|Dr\.)/g, '').trim().split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.age} years, {patient.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${patient.type === 'IPD'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                      {patient.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="bg-gray-50 px-2 py-1 rounded border border-gray-200">
                      {patient.lastVisit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(patient.status)}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-teal-600 hover:text-teal-900 hover:bg-teal-50 p-2 rounded transition-colors"
                        title="View Patient"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate(`${updatePatientBasePath}/${patient.id}`)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors"
                        title="Edit Patient"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Delete Patient"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new patient.'}
              </p>
            </div>
          </div>
        )}

        {/* Patient Count Summary */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredPatients.length}</span> of <span className="font-medium">{patients.length}</span> patients
            </div>
            <div className="text-sm text-gray-600">
              {filterType !== 'all' && (
                <span className="mr-3">
                  Type: <span className="font-medium">{filterType}</span>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span>
                  Date: <span className="font-medium">{dateFilter}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Bulk Upload Patients</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                  <XIcon />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Upload patients using a CSV file.
              </p>

              <div className="bg-gray-50 p-3 rounded-md border overflow-x-auto mb-4">
                <table className="text-xs">
                  <thead className="bg-gray-200">
                    <tr>
                      {[
                        'salutation', 'first_name', 'middle_name', 'last_name', 'email', 'phone',
                        'gender', 'dob', 'patient_type', 'blood_group', 'address', 'city', 'state',
                        'zipCode', 'village', 'district', 'tehsil', 'aadhaar_number',
                        'emergency_contact', 'emergency_phone', 'medical_history', 'allergies', 'medications'
                      ].map((header) => (
                        <th key={header} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      {[
                        'Mr.', 'Amit', 'Kumar', 'Sharma', 'amit.s@ex.com', '9876543210',
                        'male', '1990-05-15', 'opd', 'O+', '123 St', 'Kanpur', 'UP',
                        '208001', 'N/A', 'Kanpur', 'Kanpur', '123456789012',
                        'Rajesh', '987...', 'None', 'None', 'None'
                      ].map((value, index) => (
                        <td key={index} className="px-3 py-2 text-gray-700 border-t whitespace-nowrap">
                          {value}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 mb-4">
                <Button variant="outline" onClick={downloadDemoCSV}>Download Demo CSV</Button>
                <Button variant="primary" onClick={() => fileInputRef.current?.click()}>Choose & Upload CSV</Button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv"
              />
              {uploadSuccess && <div className="mt-4 p-3 text-sm text-green-800 bg-green-100 rounded-md">{uploadSuccess}</div>}
              {uploadError && <div className="mt-4 p-3 text-sm text-red-800 bg-red-100 rounded-md">{uploadError}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IpdOpdPatientList;