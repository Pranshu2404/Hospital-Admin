import React from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave } from 'react-icons/fa'; // Ensure you have react-icons installed

/**
 * A clickable card component that displays revenue information and links to another page.
 */
const RevenueCardLink = () => {
  // Define the destination path for the link
  const invoicesPath = "/dashboard/pharmacy/invoices";

  // Data for the card (can be replaced with props later)
  const revenueAmount = "₹2,450";
  const percentageChange = "+12%";

  return (
    // The Link component from React Router wraps the entire card
    <Link to={invoicesPath} style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Added transition and hover effects for better user feedback */}
      <div className="bg-white rounded-xl shadow-md p-5 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
        
        {/* Top section with icon and main figures */}
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
            <FaMoneyBillWave className="text-2xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Today's Revenue</div>
            <div className="text-2xl font-bold text-gray-800">{revenueAmount}</div>
          </div>
        </div>

        {/* Bottom section with percentage change */}
        <div className="text-xs text-green-600 mt-2">
          {percentageChange} from yesterday
        </div>

      </div>
    </Link>
  );
};

export default RevenueCardLink;