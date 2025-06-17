"use client";
import '@/styles/home-page.css';

export default function Home() {

  const services = [
    {
      title: "Housekeeping Material",
      icon: <span className="material-symbols-rounded text-4xl text-blue-600">cleaning_services</span>,
      description:
        "Essential cleaning materials and supplies for maintaining a spotless workspace.",
      href: "/services/housekeeping",
    },
    {
      title: "Pantry",
      icon: <span className="material-symbols-rounded text-4xl text-green-600">restaurant</span>,
      description:
        "Pantry management, snacks, beverages, and regular restocking for your team.",
      href: "/services/pantry",
    },
    {
      title: "Stationery",
      icon: <span className="material-symbols-rounded text-4xl text-yellow-600">stylus_note</span>,
      description:
        "Office stationery, branded supplies, and custom kits for all your business needs.",
      href: "/services/stationery",
    },
    {
      title: "Adhoc",
      icon: <span className="material-symbols-rounded text-4xl text-purple-600">build_circle</span>,
      description:
        "On-demand, special, and emergency services tailored to unique requirements.",
      href: "/services/adhoc",
    },
    {
      title: "Corporate Events",
      icon: <span className="material-symbols-rounded text-4xl text-pink-600">event</span>,
      description:
        "End-to-end planning, management, and support for corporate events, conferences, and meetings.",
      href: "/services/corporate-events",
    },
  ];

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      {/* About Us Section */}
      <section id="about" className="mb-32 max-w-3xl mx-auto flex flex-col items-center text-center scroll-mt-24">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          Empowering Corporate Operations with Trusted Supply Solutions.
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl">
          4syz Infotech Solutions provides tailored B2B services designed to enhance your operational efficiency and support your growth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#services"
            className="bg-black text-white font-semibold rounded-md px-8 py-3 text-lg shadow hover:bg-gray-900 transition"
          >
            Explore Services
          </a>
          <a
            href="/our-work"
            className="border border-black font-semibold rounded-md px-8 py-3 text-lg hover:bg-gray-100 transition"
          >
            Our Work
          </a>
        </div>
        {/* Commitment Section */}
        <div className="mt-12 w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">Our Commitment</h2>
          <p className="text-gray-700 mb-8 max-w-xl">
            We are dedicated to providing exceptional service and value to our partners.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-3xl mb-2">👍</span>
              <div className="font-semibold text-lg text-center">Unwavering Reliability</div>
              <div className="text-gray-700 text-sm text-center mt-1">Depend on us for consistent, high-quality service delivery, every time.</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-3xl mb-2">🎯</span>
              <div className="font-semibold text-lg text-center">Client-Centric Solutions</div>
              <div className="text-gray-700 text-sm text-center mt-1">We tailor our services to perfectly align with your specific business needs.</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-xl">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-3xl mb-2">⚡</span>
              <div className="font-semibold text-lg text-center">Requirements Fulfillment</div>
              <div className="text-gray-700 text-sm text-center mt-1">Streamline your processes and empower your team to focus on core objectives.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-4xl mx-auto bg-gray-50 rounded-xl shadow p-8 mt-12 scroll-mt-24">
        <h2 className="text-3xl font-extrabold text-center mb-2">Core Services</h2>
        <p className="text-center text-gray-700 mb-10">Comprehensive solutions designed to support and elevate your business operations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <a
              key={service.title}
              href={service.href}
              className="group block rounded-xl p-6 bg-white shadow transition-all duration-200 border border-gray-200 hover:border-transparent hover:shadow-xl hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
            >
              <div className="mb-4 flex items-center justify-center">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-700 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {service.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
