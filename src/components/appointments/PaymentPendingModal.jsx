// components/appointments/PaymentPendingModal.jsx
import React from 'react';
import { FaExclamationTriangle, FaMoneyBillWave, FaCalendarCheck } from 'react-icons/fa';

const PaymentPendingModal = ({ 
  isOpen, 
  onClose, 
  onProceed, 
  amount, 
  patientName,
  appointmentDetails 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-yellow-600 text-2xl" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
            Payment Pending Reminder
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            You are about to schedule an appointment with <span className="font-semibold">pending payment</span>.
          </p>
          
          {/* Details Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Amount Due</p>
                  <p className="text-lg font-bold text-gray-800">₹{amount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCalendarCheck className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium text-gray-800">{patientName || 'Unknown Patient'}</p>
                </div>
              </div>
              
              {appointmentDetails && (
                <>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Date:</span> {appointmentDetails.date}</p>
                    {appointmentDetails.time && (
                      <p><span className="font-medium">Time:</span> {appointmentDetails.time}</p>
                    )}
                    <p><span className="font-medium">Doctor:</span> {appointmentDetails.doctor}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Warning Message */}
          {/* <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">Important:</span> The payment status will be marked as "Pending" in the billing system. Please ensure to collect payment from the patient at the earliest convenience.
                </p>
              </div>
            </div>
          </div> */}
          
          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onProceed}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Proceed Anyway
            </button>
          </div>
          
          {/* Additional Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            The appointment will be created with "Pending" payment status. You can update the payment status later from the billing section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingModal;