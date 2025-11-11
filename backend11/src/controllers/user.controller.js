import { getDB } from "../lib/db.js";

// ✅ Recommended Users
export async function getRecommendedUsers(req, res) {
  try {
    const userId = req.user.id;
    const db = getDB();

    const [friendRows] = await db.execute(
      "SELECT friend_id FROM friends WHERE user_id = ?",
      [userId]
    );
    const friendIds = friendRows.map(f => f.friend_id);

    let query = `
      SELECT id, fullName, profilePic, nativeLanguage, learningLanguage 
      FROM users 
      WHERE id != ? AND isOnboarded = 1
    `;

    if (friendIds.length > 0) {
      const placeholders = friendIds.map(() => "?").join(",");
      query += ` AND id NOT IN (${placeholders})`;
      const [users] = await db.execute(query, [userId, ...friendIds]);
      return res.status(200).json(users);
    }

    const [users] = await db.execute(query, [userId]);
    res.status(200).json(users);
  } catch (error) {
    console.error("Recommended Users Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ My Friends List
export async function getMyFriends(req, res) {
  try {
    const userId = req.user.id;
    const db = getDB();

    const [rows] = await db.execute(
      `SELECT u.id, u.fullName, u.profilePic, u.nativeLanguage, u.learningLanguage 
       FROM friends f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = ?`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Friends Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ Send Friend Request
export async function sendFriendRequest(req, res) {
  try {
    const sender = req.user.id;
    const recipient = parseInt(req.params.id);
    if (isNaN(recipient)) return res.status(400).json({ message: "Invalid recipient" });
    if (sender === recipient) return res.status(400).json({ message: "Cannot send to yourself" });

    const db = getDB();

    const [recipientExists] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [recipient]
    );
    if (!recipientExists.length) return res.status(404).json({ message: "Recipient not found" });

    const [friendRows] = await db.execute(
      "SELECT * FROM friends WHERE user_id=? AND friend_id=?",
      [sender, recipient]
    );
    if (friendRows.length > 0) return res.status(400).json({ message: "Already friends" });

    const [existing] = await db.execute(
      `SELECT * FROM friend_requests 
       WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?)`,
      [sender, recipient, recipient, sender]
    );
    if (existing.length > 0) return res.status(400).json({ message: "Request already exists" });

    await db.execute(
      "INSERT INTO friend_requests (sender, recipient) VALUES (?, ?)",
      [sender, recipient]
    );

    res.status(201).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Send Friend Request Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ Accept Friend Request
export async function acceptFriendRequest(req, res) {
  try {
    const requestId = req.params.id;
    const db = getDB();

    const [rows] = await db.execute(
      "SELECT * FROM friend_requests WHERE id=?",
      [requestId]
    );
    if (!rows.length) return res.status(404).json({ message: "Request not found" });

    const reqRow = rows[0];
    if (reqRow.recipient != req.user.id) return res.status(403).json({ message: "Not allowed" });

    await db.execute(
      "UPDATE friend_requests SET status='accepted' WHERE id=?",
      [requestId]
    );

    await db.execute(
      "INSERT INTO friends (user_id, friend_id) VALUES (?, ?), (?, ?)",
      [reqRow.sender, reqRow.recipient, reqRow.recipient, reqRow.sender]
    );

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Accept Request Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ Get Friend Requests (Incoming + Accepted)
export async function getFriendRequests(req, res) {
  try {
    const userId = req.user.id;
    const db = getDB();

    // Incoming pending requests
    const [incoming] = await db.execute(
      `SELECT fr.id, u.id as senderId, u.fullName, u.profilePic, u.nativeLanguage, u.learningLanguage
       FROM friend_requests fr
       JOIN users u ON fr.sender = u.id
       WHERE fr.recipient = ? AND fr.status='pending'`,
      [userId]
    );

    // Accepted requests where current user sent
    const [accepted] = await db.execute(
      `SELECT fr.id, u.id as recipientId, u.fullName, u.profilePic, u.nativeLanguage, u.learningLanguage
       FROM friend_requests fr
       JOIN users u ON fr.recipient = u.id
       WHERE fr.sender = ? AND fr.status='accepted'`,
      [userId]
    );

    const incomingReqs = incoming.map(i => ({
      _id: i.id,
      sender: {
        id: i.senderId,
        fullName: i.fullName,
        profilePic: i.profilePic,
        nativeLanguage: i.nativeLanguage,
        learningLanguage: i.learningLanguage,
      },
    }));

    const acceptedReqs = accepted.map(a => ({
      _id: a.id,
      recipient: {
        id: a.recipientId,
        fullName: a.fullName,
        profilePic: a.profilePic,
        nativeLanguage: a.nativeLanguage,
        learningLanguage: a.learningLanguage,
      },
    }));

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.error("Friend Req Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ Outgoing Pending Requests
export async function getOutgoingFriendReqs(req, res) {
  try {
    const userId = req.user.id;
    const db = getDB();

    const [rows] = await db.execute(
      `SELECT fr.id, u.fullName, u.profilePic
       FROM friend_requests fr
       JOIN users u ON fr.recipient = u.id
       WHERE fr.sender=? AND fr.status='pending'`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Outgoing Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// import User from "../models/User.js";
// import FriendRequest from "../models/FriendRequest.js";

// export async function getRecommendedUsers(req, res) {
//   try {
//     const currentUserId = req.user.id;
//     const currentUser = req.user;

//     const recommendedUsers = await User.find({
//       $and: [
//         { _id: { $ne: currentUserId } }, //exclude current user
//         { _id: { $nin: currentUser.friends } }, // exclude current user's friends
//         { isOnboarded: true },
//       ],
//     });
//     res.status(200).json(recommendedUsers);
//   } catch (error) {
//     console.error("Error in getRecommendedUsers controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export async function getMyFriends(req, res) {
//   try {
//     const user = await User.findById(req.user.id)
//       .select("friends")
//       .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

//     res.status(200).json(user.friends);
//   } catch (error) {
//     console.error("Error in getMyFriends controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export async function sendFriendRequest(req, res) {
//   try {
//     const myId = req.user.id;
//     const { id: recipientId } = req.params;

//     // prevent sending req to yourself
//     if (myId === recipientId) {
//       return res.status(400).json({ message: "You can't send friend request to yourself" });
//     }

//     const recipient = await User.findById(recipientId);
//     if (!recipient) {
//       return res.status(404).json({ message: "Recipient not found" });
//     }

//     // check if user is already friends
//     if (recipient.friends.includes(myId)) {
//       return res.status(400).json({ message: "You are already friends with this user" });
//     }

//     // check if a req already exists
//     const existingRequest = await FriendRequest.findOne({
//       $or: [
//         { sender: myId, recipient: recipientId },
//         { sender: recipientId, recipient: myId },
//       ],
//     });

//     if (existingRequest) {
//       return res
//         .status(400)
//         .json({ message: "A friend request already exists between you and this user" });
//     }

//     const friendRequest = await FriendRequest.create({
//       sender: myId,
//       recipient: recipientId,
//     });

//     res.status(201).json(friendRequest);
//   } catch (error) {
//     console.error("Error in sendFriendRequest controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export async function acceptFriendRequest(req, res) {
//   try {
//     const { id: requestId } = req.params;

//     const friendRequest = await FriendRequest.findById(requestId);

//     if (!friendRequest) {
//       return res.status(404).json({ message: "Friend request not found" });
//     }

//     // Verify the current user is the recipient
//     if (friendRequest.recipient.toString() !== req.user.id) {
//       return res.status(403).json({ message: "You are not authorized to accept this request" });
//     }

//     friendRequest.status = "accepted";
//     await friendRequest.save();

//     // add each user to the other's friends array
//     // $addToSet: adds elements to an array only if they do not already exist.
//     await User.findByIdAndUpdate(friendRequest.sender, {
//       $addToSet: { friends: friendRequest.recipient },
//     });

//     await User.findByIdAndUpdate(friendRequest.recipient, {
//       $addToSet: { friends: friendRequest.sender },
//     });

//     res.status(200).json({ message: "Friend request accepted" });
//   } catch (error) {
//     console.log("Error in acceptFriendRequest controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export async function getFriendRequests(req, res) {
//   try {
//     const incomingReqs = await FriendRequest.find({
//       recipient: req.user.id,
//       status: "pending",
//     }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

//     const acceptedReqs = await FriendRequest.find({
//       sender: req.user.id,
//       status: "accepted",
//     }).populate("recipient", "fullName profilePic");

//     res.status(200).json({ incomingReqs, acceptedReqs });
//   } catch (error) {
//     console.log("Error in getPendingFriendRequests controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// export async function getOutgoingFriendReqs(req, res) {
//   try {
//     const outgoingRequests = await FriendRequest.find({
//       sender: req.user.id,
//       status: "pending",
//     }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

//     res.status(200).json(outgoingRequests);
//   } catch (error) {
//     console.log("Error in getOutgoingFriendReqs controller", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }
