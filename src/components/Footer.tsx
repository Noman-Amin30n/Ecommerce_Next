"use client"
import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#" },
    { icon: <Twitter size={18} />, href: "#" },
    { icon: <Instagram size={18} />, href: "#" },
    { icon: <Linkedin size={18} />, href: "#" },
  ];

  const footerLinks = {
    Links: [
      { name: "Home", href: "/" },
      { name: "Shop", href: "/shop" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    Help: [
      { name: "Payment Options", href: "#" },
      { name: "Returns", href: "#" },
      { name: "Privacy Policies", href: "#" },
    ],
  };

  return (
    <footer className="w-full bg-white border-t border-[#f1f1f1] pt-20 pb-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Logo & Info */}
          <div className="lg:col-span-4 flex flex-col gap-8 text-center md:text-left items-center md:items-start">
            <div>
              <h2 className="text-2xl font-medium text-black tracking-tight mb-4">
                Meubel House
              </h2>
              <p className="text-[#9F9F9F] text-base leading-relaxed max-w-[280px]">
                400 University Drive Suite 200 Coral Gables, <br />
                FL 33134 USA
              </p>
            </div>

            <div className="flex gap-3">
              {socialLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[#f1f1f1] text-[#7d7d7d] hover:bg-[#FF5714] hover:text-white hover:border-[#FF5714] transition-all duration-300"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 flex flex-col gap-8 text-center md:text-left items-center md:items-start">
            <h4 className="text-black font-medium text-sm lg:text-base uppercase tracking-widest">
              Links
            </h4>
            <ul className="flex flex-col gap-4">
              {footerLinks.Links.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#9F9F9F] text-base font-normal hover:text-[#FF5714] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div className="lg:col-span-2 flex flex-col gap-8 text-center md:text-left items-center md:items-start">
            <h4 className="text-black font-medium text-sm lg:text-base uppercase tracking-widest">
              Help
            </h4>
            <ul className="flex flex-col gap-4">
              {footerLinks.Help.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#9F9F9F] text-base font-normal hover:text-[#FF5714] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4 flex flex-col gap-8 text-center md:text-left items-center md:items-start">
            <h4 className="text-black font-medium text-sm lg:text-base uppercase tracking-widest">
              Newsletter
            </h4>
            <div className="w-full max-w-sm">
              <p className="text-[#9F9F9F] text-base mb-6">
                Join our community to receive exclusive offers and design
                updates.
              </p>
              <form
                className="relative flex items-center"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full py-3 bg-transparent border-b border-black focus:outline-none focus:border-[#FF5714] transition-colors duration-300 text-sm font-normal placeholder:text-[#9F9F9F]"
                />
                <button
                  type="submit"
                  className="ml-4 py-2 text-black hover:text-[#FF5714] transition-all duration-300 group flex items-center gap-2 whitespace-nowrap font-medium text-sm uppercase tracking-wider"
                >
                  Subscribe
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-10 border-t border-[#f1f1f1] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#9F9F9F] text-sm font-normal text-center md:text-left">
            © {currentYear} Meubel House. Designed with passion for better
            living.
          </p>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-[#9F9F9F] text-xs hover:text-[#FF5714] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-[#9F9F9F] text-xs hover:text-[#FF5714] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
