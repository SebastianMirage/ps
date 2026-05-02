%SIMULAR_ESPACIO  Convoluciona un audio con una respuesta impulsional (.wav).
%
%   Uso desde línea de comandos:
%       matlab -nodisplay -nosplash -r \
%         "simular_espacio('entrada.wav','ir.wav','salida.wav'); exit"
%
%   Argumentos (los 3 obligatorios, en orden):
%       1. audio_file  - Ruta al archivo .wav de la señal de entrada.
%       2. ir_file     - Ruta al archivo .wav de la respuesta impulsional.
%       3. output_file - Ruta al archivo .wav de salida.
%
%   Desde Node.js (child_process):
%       const cmd = `simular_espacio('${audio}','${ir}','${out}'); exit`;
%       spawn('matlab', ['-nodisplay','-nosplash','-r', cmd]);

function simular_espacio(audio_file, ir_file, output_file)

    % ── Validar argumentos ────────────────────────────────────────────────
    if nargin ~= 3
        error('Se requieren exactamente 3 argumentos: audio_file, ir_file, output_file.');
    end

    if ~isfile(audio_file)
        error('Archivo de audio no encontrado: %s', audio_file);
    end

    if ~isfile(ir_file)
        error('Archivo de IR no encontrado: %s', ir_file);
    end

    % ── Leer archivos de entrada ──────────────────────────────────────────
    fprintf('[simular_espacio] Leyendo audio:  %s\n', audio_file);
    [x, Fs_x] = audioread(audio_file);

    fprintf('[simular_espacio] Leyendo IR:     %s\n', ir_file);
    [h, Fs_h] = audioread(ir_file);

    % ── Convertir a mono ──────────────────────────────────────────────────
    if size(x, 2) > 1
        x = mean(x, 2);
    end
    if size(h, 2) > 1
        h = mean(h, 2);
    end

    % ── Igualar frecuencias de muestreo ───────────────────────────────────
    if Fs_x ~= Fs_h
        fprintf('[simular_espacio] Remuestreando IR de %d Hz a %d Hz.\n', Fs_h, Fs_x);
        h = resample(h, Fs_x, Fs_h);
    end
    Fs = Fs_x;

    % ── Convolución en dominio frecuencial ────────────────────────────────
    N   = length(x);
    M   = length(h);
    Nfft = 2^nextpow2(N + M - 1);

    y_full = real(ifft(fft(x, Nfft) .* fft(h, Nfft)));
    y = y_full(1:N);   % recortar al largo original del audio

    % ── Normalizar ────────────────────────────────────────────────────────
    peak = max(abs(y));
    if peak > 0
        y = y / peak * 0.95;
    end

    % ── Crear directorio de salida si no existe ───────────────────────────
    out_dir = fileparts(output_file);
    if ~isempty(out_dir) && ~isfolder(out_dir)
        mkdir(out_dir);
    end

    % ── Escribir salida ───────────────────────────────────────────────────
    audiowrite(output_file, y, Fs);
    fprintf('[simular_espacio] Salida guardada: %s\n', output_file);

end
