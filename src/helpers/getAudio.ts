import getWavValidationError from "../helpers/Validaciones.js";
import fs from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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

const getAudio = async ({
  file,
  tempPath,
  executablePath,
  outputPath,
  matlabDir,
  requestID,
  uploadsDir,
  ir,
}: getAudioInterface) => {
  if (!file) {
    throw new Error("Sin archivo");
  }

  //Validaciones
  const validationError = getWavValidationError(file);
  if (validationError) {
    throw new Error(validationError.error);
  }

  //Procesa el audio
  try {
    //Escribe un archivo temporal en la dirección tempPath
    await fs.writeFile(tempPath, file.buffer);

    try {
      //Comprueba el path del ejecutable
      await fs.access(executablePath, constants.F_OK);
    } catch (error) {
      throw new Error(`No se encontró el ejecutable: ${executablePath}`);
    }

    //Ejecución
    await execFileAsync(executablePath, [tempPath, ir, outputPath], {
      cwd: matlabDir,
    });

    //Crear directorios
    await fs.mkdir(uploadsDir, { recursive: true });
    const savedFileName = `${path.parse(file.originalname).name}-${requestID}.wav`;
    const savedFilePath = path.join(uploadsDir, savedFileName);

    //Copiar archivo en un directorio permanente
    await fs.copyFile(outputPath, savedFilePath);

    return { savedFileName, savedFilePath };
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo procesar el audio");
  } finally {
    await fs.unlink(tempPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
  }
};

export default getAudio;
