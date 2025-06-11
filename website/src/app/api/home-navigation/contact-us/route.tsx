import { NextResponse } from "next/server";
import { getConnection } from "@/utils/db";

export async function POST(request: Request) {
  console.log("API Route Hit: /api/home-navigation/contact-us"); // Debugging log

  const body = await request.json();

  console.log("Received Data:", body); // Debugging log to verify received data

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

    console.log("Executing Query:", query, values); // Debugging log for query and values

    const [result] = await connection.execute(query, values);
    console.log("Query Result:", result); // Debugging log for query result

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