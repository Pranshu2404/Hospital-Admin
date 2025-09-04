import React from "react";

const PaymentModal = ({ onClose, amount, qrImageUrl, status }) => {
  // Define colors and icons for statuses
  const getStatusStyles = (status) => {
    switch (status) {
      case "success":
        return { color: "text-green-600", icon: "✅", text: "Payment Successful" };
      case "failed":
        return { color: "text-red-600", icon: "❌", text: "Payment Failed" };
      case "pending":
      default:
        return { color: "text-yellow-600", icon: "⏳", text: "Waiting for Payment…" };
    }
  };

  const { color, icon, text } = getStatusStyles(status);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-8 rounded-3xl text-center shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Scan to Pay</h2>

        {/* Amount */}
        <p className="text-xl mb-6 text-gray-700">
          Amount:{" "}
          <span className="font-bold text-blue-600">₹{Number(amount || 0).toFixed(2)}</span>
        </p>

        {/* QR Code */}
        <div className="flex items-center justify-center mb-6">
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="Razorpay QR Code"
              className="w-full max-w-[320px] max-h-[400px] object-contain rounded-xl shadow-md"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <svg
                className="animate-spin h-6 w-6 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              <p className="mt-3 text-base">Loading...</p>
            </div>
          )}
        </div>

        {/* Status Text */}
        <p className={`mt-2 text-lg font-semibold capitalize transition-colors ${color}`}>
          {icon} {text}
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
