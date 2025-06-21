import React from 'react';
import { Button } from '../common/FormElements';

const StaffProfile = ({ selectedStaff, setCurrentPage }) => {
  if (!selectedStaff) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No staff selected</p>
        <Button onClick={() => setCurrentPage('StaffList')} className="mt-4">
          Back to Staff List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedStaff.name}</h2>
            <p className="text-sm text-gray-500">{selectedStaff.role}</p>
          </div>
          <Button onClick={() => setCurrentPage('StaffList')}>Back to Staff List</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-sm">Email</label>
            <p className="text-gray-800">{selectedStaff.email}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Phone</label>
            <p className="text-gray-800">{selectedStaff.phone}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Department</label>
            <p className="text-gray-800">{selectedStaff.department}</p>
          </div>
          <div>
            <label className="text-gray-500 text-sm">Joining Date</label>
            <p className="text-gray-800">{selectedStaff.joinedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
