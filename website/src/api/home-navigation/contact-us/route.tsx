import { NextResponse } from "next/server";
import { getConnection } from "@/utils/db";

export async function POST(request: Request) {
  const body = await request.json();

  const connection = await getConnection();

  try {
    const query = `
      INSERT INTO contact_us (name, phone, email, city, zip, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      body.name,
      body.phone,
      body.email,
      body.city,
      body.zip,
      body.message,
    ];

    const [result] = await connection.execute(query, values);

    console.log("Data successfully inserted into the database.");
  } catch (error) {
    console.error("Error executing query:", error); // Log any SQL errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage });
  } finally {
    connection.release(); // Release the connection back to the pool
  }

  return NextResponse.json({ success: true });
}