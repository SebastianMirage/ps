import type { Request } from "express";

//Validaciones
const ALLOWED_WAV_MIME_TYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/vnd.wave",
]);

//Normalizar
function normalizeMimeType(value?: string | null) {
  const mimeType = value ?? "";
  const [baseMimeType = ""] = mimeType.split(";");
  return baseMimeType.trim().toLowerCase();
}

//Veficación
function isSupportedWavMimeType(value?: string | null) {
  return ALLOWED_WAV_MIME_TYPES.has(normalizeMimeType(value));
}

// Verificar firma
function hasWavHeader(buffer: Buffer) {
  return (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WAVE"
  );
}

function getWavValidationError(file: NonNullable<Request["file"]>) {
  if (!isSupportedWavMimeType(file.mimetype)) {
    return {
      error: "Formato incorrecto",
      received: file.mimetype,
      allowed: [...ALLOWED_WAV_MIME_TYPES],
    };
  }

  if (!hasWavHeader(file.buffer)) {
    return { error: "El archivo no es un WAV valido" };
  }

  return null;
}

export default getWavValidationError;