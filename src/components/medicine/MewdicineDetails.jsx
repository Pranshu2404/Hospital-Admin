import { Button } from '../common/FormElements';

const MedicineDetail = ({ selectedMedicine, setCurrentPage }) => {
  if (!selectedMedicine) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">No medicine selected</p>
        <div className="text-center mt-4">
          <Button onClick={() => setCurrentPage('MedicineList')} variant="outline">
            Back to Medicine List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedMedicine.name}</h2>
            <p className="text-sm text-gray-500">{selectedMedicine.type} • {selectedMedicine.status}</p>
          </div>
          <Button onClick={() => setCurrentPage('MedicineList')} variant="outline">
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 font-medium">Manufacturer</p>
            <p className="text-gray-800">{selectedMedicine.manufacturer}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Expiry Date</p>
            <p className="text-gray-800">{selectedMedicine.expiryDate}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Price</p>
            <p className="text-gray-800">₹{selectedMedicine.price}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Quantity Available</p>
            <p className="text-gray-800">{selectedMedicine.quantity}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 font-medium mb-1">Description</p>
            <p className="text-gray-700">{selectedMedicine.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetail;
