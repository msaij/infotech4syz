"use client";
import { useState, useEffect } from "react";

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="py-6 text-center text-black bg-gray-100 border-t mt-auto">
      &copy; {year} 4syz Infotech Solutions. All rights reserved.
    </footer>
  );
}
