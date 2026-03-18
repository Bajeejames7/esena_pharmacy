import React, { useState } from 'react';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassTextarea from '../components/forms/GlassTextarea';
import GlassButton from '../components/forms/GlassButton';
import { prescriptionsAPI } from '../services/api';

/**
 * Prescription Upload Page
 * Allows customers to upload prescriptions for pharmacist review
 */
const UploadPrescription = () => {
  const { breakpoint } = useBreakpoint();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    prescriptionFile: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          prescriptionFile: 'Please upload a valid image (JPG, PNG) or PDF file'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          prescriptionFile: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        prescriptionFile: file
      }));
      
      // Clear error
      if (errors.prescriptionFile) {
        setErrors(prev => ({
          ...prev,
          prescriptionFile: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.prescriptionFile) {
      newErrors.prescriptionFile = 'Please upload your prescription';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('email', formData.email);
      submitData.append('message', formData.message);
      submitData.append('prescription', formData.prescriptionFile);

      const response = await prescriptionsAPI.upload(submitData);

      if (response.data?.success) {
        setIsSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '', prescriptionFile: null });
      } else {
        throw new Error('Failed to submit prescription');
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
      setErrors({ submit: 'Failed to submit prescription. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 bg-glass-green rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Prescription Submitted Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for submitting your prescription. Our pharmacist will review it and contact you within 2 hours with a quote and availability.
            </p>
            <div className="space-y-3 text-left bg-glass-blue/10 dark:bg-glass-blue/20 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white">What happens next?</h3>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="mr-3">1️⃣</span>
                <span>Pharmacist reviews your prescription (within 2 hours)</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="mr-3">2️⃣</span>
                <span>We'll call/SMS you with medicine availability and total cost</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="mr-3">3️⃣</span>
                <span>Make payment via Mpesa or card</span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="mr-3">4️⃣</span>
                <span>Receive your medicines via delivery</span>
              </div>
            </div>
            <GlassButton
              onClick={() => setIsSubmitted(false)}
              className="bg-glass-blue text-white"
            >
              Submit Another Prescription
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            📋 Upload Your Prescription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload your prescription and get a quote from our licensed pharmacist within 2 hours
          </p>
        </GlassCard>

        {/* Form */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <GlassInput
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />
              
              <GlassInput
                label="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="0700 123 456"
                required
              />
            </div>

            <GlassInput
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="your.email@example.com"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Prescription * (PDF, JPG, PNG - Max 5MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-glass-blue/50 focus:border-transparent text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-glass-blue file:text-white hover:file:bg-glass-blue/80"
                  required
                />
              </div>
              {errors.prescriptionFile && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prescriptionFile}</p>
              )}
              {formData.prescriptionFile && (
                <p className="mt-1 text-sm text-glass-green dark:text-glass-green-light">
                  ✓ {formData.prescriptionFile.name} selected
                </p>
              )}
            </div>

            <GlassTextarea
              label="Additional Message (Optional)"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Any specific instructions or questions about your prescription..."
              rows={4}
            />

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <GlassButton
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-glass-blue text-white py-4"
            >
              {isSubmitting ? 'Submitting...' : '📤 Submit Prescription'}
            </GlassButton>
          </form>
        </GlassCard>

        {/* Info Section */}
        <GlassCard className="p-6 mt-8">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            🔒 Your Privacy & Security
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>• All prescriptions are reviewed by licensed pharmacists</p>
            <p>• Your personal information is kept strictly confidential</p>
            <p>• Secure file upload with encryption</p>
            <p>• We comply with Kenya's health data protection regulations</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default UploadPrescription;