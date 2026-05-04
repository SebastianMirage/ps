import express from "express";
import multer from "multer";
import { catedralController, cuartoController, customIRController, labIRController, salaConciertoController } from "../controllers/processingEngine.js";

const router = express.Router();
const storage = multer.memoryStorage(); // Definir dónde se va a almacenar
const upload = multer({storage: storage}); // Middleware

router.post("/file/sala-concierto", upload.single("file"), salaConciertoController);
router.post("/file/catedral", upload.single("file"), catedralController);
router.post("/file/cuarto", upload.single("file"), cuartoController);
router.post("/file/lab", upload.single("file"), labIRController);
router.post("/file/custom-ir", upload.fields([{name: "file", maxCount:1}, {name: "ir", maxCount:1}]), customIRController);

export default router;