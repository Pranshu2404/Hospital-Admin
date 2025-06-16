import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, EditIcon, DeleteIcon, FilterIcon } from '../common/Icons';

const DoctorNurseList = ({ setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [staff] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      role: 'Doctor',
      specialization: 'General Medicine',
      department: 'General Medicine',
      email: 'sarah.wilson@hospital.com',
      phone: '+1 234-567-8900',
      experience: '8 years',
      status: 'Active',
      shift: 'Morning',
      license: 'MD12345'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      role: 'Doctor',
      specialization: 'Cardiology',
      department: 'Cardiology',
      email: 'michael.chen@hospital.com',
      phone: '+1 234-567-8901',
      experience: '12 years',
      status: 'Active',
      shift: 'Evening',
      license: 'MD23456'
    },
    {
      id: 3,
      name: 'Nurse Jennifer Brown',
      role: 'Nurse',
      specialization: 'Critical Care',
      department: 'ICU',
      email: 'jennifer.brown@hospital.com',
      phone: '+1 234-567-8902',
      experience: '5 years',
      status: 'Active',
      shift: 'Night',
      license: 'RN34567'
    },
    {
      id: 4,
      name: 'Dr. Lisa Anderson',
      role: 'Doctor',
      specialization: 'Orthopedics',
      department: 'Orthopedics',
      email: 'lisa.anderson@hospital.com',
      phone: '+1 234-567-8903',
      experience: '10 years',
      status: 'On Leave',
      shift: 'Morning',
      license: 'MD45678'
    },
    {
      id: 5,
      name: 'Nurse Robert Taylor',
      role: 'Nurse',
      specialization: 'Emergency Care',
      department: 'Emergency',
      email: 'robert.taylor@hospital.com',
      phone: '+1 234-567-8904',
      experience: '7 years',
      status: 'Active',
      shift: 'Rotating',
      license: 'RN56789'
    }
  ]);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Suspended': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getRoleBadge = (role) => {
    return role === 'Doctor'
      ? 'px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'
      : 'px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full';
  };

  const getShiftBadge = (shift) => {
    const shiftClasses = {
      'Morning': 'bg-orange-100 text-orange-800',
      'Evening': 'bg-indigo-100 text-indigo-800',
      'Night': 'bg-gray-100 text-gray-800',
      'Rotating': 'bg-teal-100 text-teal-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${shiftClasses[shift] || 'bg-gray-100 text-gray-800'}`;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const departments = [...new Set(staff.map(member => member.department))];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Staff Directory</h2>
              <p className="text-gray-600 mt-1">Manage doctors, nurses, and medical staff</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setCurrentPage('AddDoctorNurse')}
            >
              <PlusIcon />
              Add Staff Member
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, specialization, or department..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="Doctor">Doctors</option>
                <option value="Nurse">Nurses</option>
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <FilterIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
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
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-medium text-sm">
                          {getInitials(member.name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">License: {member.license}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={getRoleBadge(member.role)}>
                        {member.role}
                      </span>
                      <div className="text-sm text-gray-900">{member.department}</div>
                      <div className="text-sm text-gray-500">{member.specialization}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.phone}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.experience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getShiftBadge(member.shift)}>
                      {member.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(member.status)}>
                      {member.status}
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

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new staff member.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorNurseList;
