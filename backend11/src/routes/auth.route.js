import express from "express";
import { signup, login, logout, onboard, me } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboard", onboard);
router.post("/onboarding", onboard);
router.get("/me", me);

export default router;




// import express from "express";
// import { login, logout, onboard, signup } from "../controllers/auth.controller.js";
// import { protectRoute } from "../middleware/auth.middleware.js";

// const router = express.Router();

// router.post("/signup", signup);
// router.post("/login", login);
// router.post("/logout", logout);

// router.post("/onboarding", protectRoute, onboard);

// // check if user is logged in
// router.get("/me", protectRoute, (req, res) => {
//   res.status(200).json({ success: true, user: req.user });
// });

// export default router;
