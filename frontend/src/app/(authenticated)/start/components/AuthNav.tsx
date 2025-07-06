// AuthNav.js
// Collapsible left navigation bar for authenticated users in the dashboard
// Shows logo, navigation links, and user info

"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/components/(access-providers)/auth-context";
import { usePathname } from "next/navigation";

interface NavChild {
	href: string;
	label: string;
	icon: string;
}

interface NavItem {
	label: string;
	icon: string;
	children?: NavChild[];
	href?: string;
}

// Navigation items for the sidebar
const navItems: NavItem[] = [
	{
		label: "Office",
		icon: "apartment",
		children: [
			{
				href: "/start/delivery-challan",
				label: "Delivery Challan",
				icon: "local_shipping",
			},
			// Add more office-related items here
		],
	},
	// Add more top-level items as needed
];

export default function AuthNav() {
	const [collapsed, setCollapsed] = useState(false);
	const { user } = useAuth();
	const pathname = usePathname();
	// Open folders state: initialize Office open if on a child route
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
		const initial: Record<string, boolean> = {};
		navItems.forEach((item) => {
			if (item.children) {
				if (item.children.some((child) => pathname.startsWith(child.href))) {
					initial[item.label] = true;
				}
			}
		});
		return initial;
	});

	const handleFolderToggle = (label: string) => {
		setOpenFolders((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	return (
		<aside
			className={`h-screen bg-zinc-900 border-r border-zinc-800 shadow-lg flex flex-col transition-all duration-300 ${
				collapsed ? "w-20" : "w-64"
			}`}
			style={{ background: "#18181b" }} // Use a dark neutral background, but not pure black
		>
			{/* Sidebar header with logo and collapse button */}
			<div className="flex items-center justify-between px-4 h-16 border-b border-zinc-800">
				<Image
					src="/self/logo-4syz.gif"
					alt="4SYZ Logo"
					width={40}
					height={40}
					className={`h-10 w-auto transition-all duration-300 ${
						collapsed ? "hidden" : "block"
					}`}
				/>
				<button
					className="p-2 rounded hover:bg-zinc-800 focus:outline-none text-zinc-300"
					onClick={() => setCollapsed((c) => !c)}
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<span className="material-symbols-outlined text-2xl">
						{collapsed ? "chevron_right" : "chevron_left"}
					</span>
				</button>
			</div>
			{/* Navigation links */}
			<nav className="flex-1 flex flex-col gap-2 mt-4">
				{navItems.map((item) =>
					item.children ? (
						<div key={item.label}>
							<button
								onClick={() => handleFolderToggle(item.label)}
								className={`flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left hover:bg-zinc-800 transition text-zinc-200 font-medium ${collapsed ? "justify-center" : ""}`}
							>
								<span className="material-symbols-outlined text-2xl">{item.icon}</span>
								{!collapsed && <span>{item.label}</span>}
								{!collapsed && (
									<span className="material-symbols-outlined text-base ml-auto">
										{openFolders[item.label] ? "expand_less" : "expand_more"}
									</span>
								)}
							</button>
							{/* Folder children */}
							{openFolders[item.label] && !collapsed && (
								<div className="ml-8 flex flex-col gap-1">
									{item.children.map((child) => (
										child.href && (
											<Link
												key={child.href}
												href={child.href}
												className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-zinc-800 text-sm ${
													pathname === child.href
														? "bg-zinc-800 text-white font-semibold"
														: "text-zinc-300"
												}`}
											>
												<span className="material-symbols-outlined text-xl">{child.icon}</span>
												<span>{child.label}</span>
											</Link>
										)
									))}
								</div>
							)}
						</div>
					) : (
						item.href && (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800 transition text-zinc-200 font-medium ${collapsed ? "justify-center" : ""}`}
							>
								<span className="material-symbols-outlined text-2xl">{item.icon}</span>
								{!collapsed && <span>{item.label}</span>}
							</Link>
						)
					)
				)}
			</nav>
			{/* User info at the bottom */}
			{user && (
				<div
					className={`px-4 py-4 border-t border-zinc-800 text-xs text-zinc-400 ${
						collapsed ? "hidden" : "block"
					}`}
				>
					Signed in as{" "}
					<span className="font-semibold text-zinc-200">{user.email}</span>
				</div>
			)}
		</aside>
	);
}
