import type { Request, Response } from "express";
import { execFileSync } from "node:child_process";
import getWavValidationError from "../helpers/Validaciones.js";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

//Rutas y directorios
const uploadsDir = path.resolve(process.cwd(), "uploads");

const salaConciertoController = (req: Request, res: Response) => {
  const file = req.file;
  const matlabDir = path.resolve(
    process.cwd(),
    "src",
    "matlab",
    "sala-concierto",
  );
  const executablePath = path.join(matlabDir, "ir_sala_conciertos.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  if (!file) {
    return res.status(400).json({ error: "Sin archivo" });
  }

  const validationError = getWavValidationError(file);

  if (validationError) {
    return res.status(400).json(validationError);
  }

  //Escribe un archivo temporal en la dirección tempPath
  fs.writeFileSync(tempPath, file.buffer);

  //Procesa el audio
  try {
    if (!fs.existsSync(executablePath)) {
      throw new Error(`No se encontró el ejecutable: ${executablePath}`);
    }

    execFileSync(executablePath, [tempPath, outputPath], { cwd: matlabDir });

    fs.mkdirSync(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${Date.now()}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    fs.copyFileSync(outputPath, savedFilePath);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    return res.sendFile(savedFilePath);

    // return res.json({
    //   originalName: file.originalname,
    //   mimeName: file.mimetype,
    //   size: file.size,
    //   savedFileName,
    // });
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

const catedralController = (req: Request, res: Response) => {
  const file = req.file;
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "catedral");
  const executablePath = path.resolve(matlabDir, "ir_catedral.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  if (!file) {
    return res.status(400).json({ error: "Sin archivo" });
  }

  const validationError = getWavValidationError(file);

  if (validationError) {
    return res.status(400).json(validationError);
  }

  // Escribe el audio en el path temporal
  fs.writeFileSync(tempPath, file.buffer);

  try {
    //Comprobar exe
    if (!fs.existsSync(executablePath)) {
      throw new Error(`No se pudo encontrar el ejecutable: ${executablePath}`);
    }

    //Procesamiento
    execFileSync(executablePath, [tempPath, outputPath], { cwd: matlabDir });

    fs.mkdirSync(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${Date.now()}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    fs.copyFileSync(outputPath, savedFilePath);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    return res.sendFile(savedFilePath);
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

const cuartoController = (req: Request, res: Response) => {
  const file = req.file;
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "cuarto");
  const executablePath = path.resolve(matlabDir, "ir_cuarto_pequeno.exe");
  const outputPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  if (!file) {
    return res.status(400).json({ error: "Sin archivo" });
  }

  const validationError = getWavValidationError(file);

  if (validationError) {
    return res.status(400).json(validationError);
  }

  try {
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Ejecutable no encontrado ${executablePath}`);
    }

    fs.writeFileSync(tempPath, file.buffer);

    execFileSync(executablePath, [tempPath, outputPath], { cwd: matlabDir });

    fs.mkdirSync(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${Date.now()}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    fs.copyFileSync(outputPath, savedFilePath);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    return res.sendFile(savedFilePath);
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

const customIRController = (req: Request, res: Response) => {
  const file = req.file;
  const matlabDir = path.resolve(process.cwd(), "src", "matlab", "ir-custom");
  const executablePath = path.resolve(matlabDir, "ir_custom.exe");
  const irCustom = path.resolve(matlabDir, "ir_custom.wav");
  const outputPath = path.join(os.tmpdir(), `audio-out-${Date.now()}.wav`);
  const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);

  if (!file) {
    return res.status(400).json({ error: "Sin archivo" });
  }

  const validationError = getWavValidationError(file);

  if (validationError) {
    return res.status(400).json({ error: "Formato inválido" });
  }

  try {
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Ejecutable no encontrado ${executablePath}`);
    }

    //Copiar archivo
    fs.writeFileSync(tempPath, file.buffer);

    //Ejecutar
    execFileSync(executablePath, [tempPath, irCustom, outputPath]);

    fs.mkdirSync(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${Date.now()}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    fs.copyFileSync(outputPath, savedFilePath);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Disposition", 'inline; filename="procesado.wav"');
    return res.sendFile(savedFilePath);
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

export {
  salaConciertoController,
  catedralController,
  cuartoController,
  customIRController,
};
