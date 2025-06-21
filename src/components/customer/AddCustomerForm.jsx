import { useState } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

const AddCustomerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    purchasedItem: '',
    purchasedQuantity: '',
    amount: '',
    status: '',
    description: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Customer Data:', formData);
    // You can replace this with your actual API call or state update
  };

  const statusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'pending', label: 'Pending' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add Customer</h2>
          <p className="text-gray-600 mt-1">You can add a customer by filling these fields.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Name"
              required
            />
            <FormInput
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone no"
              required
            />
            <FormInput
              label="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email"
              type="email"
            />
            <FormInput
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Address"
            />
            <FormInput
              label="Purchased Item"
              value={formData.purchasedItem}
              onChange={(e) => handleInputChange('purchasedItem', e.target.value)}
              placeholder="Item"
              required
            />
            <FormInput
              label="Purchased Quantity"
              value={formData.purchasedQuantity}
              onChange={(e) => handleInputChange('purchasedQuantity', e.target.value)}
              placeholder="Quantity"
              type="number"
            />
            <FormInput
              label="Amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Amount"
              type="number"
            />
            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={statusOptions}
              placeholder="Select"
              required
            />
          </div>

          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter customer note or description"
            rows={5}
          />

          <div className="flex justify-end mt-6">
            <Button type="submit" variant="primary">
              Add Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;
