import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { doctorSidebar } from "@/constants/sidebarItems/doctorSidebar";
import { 
  FaUserMd, 
  FaEnvelope, 
  FaStethoscope, 
  FaAward, 
  FaBuilding, 
  FaPhoneAlt,
  FaUserTie,
  FaUsers
} from "react-icons/fa";

const MyDepartmentPage = () => {
  const [department, setDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        // 1️⃣ Get logged-in doctor's details
        const doctorRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`
        );
        const deptId = doctorRes.data?.department?._id;
        if (!deptId) {
          throw new Error("Department ID not found for this doctor");
        }

        // 2️⃣ Get department details (name + HOD)
        const deptRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/departments/${deptId}`
        );
        setDepartment(deptRes.data);

        // 3️⃣ Get all doctors in this department
        const doctorsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/doctors/department/${deptId}`
        );
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error("Error loading department data:", err);
        setError("Failed to load department information.");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchDepartmentData();
  }, [doctorId]);

  // UI Components
  const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color} bg-opacity-10 text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{label}</p>
        <p className="text-slate-800 font-bold text-lg">{value}</p>
      </div>
    </div>
  );

  const DoctorCard = ({ doc }) => {
    const isHead = department?.head_doctor_id?._id === doc._id;
    
    return (
      <div className={`bg-white rounded-xl shadow-sm border ${isHead ? 'border-teal-200 ring-1 ring-teal-100' : 'border-slate-200'} p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden`}>
        {isHead && (
          <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            H.O.D
          </div>
        )}
        
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            {doc.user_id?.profile_image ? (
              <img 
                src={doc.user_id.profile_image} 
                alt={doc.user_id?.name || doc.firstName} 
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-50">
                <FaUserMd size={28} />
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${doc.status === 'inactive' ? 'bg-gray-400' : 'bg-green-500'}`} title="Online"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base truncate">{doc.firstName} {doc.lastName}</h3>
            <p className="text-teal-600 text-xs font-semibold mb-2">{doc.specialization || "General Specialist"}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded">{doc.education}</span>
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">{doc.experience}+ Yrs</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 mb-4 pb-4 border-b border-slate-100 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">License #</span>
            <span className="font-medium text-slate-700">{doc.licenseNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Shift</span>
            <span className="font-medium text-slate-700">{doc.shift || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor ID</span>
            <span className="font-medium text-slate-700">{doc.doctorId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Employment</span>
            <span className="font-medium text-slate-700">{doc.isFullTime ? 'Full-Time' : 'Part-Time'}</span>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-slate-500">Payment Type</span>
            <span className="font-medium text-slate-700">{doc.paymentType || 'N/A'}</span>
          </div> */}
          {/* {doc.amount && (
            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-medium text-teal-700">₹{doc.amount.toLocaleString()}</span>
            </div>
          )} */}
        </div>

        {/* Contact Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded">
            <FaEnvelope className="text-slate-400" />
            <span className="truncate text-slate-700">{doc.email || doc.user_id?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded">
            <FaPhoneAlt className="text-slate-400" />
            <span className="font-medium text-slate-700">{doc.phone || 'N/A'}</span>
          </div>
        </div>

        {/* Address Section */}
        {/* {(doc.address || doc.city || doc.state) && (
          <div className="mb-4 pb-4 border-b border-slate-100 text-xs">
            <p className="text-slate-500 font-semibold mb-1">Address</p>
            <p className="text-slate-700">{doc.address}, {doc.city}, {doc.state} {doc.zipCode}</p>
          </div>
        )} */}

        {/* Action Buttons */}
        {/* <div className="grid grid-cols-2 gap-2">
           <a href={`mailto:${doc.email || doc.user_id?.email}`} className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors">
             <FaEnvelope size={12} /> <span>Email</span>
           </a>
           <button className="flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors">
             <FaUserMd size={12} /> <span>Profile</span>
           </button>
        </div> */}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout sidebarItems={doctorSidebar} section="Doctor">
         <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading department details...</p>
         </div>
      </Layout>
    );
  }

  if (error || !department) {
    return (
      <Layout sidebarItems={doctorSidebar} section="Doctor">
        <div className="p-8 text-center">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Department Not Found</h3>
            <p className="text-slate-500">{error || "You do not appear to be assigned to a department."}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="p-6 md:p-2 bg-slate-50/50 min-h-screen">
        
        {/* Header Section */}
        <div className="mb-8">
           <div className="flex items-center space-x-3 mb-2">
              <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
                 <FaBuilding />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">{department.name} Department</h1>
           </div>
           <p className="text-slate-500 max-w-2xl ml-11">
             Your department overview, view colleague details, and coordinate with your team members effectively.
           </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <StatCard 
             icon={<FaUsers className="text-blue-600" />} 
             label="Total Doctors" 
             value={doctors.length} 
             color="bg-blue-600 text-blue-600" 
           />
           <StatCard 
             icon={<FaUserTie className="text-teal-600" />} 
             label="Head of Dept" 
             value={department.head_doctor_id ? `${department.head_doctor_id.firstName} ${department.head_doctor_id.lastName}` : "Not Assigned"} 
             color="bg-teal-600 text-teal-600" 
           />
           <StatCard 
             icon={<FaPhoneAlt className="text-amber-600" />} 
             label="Contact Ext" 
             value={department.phone || "101"} 
             color="bg-amber-600 text-amber-600" 
           />
        </div>

        {/* Team Grid */}
        <div className="mb-6 flex justify-between items-center">
           <h2 className="text-lg font-bold text-slate-800">Meet The Team</h2>
           <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-500">
             {doctors.length} Members
           </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {doctors.map((doc) => (
             <DoctorCard key={doc._id} doc={doc} />
           ))}
        </div>

        {/* Empty State */}
        {doctors.length === 0 && (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
               <FaStethoscope className="text-slate-300 text-4xl mx-auto mb-3" />
               <p className="text-slate-500 font-medium">No doctors found in this department.</p>
           </div>
        )}

      </div>
    </Layout>
  );
};

export default MyDepartmentPage;