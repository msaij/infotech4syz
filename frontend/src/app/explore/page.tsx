import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function EventManagementPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#FFF8ED] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 bg-[#FFE1B2] rounded-xl flex flex-col justify-center items-start p-8 min-h-[260px]">
              <h1 className="text-4xl font-extrabold mb-2 text-[#2D2D2D]">Corporate Gifting</h1>
              <p className="text-lg text-[#4B4B4B] mb-6">Customized gift hampers, branded merchandise & more</p>
              <Link href="#" className="px-6 py-2 bg-[#2D2D2D] text-white rounded font-semibold text-lg shadow hover:bg-[#444] transition">SHOP NOW</Link>
            </div>
            <div className="flex-1 bg-[#FFE25B] rounded-xl flex flex-col justify-center items-center p-8 min-h-[260px]">
              <h2 className="text-3xl font-bold text-[#2D2D2D] mb-2">Event Management</h2>
              <div className="w-full flex justify-center items-end" style={{ minHeight: 80 }}>
                {/* Triangle hanging paper decoration SVG - larger cones */}
              <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 50 Q 200 120 350 50" stroke="#8B4513" stroke-width="3" fill="none"/>
                <polygon points="70,57 90,57 80,97" fill="#4A9B8E"/>
                <polygon points="110,70 130,70 120,110" fill="#FF6B35"/>
                <polygon points="150,80 170,80 160,120" fill="#4A9B8E"/>
                <polygon points="190,85 210,85 200,125" fill="#FF6B35"/>
                <polygon points="230,85 250,85 240,125" fill="#FFD23F"/>
                <polygon points="270,75 290,75 280,115" fill="#FF6B35"/>
                <polygon points="310,60 330,60 320,100" fill="#4A9B8E"/>
              </svg>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Corporate & Branded Gifts */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
              <h3 className="text-xl font-bold mb-2">Corporate & Branded Gifts</h3>
              <p className="text-[#4B4B4B] mb-4">Category • Brand • Budget • Delivery Time</p>
              <Image src="/self/corporate-gifts.png" alt="Corporate & Branded Gifts" width={180} height={120} className="mb-4 object-contain" />
              <Link href="#" className="text-[#2D2D2D] font-semibold hover:underline flex items-center gap-1">VIEW ALL <span className="text-lg">&rarr;</span></Link>
            </div>
            {/* Office Consumables */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
              <h3 className="text-xl font-bold mb-2">Office Consumables</h3>
              <p className="text-[#4B4B4B] mb-4">Category • Brand • Budget • Delivery Time</p>
              <Image src="/self/office-consumables.png" alt="Office Consumables" width={180} height={120} className="mb-4 object-contain" />
              <Link href="#" className="text-[#2D2D2D] font-semibold hover:underline flex items-center gap-1">VIEW ALL <span className="text-lg">&rarr;</span></Link>
            </div>
            {/* Build Your Own Hamper */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-start shadow">
              <h3 className="text-xl font-bold mb-2">Build Your Own Hamper</h3>
              <p className="text-[#4B4B4B] mb-4">Create custom hampers for any occasion</p>
              <Image src="/self/corporate-gifting.png" alt="Build Your Own Hamper" width={180} height={120} className="mb-4 object-contain" />
              <button className="px-4 py-2 bg-[#FFE25B] text-[#2D2D2D] rounded font-semibold shadow hover:bg-[#FFD700] transition">ADD TO CART</button>
            </div>
          </div>

          {/* Featured Products */}
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
              <Image src="/self/corporate-gifting.jpg" alt="Festive Gift Hamper" width={100} height={80} className="mb-4 object-contain" />
              <h4 className="font-semibold mb-2">Festive Gift Hamper</h4>
              <p className="mb-2">₹ 2,000</p>
              <button className="w-full px-4 py-2 bg-[#FF9900] text-white rounded font-semibold shadow hover:bg-[#FFB84D] transition">ADD TO CART</button>
            </div>
            <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
              <Image src="/self/corporate-gifting.jpg" alt="Epigamia Greek Yogurt" width={100} height={80} className="mb-4 object-contain" />
              <h4 className="font-semibold mb-2">Epigamia Greek Yogurt</h4>
              <p className="mb-2">₹ 50</p>
              <button className="w-full px-4 py-2 bg-[#FF9900] text-white rounded font-semibold shadow hover:bg-[#FFB84D] transition">ADD TO CART</button>
            </div>
            <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
              <Image src="/self/corporate-gifting.jpg" alt="Bluetooth Headphones" width={100} height={80} className="mb-4 object-contain" />
              <h4 className="font-semibold mb-2">Bluetooth Headphones</h4>
              <p className="mb-2">₹ 1,500</p>
              <button className="w-full px-4 py-2 bg-[#FF9900] text-white rounded font-semibold shadow hover:bg-[#FFB84D] transition">ADD TO CART</button>
            </div>
            <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow">
              <Image src="/self/corporate-gifting.jpg" alt="Desk Organizer Set" width={100} height={80} className="mb-4 object-contain" />
              <h4 className="font-semibold mb-2">Desk Organizer Set</h4>
              <p className="mb-2">₹ 760</p>
              <button className="w-full px-4 py-2 bg-[#FF9900] text-white rounded font-semibold shadow hover:bg-[#FFB84D] transition">ADD TO CART</button>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
          <Footer />
    </>
  );
}
