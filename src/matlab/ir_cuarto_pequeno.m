function ir_cuarto_pequeno(input_file, output_file)
%IR_CUARTO_PEQUENO  Simula la acústica de un cuarto pequeño doméstico.
%
%   ir_cuarto_pequeno(input_file, output_file)
%
%   Parámetros:
%       input_file  (char) - Ruta al archivo .wav de entrada.
%       output_file (char) - Ruta al archivo .wav de salida procesado.
%
%   Descripción del espacio modelado:
%       Habitación doméstica pequeña (~15 m²).
%       Dimensiones aproximadas: 4.0 m × 3.5 m × 2.6 m.
%       Superficies: paredes de yeso, piso de madera, alfombra,
%       muebles, cortinas.
%       RT60 ≈ 0.30 s  (absorción moderada por mobiliario).
%       Tipo de reverberación: pocas reflexiones tempranas prominentes,
%       cola corta y amortiguada.
%
%   Modelo de síntesis:
%       Se aplica el modelo de imagen-fuente de primer orden para un
%       paralelepípedo rígido, con coeficientes de absorción que
%       representan materiales domésticos típicos (α ≈ 0.20–0.40).
%       La cola difusa es breve y espectralmente atenuada en altas
%       frecuencias (efecto del mobiliario y la alfombra).
%
%   Invocación desde Node.js (ejemplo):
%       matlab -nodisplay -nosplash -r \
%         "ir_cuarto_pequeno('entrada.wav','salida.wav'); exit"
%
%   Autor: Proyecto Simulación Acústica  |  Versión 1.0

    % ── Parámetros de la IR ──────────────────────────────────────────────
    Fs   = 44100;    % Frecuencia de muestreo [Hz]
    RT60 = 0.30;     % Tiempo de reverberación [s]

    % ── Síntesis de la respuesta impulsional ─────────────────────────────
    ir = sintetizar_ir(Fs, RT60);

    % ── Aplicar convolución ───────────────────────────────────────────────
    fprintf('[ir_cuarto_pequeno] Aplicando IR de cuarto pequeño...\n');
    audio_convolve(input_file, output_file, ir, Fs);
    fprintf('[ir_cuarto_pequeno] Completado.\n');
end


% ═══════════════════════════════════════════════════════════════════════════
%  FUNCIONES LOCALES
% ═══════════════════════════════════════════════════════════════════════════

function ir = sintetizar_ir(Fs, RT60)
%SINTETIZAR_IR  Genera la respuesta impulsional de cuarto pequeño.

    duracion = RT60 * 2.5;               % margen extra para decaimiento
    N  = round(duracion * Fs);
    t  = (0 : N-1)' / Fs;

    % Coeficiente de decaimiento
    tau = RT60 / log(1000);

    % ── Cola difusa ───────────────────────────────────────────────────────
    rng(200);
    ruido = randn(N, 1);
    envolvente = exp(-t / tau);

    % Filtro paso-bajo más agresivo: la alfombra y los muebles absorben
    % las altas frecuencias rápidamente.
    b_lpf = fir1(64, 3500 / (Fs/2));
    cola  = filtfilt(b_lpf, 1, ruido .* envolvente);

    ir = cola * 0.15;   % amplitud baja: poca energía reverberante

    % ── Reflexiones tempranas (cuarto pequeño, paredes cercanas) ──────────
    %   Tiempos de viaje cortos; reflexiones de 1er y 2do orden.
    %   Dimensiones: 4.0 m × 3.5 m × 2.6 m  →  c = 343 m/s.
    delays_ms = [ 3.5,  6.2,  7.6, 10.4, 13.0, 17.5, 22.0];
    gains     = [0.60, 0.55, 0.50, 0.40, 0.32, 0.22, 0.12];

    for k = 1:length(delays_ms)
        idx = round(delays_ms(k) * Fs / 1000) + 1;
        if idx <= N
            ir(idx) = ir(idx) + gains(k);
        end
    end

    % ── Impulso directo ────────────────────────────────────────────────────
    ir(1) = 1.0;

    % ── Apagado suave al final (fade-out) ─────────────────────────────────
    fade_len = round(0.01 * Fs);   % 10 ms de fade-out
    fade = linspace(1, 0, fade_len)';
    ir(end - fade_len + 1 : end) = ir(end - fade_len + 1 : end) .* fade;

    % ── Normalización ─────────────────────────────────────────────────────
    ir = ir / max(abs(ir));
end
