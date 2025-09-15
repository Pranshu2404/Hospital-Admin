import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";
import { doctorSidebar } from "@/constants/sidebarItems/doctorSidebar";

const MyDepartmentPage = () => {
  const [department, setDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = localStorage.getItem("doctorId"); // stored after login

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        // 1️⃣ Get logged-in doctor's details
        const doctorRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/doctors/${doctorId}`
        );
        const deptId = doctorRes.data?.department?._id;
        if (!deptId) {
          throw new Error("Department ID not found for this doctor");
        }

        // 2️⃣ Get department details (name + HOD)
        const deptRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/departments/${deptId}`
        );
        setDepartment(deptRes.data);

        // 3️⃣ Get all doctors in this department
        const doctorsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/doctors/department/${deptId}`
        );
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error("Error loading department data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchDepartmentData();
  }, [doctorId]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <Layout sidebarItems={doctorSidebar} section = "Doctor">
    <div className="p-6 bg-gray-50 min-h-screen">
      {department && (
        <>
          <h1 className="text-2xl font-bold text-teal-600 mb-2">
            {department.name}
          </h1>
          <p className="mb-6 text-gray-700">
            Head of Department:{" "}
            <span className="font-semibold">
              {department.head_doctor_id?.firstName +" "+ department.head_doctor_id?.lastName || "N/A"}
            </span>
          </p>
        </>
      )}

      {/* Doctors Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Doctors in this Department</h2>
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Specialization</th>
              <th className="border p-2 text-left">Experience</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50">
                <td className="border p-2">{doc.user_id?.name}</td>
                <td className="border p-2">{doc.user_id?.email}</td>
                <td className="border p-2">{doc.user_id?.role}</td>
                <td className="border p-2">{doc.specialization || "-"}</td>
                <td className="border p-2">{doc.experience || "-"} years</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </Layout>
  );
};

export default MyDepartmentPage;
