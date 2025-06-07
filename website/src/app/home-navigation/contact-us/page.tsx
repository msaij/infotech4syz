"use client";

import React, { useEffect } from "react";

export default function ContactPage() {
  useEffect(() => {
    // If hash is present on mount, scroll to section
    if (typeof window !== "undefined") {
      if (window.location.hash === "#about" || window.location.hash === "#services") {
        setTimeout(() => {
          window.location.replace(`/${window.location.hash}`);
        }, 50);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-8">
      <h1 className="text-5xl font-extrabold text-center mb-2">Contact Us</h1>
      <p className="text-center text-gray-700 mb-10 text-lg max-w-xl">
        We're here to assist. Reach out with your requirements or inquiries.
      </p>
      <div className="w-full max-w-2xl bg-gray-50 rounded-xl shadow p-8 mx-auto">
        <h2 className="text-2xl font-bold mb-1">Send Us a Message</h2>
        <p className="text-gray-600 mb-6">Fill out the form below, and we'll be in touch promptly.</p>
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1">Full Name</label>
              <input type="text" placeholder="e.g. John Doe" className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input type="text" placeholder="e.g. (123) 456-7890" className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email Address</label>
              <input type="email" placeholder="e.g. john.doe@example.com" className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block font-semibold mb-1">City</label>
              <input type="text" placeholder="e.g. Metropolis" className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Zip Code</label>
              <input type="text" placeholder="e.g. 98765" className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Your Message</label>
            <textarea rows={4} placeholder="Please describe your needs or inquiry..." className="w-full rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" className="w-full bg-black text-white font-semibold rounded-md py-3 text-lg shadow hover:bg-gray-900 transition">
            Send Message
          </button>
        </form>
      </div>
      {/* Direct Contact Information */}
      <div className="w-full max-w-xl mx-auto mt-16 border-t pt-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Direct Contact Information</h2>
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
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
              <div className="text-gray-700 leading-tight">123 Business Avenue, Suite 456<br/>Metropolis, ST 98765</div>
              <a href="https://maps.app.goo.gl/gixDKukwkzHm66Fy9" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-sm">View on Google Maps</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
