import { NextResponse } from "next/server";
import { getConnection } from "@/utils/db";
import { signToken } from "@/utils/jwt";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    // Query the database for the user
    const connection = await getConnection();
    const [results] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    connection.release();

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // Generate JWT
    const user = results[0] as RowDataPacket;
    const token = signToken({ email: user.email, role: "company" });

    // Set the token in an HTTP-only cookie
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("authToken", token, { httpOnly: true, secure: true });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
