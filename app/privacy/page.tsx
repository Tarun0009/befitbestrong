import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how BeFitBeStrong collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wide mb-2">
          Privacy Policy
        </h1>
        <p className="text-[#8E8E93] text-sm mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-[#8E8E93] leading-relaxed">

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">1. Introduction</h2>
            <p>
              BeFitBeStrong (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your personal
              information and your right to privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website or make a purchase.
              Please read it carefully. If you disagree with its terms, please discontinue use of our site.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><span className="text-[#F2F2F7]">Account data:</span> name, email address, phone number, password (hashed)</li>
              <li><span className="text-[#F2F2F7]">Profile data:</span> fitness goals, body measurements (optional)</li>
              <li><span className="text-[#F2F2F7]">Order data:</span> purchase history, shipping addresses, payment method type</li>
              <li><span className="text-[#F2F2F7]">Communications:</span> messages you send us via contact forms or email</li>
              <li><span className="text-[#F2F2F7]">Reviews:</span> product ratings and written feedback</li>
            </ul>
            <p className="mt-3">We also automatically collect certain information when you visit:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li>IP address and browser type</li>
              <li>Pages visited, time spent, referring URLs</li>
              <li>Device identifiers and operating system</li>
              <li>Cookie and session data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Process and fulfil your orders and send order confirmations</li>
              <li>Create and manage your account</li>
              <li>Send transactional emails (order updates, shipping notifications)</li>
              <li>Send promotional emails (only with your consent; you may opt out at any time)</li>
              <li>Administer our Iron Points loyalty program</li>
              <li>Respond to customer service inquiries</li>
              <li>Detect, prevent, and address fraud or security issues</li>
              <li>Improve our website and tailor your experience</li>
              <li>Comply with applicable Indian laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">4. Payment Information &amp; Razorpay</h2>
            <p>
              All payment transactions are processed by <span className="text-[#F2F2F7]">Razorpay Software Private Limited</span>,
              a PCI-DSS compliant payment gateway. We do not store your full card number, CVV, or net banking
              credentials on our servers. We receive only a payment ID and order status from Razorpay.
              Razorpay&apos;s use of your payment data is governed by their{" "}
              <a
                href="https://razorpay.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF5500] hover:text-[#CC4400] transition-colors"
              >
                Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">5. Cookies</h2>
            <p className="mb-3">We use cookies and similar tracking technologies to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Keep you logged in to your account</li>
              <li>Remember items in your cart</li>
              <li>Understand how visitors use our site (analytics)</li>
              <li>Personalise content and advertisements</li>
            </ul>
            <p className="mt-3">
              You may disable cookies in your browser settings; however, some features of the site may not
              function properly. You can also withdraw your consent via the cookie banner on our site.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">6. Data Sharing &amp; Disclosure</h2>
            <p className="mb-3">We do not sell your personal data. We may share it with:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><span className="text-[#F2F2F7]">Service providers:</span> shipping partners, email providers, cloud hosting, analytics</li>
              <li><span className="text-[#F2F2F7]">Payment processors:</span> Razorpay (as described above)</li>
              <li><span className="text-[#F2F2F7]">Legal authorities:</span> when required by law, court order, or government regulation in India</li>
              <li><span className="text-[#F2F2F7]">Business transfers:</span> in the event of a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide
              services. Order records may be retained for up to 7 years as required under Indian tax laws
              (GST Act). You may request deletion of your account at any time via{" "}
              <a href="/account/settings" className="text-[#FF5500] hover:text-[#CC4400] transition-colors">
                Account Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">8. Your Rights</h2>
            <p className="mb-3">Subject to applicable law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><span className="text-[#F2F2F7]">Access:</span> request a copy of the personal data we hold about you</li>
              <li><span className="text-[#F2F2F7]">Correction:</span> ask us to correct inaccurate data</li>
              <li><span className="text-[#F2F2F7]">Deletion:</span> request erasure of your account and personal data</li>
              <li><span className="text-[#F2F2F7]">Portability:</span> export your data in a machine-readable format from Account Settings</li>
              <li><span className="text-[#F2F2F7]">Opt-out:</span> unsubscribe from marketing communications at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, visit{" "}
              <a href="/account/settings" className="text-[#FF5500] hover:text-[#CC4400] transition-colors">
                Account Settings
              </a>{" "}
              or contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not knowingly
              collect personal information from minors. If we become aware that a minor has provided us
              with personal data, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">10. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, hashed passwords,
              and access controls to protect your data. However, no method of internet transmission is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              via email or a prominent notice on our website. Your continued use of the site after changes
              constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact:
            </p>
            <div className="mt-3 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 space-y-1">
              <p className="text-[#F2F2F7] font-semibold">BeFitBeStrong</p>
              <p>Email: <a href="mailto:privacy@befitbestrong.in" className="text-[#FF5500] hover:text-[#CC4400] transition-colors">privacy@befitbestrong.in</a></p>
              <p>Address: India</p>
              <p>Grievance Officer: Contact via email above</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
