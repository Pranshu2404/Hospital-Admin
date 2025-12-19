import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button } from '../../../components/common/FormElements';

const PharmacyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/pharmacy/${id}`);
        setPharmacy(res.data);
      } catch (err) {
        console.error('Error loading pharmacy:', err);
      }
    };

    fetchPharmacy();
  }, [id]);

  if (!pharmacy) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">{pharmacy.name}</h2>
        <p><strong>License:</strong> {pharmacy.licenseNumber}</p>
        <p><strong>Email:</strong> {pharmacy.email}</p>
        <p><strong>Phone:</strong> {pharmacy.phone || '—'}</p>
        <p><strong>Address:</strong> {pharmacy.address || '—'}</p>
        <p><strong>Status:</strong> {pharmacy.status}</p>
        <p><strong>Registered At:</strong> {new Date(pharmacy.registeredAt).toLocaleDateString()}</p>

        <div className="mt-6">
          <Button onClick={() => navigate('/dashboard/admin/pharmacies')}>← Back to List</Button>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyProfile;
