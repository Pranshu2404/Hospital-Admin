import { useState } from 'react';
import { Button, SearchInput } from '../common/FormElements';

const MedicineList = ({ setCurrentPage, setSelectedMedicine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const medicines = [
    { id: 'M101', name: 'Paracetamol', type: 'Tablet', quantity: 100, price: '20.00', status: 'Available', description: 'Used for fever and pain relief', expiryDate: '2025-12-31' },
    { id: 'M102', name: 'Amoxicillin', type: 'Capsule', quantity: 50, price: '30.00', status: 'Low Stock', description: 'Antibiotic for bacterial infections', expiryDate: '2025-06-15' },
    { id: 'M103', name: 'Cough Syrup', type: 'Syrup', quantity: 0, price: '45.00', status: 'Out of Stock', description: 'Used to relieve cough symptoms', expiryDate: '2024-10-20' },
  ];

  const filtered = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    return status === 'Available'
      ? 'bg-green-100 text-green-700'
      : status === 'Low Stock'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medicine Inventory</h2>
            <p className="text-gray-500">Track and manage your medicine stock.</p>
          </div>
          <Button onClick={() => setCurrentPage('AddMedicine')}>+ Add Medicine</Button>
        </div>

        <SearchInput
          placeholder="Search by medicine name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="w-full mt-4 text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="p-3">{m.name}</td>
                <td>{m.type}</td>
                <td>{m.quantity}</td>
                <td>{m.price} INR</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(m.status)}`}>
                    {m.status}
                  </span>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMedicine(m);
                      setCurrentPage('MedicineDetail');
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineList;
