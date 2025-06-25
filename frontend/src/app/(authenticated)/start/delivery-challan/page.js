// generate html table with sample data
import React from 'react';

const fakeTableData = Array.from({ length: 10 }, (_, i) => ({
	id: i + 1,
	name: `Item ${i + 1}`,
	description: `Description for Item ${i + 1}`,
	quantity: Math.floor(Math.random() * 100),
	price: (Math.random() * 100).toFixed(2),
}));

export default function DeliveryChallanPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
			<h1 className="text-3xl font-bold mb-6 text-zinc-900">Delivery Challan</h1>
			<div className="flex-1 w-full flex items-center justify-center">
				<table className="w-full max-w-6xl border border-zinc-200 bg-white text-zinc-800 rounded-lg shadow-md">
					<thead className="bg-zinc-100">
						<tr>
							<th className="px-4 py-2 border-b text-left font-semibold">ID</th>
							<th className="px-4 py-2 border-b text-left font-semibold">Name</th>
							<th className="px-4 py-2 border-b text-left font-semibold">Description</th>
							<th className="px-4 py-2 border-b text-left font-semibold">Quantity</th>
							<th className="px-4 py-2 border-b text-left font-semibold">Price</th>
						</tr>
					</thead>
					<tbody>
						{fakeTableData.map((item) => (
							<tr key={item.id} className="hover:bg-zinc-100 transition">
								<td className="px-4 py-2 border-b">{item.id}</td>
								<td className="px-4 py-2 border-b">{item.name}</td>
								<td className="px-4 py-2 border-b">{item.description}</td>
								<td className="px-4 py-2 border-b">{item.quantity}</td>
								<td className="px-4 py-2 border-b">{item.price}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
