import Link from "next/link";

const stationeryItems = [
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Executive Stationery Kit",
    description:
      "Premium pens, notepads, sticky notes, and markers for executive and staff use.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Bulk Printing Paper",
    description:
      "High-quality A4 and A3 printing paper supplied in bulk for office printers and copiers.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Desk Organizer Set",
    description:
      "Multi-piece desk organizer sets to keep workspaces tidy and efficient.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Custom Company-Branded Supplies",
    description:
      "Personalized stationery items such as folders, pens, and diaries with your company logo.",
  },
];

export default function StationeryServicePage() {
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
          Stationery Services
        </h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          We supply a wide range of office stationery and branded supplies to keep
          your business running smoothly. Our products are selected for quality
          and reliability.
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
              {stationeryItems.map((item, idx) => (
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
