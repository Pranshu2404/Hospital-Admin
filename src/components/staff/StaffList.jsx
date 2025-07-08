import { useState, useEffect } from 'react';
import { Button, SearchInput } from '../common/FormElements';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaffList = ({ setCurrentPage, setSelectedStaff }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/staff`);
        setStaffMembers(response.data); 
        console.log(response.data)
      } catch (err) {
        console.error('Failed to fetch staff:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const filteredStaff = staffMembers
  .filter((staff) =>
    staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Staff Directory</h2>
            <p className="text-gray-500">Manage all hospital Staff</p>
          </div>
          <Button onClick={() => navigate('/dashboard/admin/add-staff')}>+ Add Staff</Button>
        </div>

        <SearchInput
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="overflow-x-auto mt-4">
  <table className="min-w-[900px] w-full text-sm text-gray-700 table-auto">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Department</th>
        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Role</th>
        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Action</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="6" className="text-center py-4 text-gray-500">Loading...</td>
        </tr>
      ) : (
        filteredStaff.map((staff) => (
          <tr key={staff._id} className="border-b hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {`${staff.first_name || ''} ${staff.last_name || ''}`}
              </div>
              <div className="text-xs text-gray-500">{staff.email || '—'}</div>
            </td>
            {/* <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {staff.role || '—'}
              </span>
            </td> */}
            <td className="px-6 py-4 whitespace-nowrap">{staff.phone || '—'}</td>
            <td className="px-6 py-4 whitespace-nowrap">{staff.department || '—'}</td>
            <td className="px-6 py-4 whitespace-nowrap">
  {staff.role ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1) : '—'}
</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                staff.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : staff.status === 'On Leave'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-700'
              }`}>
                {staff.status || 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStaff(staff);
                  setCurrentPage('StaffProfile');
                }}
              >
                View
              </Button>
            </td>
          </tr>
        ))
      )}
      {!loading && filteredStaff.length === 0 && (
        <tr>
          <td colSpan="6" className="text-center py-4 text-gray-500">No staff found.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
};

export default StaffList;
