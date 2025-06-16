import { useState } from 'react';
import { Modal } from '../common/Modals';
import { FormInput, FormSelect, FormTextarea, Button } from '../common/FormElements';

const AddIncomeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    source: '',
    category: '',
    amount: '',
    patientId: '',
    doctorId: '',
    description: '',
    paymentMethod: '',
    referenceNumber: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Income data:', formData);
    onClose();
    // Reset form
    setFormData({
      date: '',
      source: '',
      category: '',
      amount: '',
      patientId: '',
      doctorId: '',
      description: '',
      paymentMethod: '',
      referenceNumber: ''
    });
  };

  const sourceOptions = [
    { value: 'consultation', label: 'Patient Consultation' },
    { value: 'laboratory', label: 'Laboratory Services' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'pharmacy', label: 'Pharmacy Sales' },
    { value: 'emergency', label: 'Emergency Services' },
    { value: 'radiology', label: 'Radiology Services' },
    { value: 'other', label: 'Other' }
  ];

  const categoryOptions = [
    { value: 'service_fee', label: 'Service Fee' },
    { value: 'diagnostic_fee', label: 'Diagnostic Fee' },
    { value: 'procedure_fee', label: 'Procedure Fee' },
    { value: 'medication_sales', label: 'Medication Sales' },
    { value: 'emergency_fee', label: 'Emergency Fee' },
    { value: 'room_charges', label: 'Room Charges' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'check', label: 'Check' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Income Record" maxWidth="max-w-2xl">
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

        {/* Source and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Income Source"
            value={formData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            options={sourceOptions}
            placeholder="Select source"
            required
          />
          <FormSelect
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
            required
          />
        </div>

        {/* Patient and Doctor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Patient ID (if applicable)"
            value={formData.patientId}
            onChange={(e) => handleInputChange('patientId', e.target.value)}
            placeholder="Enter patient ID"
          />
          <FormInput
            label="Doctor ID (if applicable)"
            value={formData.doctorId}
            onChange={(e) => handleInputChange('doctorId', e.target.value)}
            placeholder="Enter doctor ID"
          />
        </div>

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
            label="Reference Number"
            value={formData.referenceNumber}
            onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
            placeholder="Enter reference number"
          />
        </div>

        {/* Description */}
        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter detailed description of the income"
          rows={3}
          required
        />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Income
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIncomeModal;
