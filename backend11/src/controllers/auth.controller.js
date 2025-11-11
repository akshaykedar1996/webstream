import { getDB } from "../lib/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅ Utility: Create JWT
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
}

// ✅ SIGNUP
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const db = getDB();
    const [exists] = await db.execute("SELECT * FROM users WHERE email=?", [email]);

    if (exists.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const idx = Math.floor(Math.random() * 100) + 1;
    const avatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const [result] = await db.execute(
      "INSERT INTO users (email, fullName, password, profilePic) VALUES (?, ?, ?, ?)",
      [email, fullName, hashedPassword, avatar]
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // ✅ localhost साठी
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [userId]);

    res.status(201).json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ LOGIN
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const db = getDB();
    const [rows] = await db.execute("SELECT * FROM users WHERE email=?", [email]);

    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);

    // ✅ FIX — MUST SET COOKIE HERE
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ LOGOUT
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logged out" });
}

// ✅ ONBOARD
export async function onboard(req, res) {
  try {
    const {
      userId,
      fullName,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePic,
    } = req.body;

    if (
      !userId ||
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = getDB();

    await db.execute(
      `UPDATE users 
       SET fullName=?, bio=?, nativeLanguage=?, learningLanguage=?, location=?, profilePic=?, isOnboarded=1 
       WHERE id=?`,
      [fullName, bio, nativeLanguage, learningLanguage, location, profilePic, userId]
    );

    const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [userId]);

    res.status(200).json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Onboard Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ AUTH ME
export async function me(req, res) {
  try {
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;

    const db = getDB();
    const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [userId]);

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, user: rows[0] });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}


// import { upsertStreamUser } from "../lib/stream.js";
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// export async function signup(req, res) {
//   const { email, password, fullName } = req.body;

//   try {
//     if (!email || !password || !fullName) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters" });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
//     }

//     const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
//     const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

//     const newUser = await User.create({
//       email,
//       fullName,
//       password,
//       profilePic: randomAvatar,
//     });

//     try {
//       await upsertStreamUser({
//         id: newUser._id.toString(),
//         name: newUser.fullName,
//         image: newUser.profilePic || "",
//       });
//       console.log(`Stream user created for ${newUser.fullName}`);
//     } catch (error) {
//       console.log("Error creating Stream user:", error);
//     }

//     const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "7d",
//     });

//     res.cookie("jwt", token, {
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true, // prevent XSS attacks,
//       sameSite: "strict", // prevent CSRF attacks
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.status(201).json({ success: true, user: newUser });
//   } catch (error) {
//     console.log("Error in signup controller", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export async function login(req, res) {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid email or password" });

//     const isPasswordCorrect = await user.matchPassword(password);
//     if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
//       expiresIn: "7d",
//     });

//     res.cookie("jwt", token, {
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true, // prevent XSS attacks,
//       sameSite: "strict", // prevent CSRF attacks
//       secure: process.env.NODE_ENV === "production",
//     });

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.log("Error in login controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export function logout(req, res) {
//   res.clearCookie("jwt");
//   res.status(200).json({ success: true, message: "Logout successful" });
// }

// export async function onboard(req, res) {
//   try {
//     const userId = req.user._id;

//     const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

//     if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
//       return res.status(400).json({
//         message: "All fields are required",
//         missingFields: [
//           !fullName && "fullName",
//           !bio && "bio",
//           !nativeLanguage && "nativeLanguage",
//           !learningLanguage && "learningLanguage",
//           !location && "location",
//         ].filter(Boolean),
//       });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         ...req.body,
//         isOnboarded: true,
//       },
//       { new: true }
//     );

//     if (!updatedUser) return res.status(404).json({ message: "User not found" });

//     try {
//       await upsertStreamUser({
//         id: updatedUser._id.toString(),
//         name: updatedUser.fullName,
//         image: updatedUser.profilePic || "",
//       });
//       console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
//     } catch (streamError) {
//       console.log("Error updating Stream user during onboarding:", streamError.message);
//     }

//     res.status(200).json({ success: true, user: updatedUser });
//   } catch (error) {
//     console.error("Onboarding error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }
