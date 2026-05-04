import getWavValidationError from "../helpers/Validaciones.js";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

interface getAudioInterface {
  file: Express.Multer.File | undefined;
  tempPath: string;
  executablePath: string;
  outputPath: string;
  matlabDir: string;
  requestID: string;
  uploadsDir: string;
  ir: string;
}

const getAudio = ({
  file,
  tempPath,
  executablePath,
  outputPath,
  matlabDir,
  requestID,
  uploadsDir,
  ir
}: getAudioInterface) => {
  if (!file) {
    throw new Error("Sin archivo");
  }

  const validationError = getWavValidationError(file);
  if (validationError) {
    throw new Error(validationError.error);
  }

  //Procesa el audio
  try {
    //Escribe un archivo temporal en la dirección tempPath
    fs.writeFileSync(tempPath, file.buffer);

    if (!fs.existsSync(executablePath)) {
      throw new Error(`No se encontró el ejecutable: ${executablePath}`);
    }

    //Ejecución
    execFileSync(executablePath, [tempPath, ir, outputPath], { cwd: matlabDir });

    //Crear directorios
    fs.mkdirSync(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${requestID}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    //Copiar archivo en un directorio permanente
    fs.copyFileSync(outputPath, savedFilePath);

    return { savedFileName, savedFilePath };
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo procesar el audio");
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
};

export default getAudio;
