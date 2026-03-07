import React, { useState } from 'react';
import { validateAppointmentForm, validateField } from '../utils/validation';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassTextarea from '../components/forms/GlassTextarea';
import GlassButton from '../components/forms/GlassButton';

/**
 * Appointment booking page
 * Implements Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.13
 */
const BookAppointment = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const services = [
    { value: '', label: 'Select a service' },
    { value: 'dermatology', label: 'Dermatology Consultation' },
    { value: 'labtest', label: 'Lab Test' },
    { value: 'pharmacist', label: 'Pharmacist Consultation' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'health-screening', label: 'Health Screening' }
  ];

  const timeSlots = [
    { value: '', label: 'Select a time' },
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (errors[name]) {
      const validation = validateField(name, value, formData);
      setErrors(prev => ({
        ...prev,
        [name]: validation.isValid ? null : validation.error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value, formData);
    setErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? null : validation.error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const validation = validateAppointmentForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Implement actual appointment booking API call
      console.log('Appointment booking:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        message: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Appointment booking error:', error);
      setErrors({ submit: 'Failed to book appointment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-gray-800 dark:text-white mb-4">Appointment Booked Successfully!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your appointment has been scheduled. We'll send you a confirmation email with all the details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton onClick={() => setSubmitSuccess(false)}>
                Book Another Appointment
              </GlassButton>
              <GlassButton variant="secondary" onClick={() => window.location.href = '/'}>
                Return Home
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Form */}
          <GlassCard className="p-8">
            <h1 className="text-gray-800 dark:text-white mb-6">Book an Appointment</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                  required
                  autoComplete="name"
                />
                
                <GlassInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone}
                  required
                  autoComplete="tel"
                />
                
                <GlassSelect
                  label="Service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  options={services}
                  error={errors.service}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassInput
                  label="Preferred Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.date}
                  min={minDate}
                  required
                />
                
                <GlassSelect
                  label="Preferred Time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  options={timeSlots}
                  error={errors.time}
                  required
                />
              </div>
              
              <GlassTextarea
                label="Additional Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.message}
                rows={4}
                maxLength={500}
                placeholder="Please describe your concerns or any specific requirements..."
              />
              
              {errors.submit && (
                <div className="p-3 bg-red-100/50 border border-red-200 rounded-lg text-red-700">
                  {errors.submit}
                </div>
              )}
              
              <GlassButton
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
              </GlassButton>
            </form>
          </GlassCard>
          
          {/* Information Panel */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-gray-800 dark:text-white mb-4">Our Services</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">👩‍⚕️</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Dermatology Consultation</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Skin health assessment and treatment recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🔬</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Lab Tests</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Blood work, urine tests, and health screenings</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">💊</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Pharmacist Consultation</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Medication reviews and health advice</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">💉</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Vaccinations</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Flu shots, travel vaccines, and immunizations</p>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <h2 className="text-gray-800 dark:text-white mb-4">Appointment Information</h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Appointments available Monday-Saturday</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirmation email sent within 1 hour</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call (555) 123-4567 for urgent appointments</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;