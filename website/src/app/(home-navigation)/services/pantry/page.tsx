import Link from "next/link";

const pantryItems = [
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Premium Tea & Coffee Kit",
    description:
      "Assorted premium teas, coffee, sugar, and creamer packs for office pantries.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Healthy Snack Basket",
    description:
      "Curated basket of healthy snacks including nuts, granola bars, and dried fruits for staff refreshment.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Disposable Cutlery & Plates Set",
    description:
      "Bulk pack of eco-friendly disposable plates, cups, and cutlery for office events and daily use.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Pantry Restock Essentials",
    description:
      "Regular restocking of pantry staples including milk, biscuits, and condiments for uninterrupted service.",
  },
];

export default function PantryServicePage() {
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
          Pantry Services
        </h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          Our pantry services ensure your team always has access to quality
          refreshments and snacks, keeping morale high and productivity up. We
          handle everything from supplies to restocking.
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
              {pantryItems.map((item, idx) => (
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
