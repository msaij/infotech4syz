import Link from "next/link";

const adhocItems = [
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "On-Demand Deep Cleaning",
    description:
      "Specialized deep cleaning services for offices, conference rooms, and common areas as needed.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Event Setup & Support",
    description:
      "Assistance with event setup, breakdown, and on-site support for corporate functions and meetings.",
  },
  {
    image: "https://via.placeholder.com/80x+80?text=80+x+80",
    name: "Emergency Maintenance Calls",
    description:
      "Rapid response for urgent maintenance issues, ensuring minimal disruption to your business.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Custom Requests",
    description:
      "Flexible solutions for unique or one-off service needs not covered by standard offerings.",
  },
];

export default function AdhocServicePage() {
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
          Adhoc & Special Services
        </h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          Our adhoc and special services are designed to address unique, urgent, or
          one-time needs for your business. We offer flexible solutions to keep your
          operations running smoothly.
        </p>
        <div className="bg-gray-50 rounded-xl shadow p-4 sm:p-8">
          <table className="min-w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-gray-700 text-base">
                <th className="font-semibold pb-2">Image</th>
                <th className="font-semibold pb-2">Service Name</th>
                <th className="font-semibold pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {adhocItems.map((item, idx) => (
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
