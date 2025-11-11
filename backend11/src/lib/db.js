import mysql from "mysql2/promise";

let db;

export const connectDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "collabnext",
      port: Number(process.env.DB_PORT) || 4306, // XAMPP default
    });

    console.log("✅ MySQL Connected (XAMPP)");
    return db;
  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("DB connection not initialized. Call connectDB() first.");
  }
  return db;
};



// import mysql from "mysql2/promise";

// let db;

// export const connectDB = async () => {
//   try {
//     db = await mysql.createConnection({
//       host: "localhost",
//       user: "root",
//       password: "",
//       database: "collabnext",
//       port: process.env.DB_PORT || 4306, 
//     });

//     console.log("✅ MySQL Connected (XAMPP)");
//     return db;

//   } catch (err) {
//     console.error("❌ MySQL Connection Error:", err);
//     throw err;
//   }
// };

// export const getDB = () => db;




// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.log("Error in connecting to MongoDB", error);
//     process.exit(1); // 1 means failure
//   }
// };
