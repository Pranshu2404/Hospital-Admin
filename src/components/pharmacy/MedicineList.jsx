


import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MedicineList = () => {
  const [medicines] = useState([
    {
      id: 1,
      name: 'Zimax',
      genericName: 'Azithromycin',
      category: 'Tablet',
      manufacturer: 'Healthcare',
      stock: 180,
      price: 60,
      status: 'Active',
      expireDate: '2025-03-01',
      details: 'Used for bacterial infections.',
    },
    {
      id: 2,
      name: 'Amoxicillin',
      genericName: 'Penicillin',
      category: 'Capsule',
      manufacturer: 'Company B',
      stock: 30,
      price: 45,
      status: 'Inactive',
      expireDate: '2024-12-20',
      details: 'Treats respiratory infections.',
    },
  ]);

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Medicine List</h2>
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Generic</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{med.name}</td>
                <td className="px-4 py-2 border">{med.genericName}</td>
                <td className="px-4 py-2 border">{med.stock}</td>
                <td className="px-4 py-2 border">${med.price}</td>
                <td className="px-4 py-2 border">
                  <Link to={`/medicine-details/${med.id}`} state={{ medicine: med }} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {medicines.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">No medicines found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineList;
