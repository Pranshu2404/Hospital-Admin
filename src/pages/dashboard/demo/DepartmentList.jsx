import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// --- Custom Icons ---
const Icons = {
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
};

const DepartmentList = () => {
  const [hods, setHods] = useState([]);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHods = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments/hods/all`);
        const hodList = res.data;

        // Extract unique department IDs from HODs
        const departmentIds = [...new Set(hodList.map(hod => hod.department))];

        // Fetch each department's name using its ID
        const deptPromises = departmentIds.map(id =>
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments/${id}`)
        );
        const deptResponses = await Promise.all(deptPromises);

        // Map department ID to name
        const deptMap = {};
        deptResponses.forEach(response => {
          deptMap[response.data._id] = response.data.name;
        });

        setDepartmentsMap(deptMap);
        setHods(hodList);
      } catch (err) {
        console.error('Failed to fetch HODs or departments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHods();
  }, []);

  // Helper to generate random avatar colors
  const getAvatarColor = (name) => {
    const colors = [
        'bg-blue-100 text-blue-600 border-blue-200',
        'bg-emerald-100 text-emerald-600 border-emerald-200',
        'bg-violet-100 text-violet-600 border-violet-200',
        'bg-amber-100 text-amber-600 border-amber-200',
        'bg-rose-100 text-rose-600 border-rose-200'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-8 min-h-screen bg-slate-50/50 font-sans text-slate-800">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Head of Departments</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage and view all department heads.</p>
            </div>
            
            <div className="mt-4 md:mt-0 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">Total HODs:</span>
                <span className="text-lg font-bold text-emerald-600">{hods.length}</span>
            </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
             <div className="flex h-64 items-center justify-center text-slate-400 font-medium">Loading HODs...</div>
        ) : hods.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
                <Icons.Search />
                <h3 className="text-lg font-bold text-slate-800">No HODs Found</h3>
                <p className="text-slate-500 mt-1 max-w-sm">
                    There are currently no Head of Departments assigned. Go to the "Add HOD" page to assign leaders.
                </p>
            </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Profile & Name</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Experience</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hods.map((hod) => {
                    const fullName = `${hod.firstName} ${hod.lastName}`;
                    const initials = `${hod.firstName[0]}${hod.lastName[0]}`;
                    
                    return (
                      <tr key={hod._id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Column 1: Avatar & Name */}
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border ${getAvatarColor(fullName)}`}>
                                    {initials}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{fullName}</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                        {hod.specialization || 'General'}
                                    </p>
                                </div>
                            </div>
                        </td>

                        {/* Column 2: Department */}
                        <td className="px-8 py-5">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200">
                                {departmentsMap[hod.department] || 'Unassigned'}
                            </span>
                        </td>

                        {/* Column 3: Contact */}
                        <td className="px-8 py-5">
                           <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className="p-1 rounded bg-slate-100 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Icons.Mail />
                                    </div>
                                    <span className="truncate max-w-[180px]" title={hod.email}>{hod.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                     <div className="p-1 rounded bg-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <Icons.Phone />
                                    </div>
                                    <span>{hod.phone}</span>
                                </div>
                           </div>
                        </td>

                        {/* Column 4: Experience */}
                        <td className="px-8 py-5 text-right">
                           <div className="inline-block text-right">
                                <span className="block text-lg font-bold text-slate-800">{hod.experience} <span className="text-sm font-medium text-slate-400">Yrs</span></span>
                                <span className="text-xs text-slate-400 font-medium">Experience</span>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DepartmentList;