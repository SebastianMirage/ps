import type { Request, Response } from "express";
import path from "node:path";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";
import getAudio from "../helpers/getAudio.js";
import fs from "node:fs"

interface FilesType {
  file?: Express.Multer.File[];
  ir?: Express.Multer.File[];
};

//Rutas y directorios
const uploadsDir = path.resolve(process.cwd(), "uploads");

const salaConciertoController = (req: Request, res: Response) => {
  const file = req.file;
  const requestID = uuidv4();
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "ir");
  const irSalaConcierto = path.resolve(matlabDir, "ir_sala_concierto.wav");
  const executablePath = path.join(matlabDir, "ir.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${requestID}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${requestID}.wav`);

  try {
    const result = getAudio({
      file,
      tempPath,
      executablePath,
      outputPath,
      matlabDir,
      requestID,
      uploadsDir,
      ir: irSalaConcierto
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    res.status(200).sendFile(result.savedFilePath);
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "No se ha podido procesar el audio"
    res.status(500).json({error: errorMessage})
  }
};

const catedralController = (req: Request, res: Response) => {
  const file = req.file;
  const requestID = uuidv4();
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "ir");
  const irCatedral = path.resolve(matlabDir, "ir_catedral.wav");
  const executablePath = path.join(matlabDir, "ir.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${requestID}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${requestID}.wav`);

  try {
    const result = getAudio({
      file,
      tempPath,
      executablePath,
      outputPath,
      matlabDir,
      requestID,
      uploadsDir,
      ir: irCatedral
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    res.status(200).sendFile(result.savedFilePath);
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "No se ha podido procesar el audio"
    res.status(500).json({error: errorMessage})
  }
};

const cuartoController = (req: Request, res: Response) => {
  const file = req.file;
  const requestID = uuidv4();
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "ir");
  const irCuarto = path.resolve(matlabDir, "ir_cuarto.wav");
  const executablePath = path.join(matlabDir, "ir.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${requestID}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${requestID}.wav`);

  try {
    const result = getAudio({
      file,
      tempPath,
      executablePath,
      outputPath,
      matlabDir,
      requestID,
      uploadsDir,
      ir: irCuarto
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    res.status(200).sendFile(result.savedFilePath);
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : "No se ha podido procesar el audio"
    res.status(500).json({error: errorMessage})
  }
};

const labIRController = (req: Request, res: Response) => {
  const file = req.file;
  const requestID = uuidv4();
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "ir");
  const irLab = path.resolve(matlabDir, "ir_lab.wav");
  const executablePath = path.join(matlabDir, "ir.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${requestID}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${requestID}.wav`);

  try {
    const result = getAudio({
      file,
      tempPath,
      executablePath,
      outputPath,
      matlabDir,
      requestID,
      uploadsDir,
      ir: irLab,
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    res.status(200).sendFile(result.savedFilePath);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "No se ha podido procesar el audio";
    res.status(500).json({ error: errorMessage });
  }
};

const customIRController = (req: Request, res: Response) => {
  const files = req.files as FilesType

  if (!files?.file?.[0] || !files?.ir?.[0]) {
  return res.status(400).json({ error: "Faltan archivos" });
}

  const file = files.file[0];
  const customIr = files.ir[0];
  const requestID = uuidv4();
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "ir");
  const executablePath = path.join(matlabDir, "ir.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${requestID}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${requestID}.wav`);
  const tempPathIr = path.resolve(os.tmpdir(), `customir-${requestID}.wav`);

  //Escribir la ir
  fs.writeFileSync(tempPathIr, customIr.buffer);

  try {
    const result = getAudio({
      file,
      tempPath,
      executablePath,
      outputPath,
      matlabDir,
      requestID,
      uploadsDir,
      ir: tempPathIr,
    });

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    res.status(200).sendFile(result.savedFilePath);
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "No se ha podido procesar el audio";
    res.status(500).json({ error: errorMessage });
  }
};

export {
  salaConciertoController,
  catedralController,
  cuartoController,
  labIRController,
  customIRController,
};
