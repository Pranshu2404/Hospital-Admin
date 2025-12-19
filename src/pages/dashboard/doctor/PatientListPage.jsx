import React, { useState, useEffect } from "react";
import { 
  FaSearch, FaThLarge, FaList, FaUser, FaMars, FaVenus, 
  FaClock, FaTint, FaStethoscope, FaFilter, FaSortAlphaDown 
} from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

const PatientListPage = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'inactive'
  const [viewType, setViewType] = useState("grid"); // 'grid' or 'list'
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = localStorage.getItem("doctorId");

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

            const patientId = patient._id;

            // Update if patient not in map OR this appointment is more recent
            if (
              !patientMap[patientId] ||
              dayjs(appt.appointment_date).isAfter(
                dayjs(patientMap[patientId].lastVisitRaw)
              )
            ) {
              patientMap[patientId] = {
                id: patient.patient_id || patientId.slice(-6).toUpperCase(),
                name: `${patient.first_name || ""} ${patient.last_name || ""}`.trim(),
                age: patient.dob ? dayjs().diff(dayjs(patient.dob), "year") : "-",
                gender: patient.gender || "-",
                bloodGroup: patient.blood_group || "-",
                phone: patient.phone || "N/A",
                diagnosis: appt.diagnosis || "Regular Checkup",
                lastVisit: dayjs(appt.appointment_date).format("MMM DD, YYYY"),
                lastVisitRaw: appt.appointment_date,
                image: patient.profile_image
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

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- SUB-COMPONENTS ---

  const PatientCard = ({ p }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300 group">
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
              ID: {p.id}
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
    <div className="bg-white p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-4 last:border-0 group">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
        {p.image ? (
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <FaUser className="text-slate-400 text-sm" />
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{p.name}</h4>
          <span className="text-xs text-slate-500">ID: {p.id}</span>
        </div>
        
        <div className="text-sm text-slate-600">
          <span className="md:hidden text-xs text-slate-400 mr-2">Info:</span>
          {p.age} yrs, {p.gender}
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
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === "active" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All Patients <span className="ml-2 bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">{patients.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === "inactive" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <FaFilter />
          </button>
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
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <span>Name / ID</span>
                 <span>Demographics</span>
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
    </div>
  );
};

export default PatientListPage;