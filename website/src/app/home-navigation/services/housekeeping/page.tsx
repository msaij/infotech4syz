import Link from "next/link";

const housekeepingItems = [
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Eco-Friendly Cleaning Solution Set",
    description:
      "A complete set of plant-based, non-toxic cleaning sprays for various surfaces, safe for office environments.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Commercial Vacuum Cleaner",
    description:
      "High-powered vacuum cleaner designed for office carpets and hard floors, with HEPA filtration.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Bulk Microfiber Cleaning Cloths",
    description:
      "Large pack of reusable, highly absorbent microfiber cloths for dusting and cleaning (100-pack).",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Restroom Sanitization & Refill Kit",
    description:
      "All-in-one kit including disinfectants, toilet bowl cleaners, hand soap, and paper product refills for office restrooms.",
  },
];

export default function HousekeepingServicePage() {
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/#services"
          className="inline-flex items-center mb-8 px-4 py-2 border rounded hover:bg-gray-100 transition text-black text-sm font-medium"
        >
          <span className="mr-2">←</span> Back to All Services
        </Link>
        <h1 className="text-4xl font-extrabold text-center mb-2">
          House Keeping
        </h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          We provide comprehensive house keeping solutions to ensure your workspace
          remains immaculate, promoting productivity and a healthy environment.
          Our services are tailored to meet the specific needs of your facility.
        </p>
        <div className="bg-gray-50 rounded-xl shadow p-4 sm:p-8">
          <table className="min-w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-gray-700 text-base">
                <th className="font-semibold pb-2">Image</th>
                <th className="font-semibold pb-2">Product Name</th>
                <th className="font-semibold pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {housekeepingItems.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-2 pr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded bg-gray-200 w-20 h-20 object-cover"
                    />
                  </td>
                  <td className="py-2 pr-4 font-semibold">{item.name}</td>
                  <td className="py-2 text-gray-700">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
