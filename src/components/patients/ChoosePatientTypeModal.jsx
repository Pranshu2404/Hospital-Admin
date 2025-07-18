




import React from "react";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const ChoosePatientTypeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    onClose();
    if (type === "opd") navigate("/dashboard/admin/patients/add-opd");
    else navigate("/dashboard/admin/patients/add-ipd");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-40 px-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">
            Add Patient
          </Dialog.Title>
          <p className="text-gray-600 mb-6">Please select the patient type to continue.</p>

          <div className="flex gap-4">
            <button
              onClick={() => handleSelect("opd")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
            >
              OPD
            </button>
            <button
              onClick={() => handleSelect("ipd")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
            >
              IPD
            </button>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ChoosePatientTypeModal;
