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

const ReportsPage = () => {
  return (
    <main className="flex-1 min-h-screen  px-6 py-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Patient Reports</h1>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{report.title}</h2>
                <p className="text-sm text-gray-600">Patient: {report.patientName}</p>
                <p className="text-sm text-gray-500">Date: {report.date}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={report.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  View
                </a>
                <a
                  href={report.file}
                  download
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ReportsPage;
