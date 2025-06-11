import mysql from "mysql2/promise";

if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  throw new Error("Missing required environment variables for database connection.");
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 20, // Start with 20 connections
  queueLimit: 0,       // Unlimited queueing
});

export async function getConnection() {
  try {
    console.log("Attempting to connect to the database..."); // Debugging log for connection attempt
    const connection = await pool.getConnection();
    console.log("Database connection successful."); // Debugging log for successful connection
    return connection;
  } catch (error) {
    console.error("Database connection error:", error); // Log any connection errors
    throw new Error("Failed to connect to the database.");
  }
}
