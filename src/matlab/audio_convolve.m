function audio_convolve(input_file, output_file, ir, Fs_ir)
%AUDIO_CONVOLVE  Convoluciona un archivo de audio con una respuesta impulsional.
%
%   audio_convolve(input_file, output_file, ir, Fs_ir)
%
%   Parámetros de entrada:
%       input_file  (char)   - Ruta completa al archivo .wav de entrada.
%       output_file (char)   - Ruta completa al archivo .wav de salida.
%       ir          (vector) - Respuesta impulsional en el dominio del tiempo.
%       Fs_ir       (double) - Frecuencia de muestreo de la IR [Hz].
%
%   Descripción:
%       Lee el audio de entrada, lo convierte a mono si es necesario,
%       lo remuestrea para coincidir con la tasa de la IR, aplica la
%       convolución lineal en el dominio frecuencial (overlap-add via FFT)
%       y guarda el resultado normalizado.
%
%   Notas:
%       - La señal de salida se normaliza a ±0.95 para evitar clipping.
%       - Si la tasa de muestreo difiere, se aplica resample() automáticamente.
%       - El directorio de salida se crea si no existe.
%
%   Ejemplo:
%       ir = randn(44100,1) .* exp(-(0:44099)'/44100);
%       audio_convolve('entrada.wav', 'salida.wav', ir, 44100);
%
%   Autor: Generado automáticamente para el proyecto de simulación acústica.
%   Versión: 1.0  |  2024

    % ── Validación de argumentos ─────────────────────────────────────────
    if nargin ~= 4
        error('audio_convolve: Se requieren exactamente 4 argumentos.');
    end
    if ~ischar(input_file) && ~isstring(input_file)
        error('audio_convolve: input_file debe ser una cadena de texto.');
    end
    if ~isfile(input_file)
        error('audio_convolve: No se encontró el archivo de entrada: %s', input_file);
    end

    % ── Lectura del audio de entrada ─────────────────────────────────────
    fprintf('[audio_convolve] Leyendo: %s\n', input_file);
    [x, Fs_in] = audioread(input_file);

    % ── Conversión a mono ────────────────────────────────────────────────
    if size(x, 2) > 1
        fprintf('[audio_convolve] Audio multicanal detectado (%d ch) → promediando a mono.\n', ...
                size(x, 2));
        x = mean(x, 2);
    end

    % ── Remuestreo si las tasas difieren ─────────────────────────────────
    if Fs_in ~= Fs_ir
        fprintf('[audio_convolve] Remuestreando de %d Hz a %d Hz.\n', Fs_in, Fs_ir);
        x = resample(x, Fs_ir, Fs_in);
        Fs_out = Fs_ir;
    else
        Fs_out = Fs_in;
    end

    n_original = length(x);

    % ── Convolución en el dominio de la frecuencia ────────────────────────
    % Se usa FFT de longitud N = next power of 2 para eficiencia.
    N_fft = 2^nextpow2(length(x) + length(ir) - 1);
    X = fft(x, N_fft);
    IR = fft(ir(:), N_fft);
    y_full = real(ifft(X .* IR));

    % ── Recorte al largo original ─────────────────────────────────────────
    y = y_full(1:n_original);

    % ── Normalización ─────────────────────────────────────────────────────
    peak = max(abs(y));
    if peak > 0
        y = y / peak * 0.95;
    end

    % ── Creación del directorio de salida (si no existe) ──────────────────
    out_dir = fileparts(output_file);
    if ~isempty(out_dir) && ~isfolder(out_dir)
        mkdir(out_dir);
    end

    % ── Escritura del archivo de salida ───────────────────────────────────
    audiowrite(output_file, y, Fs_out);
    fprintf('[audio_convolve] Guardado: %s  (Fs=%d Hz, %d muestras)\n', ...
            output_file, Fs_out, length(y));
end
