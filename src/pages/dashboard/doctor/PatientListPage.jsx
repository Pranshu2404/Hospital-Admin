import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaThLarge, FaList, FaUser, FaMars, FaVenus,
  FaClock, FaTint, FaStethoscope, FaFilter, FaSortAlphaDown,
  FaDownload, FaFileCsv, FaFileExcel
} from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

const PatientListPage = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [viewType, setViewType] = useState("grid");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const navigate = useNavigate();

  const doctorId = localStorage.getItem("doctorId");
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`
        );

        if (Array.isArray(res.data)) {
          // Filter only completed/past appointments to find patients
          const pastAppointments = res.data.filter((appt) =>
            dayjs(appt.appointment_date).isBefore(dayjs())
          );

          // Map patients with last visit date to deduplicate
          const patientMap = {};
          pastAppointments.forEach((appt) => {
            const patient = appt.patient_id;
            if (!patient) return;
            const patientId = patient.patientId;

            // Update if patient not in map OR this appointment is more recent
            if (
              !patientMap[patientId] ||
              dayjs(appt.appointment_date).isAfter(
                dayjs(patientMap[patientId].lastVisitRaw)
              )
            ) {
              patientMap[patientId] = {
                id: patient.patient_id || patientId,
                patientId: patient.patient_id || patientId,
                mongoId: patientId,
                name: `${patient.first_name || ""} ${patient.last_name || ""}`.trim(),
                firstName: patient.first_name || "",
                lastName: patient.last_name || "",
                age: patient.dob ? dayjs().diff(dayjs(patient.dob), "year") : "-",
                dob: patient.dob ? dayjs(patient.dob).format("YYYY-MM-DD") : "N/A",
                gender: patient.gender || "-",
                bloodGroup: patient.blood_group || "-",
                phone: patient.phone || "N/A",
                email: patient.email || "N/A",
                diagnosis: appt.diagnosis || "Regular Checkup",
                lastVisit: dayjs(appt.appointment_date).format("MMM DD, YYYY"),
                lastVisitDate: dayjs(appt.appointment_date).format("YYYY-MM-DD"),
                lastVisitRaw: appt.appointment_date,
                image: patient.profile_image,
                address: patient.address || "N/A",
                city: patient.city || "N/A",
                state: patient.state || "N/A",
                aadhaarNumber: patient.aadhaar_number || "N/A",
                medicalHistory: patient.medical_history || "N/A",
                allergies: patient.allergies || "N/A",
                medications: patient.medications || "N/A",
                patientType: patient.patient_type || "opd",
                registeredDate: patient.registered_at ? dayjs(patient.registered_at).format("YYYY-MM-DD") : "N/A"
              };
            }
          });

          setPatients(Object.values(patientMap));
        }
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

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

  // Export to CSV function
  const exportToCSV = () => {
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const exportData = patients.map(patient => ({
        'Patient ID': patient.patientId,
        'Name': patient.name,
        'First Name': patient.firstName,
        'Last Name': patient.lastName,
        'Age': patient.age,
        'Date of Birth': patient.dob,
        'Gender': patient.gender,
        'Blood Group': patient.bloodGroup,
        'Phone': patient.phone,
        'Email': patient.email,
        'Last Visit': patient.lastVisitDate,
        'Last Diagnosis': patient.diagnosis,
        'Address': patient.address,
        'City': patient.city,
        'State': patient.state,
        'Aadhaar Number': patient.aadhaarNumber,
        'Medical History': patient.medicalHistory,
        'Allergies': patient.allergies,
        'Medications': patient.medications,
        'Patient Type': patient.patientType.toUpperCase(),
        'Registered Date': patient.registeredDate
      }));

      const headers = [
        'Patient ID', 'Name', 'First Name', 'Last Name', 'Age', 'Date of Birth',
        'Gender', 'Blood Group', 'Phone', 'Email', 'Last Visit', 'Last Diagnosis',
        'Address', 'City', 'State', 'Aadhaar Number', 'Medical History',
        'Allergies', 'Medications', 'Patient Type', 'Registered Date'
      ];
      
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `my_patients_export_${timestamp}.csv`;
      
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

  // Export to Excel function
  const exportToExcel = () => {
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const exportData = patients.map(patient => ({
        'Patient ID': patient.patientId,
        'Name': patient.name,
        'First Name': patient.firstName,
        'Last Name': patient.lastName,
        'Age': patient.age,
        'Date of Birth': patient.dob,
        'Gender': patient.gender,
        'Blood Group': patient.bloodGroup,
        'Phone': patient.phone,
        'Email': patient.email,
        'Last Visit': patient.lastVisitDate,
        'Last Diagnosis': patient.diagnosis,
        'Address': patient.address,
        'City': patient.city,
        'State': patient.state,
        'Aadhaar Number': patient.aadhaarNumber,
        'Medical History': patient.medicalHistory,
        'Allergies': patient.allergies,
        'Medications': patient.medications,
        'Patient Type': patient.patientType.toUpperCase(),
        'Registered Date': patient.registeredDate
      }));

      const headers = [
        'Patient ID', 'Name', 'First Name', 'Last Name', 'Age', 'Date of Birth',
        'Gender', 'Blood Group', 'Phone', 'Email', 'Last Visit', 'Last Diagnosis',
        'Address', 'City', 'State', 'Aadhaar Number', 'Medical History',
        'Allergies', 'Medications', 'Patient Type', 'Registered Date'
      ];
      
      const csvRows = [
        headers.join('\t'),
        ...exportData.map(row => 
          headers.map(header => row[header]).join('\t')
        )
      ];

      const content = csvRows.join('\n');
      const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `my_patients_export_${timestamp}.xls`;
      
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

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.phone && p.phone.includes(search))
  );

  // --- SUB-COMPONENTS ---

  const PatientCard = ({ p }) => (
    <div
      onClick={() => navigate(`/dashboard/doctor/patients/${p.mongoId}`)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 group-hover:border-teal-100 transition-colors"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-50 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors">
                <FaUser size={24} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
              {p.gender === 'Male' ? <FaMars className="text-blue-500 text-xs" /> :
                p.gender === 'Female' ? <FaVenus className="text-pink-500 text-xs" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-teal-700 transition-colors">{p.name}</h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 mt-1 inline-block">
              ID: {p.patientId}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
          <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">Age</span>
          <span className="text-sm font-semibold text-slate-700">{p.age} Yrs</span>
        </div>
        <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center flex flex-col items-center justify-center">
          <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Blood</span>
          <div className="flex items-center gap-1">
            <FaTint className="text-red-500 text-xs" />
            <span className="text-sm font-semibold text-slate-700">{p.bloodGroup}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FaStethoscope className="text-teal-500 text-xs" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Recent Diagnosis</span>
          </div>
          <p className="text-sm text-slate-700 font-medium truncate bg-teal-50/50 px-2 py-1 rounded border border-teal-100/50">
            {p.diagnosis}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Last Visit</span>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-full">
            <FaClock className="text-slate-400" /> {p.lastVisit}
          </div>
        </div>
      </div>
    </div>
  );

  const PatientListItem = ({ p }) => (
    <div
      onClick={() => navigate(`/dashboard/doctor/patients/${p.mongoId}`)}
      className="bg-white p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-4 last:border-0 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
        {p.image ? (
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <FaUser className="text-slate-400 text-sm" />
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{p.name}</h4>
          <span className="text-xs text-slate-500 font-mono">ID: {p.patientId}</span>
        </div>

        <div className="text-sm text-slate-600">
          <span className="md:hidden text-xs text-slate-400 mr-2">Info:</span>
          {p.age} yrs, {p.gender}
        </div>

        <div>
          <div className="text-xs text-slate-400 mb-0.5 md:hidden">Blood Group</div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <FaTint className="mr-1" size={10} /> {p.bloodGroup}
          </span>
        </div>

        <div>
          <div className="text-xs text-slate-400 mb-0.5 md:hidden">Diagnosis</div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 truncate max-w-[150px]">
            {p.diagnosis}
          </span>
        </div>

        <div className="text-right md:text-left">
          <div className="text-xs text-slate-400 mb-0.5 md:hidden">Last Visit</div>
          <span className="text-sm text-slate-500 font-medium flex items-center gap-1 md:justify-start justify-end">
            <FaClock className="text-slate-300" size={12} /> {p.lastVisit}
          </span>
        </div>
      </div>
    </div>
  );

  // --- RENDER ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-2 bg-slate-50/50 min-h-screen font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Patients</h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage your patient history</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={isExporting || patients.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onMouseEnter={() => setShowExportDropdown(true)}
            >
              <FaDownload className="text-slate-500" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            {showExportDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-10"
                onMouseEnter={() => setShowExportDropdown(true)}
                onMouseLeave={() => setShowExportDropdown(false)}
              >
                <button
                  onClick={exportToCSV}
                  disabled={isExporting || patients.length === 0}
                  className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-green-600">
                      <FaFileCsv />
                    </div>
                    <div>
                      <div className="font-medium">Export to CSV</div>
                      <div className="text-xs text-slate-500">{patients.length} patient records</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={isExporting || patients.length === 0}
                  className="block w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      <FaFileExcel />
                    </div>
                    <div>
                      <div className="font-medium">Export to Excel</div>
                      <div className="text-xs text-slate-500">{patients.length} patient records</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex">
            <button
              onClick={() => setViewType("grid")}
              className={`p-2 rounded transition-all ${viewType === 'grid' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`p-2 rounded transition-all ${viewType === 'list' ? 'bg-teal-50 text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "active" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            All Patients <span className="ml-2 bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">{patients.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "inactive" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Recent <span className="ml-2 bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">0</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
              placeholder="Search by name, ID, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Total Patients</div>
          <div className="text-2xl font-bold text-slate-800">{patients.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Male Patients</div>
          <div className="text-2xl font-bold text-blue-600">
            {patients.filter(p => p.gender === 'male').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Female Patients</div>
          <div className="text-2xl font-bold text-pink-600">
            {patients.filter(p => p.gender === 'female').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Last 30 Days</div>
          <div className="text-2xl font-bold text-teal-600">
            {patients.filter(p => {
              const lastVisit = dayjs(p.lastVisitDate);
              return lastVisit.isAfter(dayjs().subtract(30, 'day'));
            }).length}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {filtered.length > 0 ? (
        viewType === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <PatientCard key={i} p={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-[48px_1fr] gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="hidden md:block"></span>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <span>Name / ID</span>
                <span>Demographics</span>
                <span>Blood Group</span>
                <span>Latest Diagnosis</span>
                <span>Last Visit</span>
              </div>
            </div>
            {filtered.map((p, i) => (
              <PatientListItem key={i} p={p} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-slate-300 text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">No patients found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your search query</p>
        </div>
      )}

      {/* Footer Summary */}
      {filtered.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-600 mb-2 md:mb-0">
              Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of <span className="font-semibold text-slate-800">{patients.length}</span> patients
              {search && <span className="ml-2 text-teal-600">(filtered by: "{search}")</span>}
            </div>
            <div className="text-xs text-slate-500">
              Data exported includes: Patient ID, Name, Demographics, Contact, Diagnosis, and Medical History
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientListPage;