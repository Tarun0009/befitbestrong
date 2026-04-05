import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms of Service governing your use of BeFitBeStrong.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="font-(family-name:--font-bebas-neue) text-5xl text-[#F2F2F7] tracking-wide mb-2">
          Terms of Service
        </h1>
        <p className="text-[#8E8E93] text-sm mb-12">Last updated: April 2026</p>

        <div className="space-y-10 text-[#8E8E93] leading-relaxed">

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the BeFitBeStrong website (&quot;Site&quot;) or placing an order, you agree to
              be bound by these Terms of Service (&quot;Terms&quot;) and our{" "}
              <a href="/privacy" className="text-[#FF5500] hover:text-[#CC4400] transition-colors">Privacy Policy</a>.
              If you do not agree, you must not use our Site. We reserve the right to update these Terms
              at any time; continued use of the Site constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to make a purchase or create an account. By using the
              Site, you represent and warrant that you meet this requirement and that all information you
              provide is accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">3. Products &amp; Pricing</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.</li>
              <li>We reserve the right to change prices at any time without prior notice.</li>
              <li>Product images are for illustrative purposes; actual product colours may vary slightly.</li>
              <li>We reserve the right to limit quantities, discontinue products, or refuse orders at our discretion.</li>
              <li>Promotional prices are valid for the stated period only and while stocks last.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">4. Orders &amp; Payments</h2>
            <p className="mb-3">
              When you place an order, you are making an offer to purchase. We reserve the right to accept
              or reject any order. An order confirmation email does not constitute acceptance; acceptance
              occurs when the order is dispatched.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Payments are processed securely through <span className="text-[#F2F2F7]">Razorpay</span> (UPI, Cards, Net Banking, EMI, Wallets, COD).</li>
              <li>For Cash on Delivery orders, payment is due at the time of delivery.</li>
              <li>In case of payment failure, the order will not be confirmed until payment is successful.</li>
              <li>We are not liable for any charges imposed by your bank or payment provider.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">5. Shipping &amp; Delivery</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We ship across India. Delivery times are estimates only and not guaranteed.</li>
              <li>Free shipping is available on orders above ₹2,999 (as applicable at the time of purchase).</li>
              <li>Risk of loss and title for products pass to you upon delivery.</li>
              <li>We are not responsible for delays caused by courier partners, customs, or force majeure events.</li>
              <li>Please inspect your package upon delivery and report any damage within 48 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">6. Returns &amp; Refunds</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We offer a <span className="text-[#F2F2F7]">30-day return policy</span> for most items in original, unused condition with tags intact.</li>
              <li>Supplements, consumables, and personalised/digital products are non-returnable for hygiene and nature reasons.</li>
              <li>Refunds are processed within 5–7 business days after we receive and inspect the returned item.</li>
              <li>Shipping costs for returns are borne by the customer unless the return is due to our error or a defective product.</li>
              <li>In-store or manufacturer warranties for equipment are subject to the respective manufacturer&apos;s policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">7. Iron Points Loyalty Program</h2>
            <p>
              Iron Points are awarded as per the programme rules displayed on the Site. Points have no
              cash value, are non-transferable, and may be modified or discontinued by us at any time
              with reasonable notice. Points earned fraudulently will be forfeited.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">8. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to notify us immediately of any unauthorised access to your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">9. Prohibited Uses</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Use the Site for any unlawful purpose or in violation of applicable Indian laws</li>
              <li>Attempt to gain unauthorised access to our systems or user accounts</li>
              <li>Scrape, crawl, or harvest data from the Site without written permission</li>
              <li>Transmit any malware, spam, or harmful code</li>
              <li>Resell products purchased from us without prior written authorisation</li>
              <li>Submit false or misleading reviews or information</li>
              <li>Use the Site in any way that could damage, disable, or impair our servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">10. Intellectual Property</h2>
            <p>
              All content on the Site — including text, images, logos, product descriptions, and software
              — is owned by or licensed to BeFitBeStrong and is protected by Indian copyright law. You may
              not reproduce, distribute, or create derivative works without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">11. Disclaimer of Warranties</h2>
            <p>
              The Site and its content are provided &quot;as is&quot; without warranties of any kind, whether express
              or implied. We do not warrant that the Site will be error-free, uninterrupted, or free of
              viruses. Fitness and health information on the Site is for general informational purposes
              only and is not a substitute for professional medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, BeFitBeStrong shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use of
              the Site or products, even if we have been advised of the possibility of such damages. Our
              total liability to you shall not exceed the amount you paid for the specific product or
              service giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">13. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of
              the courts of India. We encourage you to contact us first at{" "}
              <a href="mailto:legal@befitbestrong.in" className="text-[#FF5500] hover:text-[#CC4400] transition-colors">
                legal@befitbestrong.in
              </a>{" "}
              to resolve any issue amicably.
            </p>
          </section>

          <section>
            <h2 className="text-[#F2F2F7] font-bold text-xl mb-3">14. Contact</h2>
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-5 space-y-1">
              <p className="text-[#F2F2F7] font-semibold">BeFitBeStrong</p>
              <p>Email: <a href="mailto:legal@befitbestrong.in" className="text-[#FF5500] hover:text-[#CC4400] transition-colors">legal@befitbestrong.in</a></p>
              <p>Address: India</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
