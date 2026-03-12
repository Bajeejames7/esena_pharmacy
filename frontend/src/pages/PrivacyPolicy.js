import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Privacy Policy</h1>
          
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>Esena Pharmacy</strong></p>
            <p>Effective Date: March 8, 2026</p>
            <p>Last Updated: March 8, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-200">
            <p className="mb-6">
              Esena Pharmacy ("Esena Pharmacy", "we", "our", or "us") operates the Esena Pharmacy website and related online services. 
              This Privacy Policy explains how we collect, use, store, disclose, and protect your personal information when you visit our 
              website, place orders, request pharmacy services, or otherwise interact with our online platform.
            </p>

            <p className="mb-6">
              Your privacy and the protection of your personal and medical information are extremely important to us. This policy is 
              intended to provide transparency about how your information is handled.
            </p>

            <p className="mb-8 font-semibold">
              By accessing or using our website, you agree to the practices described in this Privacy Policy.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Information We Collect</h2>
              <p className="mb-4">
                We may collect several types of information from users depending on how they interact with our website and services.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1.1 Personal Identification Information</h3>
              <p className="mb-3">
                When you place an order, submit a request, create an account, or contact us through the website, we may collect 
                personal information including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Full name</li>
                <li>Phone number</li>
                <li>Delivery address</li>
                <li>Order details</li>
                <li>Prescription information (when required)</li>
                <li>Patient name if different from the person placing the order</li>
                <li>Payment information necessary to process transactions</li>
              </ul>
              <p className="mb-4">This information is collected only when voluntarily provided by you.</p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1.2 Health and Prescription Information</h3>
              <p className="mb-3">
                Because Esena Pharmacy provides pharmaceutical services, certain orders may require the submission of prescription 
                or medical information. This may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Prescription images or documents</li>
                <li>Prescribing doctor details</li>
                <li>Medication names and dosage instructions</li>
                <li>Patient health information necessary to verify medication safety</li>
              </ul>
              <p className="mb-4">
                This information is treated with a higher level of confidentiality and is used strictly for the purpose of providing 
                safe and lawful pharmaceutical services.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">1.3 Automatically Collected Information</h3>
              <p className="mb-3">
                When you visit the Esena Pharmacy website, some technical information may be collected automatically by our systems. 
                This may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Internet Protocol (IP) address</li>
                <li>Browser type and version</li>
                <li>Device type</li>
                <li>Operating system</li>
                <li>Pages visited on our website</li>
                <li>Time and date of visits</li>
                <li>Referring website addresses</li>
              </ul>
              <p className="mb-4">
                This information helps us understand how users interact with our website and helps us improve the performance and 
                security of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. How We Use Your Information</h2>
              <p className="mb-4">The information we collect may be used for several purposes including:</p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.1 Order Processing</h3>
              <p className="mb-4">To process, confirm, and deliver medication orders placed through the website.</p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.2 Customer Support</h3>
              <p className="mb-4">To respond to inquiries, requests for information, and customer service issues.</p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.3 Prescription Verification</h3>
              <p className="mb-4">
                To verify prescriptions and ensure that medications are dispensed safely and in compliance with pharmacy regulations.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.4 Service Improvement</h3>
              <p className="mb-4">
                To analyze how our website is used in order to improve functionality, design, and user experience.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.5 Communication</h3>
              <p className="mb-3">To contact you regarding:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Order confirmations</li>
                <li>Delivery updates</li>
                <li>Medication clarification</li>
                <li>Service updates</li>
              </ul>
              <p className="mb-4">All communication is conducted through the phone number you provide.</p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">2.6 Legal and Regulatory Compliance</h3>
              <p className="mb-4">
                Pharmacies are required to maintain certain records for regulatory compliance. Your information may be used to meet 
                these obligations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Legal Basis for Processing Information</h2>
              <p className="mb-3">We process personal data under the following lawful bases:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>To fulfill orders and provide requested services</li>
                <li>To comply with pharmacy and healthcare regulations</li>
                <li>To protect patient safety</li>
                <li>To improve and maintain our services</li>
                <li>With the consent of the user when voluntarily providing information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Sharing of Information</h2>
              <p className="mb-4">
                Esena Pharmacy values your privacy and does not sell, trade, or rent personal information to third parties.
              </p>
              <p className="mb-4">However, limited sharing may occur under specific circumstances:</p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4.1 Delivery Services</h3>
              <p className="mb-4">
                Information such as your name, phone number, and delivery address may be shared with delivery personnel to complete 
                medication deliveries.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4.2 Payment Processing</h3>
              <p className="mb-4">
                If electronic payments are used, necessary information may be shared with secure payment service providers.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4.3 Healthcare Verification</h3>
              <p className="mb-4">
                In certain cases, we may contact healthcare professionals or medical institutions to verify prescriptions.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">4.4 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose information if required to do so by law, court order, or government authority.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Cookies and Website Tracking</h2>
              <p className="mb-3">
                Our website may use cookies and similar technologies to enhance your browsing experience. Cookies may be used to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Remember user preferences</li>
                <li>Improve website performance</li>
                <li>Analyze website usage patterns</li>
                <li>Provide a smoother user experience</li>
              </ul>
              <p className="mb-4">
                Users may disable cookies through their browser settings, although doing so may affect certain website functions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Data Security</h2>
              <p className="mb-3">
                We take reasonable technical and administrative precautions to protect your information from unauthorized access, 
                loss, misuse, alteration, or disclosure. Security measures may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Secure servers</li>
                <li>Restricted access to sensitive data</li>
                <li>Data encryption where applicable</li>
                <li>Internal confidentiality policies</li>
              </ul>
              <p className="mb-4">
                While we strive to protect your information, no internet-based service can guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Data Retention</h2>
              <p className="mb-3">
                Esena Pharmacy retains personal and transaction data only for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide services to customers</li>
                <li>Maintain pharmacy records</li>
                <li>Comply with legal, medical, and regulatory obligations</li>
              </ul>
              <p className="mb-4">
                Once the information is no longer required, it will be securely deleted or anonymized.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">8. Your Privacy Rights</h2>
              <p className="mb-3">
                Users may have certain rights regarding their personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Requesting access to personal information we hold</li>
                <li>Requesting correction of inaccurate information</li>
                <li>Requesting deletion of personal data where legally permissible</li>
                <li>Requesting clarification on how data is used</li>
              </ul>
              <p className="mb-4">
                Requests related to personal data may be made using the contact details provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">9. Third-Party Links</h2>
              <p className="mb-4">
                Our website may include links to external websites such as mapping services or healthcare resources. These third-party 
                websites operate independently and have their own privacy policies.
              </p>
              <p className="mb-4">
                Esena Pharmacy is not responsible for the privacy practices of external websites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">10. Children's Privacy</h2>
              <p className="mb-4">
                Esena Pharmacy services are intended for adults or individuals ordering medications on behalf of patients.
              </p>
              <p className="mb-4">
                We do not knowingly collect personal information from individuals under the age of 18 without appropriate parental 
                or guardian involvement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">11. Policy Updates</h2>
              <p className="mb-3">
                We may update this Privacy Policy from time to time to reflect changes in:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Legal requirements</li>
                <li>Pharmacy practices</li>
                <li>Website functionality</li>
                <li>Security standards</li>
              </ul>
              <p className="mb-4">
                Any updates will be posted on this page with an updated revision date. Users are encouraged to review this Privacy 
                Policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">12. Contact Information</h2>
              <p className="mb-3">
                If you have questions about this Privacy Policy or how your personal information is handled, you may contact us at:
              </p>
              <div className="bg-white/20 dark:bg-slate-700/30 p-6 rounded-lg">
                <p className="font-semibold mb-2">Esena Pharmacy</p>
                <p className="mb-1"><strong>Phone:</strong> 0768103599</p>
                <p className="mb-1"><strong>Physical Location:</strong> OUTERING ROAD BEHIND EASTMART SUPERMARKET RUARAKA, NAIROBI</p>
                <p className="mb-1">Kenya</p>
                <p className="mt-3">
                  <a 
                    href="https://maps.app.goo.gl/aNLgSwfv4Nzw9Aj5A" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Map Location →
                  </a>
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
              <Link 
                to="/" 
                className="inline-block glass-button-primary px-6 py-3 rounded-lg"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
