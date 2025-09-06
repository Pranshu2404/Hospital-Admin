import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';

const RecentPrescriptions = ({ prescriptions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Prescription #</th>
            <th className="text-left py-2">Patient</th>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription) => (
            <tr key={prescription._id} className="border-b hover:bg-gray-50">
              <td className="py-2">{prescription.prescription_number}</td>
              <td className="py-2">
                {prescription.patient_id?.first_name} {prescription.patient_id?.last_name}
              </td>
              <td className="py-2">
                {new Date(prescription.issue_date).toLocaleDateString()}
              </td>
              <td className="py-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                  prescription.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {prescription.status}
                </span>
              </td>
              <td className="py-2">
                <Link
                  to={`/dashboard/pharmacy/prescriptions/${prescription._id}`}
                  className="text-teal-600 hover:text-teal-700"
                >
                  <FaEye />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentPrescriptions;