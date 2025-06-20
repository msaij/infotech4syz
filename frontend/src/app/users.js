"use client";
import { useEffect, useState } from "react";
import ProtectedPage from "./components/ProtectedPage";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/items/users/", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <ProtectedPage>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-lg font-bold mb-4">User List</h2>
        <ul className="list-disc pl-6">
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.username}</strong> ({user.email})
            </li>
          ))}
        </ul>
      </div>
    </ProtectedPage>
  );
}
