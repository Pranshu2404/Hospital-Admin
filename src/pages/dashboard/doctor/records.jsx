// import React from 'react'

// function records() {
//   return (
//     <div>records</div>
//   )
// }

// export default records







import React from 'react';

const reports = [
  {
    id: 1,
    patientName: 'John Doe',
    title: 'Blood Test Report',
    date: '2025-06-20',
    file: '/reports/report1.pdf',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    title: 'MRI Scan Report',
    date: '2025-06-19',
    file: '/reports/report2.pdf',
  },
  {
    id: 3,
    patientName: 'Alice Brown',
    title: 'X-Ray Report',
    date: '2025-06-18',
    file: '/reports/report3.pdf',
  },
];

const Reports = () => {
  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Patient Reports</h1>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{report.title}</h2>
              <p className="text-gray-600">Patient: {report.patientName}</p>
              <p className="text-gray-500 text-sm">Date: {report.date}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={report.file}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                View
              </a>
              <a
                href={report.file}
                download
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Reports;
