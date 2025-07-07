import { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchInput, Button } from '../common/FormElements';
import { EditIcon, DeleteIcon, FilterIcon } from '../common/Icons';
import { useNavigate } from 'react-router-dom';

const IpdOpdPatientList = ({ setCurrentPage, setSelectedPatient }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [patients, setPatients] = useState([]);

  // Fetch patient data from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patients`);
        const data = response.data;

        // Optional: transform backend fields to frontend format
        const formatted = data.map(p => ({
          id: p._id,
          name: `${p.first_name} ${p.last_name}`,
          age: calculateAge(p.dob),
          gender: p.gender,
          phone: p.phone,
          email: p.email,
          type: p.patient_type.toUpperCase() || 'OPD',
          bloodGroup: p.blood_group || 'N/A',
          lastVisit: new Date(p.registered_at).toISOString().split('T')[0],
          status: 'Active', // You can map a real status if available
        }));

        setPatients(formatted);
      } catch (error) {
        console.error('❌ Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)||
      patient.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || patient.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentPage('PatientProfile');
  };

  const getStatusBadge = (status) =>
    status === 'Active'
      ? 'px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full'
      : 'px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full';

  const getTypeBadge = (type) =>
    type === 'IPD'
      ? 'px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'
      : 'px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full';

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Patient List</h2>
              <p className="text-gray-600 mt-1">Manage all patient records</p>
            </div>
            <Button 
              variant="primary"
              onClick={() => navigate('/dashboard/admin/add-patient')}
            >
              Add New Patient
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients by name, email, or phone..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Patients</option>
                <option value="OPD">OPD Only</option>
                <option value="IPD">IPD Only</option>
              </select>
              <Button variant="outline" size="sm">
                <FilterIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
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
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-medium text-sm">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.age} years, {patient.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getTypeBadge(patient.type)}>
                      {patient.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.bloodGroup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(patient.status)}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-teal-600 hover:text-teal-900 p-1 rounded"
                      >
                        View
                      </button>
                      {/* <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <EditIcon />
                      </button> */}
                      <button
                        onClick={() => navigate(`/dashboard/admin/update-patient/${patient.id}`)}
                        className="text-gray-400 hover:text-blue-600 p-1 rounded"
                      >
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

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m12 0a3 3 0 100-6 3 3 0 000 6zm0 0a3 3 0 100 6 3 3 0 000-6z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new patient.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IpdOpdPatientList;
