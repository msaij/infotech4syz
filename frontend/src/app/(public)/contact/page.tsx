"use client";

import { useState } from "react";
import NavBar from "@/components/navigation/SmartNavBar";
import Footer from "@/components/layout/Footer";
import { DJANGO_API_URL } from "@/app/utils/serviceIntegration";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    company_name: "",
    zip_code: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setLoading(true);

    if (!formData.zip_code.trim()) {
      setError("Zip code is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${DJANGO_API_URL}/api/v1/public/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          message: "",
          phone: "",
          company_name: "",
          zip_code: "",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.detail || errorData.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Contact form error:", error);
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-2xl md:text-4xl font-extrabold text-blue-700 mb-4 tracking-tight" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
              Contact Us
            </h1>
            <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-6"></div>
            <p className="text-base md:text-lg text-gray-700 mb-8 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
              We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-stretch">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex flex-col">
              <h2 className="text-xl font-bold text-blue-700 mb-2 tracking-tight" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
                Get in Touch
              </h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full mb-8"></div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FaEnvelope className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-base" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Email</h3>
                    <p className="text-gray-700 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>info@4syz.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <FaPhone className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-base" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Phone</h3>
                    <p className="text-gray-700 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1 text-base" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Address</h3>
                    <p className="text-gray-700 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                      4Syz Infotech Solutions Pvt Ltd<br />
                      Bangalore, Karnataka<br />
                      India
                    </p>
                  </div>
                </div>
                
                {/* Google Maps Embed */}
                <div className="mt-8">
                  <h3 className="font-semibold text-black mb-4 text-base" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Our Location</h3>
                  <div className="rounded-lg overflow-hidden shadow-sm">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.995917378707!2d77.63531537578042!3d12.907983687401579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1534e2a37ef9%3A0x16b38a8b4fb58d99!2s4Syz%20Infotech%20Solutions%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1752620831177!5m2!1sen!2sin" 
                      width="100%" 
                      height="250" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                    ></iframe>
                  </div>
                </div>
              </div>
              

            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 flex flex-col">
              <h2 className="text-xl font-bold text-blue-700 mb-2 tracking-tight" style={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
                Send us a Message
              </h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full mb-8"></div>
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <h3 className="text-green-800 font-semibold mb-2 text-base" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>Message Sent!</h3>
                  <p className="text-green-700 text-sm" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                    Thank you for your message. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                        Company
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      id="zip_code"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 text-white py-3 px-8 rounded-full hover:bg-blue-800 transition font-semibold text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
          

        </div>
      </main>
      <Footer />
    </div>
  );
}
