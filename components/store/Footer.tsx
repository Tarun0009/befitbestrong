import Link from "next/link";
import { Dumbbell, X } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "Equipment", href: "/products?category=equipment" },
    { label: "Supplements", href: "/products?category=supplements" },
    { label: "Apparel", href: "/products?category=apparel" },
    { label: "Recovery", href: "/products?category=recovery" },
    { label: "Programs", href: "/products?category=programs" },
    { label: "Bundles", href: "/products?category=bundles" },
  ],
  Help: [
    { label: "Track Order", href: "/account/orders" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Iron Club", href: "/iron-club" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1E] border-t border-[#2C2C2E] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-6 h-6 text-[#FF5500]" />
              <span className="font-(family-name:--font-bebas-neue) text-2xl tracking-wider">
                BeFitBeStrong
              </span>
            </Link>
            <p className="text-[#8E8E93] text-sm leading-relaxed mb-4">
              India&apos;s premium gym e-commerce platform. Expert-curated gear for serious athletes.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="text-[#8E8E93] hover:text-[#FF5500] transition-colors" aria-label="X">
                <X className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-[#F2F2F7] font-bold uppercase tracking-widest text-xs mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#8E8E93] hover:text-[#FF5500] text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2C2C2E] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#8E8E93] text-xs">
            © {new Date().getFullYear()} BeFitBeStrong. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
            <span>UPI</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>EMI</span>
            <span>•</span>
            <span>COD</span>
            <span>•</span>
            <span>Razorpay Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
