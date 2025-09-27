import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { FormInput, Button } from '../../../components/common/FormElements';

const AddPharmacy = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/pharmacy`, form);
      navigate('/dashboard/admin/pharmacies');
    } catch (err) {
      console.error('Failed to add pharmacy:', err);
    }
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 mx-auto">
        <h2 className="text-2xl font-bold mb-6">Register New Pharmacy</h2>
        <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormInput label="Pharmacy Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          <FormInput label="License Number" value={form.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} required />
          <FormInput label="Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} type="email" required />
          <FormInput label="Phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          <FormInput label="Address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
          <FormInput label="Password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} type="password" required />
          </div>
          <Button type="submit" variant="primary">Create Pharmacy</Button>
        </form>
      </div>
    </Layout>
  );
};

export default AddPharmacy;
