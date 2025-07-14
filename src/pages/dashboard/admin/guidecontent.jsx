// import React from 'react';

// const AdminGuidePage = () => {
//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <h1 className="text-2xl font-bold text-gray-900 mb-4">Hospital Admin Dashboard — Guide & Workflow</h1>
//         <p className="text-gray-600 mb-6">This guide provides a structured overview of how to use the Hospital Management System effectively as an administrator.</p>

//         <section className="mb-8">
//           <h2 className="text-lg font-semibold text-gray-900 mb-2">1️⃣ Staff Management</h2>
//           <ul className="list-disc pl-6 text-gray-700">
//             <li><strong>Add New Staff:</strong> Use the “Add Staff” form to register doctors, nurses, ward boys, and other staff members. Set role, department, and login password while adding.</li>
//             <li><strong>Update Staff:</strong> Go to the staff list, click “View” or “Edit” on any staff profile to update details such as role or contact information.</li>
//             <li><strong>Deactivate Staff:</strong> Mark staff as inactive instead of deleting for record-keeping.</li>
//           </ul>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-lg font-semibold text-gray-900 mb-2">2️⃣ Patient Management</h2>
//           <ul className="list-disc pl-6 text-gray-700">
//             <li><strong>Add Patient (IPD/OPD):</strong> Use separate forms to admit new patients. IPD form includes ward, bed number, medical history, and admission date.</li>
//             <li><strong>Patient Records:</strong> View, update, or discharge patient profiles from the patient list. Includes emergency contact and medical history overview.</li>
//             <li><strong>Search Patients:</strong> Use patient list filters for quick search by name, department, or patient type.</li>
//           </ul>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-lg font-semibold text-gray-900 mb-2">3️⃣ Department & Ward Setup</h2>
//           <ul className="list-disc pl-6 text-gray-700">
//             <li><strong>Manage Departments:</strong> Add or update departments such as Cardiology, Pediatrics, etc., which will be linked to both staff and patient forms.</li>
//             <li><strong>Manage Wards & Beds:</strong> Assign ward and bed numbers while admitting IPD patients for better organization.</li>
//           </ul>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-lg font-semibold text-gray-900 mb-2">4️⃣ Login & Security</h2>
//           <ul className="list-disc pl-6 text-gray-700">
//             <li><strong>Admin Login:</strong> Admin users must log in with their assigned email and password.</li>
//             <li><strong>Staff Login Credentials:</strong> When adding staff, make sure to set a password. Staff can use their credentials to log in (if login functionality is set up for them).</li>
//             <li><strong>Role-Based Access Control (RBAC):</strong> Only admin users have access to staff and department management pages. Regular staff can only access patient management based on their roles (if implemented).</li>
//           </ul>
//         </section>

//         <section className="mb-8">
//           <h2 className="text-lg font-semibold text-gray-900 mb-2">5️⃣ Best Practices for Smooth Operation</h2>
//           <ul className="list-disc pl-6 text-gray-700">
//             <li>Always check department availability before adding new staff or patients.</li>
//             <li>Assign unique email and phone numbers for each staff to avoid duplication errors.</li>
//             <li>Fill in medical history and allergy details carefully when admitting patients for better treatment planning.</li>
//             <li>Keep patient and staff data updated regularly for accurate record-keeping and audits.</li>
//           </ul>
//         </section>

//         <section>
//           <h2 className="text-lg font-semibold text-gray-900 mb-2">📞 Support</h2>
//           <p className="text-gray-700">
//             For any issues or customization requests, contact the system administrator or IT support team.
//           </p>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default AdminGuidePage;


import React from 'react';

const AdminGuidePage = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hospital Admin Dashboard — Operational Workflow Guide</h1>
        <p className="text-gray-600 mb-6">This guide outlines the recommended step-by-step process for efficiently managing the hospital system as an administrator.</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 1️⃣ — Department Setup</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Create Departments:</strong> Start by adding departments such as Cardiology, Orthopedics, Pediatrics, etc., under the “Add Department” section. These departments form the organizational structure for both staff and patient management.</li>
            <li><strong>Review Department List:</strong> Verify the department list to ensure all required departments are created before proceeding further.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 2️⃣ — Add Doctors</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Register Doctors:</strong> Use the “Add Doctor” form to input essential details including specialization, department, availability, and contact information.</li>
            <li><strong>Verify Doctor List:</strong> Ensure that all doctors are listed correctly under the “Doctor List” section. Edit profiles as necessary.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 3️⃣ — Assign HODs (Head of Departments)</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Set HOD for Each Department:</strong> Assign one doctor as the Head of Department (HOD) through the “Add HOD” or department management section.</li>
            <li><strong>Role Management:</strong> HODs may have elevated access rights depending on system configuration. Ensure correct assignment.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 4️⃣ — Add Supporting Staff</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Register Non-Doctor Staff:</strong> Add nurses, wardboys, lab technicians, pharmacists, receptionists, and other staff members through the “Add Staff” form.</li>
            <li><strong>Department Assignment:</strong> Link each staff member to their respective department for organizational clarity.</li>
            <li><strong>Provide Login Credentials:</strong> Set login passwords while adding staff to ensure secure access.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 5️⃣ — Patient Registration</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Add Patient Details:</strong> Admit new patients using either the “Add Patient OPD” or “Add Patient IPD” forms depending on their treatment type.</li>
            <li><strong>Capture Medical Information:</strong> Record patient history, allergies, emergency contacts, and assign ward/bed numbers where applicable.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 6️⃣ — Doctor Appointment</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Assign Doctors to Patients:</strong> Schedule appointments by assigning a doctor to each patient through the “Appointments” section.</li>
            <li><strong>Manage Appointment List:</strong> Regularly review and update appointments to reflect changes in doctor availability or patient needs.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Step 7️⃣ — Pharmacy and Billing Management</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li><strong>Pharmacy Setup:</strong> Add available medicines, manage stock, and handle pharmacy-related transactions under the “Pharmacy” section.</li>
            <li><strong>Generate Bills & Invoices:</strong> Record expenses, generate patient bills, and maintain financial records through the “Finance” section.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">📢 Important Notes</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Ensure all staff and patient information is up-to-date for accurate reporting and smooth hospital operations.</li>
            <li>Use role-based access settings to maintain data security and limit unauthorized access.</li>
            <li>Regularly back up data and consult IT support in case of technical issues.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminGuidePage;
