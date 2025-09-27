import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../common/FormElements';
import { EditIcon, PlusIcon, DeleteIcon } from '../common/Icons';
import ProfileInfoRow from './ProfileInfoRow';

const ChargesDiscountTab = ({ hospitalData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [chargesData, setChargesData] = useState({
    opdCharges: {
      registrationFee: 0,
      consultationFee: 0,
      discountType: 'Fixed',
      discountValue: 0,
    },
    ipdCharges: {
      admissionFee: 0,
      registrationFee: 0,
      consultationFee: 0,
      nursingCharges: 0,
      otCharges: 0,
      miscellaneous: 0,
      discountType: 'Fixed',
      discountValue: 0,
      roomCharges: [],
    }
  });

  // ✅ Fetch charges from backend
  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/hospital-charges/${hospitalData._id}`
        );
        if (res.data) {
          setChargesData({
            opdCharges: {
              registrationFee: res.data.opdCharges?.registrationFee || 0,
              consultationFee: res.data.opdCharges?.consultationFee || 0,
              discountType: res.data.opdCharges?.discountType || 'Fixed',
              discountValue: res.data.opdCharges?.discountValue || 0,
            },
            ipdCharges: {
              admissionFee: res.data.ipdCharges?.admissionFee || 0,
              registrationFee: res.data.ipdCharges?.registrationFee || 0,
              consultationFee: res.data.ipdCharges?.consultationFee || 0,
              nursingCharges: res.data.ipdCharges?.nursingCharges || 0,
              otCharges: res.data.ipdCharges?.otCharges || 0,
              miscellaneous: res.data.ipdCharges?.miscellaneous || 0,
              discountType: res.data.ipdCharges?.discountType || 'Fixed',
              discountValue: res.data.ipdCharges?.discountValue || 0,
              roomCharges: res.data.ipdCharges?.roomCharges || [],
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch charges:', err);
      }
    };
    fetchCharges();
  }, [hospitalData._id]);

  // ✅ Save charges
  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/hospital-charges`, {
        hospital: hospitalData._id,
        opdCharges: chargesData.opdCharges,
        ipdCharges: chargesData.ipdCharges
      });
      alert('Charges updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating charges:', err);
      alert('Failed to update charges');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add a new room charge
  const handleAddRoomCharge = () => {
    setChargesData(prev => ({
      ...prev,
      ipdCharges: {
        ...prev.ipdCharges,
        roomCharges: [...prev.ipdCharges.roomCharges, { type: 'General', chargePerDay: 0 }]
      }
    }));
  };

  // ✅ Update a room charge
  const handleRoomChargeChange = (index, field, value) => {
    const updatedRoomCharges = [...chargesData.ipdCharges.roomCharges];
    updatedRoomCharges[index][field] = field === 'chargePerDay' ? Number(value) : value;
    setChargesData(prev => ({
      ...prev,
      ipdCharges: { ...prev.ipdCharges, roomCharges: updatedRoomCharges }
    }));
  };

  // ✅ Delete a room charge
  const handleDeleteRoomCharge = (index) => {
    const updatedRoomCharges = chargesData.ipdCharges.roomCharges.filter((_, i) => i !== index);
    setChargesData(prev => ({
      ...prev,
      ipdCharges: { ...prev.ipdCharges, roomCharges: updatedRoomCharges }
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Charges & Discounts</h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <EditIcon /> Edit Charges
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* ✅ OPD Charges */}
      <h4 className="text-md font-semibold text-gray-900 mb-4">OPD Charges</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ProfileInfoRow
          label="Registration Fee"
          value={chargesData.opdCharges.registrationFee}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, opdCharges: { ...prev.opdCharges, registrationFee: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Consultation Fee"
          value={chargesData.opdCharges.consultationFee}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, opdCharges: { ...prev.opdCharges, consultationFee: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Discount Type"
          value={chargesData.opdCharges.discountType}
          isEditing={isEditing}
          type="select"
          options={[
            { label: 'Fixed', value: 'Fixed' },
            { label: 'Percentage', value: 'Percentage' }
          ]}
          onChange={(val) => setChargesData(prev => ({
            ...prev, opdCharges: { ...prev.opdCharges, discountType: val }
          }))}
        />
        <ProfileInfoRow
          label="Discount Value"
          value={chargesData.opdCharges.discountValue}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, opdCharges: { ...prev.opdCharges, discountValue: Number(val) }
          }))}
        />
      </div>

      {/* ✅ IPD Charges */}
      <h4 className="text-md font-semibold text-gray-900 mb-4">IPD Charges</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProfileInfoRow
          label="Admission Fee"
          value={chargesData.ipdCharges.admissionFee}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, admissionFee: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Registration Fee"
          value={chargesData.ipdCharges.registrationFee}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, registrationFee: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Consultation Fee"
          value={chargesData.ipdCharges.consultationFee}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, consultationFee: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Nursing Charges"
          value={chargesData.ipdCharges.nursingCharges}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, nursingCharges: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="OT Charges"
          value={chargesData.ipdCharges.otCharges}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, otCharges: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Miscellaneous"
          value={chargesData.ipdCharges.miscellaneous}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, miscellaneous: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Discount Type"
          value={chargesData.ipdCharges.discountType}
          isEditing={isEditing}
          type="select"
          options={[
            { label: 'Fixed', value: 'Fixed' },
            { label: 'Percentage', value: 'Percentage' }
          ]}
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, discountType: val }
          }))}
        />
        <ProfileInfoRow
          label="Discount Value"
          value={chargesData.ipdCharges.discountValue}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev, ipdCharges: { ...prev.ipdCharges, discountValue: Number(val) }
          }))}
        />
      </div>

      {/* ✅ Room Charges */}
      <h4 className="text-md font-semibold text-gray-900 mb-2">Room Charges</h4>
      {chargesData.ipdCharges.roomCharges.length === 0 && !isEditing && (
        <p className="text-gray-500 mb-4">No room charges added</p>
      )}
      {chargesData.ipdCharges.roomCharges.map((room, index) => (
        <div key={index} className="flex items-center space-x-4 mb-3">
          {isEditing ? (
            <>
              <select
                value={room.type}
                onChange={(e) => handleRoomChargeChange(index, 'type', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="General">General</option>
                <option value="Semi-Private">Semi-Private</option>
                <option value="Private">Private</option>
                <option value="ICU">ICU</option>
              </select>
              <input
                type="number"
                value={room.chargePerDay}
                onChange={(e) => handleRoomChargeChange(index, 'chargePerDay', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Charge per day"
              />
              <button
                onClick={() => handleDeleteRoomCharge(index)}
                className="text-red-500 hover:text-red-700"
              >
                <DeleteIcon />
              </button>
            </>
          ) : (
            <p className="text-gray-700">{room.type} - ₹{room.chargePerDay}/day</p>
          )}
        </div>
      ))}
      {isEditing && (
        <Button variant="outline" size="sm" onClick={handleAddRoomCharge} className="mt-3">
          <PlusIcon /> Add Room Charge
        </Button>
      )}
    </div>
  );
};

export default ChargesDiscountTab;
