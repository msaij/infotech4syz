import Link from "next/link";

const eventItems = [
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "End-to-End Event Management",
    description:
      "Comprehensive planning, coordination, and execution of corporate events, from small meetings to large conferences.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Venue Setup & Decoration",
    description:
      "Professional venue setup, theming, and decoration to create the perfect ambiance for your event.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Catering & Refreshments",
    description:
      "Curated catering services offering a variety of cuisines and refreshments tailored to your event needs.",
  },
  {
    image: "https://via.placeholder.com/80x80?text=80+x+80",
    name: "Audio-Visual & Technical Support",
    description:
      "State-of-the-art audio-visual equipment and on-site technical support for seamless presentations and entertainment.",
  },
];

export default function CorporateEventsServicePage() {
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
          Corporate Events
        </h1>
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          We specialize in organizing memorable corporate events that reflect your brand and engage your audience. From planning to execution, our team ensures every detail is handled with professionalism and creativity.
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
              {eventItems.map((item, idx) => (
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
