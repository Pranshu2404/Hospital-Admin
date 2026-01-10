import { useState, useEffect } from 'react';
import { FormSelect, Button } from '../common/FormElements';
import axios from 'axios';

const AddNurseForm = () => {
    const [staffOptions, setStaffOptions] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
    const [password, setPassword] = useState('');
    const [departmentOptions, setDepartmentOptions] = useState([]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/staff`);
                // Filter for staff who might be eligible to become nurses (e.g., role 'Staff', 'Other', or already 'Nurse' but updating credentials)
                // Adjust filter as needed. For now, showing all or a subset makes sense. 
                // Showing 'Staff', 'Other' and 'Nurse' (to update) seems consistent with Registrar form.
                const filteredStaff = response.data.filter(staff => ['Staff', 'Other', 'Nurse', 'nurse'].includes(staff.role));
                setStaffOptions(filteredStaff);
            } catch (err) {
                console.error('Failed to fetch staff:', err);
            }
        };
        fetchStaff();
    }, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments`);
                const departments = res.data?.map(dep => ({
                    value: dep.name,
                    label: dep.name
                })) || [];
                setDepartmentOptions(departments);
            } catch (err) {
                console.error('❌ Failed to fetch departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedStaffId) {
            const selectedStaff = staffOptions.find(s => s._id === selectedStaffId);

            if (selectedStaff) {
                setEmail(selectedStaff.email || '');
                setDepartment(selectedStaff.department || '');
            }
        } else {
            setEmail('');
            setDepartment('');
        }
    }, [selectedStaffId, staffOptions]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStaffId) return alert('Please select a staff member.');
        const selectedStaff = staffOptions.find(s => s._id === selectedStaffId);
        if (!selectedStaff) return alert('Selected staff not found.');

        const nurseData = {
            ...selectedStaff,
            role: 'nurse', // Assign role as nurse
            department,
            email,
            joiningDate,
            status: 'Active',
            password: password.trim() || undefined
        };

        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/staff/${selectedStaffId}`,
                nurseData
            );
            alert('Nurse role assigned successfully!');

            // Clear password field for security
            setPassword('');
        } catch (err) {
            console.error('❌ Error updating nurse:', err.response?.data || err.message);
            alert(err.response?.data?.error || 'Failed to assign nurse role.');
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Assign Nurse</h2>
                    <p className="text-gray-600 mt-1">Select from existing staff to assign Nurse role and credentials.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        label="Select Staff"
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        options={staffOptions.map(staff => ({
                            value: staff._id,
                            label: `${(staff.full_name || staff.first_name + ' ' + staff.last_name) + ' - ' + (staff.phone || '')}`
                        }))}
                        required
                    />

                    <FormSelect
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        options={departmentOptions}
                        required
                    />

                    <input
                        type="email"
                        className="form-input border rounded px-3 py-2 w-full"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="date"
                        className="form-input border rounded px-3 py-2 w-full"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="form-input border rounded px-3 py-2 md:col-span-2 w-full"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="md:col-span-2 flex justify-end space-x-4 mt-2">
                        <Button variant="secondary" type="button">Cancel</Button>
                        <Button variant="primary" type="submit">Assign Nurse</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNurseForm;
