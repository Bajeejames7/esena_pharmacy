import React, { useState } from 'react';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassTextarea from '../components/forms/GlassTextarea';
import GlassSelect from '../components/forms/GlassSelect';
import GlassButton from '../components/forms/GlassButton';

/**
 * WhatsApp Order Form Page
 * Collects customer details and order information before redirecting to WhatsApp
 */
const WhatsAppOrder = () => {
  const { breakpoint } = useBreakpoint();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    orderType: '',
    prescription: null,
    medications: '',
    urgency: 'normal',
    notes: ''
  });

  const [errors, setErrors] = useState({});

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
    setFormData(prev => ({
      ...prev,
      prescription: file
    }));
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
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.orderType) {
      newErrors.orderType = 'Please select order type';
    }

    if (formData.orderType === 'prescription' && !formData.prescription) {
      newErrors.prescription = 'Please upload your prescription';
    }

    if (formData.orderType === 'specific' && !formData.medications.trim()) {
      newErrors.medications = 'Please specify the medications you need';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateWhatsAppMessage = () => {
    let message = `*New Medicine Order Request*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${formData.name}\n`;
    message += `Phone: ${formData.phone}\n`;
    if (formData.email) message += `Email: ${formData.email}\n`;
    message += `Location: ${formData.location}\n\n`;
    
    message += `*Order Details:*\n`;
    message += `Order Type: ${formData.orderType === 'prescription' ? 'Prescription Upload' : 'Specific Medications'}\n`;
    
    if (formData.orderType === 'specific') {
      message += `Medications Needed: ${formData.medications}\n`;
    }
    
    message += `Urgency: ${formData.urgency === 'urgent' ? 'Urgent (Same Day)' : 'Normal (1-2 Days)'}\n`;
    
    if (formData.notes) {
      message += `Additional Notes: ${formData.notes}\n`;
    }
    
    if (formData.orderType === 'prescription') {
      message += `\n*Note: Prescription image will be sent separately*`;
    }
    
    return encodeURIComponent(message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const whatsappMessage = generateWhatsAppMessage();
    const whatsappNumber = '254700123456'; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    // Open WhatsApp with the pre-filled message
    window.open(whatsappUrl, '_blank');
  };

  const orderTypes = [
    { value: '', label: 'Select order type' },
    { value: 'prescription', label: 'I have a prescription to upload' },
    { value: 'specific', label: 'I know the specific medications I need' }
  ];

  const urgencyOptions = [
    { value: 'normal', label: 'Normal delivery (1-2 days)' },
    { value: 'urgent', label: 'Urgent delivery (Same day - Extra charges apply)' }
  ];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <GlassCard className="p-8 text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 mr-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.595z"/>
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              WhatsApp Order Form
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Fill in your details below and we'll connect you with our pharmacist via WhatsApp for instant assistance.
          </p>
        </GlassCard>

        {/* Order Form */}
        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Personal Information
              </h2>
              <div className={`grid gap-4 ${breakpoint === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <GlassInput
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                />
                <GlassInput
                  label="Phone Number *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  placeholder="+254 700 123 456"
                />
              </div>
              <div className="mt-4">
                <GlassInput
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="mt-4">
                <GlassInput
                  label="Delivery Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={errors.location}
                  placeholder="e.g., Westlands, Nairobi or specific address"
                />
              </div>
            </div>

            {/* Order Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Order Information
              </h2>
              <div className="space-y-4">
                <GlassSelect
                  label="Order Type *"
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleInputChange}
                  options={orderTypes}
                  error={errors.orderType}
                />

                {formData.orderType === 'prescription' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Prescription *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-glass-blue file:text-white
                        hover:file:bg-glass-blue-dark
                        file:cursor-pointer cursor-pointer"
                    />
                    {errors.prescription && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prescription}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Accepted formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>
                )}

                {formData.orderType === 'specific' && (
                  <GlassTextarea
                    label="Medications Needed *"
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    error={errors.medications}
                    placeholder="Please list the medications you need (name, dosage, quantity)"
                    rows={4}
                  />
                )}

                <GlassSelect
                  label="Delivery Urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  options={urgencyOptions}
                />

                <GlassTextarea
                  label="Additional Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or additional information"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <GlassButton
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                Continue to WhatsApp
              </GlassButton>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                You'll be redirected to WhatsApp with your order details pre-filled
              </p>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default WhatsAppOrder;