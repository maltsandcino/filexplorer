const express = require('express');
const router = express.Router();
const controller = require("../controllers/controller");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });



// Main home route. Handle logged in and un-logged inviews
router.get("/", controller.getHome);
// // Post Login -> Will redirect
router.post("/login", controller.postLogin);
router.get("/logout", controller.getLogout);
// // Sign-Up Form
router.post("/signup", controller.postSignup);
// Create Folder
router.post("/createFolder", controller.createFolder);
// Get Folder
router.get("/folder/:folderid", controller.getFolder);
// Upload File
router.post('/upload', upload.single('file'), controller.uploadFile);
// Create Sharing Token
router.get("/share/:folderid", controller.setLink);
// View shared folder
router.get("/files/:token", controller.getLink);

module.exports = router;