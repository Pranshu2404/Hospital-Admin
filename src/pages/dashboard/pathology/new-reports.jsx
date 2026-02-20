// pages/dashboard/pathology/reports/new.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { FormInput, Button } from '../../../components/common/FormElements';
import { FaFileAlt, FaUpload, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const NewReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    test_id: '',
    report_type: 'Lab Report',
    report_date: new Date().toISOString().split('T')[0],
    notes: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const reportTypes = [
    'Lab Report',
    'Pathology Report',
    'Radiology Report',
    'Clinical Summary',
    'Other'
  ];

  useEffect(() => {
    fetchPatients();
    fetchTests();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients`);
      setPatients(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/labtests/all?limit=1000`);
      setTests(res.data.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, file: 'File size must be less than 10MB' });
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, file: 'Invalid file type. Please upload PDF, DOC, DOCX, or image files' });
        return;
      }

      setFormData(prev => ({ ...prev, file }));
      setErrors(prev => ({ ...prev, file: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required';
    if (!formData.test_id) newErrors.test_id = 'Test is required';
    if (!formData.report_type) newErrors.report_type = 'Report type is required';
    if (!formData.report_date) newErrors.report_date = 'Report date is required';
    if (!formData.file) newErrors.file = 'File is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('patient_id', formData.patient_id);
      formDataToSend.append('test_id', formData.test_id);
      formDataToSend.append('report_type', formData.report_type);
      formDataToSend.append('report_date', formData.report_date);
      formDataToSend.append('notes', formData.notes || '');
      formDataToSend.append('file', formData.file);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/lab-reports`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );

      if (response.data.success) {
        navigate('/dashboard/pathology/reports');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      setErrors({ ...errors, submit: error.response?.data?.message || 'Failed to upload report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaFileAlt className="text-teal-600" />
          Upload New Report
        </h1>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-medium">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => handleChange('patient_id', e.target.value)}
                className={`w-full px-4 py-2 border ${errors.patient_id ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.first_name} {patient.last_name} - {patient.patientId}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
              )}
            </div>
          </div>

          {/* Test Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Test <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.test_id}
                  onChange={(e) => handleChange('test_id', e.target.value)}
                  className={`w-full px-4 py-2 border ${errors.test_id ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                >
                  <option value="">Select a test</option>
                  {tests.map(test => (
                    <option key={test._id} value={test._id}>
                      {test.name} ({test.code})
                    </option>
                  ))}
                </select>
                {errors.test_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.test_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.report_type}
                  onChange={(e) => handleChange('report_type', e.target.value)}
                  className={`w-full px-4 py-2 border ${errors.report_type ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
                >
                  <option value="">Select report type</option>
                  {reportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.report_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.report_type}</p>
                )}
              </div>

              <FormInput
                label="Report Date"
                type="date"
                value={formData.report_date}
                onChange={(e) => handleChange('report_date', e.target.value)}
                error={errors.report_date}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Comments
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Any additional notes about this report..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload File</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
              {!formData.file ? (
                <div>
                  <FaUpload className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                  <p className="text-sm text-gray-400">Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 text-xl" />
                    <div className="text-left">
                      <p className="font-medium text-gray-700">{formData.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(formData.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            {errors.file && (
              <p className="mt-2 text-sm text-red-600">{errors.file}</p>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="font-medium text-teal-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/pathology/reports')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload /> Upload Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewReport;