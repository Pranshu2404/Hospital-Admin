import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, DownloadIcon } from '../common/Icons';
import { useModal } from '../common/Modals';
import AddBirthReportModal from './AddBirthReportModal';

const BirthReportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const { isOpen, openModal, closeModal } = useModal();

  const [birthReports] = useState([
    {
      id: 1,
      date: '2024-01-15',
      time: '14:30',
      motherName: 'Sarah Johnson',
      fatherName: 'Michael Johnson',
      babyGender: 'Female',
      weight: '3.2 kg',
      height: '50 cm',
      deliveryType: 'Normal',
      doctorName: 'Dr. Emily Davis',
      complications: 'None',
      status: 'Healthy',
      roomNumber: '205',
      registrationNumber: 'BR-2024-001'
    },
    {
      id: 2,
      date: '2024-01-14',
      time: '09:15',
      motherName: 'Maria Rodriguez',
      fatherName: 'Carlos Rodriguez',
      babyGender: 'Male',
      weight: '3.8 kg',
      height: '52 cm',
      deliveryType: 'C-Section',
      doctorName: 'Dr. Sarah Wilson',
      complications: 'Minor complications',
      status: 'Healthy',
      roomNumber: '302',
      registrationNumber: 'BR-2024-002'
    },
    {
      id: 3,
      date: '2024-01-13',
      time: '22:45',
      motherName: 'Jennifer Brown',
      fatherName: 'David Brown',
      babyGender: 'Female',
      weight: '2.9 kg',
      height: '48 cm',
      deliveryType: 'Normal',
      doctorName: 'Dr. Lisa Anderson',
      complications: 'None',
      status: 'Healthy',
      roomNumber: '108',
      registrationNumber: 'BR-2024-003'
    }
  ]);

  const filteredReports = birthReports.filter(report => {
    const matchesSearch = report.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Healthy': 'bg-green-100 text-green-800',
      'Under Observation': 'bg-yellow-100 text-yellow-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getDeliveryTypeBadge = (type) => {
    const typeClasses = {
      'Normal': 'bg-blue-100 text-blue-800',
      'C-Section': 'bg-purple-100 text-purple-800',
      'Assisted': 'bg-orange-100 text-orange-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`;
  };

  const totalBirths = filteredReports.length;
  const normalDeliveries = filteredReports.filter(report => report.deliveryType === 'Normal').length;
  const cSections = filteredReports.filter(report => report.deliveryType === 'C-Section').length;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Birth Reports</h2>
              <p className="text-gray-600 mt-1">Track and manage birth records</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <DownloadIcon />
                Export
              </Button>
              <Button variant="primary" onClick={openModal}>
                <PlusIcon />
                Add Birth Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Births</div>
              <div className="text-2xl font-bold text-gray-900">{totalBirths}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Normal Deliveries</div>
              <div className="text-2xl font-bold text-blue-600">{normalDeliveries}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">C-Sections</div>
              <div className="text-2xl font-bold text-purple-600">{cSections}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">This Month</div>
              <div className="text-2xl font-bold text-gray-900">{totalBirths}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by mother name, father name, or registration number..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <Button variant="outline" size="sm">
                <FilterIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Birth Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Baby Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
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
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.registrationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.motherName}</div>
                    <div className="text-sm text-gray-500">{report.fatherName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.date}</div>
                    <div className="text-sm text-gray-500">{report.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.babyGender}</div>
                    <div className="text-sm text-gray-500">{report.weight}, {report.height}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getDeliveryTypeBadge(report.deliveryType)}>
                      {report.deliveryType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.doctorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(report.status)}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-900">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Edit
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Certificate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No birth reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding a new birth report.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <AddBirthReportModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default BirthReportPage;
