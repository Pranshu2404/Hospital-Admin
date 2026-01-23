import { useState } from 'react';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button, SearchableFormSelect } from '../common/FormElements';

const AddItemsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    minStock: '',
    maxStock: '',
    supplier: '',
    location: '',
    expiryDate: '',
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
    console.log('Inventory item data:', formData);
    onClose();
    // Reset form
    setFormData({
      name: '',
      category: '',
      sku: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      minStock: '',
      maxStock: '',
      supplier: '',
      location: '',
      expiryDate: '',
      description: ''
    });
  };

  const categoryOptions = [
    { value: 'medical_supplies', label: 'Medical Supplies' },
    { value: 'medical_equipment', label: 'Medical Equipment' },
    { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'office_supplies', label: 'Office Supplies' },
    { value: 'cleaning_supplies', label: 'Cleaning Supplies' },
    { value: 'other', label: 'Other' }
  ];

  const unitOptions = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'units', label: 'Units' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'liters', label: 'Liters' },
    { value: 'meters', label: 'Meters' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Inventory Item" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Item Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter item name"
            required
          />
          <FormInput
            label="SKU"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder="Enter SKU code"
            required
          />
        </div>

        {/* Category and Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableFormSelect
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
            required
          />
          <SearchableFormSelect
            label="Unit"
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            options={unitOptions}
            placeholder="Select unit"
            required
          />
        </div>

        {/* Quantity and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="0"
            required
          />
          <FormInput
            label="Unit Price"
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => handleInputChange('unitPrice', e.target.value)}
            placeholder="0.00"
            required
          />
          <FormInput
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
          />
        </div>

        {/* Stock Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Minimum Stock Level"
            type="number"
            value={formData.minStock}
            onChange={(e) => handleInputChange('minStock', e.target.value)}
            placeholder="0"
            required
          />
          <FormInput
            label="Maximum Stock Level"
            type="number"
            value={formData.maxStock}
            onChange={(e) => handleInputChange('maxStock', e.target.value)}
            placeholder="0"
            required
          />
        </div>

        {/* Supplier and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Supplier"
            value={formData.supplier}
            onChange={(e) => handleInputChange('supplier', e.target.value)}
            placeholder="Enter supplier name"
            required
          />
          <FormInput
            label="Storage Location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Enter storage location"
            required
          />
        </div>

        {/* Description */}
        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter item description"
          rows={3}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddItemsModal;
