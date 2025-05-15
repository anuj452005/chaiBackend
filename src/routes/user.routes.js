import Router from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",

  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),

  registerUser
);

router.route("/login").post(loginUser);

//sercure routes
router.route("/logout").post(verifyJWT, logoutUser);

router.get("/", (req, res) => {
  res.send("User Route");
});

export default router;
