import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, EditIcon, DeleteIcon } from '../common/Icons';

const UsersSettingsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [users] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@hospital.com',
      role: 'Administrator',
      department: 'Administration',
      status: 'Active',
      lastLogin: '2024-01-15 09:30 AM',
      createdAt: '2023-06-15'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@hospital.com',
      role: 'Doctor',
      department: 'Cardiology',
      status: 'Active',
      lastLogin: '2024-01-15 08:45 AM',
      createdAt: '2023-07-20'
    },
    {
      id: 3,
      name: 'Nurse Jennifer Brown',
      email: 'jennifer.brown@hospital.com',
      role: 'Nurse',
      department: 'ICU',
      status: 'Active',
      lastLogin: '2024-01-14 11:20 PM',
      createdAt: '2023-08-10'
    },
    {
      id: 4,
      name: 'John Admin',
      email: 'john.admin@hospital.com',
      role: 'IT Support',
      department: 'IT',
      status: 'Inactive',
      lastLogin: '2024-01-10 02:15 PM',
      createdAt: '2023-05-01'
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Suspended': 'bg-yellow-100 text-yellow-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      'Administrator': 'bg-purple-100 text-purple-800',
      'Doctor': 'bg-blue-100 text-blue-800',
      'Nurse': 'bg-green-100 text-green-800',
      'IT Support': 'bg-gray-100 text-gray-800',
      'registrar': 'bg-yellow-100 text-yellow-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${roleClasses[role] || 'bg-gray-100 text-gray-800'}`;
  };

  const roles = [...new Set(users.map(user => user.role))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <Button variant="primary">
          <PlusIcon />
          Add User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Active Users</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(user => user.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Administrators</div>
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(user => user.role === 'Administrator').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Online Now</div>
          <div className="text-2xl font-bold text-blue-600">8</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name, email, or department..."
          className="flex-1"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(user.status)}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-teal-600 hover:text-teal-900 p-1 rounded">
                      View
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                      <EditIcon />
                    </button>
                    <button className="text-red-400 hover:text-red-600 p-1 rounded">
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new user.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSettingsTab;
