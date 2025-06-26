import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button } from '../../../components/common/FormElements';

const PharmacyList = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pharmacy`);
        setPharmacies(res.data);
      } catch (err) {
        console.error('Failed to fetch pharmacies:', err);
      }
    };

    fetchPharmacies();
  }, []);

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Registered Pharmacies</h2>
          <Button onClick={() => navigate('/dashboard/admin/pharmacies/add')}>+ Add Pharmacy</Button>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Name</th>
                <th className="px-6 py-3 text-left font-semibold">License</th>
                <th className="px-6 py-3 text-left font-semibold">Phone</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map(pharmacy => (
                <tr key={pharmacy._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{pharmacy.name}</td>
                  <td className="px-6 py-4">{pharmacy.licenseNumber}</td>
                  <td className="px-6 py-4">{pharmacy.phone || '—'}</td>
                  <td className="px-6 py-4">{pharmacy.status}</td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/admin/pharmacies/${pharmacy._id}`)}>View</Button>
                  </td>
                </tr>
              ))}
              {pharmacies.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">No pharmacies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyList;
