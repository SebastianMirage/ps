import type { Request, Response } from "express";
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const uploadController = (req: Request, res: Response) => {
  const file = req.file;

  //Rutas y directorios
  const matlabDir = path.resolve(process.cwd(), "src", "matlab");
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  const outputPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);
  const toMatlabPath = (p: string) => p.replace(/\\/g, "/");
  const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  if (!file) {
    return res.status(400).json({ error: "Sin archivo" });
  }

  if (file.mimetype !== "audio/wave") {
    return res.status(400).json("Formato incorrecto");
  }

  //Escribe un archivo temporal en la dirección tempPath
  fs.writeFileSync(tempPath, file.buffer);

  //Procesa el audio
  try {
    execFileSync(
      "matlab",
      [
        "-batch",
        `addpath('${toMatlabPath(matlabDir)}'); ir_sala_conciertos('${toMatlabPath(tempPath)}','${toMatlabPath(outputPath)}')`,
      ],
      { windowsHide: true },
    );

    fs.mkdirSync(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${Date.now()}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    fs.copyFileSync(outputPath, savedFilePath);

    return res.json({
      originalName: file.originalname,
      mimeName: file.mimetype,
      size: file.size,
      savedFileName,
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "No se pudo procesar el audio" });
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }

};

export default uploadController;
