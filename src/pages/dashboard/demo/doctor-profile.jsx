import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import {
  FaUserMd, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStethoscope,
  FaAward, FaBirthdayCake, FaVenusMars, FaBuilding, FaClock,
  FaFileAlt, FaMoneyBillWave, FaIdCard, FaEdit, FaCheckCircle,
  FaCalendarAlt, FaBriefcase, FaTimes, FaSave, FaExclamationCircle,
  FaGraduationCap, FaArrowLeft
} from 'react-icons/fa';

const SectionTitle = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <Icon className="text-teal-600" />
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
  </div>
);

const ProfileField = ({ icon: Icon, label, value, colorClass = 'text-slate-400' }) => (
  <div className="flex items-start group p-2 rounded-lg hover:bg-slate-50 transition-colors">
    <div className={`mt-1 mr-3 ${colorClass}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-slate-700 font-medium text-sm break-all">{value || <span className="text-slate-300 italic">Not provided</span>}</p>
    </div>
  </div>
);

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const fmtDate = (d) => {
    try {
      return d ? new Date(d).toLocaleDateString() : '-';
    } catch {
      return d || '-';
    }
  };

  if (loading) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="flex h-screen items-center justify-center text-slate-400 font-medium">Loading Profile...</div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-slate-800">Doctor not found</h3>
          <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 hover:underline">Go Back</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="min-h-screen bg-slate-50/50 p-2 font-sans">

        {/* Header Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-teal-600 to-cyan-700 relative"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-10 mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-lg">
                  <img
                    src={`https://ui-avatars.com/api/?name=${doctor.firstName}+${doctor.lastName}&background=0d9488&color=fff&size=128`}
                    alt="Doctor"
                    className="w-full h-full object-cover rounded-xl bg-slate-100"
                  />
                </div>
                <div className="absolute bottom-1 -right-1 bg-green-500 border-4 border-white w-5 h-5 rounded-full" title="Active"></div>
              </div>

              <div className="md:ml-6 mt-4 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      Dr. {doctor.firstName} {doctor.lastName}
                      <FaCheckCircle className="text-blue-500 text-sm" title="Verified" />
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-sm">
                        <FaIdCard className="text-xs" /> {doctor.doctorId || 'ID: --'}
                      </span>
                      <span className="text-sm border flex items-center gap-1 px-2 rounded-md bg-slate-50">
                        <FaStethoscope className="text-xs text-slate-400" /> {doctor.specialization || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                    >
                      <FaArrowLeft /> Back
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/admin/edit-doctor/${doctor._id}`)}
                      className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Experience</p>
                <p className="text-xl font-bold text-slate-800">{doctor.experience || 0} Years</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Joined</p>
                <p className="text-xl font-bold text-slate-800">{fmtDate(doctor.startDate || doctor.createdAt)}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Type</p>
                <p className="text-xl font-bold text-slate-800">{doctor.isFullTime ? 'Full-Time' : 'Part-Time'}</p>
              </div>
              {/* <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase">Patients</p>
                <p className="text-xl font-bold text-slate-800">--</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {/* Left Column */}
          <div className="space-y-6">

            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Personal Details" icon={FaUserMd} />
              <div className="space-y-1">
                <ProfileField icon={FaEnvelope} label="Email" value={doctor.email} />
                <ProfileField icon={FaPhone} label="Phone" value={doctor.phone} />
                <ProfileField icon={FaVenusMars} label="Gender" value={doctor.gender} />
                <ProfileField icon={FaBirthdayCake} label="Date of Birth" value={fmtDate(doctor.dateOfBirth)} />
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Address & Location" icon={FaMapMarkerAlt} />
              <div className="space-y-1">
                <ProfileField icon={FaMapMarkerAlt} label="Full Address" value={doctor.address} />
                <div className="grid grid-cols-2 gap-2">
                  <ProfileField icon={FaBuilding} label="City" value={doctor.city} />
                  <ProfileField icon={FaBuilding} label="State" value={doctor.state} />
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Emergency & IDs" icon={FaIdCard} />
              <div className="space-y-1">
                <ProfileField icon={FaPhone} label="Emergency Contact" value={`${doctor.emergencyContact || ''} (${doctor.emergencyPhone || '-'})`} />
                <ProfileField icon={FaIdCard} label="Aadhar Number" value={doctor.aadharNumber} />
                <ProfileField icon={FaIdCard} label="PAN Number" value={doctor.panNumber} />
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Professional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Professional Details" icon={FaStethoscope} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ProfileField icon={FaBuilding} label="Department" value={typeof doctor.department === 'object' ? doctor.department?.name : doctor.department} />
                <ProfileField icon={FaStethoscope} label="Specialization" value={doctor.specialization} />
                <ProfileField icon={FaIdCard} label="License Number" value={doctor.licenseNumber} />
                <ProfileField icon={FaBriefcase} label="Experience" value={`${doctor.experience || 0} Years`} />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><FaGraduationCap className="text-slate-400" /> Education</h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{doctor.education || 'No details provided'}</p>
              </div>
            </div>

            {/* Employment & Financial */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Employment & Compensation" icon={FaMoneyBillWave} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <ProfileField icon={FaCalendarAlt} label="Joining Date" value={fmtDate(doctor.startDate)} />
                <ProfileField icon={FaBriefcase} label="Type" value={doctor.isFullTime ? 'Full-time' : 'Part-time'} />
              </div>

              {doctor.isFullTime ? (
                <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-emerald-800 mb-2 border-b border-emerald-200 pb-2">Full-Time Configuration</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <ProfileField icon={FaClock} label="Shift" value={doctor.shift} colorClass="text-emerald-600" />
                    <ProfileField icon={FaMoneyBillWave} label="Annual Salary" value={`₹${doctor.amount || 0}`} colorClass="text-emerald-600" />
                  </div>

                  {doctor.timeSlots && doctor.timeSlots.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-emerald-700 mb-2">Shift Timings:</p>
                      <div className="flex flex-wrap gap-2">
                        {doctor.timeSlots.map((slot, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-1 bg-white border border-emerald-100 text-emerald-600 rounded text-xs">
                            <FaClock className="mr-1" /> {slot.start} - {slot.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 mb-2 border-b border-blue-200 pb-2">Consultant Configuration</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <ProfileField icon={FaBriefcase} label="Payment Model" value={doctor.paymentType} colorClass="text-blue-600" />
                    <ProfileField icon={FaMoneyBillWave} label="Rate / Amount" value={`₹${doctor.amount || 0}`} colorClass="text-blue-600" />
                    <ProfileField icon={FaCalendarAlt} label="Contract Start" value={fmtDate(doctor.contractStartDate)} colorClass="text-blue-600" />
                    <ProfileField icon={FaCalendarAlt} label="Contract End" value={fmtDate(doctor.contractEndDate)} colorClass="text-blue-600" />
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Revenue Share Percentage</p>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${doctor.revenuePercentage || 0}%` }}></div>
                    </div>
                    <p className="text-right text-xs text-blue-800 font-bold mt-1">{doctor.revenuePercentage}%</p>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Available Time Slots</p>
                    <div className="flex flex-wrap gap-2">
                      {(doctor.timeSlots || []).map((slot, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 bg-white border border-blue-200 text-blue-600 rounded text-xs shadow-sm">
                          <FaClock className="mr-1" /> {slot.start} - {slot.end}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {doctor.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <SectionTitle title="Additional Notes" icon={FaFileAlt} />
                <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-lg border border-amber-100">{doctor.notes}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfilePage;
