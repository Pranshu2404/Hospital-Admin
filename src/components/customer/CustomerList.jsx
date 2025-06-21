import { useState } from 'react';
import { Button, SearchInput } from '../common/FormElements';

const CustomerList = ({ setCurrentPage, setSelectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 'P6985', name: 'Abu Bin Ishtiyak', email: 'info@softnio.com', phone: '+811 847-4958', address: 'Large cottage', purchase: 'Omiodon10mg, 10pcs', amount: '78.55 USD', status: 'Inactive' },
    { id: 'P6986', name: 'Ashley Lawson', email: 'ashley@softnio.com', phone: '+124 394-1787', address: 'Near Roberts Lake', purchase: 'Zimax50mg, 12pcs', amount: '90.20 USD', status: 'Active' },
    { id: 'P6987', name: 'Joe Larson', email: 'larson@example.com', phone: '+168 603-2320', address: 'Uttara,sector 10', purchase: 'Furosemide, 1 bottle', amount: '43.98 USD', status: 'Active' },
    { id: 'P6988', name: 'Jane Montgomery', email: 'jane84@example.com', phone: '+439 271-5360', address: 'Dhanmondi 9/A', purchase: 'Isoniazid Syrup, 2 bottles', amount: '80.26 USD', status: 'Active' }
  ];

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
            <p className="text-gray-500">You have total 17890 Customers in Pharmacy.</p>
          </div>
          <Button onClick={() => setCurrentPage('AddCustomerForm')}>
            + Add Customer
          </Button>

        </div>

        <SearchInput
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="w-full mt-4 text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th>ID</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Purchase Details</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b">
                <td className="p-3">
                  {c.name}
                  <br />
                  <span className="text-xs text-gray-500">{c.email}</span>
                </td>
                <td>{c.id}</td>
                <td>{c.phone}</td>
                <td>{c.address}</td>
                <td>{c.purchase}</td>
                <td>{c.amount}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCurrentPage('CustomerProfile');
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
