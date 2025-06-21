import { useState } from 'react';
import { Button, SearchInput } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';

const StaffList = ({ setCurrentPage, setSelectedStaff }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const staffMembers = [
    { id: 'D101', name: 'Dr. Aditi Mehra', role: 'Doctor', phone: '+91 98765 43210', department: 'Cardiology', status: 'Active' },
    { id: 'N201', name: 'Nurse Kavita Rao', role: 'Nurse', phone: '+91 99876 54321', department: 'Pediatrics', status: 'Active' },
    { id: 'D102', name: 'Dr. Rahul Sharma', role: 'Doctor', phone: '+91 91234 56789', department: 'Orthopedics', status: 'On Leave' },
  ];

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Staff Directory</h2>
            <p className="text-gray-500">Manage all hospital staff including doctors and nurses.</p>
          </div>
            <Button onClick={() => navigate('/dashboard/admin/add-staff')}>+ Add Staff</Button>
        </div>

        <SearchInput
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className="w-full mt-4 text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="border-b">
                <td className="p-3">{staff.name}</td>
                <td>{staff.role}</td>
                <td>{staff.phone}</td>
                <td>{staff.department}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    {staff.status}
                  </span>
                </td>
                <td>
                  
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStaff(staff);  // Pass selected staff data
                    setCurrentPage('StaffProfile'); // Redirect to profile page
                  }}
                >
                  View
                </Button>
                </td>
              </tr>
            ))}
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">No staff found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffList;
