import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = (req, res) => {
  try {
    const userId = req.user.id.toString(); // ✅ MUST BE STRING

    const token = generateStreamToken(userId); // ✅ FIXED

    return res.status(200).json({ token, user_id: userId });
  } catch (err) {
    console.error("Stream token error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
