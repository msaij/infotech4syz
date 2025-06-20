"use client";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("http://127.0.0.1:8000/api-auth/logout/", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black py-16 px-4">
      <div className="w-full max-w-md bg-gray-100 p-8 rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-6">Logout</h1>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
