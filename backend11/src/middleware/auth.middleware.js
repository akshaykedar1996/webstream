import jwt from "jsonwebtoken";
import { getDB } from "../lib/db.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // ✅ 1) Read from cookies (most likely "access" or any cookie)
    if (req.cookies?.access) {
      token = req.cookies.access;
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // ✅ 2) Read from Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ✅ 3) No token found → Unauthorized
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ 4) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.id || decoded.userId; // ✅ supports both

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // ✅ 5) Fetch logged-in user from MySQL
    const db = getDB();
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ 6) Attach user to req
    req.user = rows[0];

    next();
  } catch (error) {
    console.error("protectRoute error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};


// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized - No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//     if (!decoded) {
//       return res.status(401).json({ message: "Unauthorized - Invalid token" });
//     }

//     const user = await User.findById(decoded.userId).select("-password");

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized - User not found" });
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     console.log("Error in protectRoute middleware", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
