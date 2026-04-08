const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");


const router = express.Router();


// Auth Routes
router.post("/register",registerUser);      //Register User
router.post("/login",loginUser);           //Login User
router.get("/profile",protect , getUserProfile);   // Get User Profile
router.put("/profile",protect , updateUserProfile);      // update Profile



// Image upload — protected: only authenticated users can upload
router.post("/upload-image", protect, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({ imageUrl: req.file.path });
});


module.exports = router;