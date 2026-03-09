import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Terms of Use</h1>
          
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>Esena Pharmacy</strong></p>
            <p>Effective Date: March 8, 2026</p>
            <p>Last Updated: March 8, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-200">
            <p className="mb-6">
              Welcome to the Esena Pharmacy website. These Terms of Use ("Terms") govern your access to and use of the 
              Esena Pharmacy website, services, products, and related digital platforms.
            </p>

            <p className="mb-6">
              By accessing or using the Esena Pharmacy website, placing orders, submitting prescriptions, or interacting 
              with our services, you agree to comply with and be legally bound by these Terms. If you do not agree to 
              these Terms, you should discontinue use of the website immediately.
            </p>

            <p className="mb-8">
              These Terms apply to all users of the website including customers, visitors, and any individuals accessing 
              pharmacy information or services through the platform.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. About Esena Pharmacy</h2>
              <p className="mb-3">
                Esena Pharmacy is a retail pharmaceutical provider offering healthcare products, medications, and 
                pharmacy-related services through both physical and online channels.
              </p>
              <p className="mb-3">Our website may provide:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Information about medications and health products</li>
                <li>Online ordering for pharmacy items</li>
                <li>Prescription verification and processing</li>
                <li>Pharmacy consultations and customer support</li>
                <li>Delivery coordination for purchased products</li>
              </ul>
              <p className="mb-4">
                The website is designed to support pharmacy services but does not replace professional medical 
                consultation, diagnosis, or treatment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Acceptance of Terms</h2>
              <p className="mb-3">By using the website, you acknowledge that:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You have read and understood these Terms of Use</li>
                <li>You agree to comply with all applicable laws and regulations</li>
                <li>You accept responsibility for any activity conducted under your use of the website</li>
              </ul>
              <p className="mb-4">
                Esena Pharmacy reserves the right to refuse service, terminate access, or cancel orders if these Terms 
                are violated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Eligibility to Use the Website</h2>
              <p className="mb-3">
                The Esena Pharmacy website is intended for use by individuals who are legally capable of entering into 
                binding agreements.
              </p>
              <p className="mb-3">By using the website, you confirm that:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You are at least 18 years old, or</li>
                <li>You are acting under the supervision of a parent, guardian, or authorized caregiver</li>
              </ul>
              <p className="mb-4">
                Users ordering medications on behalf of patients must ensure they have appropriate authorization to do so.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Medical and Health Information Disclaimer</h2>
              <p className="mb-3">
                The information provided on this website is intended for educational and informational purposes only.
              </p>
              <p className="mb-3">Content may include:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Medication descriptions</li>
                <li>Health-related articles</li>
                <li>General healthcare information</li>
                <li>Pharmaceutical guidance</li>
              </ul>
              <p className="mb-3 font-semibold">However:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The information does not constitute medical advice</li>
                <li>It does not replace consultation with qualified healthcare professionals</li>
                <li>It should not be used to diagnose or treat medical conditions</li>
              </ul>
              <p className="mb-4">
                Users should always consult a licensed healthcare professional before starting, stopping, or modifying 
                any medication. Esena Pharmacy is not responsible for decisions made based on information obtained from 
                the website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Prescription Medication Policy</h2>
              <p className="mb-3">
                Certain medications available through Esena Pharmacy require a valid prescription issued by a licensed 
                healthcare professional.
              </p>
              <p className="mb-3">When ordering prescription medications through the website:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Users must submit a valid prescription</li>
                <li>Prescriptions may be reviewed and verified by a licensed pharmacist</li>
                <li>Esena Pharmacy may contact the prescribing doctor for verification when necessary</li>
              </ul>
              <p className="mb-3">We reserve the right to refuse or delay dispensing medication if:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The prescription appears invalid, altered, or expired</li>
                <li>There are concerns about drug interactions or patient safety</li>
                <li>Legal or regulatory restrictions apply</li>
                <li>The prescription does not comply with pharmacy regulations</li>
              </ul>
              <p className="mb-4">
                Prescription medications will only be dispensed in accordance with applicable pharmaceutical laws and 
                professional standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Product Information and Availability</h2>
              <p className="mb-3">
                Esena Pharmacy strives to provide accurate product descriptions and information on the website.
              </p>
              <p className="mb-3">However:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Product images may differ slightly from actual packaging</li>
                <li>Medication brands may vary depending on supplier availability</li>
                <li>Product information may change due to manufacturer updates</li>
                <li>All products are subject to stock availability</li>
              </ul>
              <p className="mb-4">
                Esena Pharmacy reserves the right to substitute equivalent medication brands where appropriate and 
                legally permissible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Online Orders and Order Confirmation</h2>
              <p className="mb-3">
                Orders placed through the website constitute a request to purchase products from Esena Pharmacy.
              </p>
              <p className="mb-3">Orders are not considered final until:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Prescription verification (if required) has been completed</li>
                <li>Payment has been confirmed</li>
                <li>The order has been approved by the pharmacy</li>
              </ul>
              <p className="mb-3">After placing an order:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Customers may receive confirmation via phone communication</li>
                <li>Additional verification may be requested before processing</li>
              </ul>
              <p className="mb-3">Esena Pharmacy reserves the right to cancel or refuse any order for reasons including but not limited to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Prescription issues</li>
                <li>Payment problems</li>
                <li>Product unavailability</li>
                <li>Safety concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">8. Pricing Policy</h2>
              <p className="mb-3">
                Prices listed on the website are provided for informational purposes and may change without prior notice.
              </p>
              <p className="mb-3">Prices may vary due to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Supplier pricing changes</li>
                <li>Market conditions</li>
                <li>Pharmaceutical regulation changes</li>
              </ul>
              <p className="mb-4">The final price payable will be confirmed during order processing.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">9. Payment Terms</h2>
              <p className="mb-3">
                Payments for products may be completed through approved payment methods available during the ordering process.
              </p>
              <p className="mb-3">Users agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Provide accurate payment details</li>
                <li>Authorize payment for all orders placed</li>
                <li>Ensure funds are available for successful transactions</li>
              </ul>
              <p className="mb-4">
                Esena Pharmacy is not responsible for delays caused by third-party payment systems or banking institutions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">10. Delivery Services</h2>
              <p className="mb-3">
                Esena Pharmacy may provide medication delivery services to selected locations.
              </p>
              <p className="mb-3">Delivery services may depend on:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Customer location</li>
                <li>Order size</li>
                <li>Medication requirements</li>
                <li>Delivery partner availability</li>
              </ul>
              <p className="mb-3">Delivery timeframes are estimates and may vary due to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Traffic conditions</li>
                <li>Weather conditions</li>
                <li>Operational circumstances</li>
              </ul>
              <p className="mb-4">
                Customers are responsible for ensuring that someone is available to receive the order at the delivery 
                address. Certain medications may require identity verification upon delivery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">11. Returns and Refunds</h2>
              <p className="mb-3">
                Due to safety and regulatory requirements, most medications cannot be returned once dispensed.
              </p>
              <p className="mb-3">Returns may only be accepted under limited circumstances such as:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Incorrect medication supplied</li>
                <li>Damaged products upon delivery</li>
                <li>Expired products</li>
              </ul>
              <p className="mb-4">
                Refunds or replacements may be issued at the discretion of Esena Pharmacy after review. Opened or used 
                medications generally cannot be returned unless required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">12. User Conduct and Prohibited Activities</h2>
              <p className="mb-3">
                Users agree not to engage in activities that may harm the website or its users.
              </p>
              <p className="mb-3">Prohibited activities include:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Uploading fraudulent or altered prescriptions</li>
                <li>Providing false personal information</li>
                <li>Attempting unauthorized access to systems</li>
                <li>Distributing malware or harmful software</li>
                <li>Interfering with website functionality</li>
                <li>Using the platform for illegal activities</li>
              </ul>
              <p className="mb-4">
                Esena Pharmacy reserves the right to block or terminate access to users who violate these rules.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">13. Intellectual Property Rights</h2>
              <p className="mb-3">
                All content on the Esena Pharmacy website is protected by intellectual property laws.
              </p>
              <p className="mb-3">This includes:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Website design</li>
                <li>Logos and trademarks</li>
                <li>Text and written materials</li>
                <li>Images and graphics</li>
                <li>Software and functionality</li>
              </ul>
              <p className="mb-4">
                Users may not reproduce, distribute, modify, or commercially exploit any content without prior written 
                permission from Esena Pharmacy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">14. Website Security</h2>
              <p className="mb-3">Users agree not to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Attempt to bypass website security systems</li>
                <li>Probe or test vulnerabilities in the website</li>
                <li>Access restricted areas without authorization</li>
              </ul>
              <p className="mb-4">Any attempts to compromise website security may result in legal action.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">15. Service Availability</h2>
              <p className="mb-3">
                Esena Pharmacy strives to maintain continuous access to its website.
              </p>
              <p className="mb-3">However, the website may occasionally be unavailable due to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>System maintenance</li>
                <li>Security updates</li>
                <li>Technical failures</li>
                <li>Network disruptions</li>
              </ul>
              <p className="mb-4">We are not responsible for temporary service interruptions.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">16. Limitation of Liability</h2>
              <p className="mb-3">
                To the fullest extent permitted by law, Esena Pharmacy shall not be liable for any damages resulting from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Use or inability to use the website</li>
                <li>Errors in product information</li>
                <li>Delays in order processing or delivery</li>
                <li>Medication misuse</li>
                <li>Third-party service disruptions</li>
              </ul>
              <p className="mb-4">
                Users assume full responsibility for the use of medications purchased through the website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">17. Indemnification</h2>
              <p className="mb-3">
                Users agree to indemnify and hold harmless Esena Pharmacy, its staff, pharmacists, and partners from any 
                claims, damages, liabilities, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Violation of these Terms</li>
                <li>Misuse of medications</li>
                <li>Submission of fraudulent prescriptions</li>
                <li>Unlawful use of the website</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">18. Privacy and Data Protection</h2>
              <p className="mb-4">
                User data collected through the website is handled in accordance with the Esena Pharmacy Privacy Policy.
              </p>
              <p className="mb-4">
                By using the website, users agree to the data collection and usage practices described in the{' '}
                <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">19. Third-Party Links and Services</h2>
              <p className="mb-4">
                The website may include links to third-party services such as mapping platforms, healthcare resources, 
                or payment providers. These services operate independently and have their own policies.
              </p>
              <p className="mb-4">
                Esena Pharmacy is not responsible for the practices or content of third-party websites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">20. Modifications to Terms</h2>
              <p className="mb-3">
                Esena Pharmacy reserves the right to modify these Terms of Use at any time.
              </p>
              <p className="mb-3">Changes may occur due to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Legal requirements</li>
                <li>Business operations</li>
                <li>Technology updates</li>
              </ul>
              <p className="mb-4">
                Revised Terms will be posted on this page with the updated date. Continued use of the website constitutes 
                acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">21. Governing Law</h2>
              <p className="mb-4">
                These Terms of Use shall be governed by and interpreted in accordance with the laws of Kenya.
              </p>
              <p className="mb-4">
                Any disputes arising from the use of the website shall be resolved within the jurisdiction of the courts 
                of Kenya.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">22. Contact Information</h2>
              <p className="mb-3">For questions regarding these Terms of Use, you may contact:</p>
              <div className="bg-white/20 dark:bg-slate-700/30 p-6 rounded-lg">
                <p className="font-semibold mb-2">Esena Pharmacy</p>
                <p className="mb-1"><strong>Phone:</strong> 0768103599</p>
                <p className="mb-1"><strong>Physical Location:</strong> Ruaraka, behind Eastmatt Supermarket</p>
                <p className="mb-1">Nairobi, Kenya</p>
                <p className="mt-3">
                  <a 
                    href="https://maps.app.goo.gl/UFhEtCFQ2SgKzcXK6" 
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

export default TermsOfUse;
