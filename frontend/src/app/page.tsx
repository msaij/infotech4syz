"use client";
import Link from "next/link";
import NavBar from "@/components/navigation/SmartNavBar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const commitments = [
	{
		icon: "verified_user",
		title: "Unwavering Reliability",
		desc: "Count on us for consistent, dependable service delivery every time.",
	},
	{
		icon: "diversity_3",
		title: "Client-Centric Solutions",
		desc: "We tailor our services to fit your unique business needs.",
	},
	{
		icon: "bolt",
		title: "Operational Efficiency",
		desc: "Streamlined processes that save you time and resources.",
	},
];

const services = [
	{
		title: "House Keeping",
		icon: "cleaning_services",
		link: "/services/house-keeping",
		desc: "Professional cleaning and maintenance for your business premises.",
	},
	{
		title: "Stationery",
		icon: "edit_square",
		link: "/services/stationery",
		desc: "Comprehensive office stationery supplies delivered on time.",
	},
	{
		title: "Corporate Events",
		icon: "event",
		link: "/services/corporate-events",
		desc: "End-to-end event planning and management for your corporate needs.",
	},
	{
		title: "Pantry Material",
		icon: "restaurant",
		link: "/services/pantry-material",
		desc: "Quality pantry supplies to keep your team refreshed.",
	},
	{
		title: "Adhoc Services",
		icon: "build",
		link: "/services/adhoc-services",
		desc: "Flexible solutions for your unique business requirements.",
	},
	{
		title: "General Supplies",
		icon: "inventory_2",
		link: "/services/general-supplies",
		desc: "A wide range of general office and facility supplies.",
	},
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans">
      <NavBar />
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 px-4 min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 relative overflow-hidden animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-blue-700" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
          Your Partner in Business Excellence
        </h1>
        <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
        <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
          4syz Infotech Solutions empowers your business with reliable, efficient, and client-focused B2B services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <a
            href="#services"
            className="bg-blue-700 text-white px-8 py-3 rounded-full hover:bg-blue-800 transition font-semibold text-base flex items-center justify-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
            Explore Services
          </a>
          <Link
            href="/contact"
            className="border border-blue-700 text-blue-700 px-8 py-3 rounded-full hover:bg-blue-50 transition font-semibold text-base flex items-center justify-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-xl">mail</span>
            Contact Us
          </Link>
        </div>
      </section>

      {/* Core Services Section (moved up) */}
      <section id="services" className="py-12 animate-fade-in scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center tracking-tight" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
            Core Services
          </h2>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <a
                key={s.title}
                href={s.link}
                className="bg-white rounded-xl border p-6 flex flex-col items-center shadow-sm hover:shadow-xl hover:scale-105 transition-transform duration-200 group"
              >
                <span className="material-symbols-outlined text-4xl mb-3 text-blue-600 group-hover:text-blue-800 transition">
                  {s.icon}
                </span>
                <h3 className="font-semibold text-black mb-1 text-lg" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                  {s.title}
                </h3>
                <p className="text-gray-700 text-sm text-center" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                  {s.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment Section (moved below services) */}
      <section className="py-12 animate-fade-in">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center tracking-tight" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
            Our Commitment
          </h2>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {commitments.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-xl border p-6 flex flex-col items-center shadow-sm hover:shadow-xl hover:scale-105 transition-transform duration-200 group"
              >
                <span className="material-symbols-outlined text-4xl mb-3 text-blue-600 group-hover:text-blue-800 transition">
                  {c.icon}
                </span>
                <h3 className="font-semibold text-black mb-1 text-lg" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                  {c.title}
                </h3>
                <p className="text-gray-700 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect With Us Section (last main section) */}
      <section className="py-12 animate-fade-in">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-2 tracking-tight" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
            Connect With Us
          </h2>
          <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-700 mb-6 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Follow Our Journey</p>
          <div className="flex justify-center gap-6">
            <a href="#" aria-label="Facebook" className="hover:text-blue-600 transition p-2">
              <span className="material-symbols-outlined text-3xl">public</span>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-sky-500 transition p-2">
              <span className="material-symbols-outlined text-3xl">alternate_email</span>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-800 transition p-2">
              <span className="material-symbols-outlined text-3xl">business_center</span>
            </a>
          </div>
          <div className="mt-6 text-gray-600 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
            Or email us at {" "}
            <a href="mailto:info@4syz.com" className="underline hover:text-black transition">
              info@4syz.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
