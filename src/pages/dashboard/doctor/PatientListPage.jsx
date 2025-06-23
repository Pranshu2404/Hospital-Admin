import React, { useState } from 'react';
import { FaSearch, FaThLarge, FaList } from 'react-icons/fa';

const patients = [
  {
    id: 'PT0001',
    name: 'Janine Gomez',
    age: 32,
    gender: 'Female',
    bloodGroup: 'O+',
    diagnosis: 'The process of identifying a disease, condition, or injury from its signs and...',
    lastVisit: '06/06/2024 at 2:30PM',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 'PT0002',
    name: 'Graciela Chase',
    age: 39,
    gender: 'Female',
    bloodGroup: 'B+',
    diagnosis: 'The process of identifying a disease, condition, or injury from its signs and...',
    lastVisit: '18/02/2024 at 6:30PM',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    id: 'PT0003',
    name: 'Rose Lindsey',
    age: 32,
    gender: 'Female',
    bloodGroup: 'AB+',
    diagnosis: 'The process of identifying a disease, condition, or injury from its signs and...',
    lastVisit: '16/01/2024 at 4:45PM',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 'PT0004',
    name: 'Alba Mathews',
    age: 65,
    gender: 'Female',
    bloodGroup: 'A-',
    diagnosis: 'The process of identifying a disease, condition, or injury from its signs and...',
    lastVisit: '20/03/2024 at 3:45PM',
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: 'PT0005',
    name: 'Jacob Calderon',
    age: 23,
    gender: 'Male',
    bloodGroup: 'O-',
    diagnosis: 'The process of identifying a disease, condition, or injury from its signs and...',
    lastVisit: '09/02/2024 at 10:30AM',
    image: 'https://randomuser.me/api/portraits/men/48.jpg',
  },
  {
    id: 'PT0006',
    name: 'Cyrus Henson',
    age: 48,
    gender: 'Male',
    bloodGroup: 'B+',
    diagnosis: 'The process of identifying a disease, condition, or injury from its signs and...',
    lastVisit: '24/02/2024 at 6:15PM',
    image: 'https://randomuser.me/api/portraits/men/66.jpg',
  },
];

const PatientListPage = () => {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(true);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Patients List</h1>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setActive(true)}
          className={`px-4 py-1 rounded ${active ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}
        >
          Active Patients <span className="ml-1 font-semibold">{patients.length}</span>
        </button>
        <button
          onClick={() => setActive(false)}
          className={`px-4 py-1 rounded ${!active ? 'bg-red-100 text-red-800' : 'bg-gray-200'}`}
        >
          Inactive Patients <span className="ml-1 font-semibold">20</span>
        </button>

        <div className="ml-auto flex items-center bg-white rounded shadow px-3 py-1 w-64">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="p-2 rounded bg-gray-200">
          <FaThLarge />
        </button>
        <button className="p-2 rounded bg-gray-200">
          <FaList />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <img src={p.image} alt={p.name} className="w-14 h-14 rounded-full" />
              <div>
                <div className="text-sm text-gray-500">#{p.id}</div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">
                  Age: {p.age} &nbsp; • &nbsp; {p.gender} &nbsp; • &nbsp; {p.bloodGroup}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-teal-600">Diagnosis</div>
              <div className="text-sm text-gray-700">{p.diagnosis}</div>
            </div>
            <div className="text-xs text-blue-600">
              Last Visit: {p.lastVisit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientListPage;
