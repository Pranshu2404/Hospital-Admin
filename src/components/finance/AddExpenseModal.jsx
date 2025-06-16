import { useState } from 'react';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

const AddExpenseModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    vendor: '',
    description: '',
    amount: '',
    department: '',
    approvedBy: '',
    paymentMethod: '',
    receiptNumber: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Expense data:', formData);
    onClose();
    // Reset form
    setFormData({
      date: '',
      category: '',
      vendor: '',
      description: '',
      amount: '',
      department: '',
      approvedBy: '',
      paymentMethod: '',
      receiptNumber: '',
      notes: ''
    });
  };

  const categoryOptions = [
    { value: 'medical_equipment', label: 'Medical Equipment' },
    { value: 'medical_supplies', label: 'Medical Supplies' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'staff_salaries', label: 'Staff Salaries' },
    { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'rent', label: 'Rent' },
    { value: 'other', label: 'Other' }
  ];

  const departmentOptions = [
    { value: 'general', label: 'General Medicine' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'laboratory', label: 'Laboratory' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'administration', label: 'Administration' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense Record" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
          <FormInput
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        {/* Category and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
            required
          />
          <FormSelect
            label="Department"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            options={departmentOptions}
            placeholder="Select department"
            required
          />
        </div>

        {/* Vendor and Description */}
        <FormInput
          label="Vendor/Supplier"
          value={formData.vendor}
          onChange={(e) => handleInputChange('vendor', e.target.value)}
          placeholder="Enter vendor name"
          required
        />

        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter detailed description of the expense"
          rows={3}
          required
        />

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            options={paymentMethodOptions}
            placeholder="Select payment method"
            required
          />
          <FormInput
            label="Receipt Number"
            value={formData.receiptNumber}
            onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
            placeholder="Enter receipt number"
          />
        </div>

        <FormInput
          label="Approved By"
          value={formData.approvedBy}
          onChange={(e) => handleInputChange('approvedBy', e.target.value)}
          placeholder="Enter approver name"
          required
        />

        {/* Additional Notes */}
        <FormTextarea
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Enter any additional notes"
          rows={2}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
