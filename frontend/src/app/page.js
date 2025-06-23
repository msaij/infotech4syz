"use client";
import Link from "next/link";
import NavBar from "@/components/NavBar";
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
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const sessionCookie = cookies.find((c) => c.startsWith("sessionid="));
      if (sessionCookie) {
        router.replace("/start/dashboard");
      }
    }
  }, [router]);

  return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-200 text-black">
			<NavBar />

			{/* Hero Section */}
			<section className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-b border-gray-200">
				<h1 className="text-3xl sm:text-5xl font-extrabold mb-4 text-black tracking-tight drop-shadow-lg">
					Your Partner in Business Excellence.
				</h1>
				<p className="text-lg sm:text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
					4syz Infotech Solutions empowers your business with reliable, efficient,
					and client-focused B2B services.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="#services"
						className="bg-black text-white px-10 py-4 rounded-full shadow-lg hover:bg-gray-900 transition font-semibold text-lg flex items-center gap-2"
					>
						<span className="material-symbols-outlined text-2xl">
							rocket_launch
						</span>
						Explore Services
					</a>
					<Link
						href="/contact"
						className="bg-white border border-black text-black px-10 py-4 rounded-full shadow-lg hover:bg-gray-100 transition font-semibold text-lg flex items-center gap-2"
					>
						<span className="material-symbols-outlined text-2xl">mail</span>
						Contact Us
					</Link>
				</div>
			</section>

			{/* Our Commitment Section */}
			<section className="py-20 bg-gradient-to-br from-gray-100 to-white border-b border-gray-200">
				<div className="max-w-5xl mx-auto px-4">
					<h2 className="text-2xl font-bold text-black mb-10 text-center tracking-tight">
						Our Commitment
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
						{commitments.map((c) => (
							<div
								key={c.title}
								className="bg-white rounded-2xl shadow-xl flex flex-col items-center p-10 border border-gray-200 hover:scale-105 hover:shadow-2xl transition-transform duration-300"
							>
								<span className="material-symbols-outlined text-6xl mb-4 text-white bg-black rounded-full p-4 shadow-lg">
									{c.icon}
								</span>
								<h3 className="font-semibold text-black mb-2 text-xl">
									{c.title}
								</h3>
								<p className="text-gray-700 text-base text-center">
									{c.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Core Services Section */}
			<section id="services" className="py-20 bg-white border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-4">
					<h2 className="text-2xl font-bold text-black mb-10 text-center tracking-tight">
						Core Services
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
						{services.map((s) => (
							<a
								key={s.title}
								href={s.link}
								className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl flex flex-col items-center p-10 border border-gray-200 hover:scale-105 hover:shadow-2xl transition-transform duration-300 group"
							>
								<span className="material-symbols-outlined text-6xl mb-4 text-black bg-gray-200 rounded-full p-4 group-hover:bg-black group-hover:text-white transition">
									{s.icon}
								</span>
								<h3 className="font-semibold text-black mb-2 text-xl">
									{s.title}
								</h3>
								<p className="text-gray-700 text-base text-center">
									{s.desc}
								</p>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* Connect With Us Section */}
			<section className="py-16 bg-gradient-to-br from-gray-100 to-white">
				<div className="max-w-3xl mx-auto px-4 text-center">
					<h2 className="text-2xl font-bold text-black mb-6 tracking-tight">
						Connect With Us
					</h2>
					<p className="text-gray-700 mb-8 text-base">Follow Our Journey</p>
					<div className="flex justify-center gap-8">
						<a
							href="#"
							aria-label="Facebook"
							className="hover:text-blue-600 transition"
						>
							<span className="material-symbols-outlined text-4xl">public</span>
						</a>
						<a
							href="#"
							aria-label="Twitter"
							className="hover:text-sky-500 transition"
						>
							<span className="material-symbols-outlined text-4xl">alternate_email</span>
						</a>
						<a
							href="#"
							aria-label="LinkedIn"
							className="hover:text-blue-800 transition"
						>
							<span className="material-symbols-outlined text-4xl">business_center</span>
						</a>
					</div>
					<div className="mt-8 text-gray-600 text-base">
						Or email us at{" "}
						<a
							href="mailto:info@4syz.com"
							className="underline hover:text-black"
						>
							info@4syz.com
						</a>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
