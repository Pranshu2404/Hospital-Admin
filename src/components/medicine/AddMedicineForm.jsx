import { useState } from 'react';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';
import { SearchableFormSelect } from '../common/FormElements';

const AddMedicineForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    manufacturer: '',
    quantity: '',
    price: '',
    expiryDate: '',
    status: 'Available'
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Medicine data:', formData);
    // You can add submission logic here
  };

  const typeOptions = [
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Capsule', label: 'Capsule' },
    { value: 'Syrup', label: 'Syrup' },
    { value: 'Injection', label: 'Injection' }
  ];

  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Low Stock', label: 'Low Stock' },
    { value: 'Out of Stock', label: 'Out of Stock' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Medicine</h2>
          <p className="text-gray-600 mt-1">Enter medicine details to update the inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormInput
              label="Medicine Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter medicine name"
              required
            />
            <SearchableFormSelect
              label="Type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              options={typeOptions}
              placeholder="Select type"
              required
            />
            <FormInput
              label="Manufacturer"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              placeholder="Enter manufacturer name"
            />
            <FormInput
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="Enter available quantity"
              required
            />
            <FormInput
              label="Price (INR)"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter price"
              required
            />
            <FormInput
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              required
            />
            <SearchableFormSelect
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={statusOptions}
            />
          </div>

          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter description or dosage instructions"
            rows={3}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Medicine
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineForm;
