import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, EditIcon, DeleteIcon, ViewIcon } from '../common/Icons';
import ChoosePatientTypeModal2 from '../patients/ChoosePatientTypeModal2';
import { useLocation } from 'react-router-dom';

const AppointmentSlipModal = ({ isOpen, onClose, appointmentData, hospitalInfo }) => {
  const [billingDetails, setBillingDetails] = useState(null);
  
  useEffect(() => {
    if (isOpen && appointmentData) {
      const fetchBillingDetails = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/billing/appointment/${appointmentData._id}`
          );
          console.log(response.data);
          setBillingDetails(response.data.bill);
        } catch (error) {
          console.error('Error fetching billing details:', error);
          setBillingDetails(null);
        }
      };
      
      fetchBillingDetails();
    }
  }, [isOpen, appointmentData]);

  if (!isOpen || !appointmentData) return null;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body, html {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          body * { 
            visibility: hidden; 
          }
          .printable-slip-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            background: white;
          }
          .printable-slip, .printable-slip * { 
            visibility: visible; 
          }
          .printable-slip { 
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            margin: 0 auto;
            padding: 15mm;
            background: white;
            font-size: 12pt;
            box-shadow: none;
          }
          .no-print { 
            display: none !important; 
          }
          .slip-header {
            border-bottom: 2px dashed #ccc;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .slip-section {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #eee;
          }
          .slip-footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #ccc;
            font-size: 10pt;
          }
        }

        /* Screen styles */
        @media screen {
          .printable-slip-container {
            position: fixed;
            inset: 0;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            padding: 20px;
            overflow-y: auto;
          }
          .printable-slip {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px;
          }
        }
      `}</style>

      <div className="printable-slip-container no-print">
        <div className="printable-slip">
          {/* Header */}
          <div className="text-center slip-header">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">APPOINTMENT SLIP</h2>
            <h3 className="text-xl font-semibold text-blue-800">{hospitalInfo?.name || 'MEDICAL CENTER'}</h3>
            <p className="text-sm text-gray-600 mt-1">{hospitalInfo?.address || 'Hospital Address'}</p>
            <p className="text-sm text-gray-600">
              {hospitalInfo?.phone ? `Tel: ${hospitalInfo.phone} • ` : ''}
              {hospitalInfo?.email || ''}
            </p>
          </div>

          {/* Appointment Details */}
          <div className="slip-section">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">APPOINTMENT DETAILS</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-600 font-medium">Slip No:</span> <span className="font-semibold">#{appointmentData._id?.slice(-8).toUpperCase() || 'N/A'}</span></div>
              <div><span className="text-gray-600 font-medium">Date:</span> <span className="font-semibold">{new Date().toLocaleDateString()}</span></div>
              
              <div><span className="text-gray-600 font-medium">Patient Name:</span> <strong className="text-blue-800">{appointmentData.patientName}</strong></div>
              <div><span className="text-gray-600 font-medium">Patient ID:</span> <strong>{appointmentData.patientId || 'N/A'}</strong></div>
              
              <div><span className="text-gray-600 font-medium">Appointment Type:</span> <strong>{appointmentData.type || 'Consultation'}</strong></div>
              <div><span className="text-gray-600 font-medium">Department:</span> <strong>{appointmentData.departmentName}</strong></div>
              
              <div><span className="text-gray-600 font-medium">Doctor:</span> <strong className="text-green-700">{appointmentData.doctorName}</strong></div>
              <div><span className="text-gray-600 font-medium">Status:</span> <span className="font-semibold">{appointmentData.status}</span></div>
              {appointmentData.type === "time-based" && (
                <div className="col-span-2">
                  <span className="text-gray-600 font-medium">Appointment Date & Time:</span>{' '}
                  <strong className="text-red-600">{appointmentData.date}, {appointmentData.time}</strong>
                </div>
              )}
              {appointmentData.type === "number-based" && (
                <div className="col-span-2">
                  <span className="text-gray-600 font-medium">Appointment Number:</span>{' '}
                  <strong className="text-red-600">{appointmentData.serial_number}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Billing Details */}
          {billingDetails && billingDetails.details && billingDetails.details.length > 0 && (
            <div className="slip-section">
              <h4 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">BILLING DETAILS</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-5 gap-2 font-medium text-gray-700">
                  <div className="col-span-3">Description</div>
                  <div>Qty</div>
                  <div>Amount</div>
                </div>
                {billingDetails.details.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 border-b pb-1">
                    <div className="col-span-3">{item.description || 'Consultation Fee'}</div>
                    <div>{item.quantity || 1}</div>
                    <div>₹{item.amount?.toFixed(2) || '0.00'}</div>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-2 font-bold border-t pt-2 mt-2">
                  <div className="col-span-4 text-right">Total Amount:</div>
                  <div>₹{billingDetails.total_amount?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-4 text-right">Payment Method:</div>
                  <div className="font-medium">{billingDetails.payment_method || 'Cash'}</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-4 text-right">Payment Status:</div>
                  <div className={`font-medium ${
                    billingDetails.status === 'Paid' ? 'text-green-600' : 
                    billingDetails.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {billingDetails.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="slip-section mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">IMPORTANT INSTRUCTIONS</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
              <li>Please arrive 15 minutes before your appointment time</li>
              <li>Bring this slip and your ID proof for verification</li>
              <li>Carry all previous medical reports and prescriptions</li>
              <li>In case of cancellation, please inform 24 hours in advance</li>
              <li>Late arrivals may need to reschedule</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="slip-footer text-center">
            <p className="text-xs text-gray-500 mb-2">** This is computer generated slip - no signature required **</p>
            <p className="text-xs text-gray-400">
              {hospitalInfo?.website ? `Website: ${hospitalInfo.website} • ` : ''}
              Emergency: {hospitalInfo?.emergency_phone || 'XXXX-XXXXXX'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Thank you for choosing {hospitalInfo?.name || 'our hospital'}. We wish you good health!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t flex justify-end space-x-3 no-print mt-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
            <button 
              onClick={handlePrint} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Print Slip
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentSlipModal;