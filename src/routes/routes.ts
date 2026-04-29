import express from "express";
import multer from "multer";
import uploadController from "../controllers/controller.js";

const router = express.Router();
const storage = multer.memoryStorage(); // Definir dónde se va a almacenar
const upload = multer({storage: storage}); // Middleware

router.post("/file", upload.single("file"), uploadController);

export default router;