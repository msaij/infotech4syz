"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      city: formData.get("city"),
      zip: formData.get("zip"),
      message: formData.get("message"),
    };

    // Client-side validation
    if (!data.name || !data.email || !data.message) {
      setFormMessage("Please fill in all required fields.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/home-navigation/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setFormMessage("Message sent successfully!");
      setMessageType("success");
    } catch (error) {
      setFormMessage(`Failed to send message. ${(error as Error).message}`);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-8">
      <h1 className="text-5xl font-extrabold text-center mb-2">Contact Us</h1>
      <p className="text-center text-gray-700 mb-10 text-lg max-w-xl">
        We're here to assist. Reach out with your requirements or inquiries.
      </p>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-gray-50 rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold mb-1">Send Us a Message</h2>
          <p className="text-gray-600 mb-6">Fill out the form below, and we'll be in touch promptly.</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Shrek"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-describedby="phone-help"
                />
                <small id="phone-help" className="text-gray-500">
                  Optional - We'll use this if we need to reach you about your message.
                </small>
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. shrek@swamp.com"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-describedby="city-help"
                  required
                />
                <small id="city-help" className="text-gray-500">
                  Required - Please provide your city.
                </small>
              </div>
              <div>
                <label className="block font-semibold mb-1">Zip Code</label>
                <input
                  type="text"
                  name="zip"
                  placeholder="e.g. 560102"
                  className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-describedby="zip-help"
                  required
                />
                <small id="zip-help" className="text-gray-500">
                  Required - Please provide your zip code.
                </small>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Your Message</label>
              <textarea
                rows={4}
                name="message"
                placeholder="Please describe your needs or inquiry..."
                className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div id="form-message" className={`text-center mt-4 ${messageType === "success" ? "text-green-600" : "text-red-600"}`}>
              {formMessage}
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-semibold rounded-md py-3 text-lg shadow hover:bg-gray-900 transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
        {/* Direct Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-center mb-8">Direct Contact Information</h2>
          {/* Email Row */}
          <div className="flex items-center gap-4 w-full mb-6">
            <span className="material-symbols-rounded text-4xl text-blue-600">mail</span>
            <div>
              <div className="font-semibold text-base">Email</div>
              <a href="mailto:info@4syz.com" className="text-blue-700 hover:underline break-all">info@4syz.com</a>
            </div>
          </div>
          {/* Phone Row */}
          <div className="flex items-center gap-4 w-full mb-6">
            <span className="material-symbols-rounded text-4xl text-green-600">call</span>
            <div>
              <div className="font-semibold text-base">Phone</div>
              <a href="tel:+919876543210" className="text-blue-700 hover:underline">+91 98765 43210</a>
            </div>
          </div>
          {/* Address Row */}
          <div className="flex items-center gap-4 w-full">
            <span className="material-symbols-rounded text-4xl text-pink-600">location_on</span>
            <div>
              <div className="font-semibold text-base">Address</div>
              <div className="text-gray-700 leading-tight">554, 14th Main Rd, Sector 7, HSR Layout<br/>Bengaluru, Karnataka 560102</div>
              <a href="https://maps.app.goo.gl/gixDKukwkzHm66Fy9" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-sm">View on Google Maps</a>
            </div>
          </div>
          {/* Embedded Google Map */}
          <div className="mt-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.6970276359275!2d77.63531537578038!3d12.907983687401579!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1534e2a37ef9%3A0x16b38a8b4fb58d99!2s4Syz%20Infotech%20Solutions%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1749620525229!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
