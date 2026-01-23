// SuccessModal.jsx
import { FaCheckCircle, FaUser, FaCalendarAlt, FaClock, FaTimes } from 'react-icons/fa';
import { Button } from '../common/FormElements';

const SuccessModal = ({ isOpen, onClose, message, patientName, isPatient, onContinue, showSlipButton = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-full mr-4">
                <FaCheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Success!</h3>
                <p className="text-gray-600">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {patientName && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full mr-3">
                  <FaUser className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Patient Details</p>
                  <p className="text-gray-700">{patientName}</p>
                </div>
              </div>
            </div>
          )}

          {isPatient ? (
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <FaCheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                <span>Patient added to database</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaCheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                <span>Ready for appointment scheduling</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <FaCalendarAlt className="h-5 w-5 text-emerald-500 mr-3" />
                <span>Appointment scheduled successfully</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaClock className="h-5 w-5 text-emerald-500 mr-3" />
                <span>Billing record created</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-8">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {isPatient && onContinue && (
              <Button
                variant="primary"
                onClick={onContinue}
              >
                Schedule Appointment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;