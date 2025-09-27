import React, { useState, useEffect } from "react";
import { FaSearch, FaThLarge, FaList } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

const PatientListPage = () => {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(true);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorId}`
        );

        if (Array.isArray(res.data)) {
          // Filter only completed/past appointments
          const pastAppointments = res.data.filter((appt) =>
            dayjs(appt.appointment_date).isBefore(dayjs())
          );

          // Map patients with last visit date
          const patientMap = {};
          pastAppointments.forEach((appt) => {
            const patient = appt.patient_id;
            if (!patient) return;

            const patientId = patient._id;

            if (
              !patientMap[patientId] ||
              dayjs(appt.appointment_date).isAfter(
                dayjs(patientMap[patientId].lastVisitRaw)
              )
            ) {
              patientMap[patientId] = {
                id: patient.patient_id || patientId, // hospital patient ID or ObjectId
                name: `${patient.first_name || ""} ${patient.last_name || ""}`,
                age: patient.dob
                ? dayjs().diff(dayjs(patient.dob), "year")
                : "-",
                gender: patient.gender || "-",
                bloodGroup: patient.blood_group || "-",
                diagnosis: appt.diagnosis || "N/A",
                lastVisit: dayjs(appt.appointment_date).format(
                  "DD/MM/YYYY [at] h:mmA"
                ),
                lastVisitRaw: appt.appointment_date,
                image:
                  patient.profile_image ||
                  `https://ui-avatars.com/api/?name=${patient.first_name || ""}+${
                    patient.last_name || ""
                  }&background=random`,
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

  if (loading) {
    return <p className="p-6">Loading patients...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Patients List</h1>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActive(true)}
          className={`px-4 py-1 rounded ${
            active ? "bg-green-100 text-green-800" : "bg-gray-200"
          }`}
        >
          Active Patients{" "}
          <span className="ml-1 font-semibold">{patients.length}</span>
        </button>
        <button
          onClick={() => setActive(false)}
          className={`px-4 py-1 rounded ${
            !active ? "bg-red-100 text-red-800" : "bg-gray-200"
          }`}
        >
          Inactive Patients <span className="ml-1 font-semibold">0</span>
        </button>

        <div className="ml-auto flex items-center bg-white rounded shadow px-3 py-1 w-64">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="p-2 rounded bg-gray-200">
          <FaThLarge />
        </button>
        <button className="p-2 rounded bg-gray-200">
          <FaList />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-4">
              <img
                src={p.image}
                alt={p.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <div className="text-sm text-gray-500">#{p.id}</div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">
                  Age: {p.age} &nbsp; • &nbsp; {p.gender} &nbsp; • &nbsp;{" "}
                  {p.bloodGroup}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-teal-600">
                Diagnosis
              </div>
              <div className="text-sm text-gray-700">{p.diagnosis}</div>
            </div>
            <div className="text-xs text-blue-600">
              Last Visit: {p.lastVisit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientListPage;
