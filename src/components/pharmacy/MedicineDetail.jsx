// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const MedicineDetails = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   // Static demo data (replace with real data fetch by ID)
//   const medicine = {
//     name: 'Zimax',
//     genericName: 'Azithromycin',
//     weight: '500mg',
//     category: 'Tablet',
//     manufacturer: 'Healthcare',
//     expireDate: '19/12/2020',
//     popularity: 5,
//     startingStock: 230,
//     currentStock: 180,
//     manufacturerPrice: 50,
//     sellingPrice: 60,
//     wholesalePrice: 55,
//   };

//   const stockPercent = Math.round((medicine.currentStock / medicine.startingStock) * 100);

//   return (
//     <div className="p-6">
//       <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Back</button>

//       <div className="bg-white p-6 rounded-xl shadow-sm border">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Medicine details</h2>

//         {/* Info Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
//           <div><strong>Name:</strong> {medicine.name}</div>
//           <div><strong>Generic Name:</strong> {medicine.genericName}</div>
//           <div><strong>Weight:</strong> {medicine.weight}</div>
//           <div><strong>Category:</strong> {medicine.category}</div>
//           <div><strong>Manufacturer:</strong> {medicine.manufacturer}</div>
//           <div><strong>Expire Date:</strong> {medicine.expireDate}</div>
//         </div>

//         {/* Popularity */}
//         <div className="mt-4">
//           <strong>Popularity:</strong>{' '}
//           {'★'.repeat(medicine.popularity)}{'☆'.repeat(5 - medicine.popularity)}
//         </div>

//         {/* Stock */}
//         <div className="mt-6">
//           <h3 className="font-semibold mb-2">Stock</h3>
//           <p><strong>Starting Stock:</strong> {medicine.startingStock} box</p>
//           <p><strong>Current Stock:</strong> {medicine.currentStock} box</p>
//           <p><strong>Stock Status:</strong>{' '}
//             <span className="text-green-600 font-medium">Available</span>
//           </p>

//           <div className="w-full bg-gray-200 h-4 rounded mt-2">
//             <div
//               className="bg-green-500 h-4 rounded"
//               style={{ width: `${stockPercent}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Price Info */}
//         <div className="mt-6">
//           <h3 className="font-semibold mb-2">Estimate</h3>
//           <p><strong>Manufacturer Price:</strong> ${medicine.manufacturerPrice.toFixed(2)} USD</p>
//           <p><strong>Selling Price:</strong> ${medicine.sellingPrice.toFixed(2)} USD</p>
//           <p><strong>Wholesale Price:</strong> ${medicine.wholesalePrice.toFixed(2)} USD</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MedicineDetails;





import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const MedicineDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const medicine = state?.medicine;

  if (!medicine) {
    return (
      <div className="p-6">
        <p className="text-red-500">Medicine not found. Please go back to the list.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medicine Details</h2>
        <p><strong>Name:</strong> {medicine.name}</p>
        <p><strong>Generic Name:</strong> {medicine.genericName}</p>
        <p><strong>Category:</strong> {medicine.category}</p>
        <p><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
        <p><strong>Stock:</strong> {medicine.stock}</p>
        <p><strong>Price:</strong> ₹{medicine.price}</p>
        <p><strong>Status:</strong> {medicine.status}</p>
        <p><strong>Expire Date:</strong> {medicine.expireDate}</p>
        <p><strong>Details:</strong> {medicine.details}</p>

        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Back to List
        </button>
      </div>
    </div>
  );
};

export default MedicineDetails;
