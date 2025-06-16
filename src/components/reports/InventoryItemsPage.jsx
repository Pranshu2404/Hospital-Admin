import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, EditIcon, DeleteIcon } from '../common/Icons';
import { useModal } from '../common/Modals';
import AddItemsModal from './AddItemsModal';
import FilterSidebar from './FilterSidebar';

const InventoryItemsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const [inventoryItems] = useState([
    {
      id: 1,
      name: 'Surgical Gloves',
      category: 'Medical Supplies',
      sku: 'SKU-001',
      quantity: 500,
      unit: 'boxes',
      minStock: 50,
      maxStock: 1000,
      unitPrice: 25.00,
      totalValue: 12500.00,
      supplier: 'MedSupply Co.',
      lastRestocked: '2024-01-10',
      expiryDate: '2025-01-10',
      location: 'Storage Room A',
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'X-Ray Machine',
      category: 'Medical Equipment',
      sku: 'SKU-002',
      quantity: 2,
      unit: 'units',
      minStock: 1,
      maxStock: 3,
      unitPrice: 150000.00,
      totalValue: 300000.00,
      supplier: 'MedTech Solutions',
      lastRestocked: '2023-06-15',
      expiryDate: null,
      location: 'Radiology Dept',
      status: 'In Use'
    },
    {
      id: 3,
      name: 'Paracetamol 500mg',
      category: 'Pharmaceuticals',
      sku: 'SKU-003',
      quantity: 20,
      unit: 'bottles',
      minStock: 100,
      maxStock: 500,
      unitPrice: 15.00,
      totalValue: 300.00,
      supplier: 'Pharma Distributors',
      lastRestocked: '2024-01-05',
      expiryDate: '2025-12-31',
      location: 'Pharmacy',
      status: 'Low Stock'
    },
    {
      id: 4,
      name: 'Blood Pressure Monitor',
      category: 'Medical Equipment',
      sku: 'SKU-004',
      quantity: 0,
      unit: 'units',
      minStock: 5,
      maxStock: 20,
      unitPrice: 200.00,
      totalValue: 0.00,
      supplier: 'MedDevice Inc.',
      lastRestocked: '2023-12-20',
      expiryDate: null,
      location: 'Equipment Store',
      status: 'Out of Stock'
    }
  ]);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'In Stock': 'bg-green-100 text-green-800',
      'Low Stock': 'bg-yellow-100 text-yellow-800',
      'Out of Stock': 'bg-red-100 text-red-800',
      'In Use': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-purple-100 text-purple-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getCategoryBadge = (category) => {
    const categoryClasses = {
      'Medical Supplies': 'bg-blue-100 text-blue-800',
      'Medical Equipment': 'bg-purple-100 text-purple-800',
      'Pharmaceuticals': 'bg-green-100 text-green-800',
      'Office Supplies': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${categoryClasses[category] || 'bg-gray-100 text-gray-800'}`;
  };

  const totalValue = filteredItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = filteredItems.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
              <p className="text-gray-600 mt-1">Track and manage hospital inventory items</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <FilterIcon />
                Filters
              </Button>
              <Button variant="primary" onClick={openModal}>
                <PlusIcon />
                Add Item
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Items</div>
              <div className="text-2xl font-bold text-gray-900">{filteredItems.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Value</div>
              <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Low Stock Alerts</div>
              <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Categories</div>
              <div className="text-2xl font-bold text-gray-900">{new Set(inventoryItems.map(item => item.category)).size}</div>
            </div>
          </div>

          {/* Search */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by item name, SKU, or supplier..."
            className="mb-4"
          />
        </div>

        <div className="flex">
          {/* Filter Sidebar */}
          {showFilters && (
            <FilterSidebar
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={[...new Set(inventoryItems.map(item => item.category))]}
            />
          )}

          {/* Items Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
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
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getCategoryBadge(item.category)}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                      <div className="text-sm text-gray-500">Min: {item.minStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(item.status)}>
                        {item.status}
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
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new inventory item.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <AddItemsModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default InventoryItemsPage;
