import { useState } from 'react';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// --- Guide Content structured for easy maintenance ---
const guideData = [
  {
    title: 'Department Setup',
    content: [
      'Create Departments: Start by adding departments such as Cardiology, Orthopedics, etc., under the "Add Department" section.',
      'Review Department List: Verify the department list to ensure all required departments are created before proceeding.'
    ]
  },
  {
    title: 'Add Doctors',
    content: [
      'Register Doctors: Use the "Add Doctor" form to input essential details including specialization, department, availability, and contact information.',
      'Verify Doctor List: Ensure that all doctors are listed correctly under the "Doctor List" section. Edit profiles as necessary.'
    ]
  },
  {
    title: 'Assign HODs (Head of Departments)',
    content: [
      'Set HOD for Each Department: Assign one doctor as the Head of Department (HOD) through the "Add HOD" or department management section.',
      'Role Management: HODs may have elevated access rights depending on system configuration. Ensure correct assignment.'
    ]
  },
  {
    title: 'Add Supporting Staff',
    content: [
      'Register Non-Doctor Staff: Add nurses, wardboys, lab technicians, pharmacists, and other staff members through the "Add Staff" form.',
      'Department Assignment: Link each staff member to their respective department for organizational clarity.'
    ]
  },
  {
    title: 'Patient Registration',
    content: [
      'Add Patient Details: Admit new patients using either the "Add Patient OPD" or "Add Patient IPD" Forms depending on their treatment type.',
      'Capture Medical Information: Record patient history, allergies, emergency contacts, and assign ward/bed numbers where applicable.'
    ]
  },
  {
    title: 'Doctor Appointment',
    content: [
      'Assign Doctors to Patients: Schedule appointments by assigning a doctor to each patient through the "Appointments" section.',
      'Manage Appointment List: Regularly review and update appointments to reflect changes in doctor availability or patient needs.'
    ]
  },
  {
    title: 'Pharmacy and Billing Management',
    content: [
      'Pharmacy Setup: Add available medicines, manage stock, and handle pharmacy-related transactions under the "Pharmacy" section.',
      'Generate Bills & Invoices: Record expenses, generate patient bills, and maintain financial records through the "Finance" section.'
    ]
  }
];

const AdminGuidePage = () => {
  // State to track which accordion item is open
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    // If the clicked item is already open, close it. Otherwise, open it.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Hospital Admin Dashboard</h2>
            <p className="text-lg text-gray-600 mt-2">Operational Workflow Guide</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {guideData.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                >
                  <span className="text-lg font-semibold text-gray-800">{`Step ${index + 1} — ${item.title}`}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {/* Accordion Content */}
                {openIndex === index && (
                  <div className="p-5 border-t border-gray-200 bg-white">
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {item.content.map((point, pointIndex) => (
                        <li key={pointIndex}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminGuidePage;