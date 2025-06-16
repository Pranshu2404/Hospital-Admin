import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, DownloadIcon } from '../common/Icons';
import { useModal } from '../common/Modals';
import AddExpenseModal from './AddExpenseModal';

const ExpensePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const { isOpen, openModal, closeModal } = useModal();

  const [expenseRecords] = useState([
    {
      id: 1,
      date: '2024-01-15',
      category: 'Medical Equipment',
      vendor: 'MedTech Solutions',
      description: 'X-Ray Machine Maintenance',
      amount: 2500.00,
      approvedBy: 'Dr. Sarah Wilson',
      department: 'Radiology',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'RCP-001'
    },
    {
      id: 2,
      date: '2024-01-14',
      category: 'Medical Supplies',
      vendor: 'HealthCare Supplies Inc.',
      description: 'Surgical instruments and consumables',
      amount: 1200.00,
      approvedBy: 'Dr. Michael Chen',
      department: 'Surgery',
      status: 'Paid',
      paymentMethod: 'Credit Card',
      receiptNo: 'RCP-002'
    },
    {
      id: 3,
      date: '2024-01-14',
      category: 'Utilities',
      vendor: 'City Electric Company',
      description: 'Monthly electricity bill',
      amount: 3500.00,
      approvedBy: 'Admin Office',
      department: 'Administration',
      status: 'Pending',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'RCP-003'
    },
    {
      id: 4,
      date: '2024-01-13',
      category: 'Staff Salaries',
      vendor: 'Hospital Payroll',
      description: 'Monthly staff salaries',
      amount: 85000.00,
      approvedBy: 'HR Department',
      department: 'Human Resources',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'RCP-004'
    },
    {
      id: 5,
      date: '2024-01-12',
      category: 'Pharmaceuticals',
      vendor: 'Pharma Distributors',
      description: 'Monthly medication stock',
      amount: 15000.00,
      approvedBy: 'Dr. Lisa Anderson',
      department: 'Pharmacy',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'RCP-005'
    }
  ]);

  const filteredRecords = expenseRecords.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || record.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidExpenses = filteredRecords
    .filter(record => record.status === 'Paid')
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingExpenses = filteredRecords
    .filter(record => record.status === 'Pending')
    .reduce((sum, record) => sum + record.amount, 0);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Approved': 'bg-blue-100 text-blue-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getCategoryBadge = (category) => {
    const categoryClasses = {
      'Medical Equipment': 'bg-blue-100 text-blue-800',
      'Medical Supplies': 'bg-green-100 text-green-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Staff Salaries': 'bg-purple-100 text-purple-800',
      'Pharmaceuticals': 'bg-indigo-100 text-indigo-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
      'Insurance': 'bg-teal-100 text-teal-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${categoryClasses[category] || 'bg-gray-100 text-gray-800'}`;
  };

  const categories = [...new Set(expenseRecords.map(record => record.category))];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Expense Management</h2>
              <p className="text-gray-600 mt-1">Track and manage all hospital expenses</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <DownloadIcon />
                Export
              </Button>
              <Button variant="primary" onClick={openModal}>
                <PlusIcon />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Expenses</div>
              <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Paid</div>
              <div className="text-2xl font-bold text-green-600">${paidExpenses.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">${pendingExpenses.toFixed(2)}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by description, vendor, or category..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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

        {/* Expense Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved By
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
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getCategoryBadge(record.category)}>
                      {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{record.description}</div>
                    <div className="text-sm text-gray-500">{record.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${record.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.approvedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(record.status)}>
                      {record.status}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expense records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding a new expense record.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <AddExpenseModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default ExpensePage;
