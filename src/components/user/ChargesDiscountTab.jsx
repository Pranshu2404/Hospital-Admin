import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../common/FormElements';
import { EditIcon, PlusIcon, DeleteIcon } from '../common/Icons';
import ProfileInfoRow from './ProfileInfoRow';

const ChargesDiscountTab = ({ hospitalData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chargesData, setChargesData] = useState({
    registrationFee: 0,
    discountType: 'fixed',
    discountValue: 0,
    ipdCharges: {
      roomCharges: [],
      nursingCharges: 0,
      otCharges: 0,
      miscellaneous: 0
    }
  });

  // ✅ Fetch charges from backend
  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/hospital-charges/${hospitalData._id}`
        );
        if (res.data) {
          setChargesData({
            registrationFee: res.data.opdCharges?.registrationFee || 0,
            discountType: res.data.opdCharges?.discountType || 'fixed',
            discountValue: res.data.opdCharges?.discountValue || 0,
            ipdCharges: res.data.ipdCharges || {
              roomCharges: [],
              nursingCharges: 0,
              otCharges: 0,
              miscellaneous: 0
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
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/hospital-charges`, {
        hospital: hospitalData._id,
        opdCharges: {
          registrationFee: chargesData.registrationFee,
          discountType: chargesData.discountType,
          discountValue: chargesData.discountValue
        },
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
        roomCharges: [
          ...prev.ipdCharges.roomCharges,
          { type: 'General', chargePerDay: 0 }
        ]
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
          value={chargesData.registrationFee}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({ ...prev, registrationFee: Number(val) }))}
        />
        <ProfileInfoRow
          label="Discount Type"
          value={chargesData.discountType}
          isEditing={isEditing}
          type="select"
          options={[
            { label: 'Fixed', value: 'fixed' },
            { label: 'Percentage', value: 'percentage' }
          ]}
          onChange={(val) => setChargesData(prev => ({ ...prev, discountType: val }))}
        />
        <ProfileInfoRow
          label="Discount Value"
          value={chargesData.discountValue}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({ ...prev, discountValue: Number(val) }))}
        />
      </div>

      {/* ✅ IPD Charges */}
      <h4 className="text-md font-semibold text-gray-900 mb-4">IPD Charges</h4>
      {/* Nursing, OT, Misc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProfileInfoRow
          label="Nursing Charges"
          value={chargesData.ipdCharges.nursingCharges}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev,
            ipdCharges: { ...prev.ipdCharges, nursingCharges: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="OT Charges"
          value={chargesData.ipdCharges.otCharges}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev,
            ipdCharges: { ...prev.ipdCharges, otCharges: Number(val) }
          }))}
        />
        <ProfileInfoRow
          label="Miscellaneous"
          value={chargesData.ipdCharges.miscellaneous}
          isEditing={isEditing}
          type="number"
          onChange={(val) => setChargesData(prev => ({
            ...prev,
            ipdCharges: { ...prev.ipdCharges, miscellaneous: Number(val) }
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
