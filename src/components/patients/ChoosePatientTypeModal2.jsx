// // ChoosePatientTypeModal.jsx
// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Dialog } from "@headlessui/react"; // Or use your modal library

// const ChoosePatientTypeModal = ({ isOpen, onClose }) => {
//   const navigate = useNavigate();

//   // const handleSelect = (type) => {
//   //   onClose();
//   //   if (type === "opd") navigate("/dashboard/admin/patients/add-opd");
//   //   else navigate("/dashboard/admin/patients/add-ipd");
    
    
//   // };
//     const handleSelect = (type) => {
//     onClose();
//     if (type === "opd") {
//       navigate("/dashboard/admin/patients/add-opd"); // ✅ correct full path
//     } else {
//       navigate("/dashboard/admin/patients/add-ipd"); // ✅ update this too if needed
//     }
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen">
//         <Dialog.Panel className="bg-white p-6 rounded-xl shadow-md">
//           <Dialog.Title className="text-lg font-medium">Select Patient Type</Dialog.Title>
//           <div className="mt-4 flex gap-4">
//             <button onClick={() => handleSelect("opd")} className="btn btn-primary">
//               OPD
//             </button>
//             <button onClick={() => handleSelect("ipd")} className="btn btn-secondary">
//               IPD
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default ChoosePatientTypeModal;







// import React from "react";
// import { Dialog } from "@headlessui/react";
// import { useNavigate } from "react-router-dom";

// const ChoosePatientTypeModal = ({ isOpen, onClose }) => {
//   const navigate = useNavigate();

//   const handleSelect = (type) => {
//     onClose();
//     if (type === "opd") navigate("/dashboard/admin/patients/add-opd");
//     else navigate("/dashboard/admin/patients/add-ipd");
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
//         <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
//           <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">
//             Add Patient
//           </Dialog.Title>
//           <p className="text-gray-600 mb-6">Please select the patient type to proceed.</p>
          
//           <div className="flex justify-between gap-4">
//             <button
//               onClick={() => handleSelect("opd")}
//               className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
//             >
//               OPD
//             </button>
//             <button
//               onClick={() => handleSelect("ipd")}
//               className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full"
//             >
//               IPD
//             </button>
//           </div>

//           <div className="flex justify-end mt-6">
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 text-sm"
//             >
//               Close
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// };

// export default ChoosePatientTypeModal;





import React from "react";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const ChoosePatientTypeModal2 = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    onClose();
    if (type === "opd") navigate("/dashboard/admin/patients/add-opd");
    else navigate("/dashboard/admin/ipd-appointments");
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

export default ChoosePatientTypeModal2;
