import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const requests = [
    { name: 'Sophia', treatment: 'Root Canal Treatment', date: '05.12.2024'},
    { name: 'Mason', treatment: 'Consultation', date: '02.12.2024'},
    { name: 'Emily', treatment: 'Scaling', date: '04.12.2024'},
]

const ApprovalRequestList = () => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Approval requests</h3>
            <ul className="space-y-3">
                {requests.map((req, index) => (
                    <li key={index} className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-800">{req.name}</p>
                            <p className="text-xs text-gray-500">{req.treatment}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <p className="text-xs text-gray-400">{req.date}</p>
                             <button className="text-green-500 hover:text-green-700"><FaCheck /></button>
                             <button className="text-red-500 hover:text-red-700"><FaTimes /></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ApprovalRequestList;