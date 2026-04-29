function ir_sala_conciertos(input_file, output_file)
%IR_SALA_CONCIERTOS  Simula la acústica de una sala de conciertos.
%
%   ir_sala_conciertos(input_file, output_file)
%
%   Parámetros:
%       input_file  (char) - Ruta al archivo .wav de entrada.
%       output_file (char) - Ruta al archivo .wav de salida procesado.
%
%   Descripción del espacio modelado:
%       Sala de conciertos de tamaño mediano (~1200 asientos).
%       Dimensiones aproximadas: 35 m × 22 m × 18 m.
%       Superficies: madera, paneles acústicos, butacas tapizadas.
%       RT60 ≈ 2.0 s  (medido a 1 kHz).
%       Tipo de reverberación: reflexiones tempranas densas +
%       cola difusa de larga duración.
%
%   Modelo de síntesis:
%       Se emplea el modelo de Schroeder extendido:
%         1. Impulso directo (tiempo 0, ganancia = 1).
%         2. Reflexiones tempranas (0–80 ms) con patrones de delay
%            derivados del modelo de fuente imagen para un paralelepípedo.
%         3. Cola difusa generada con ruido gaussiano modulado por
%            una envolvente exponencial que satisface la condición de RT60.
%
%   Invocación desde Node.js (ejemplo):
%       matlab -nodisplay -nosplash -r \
%         "ir_sala_conciertos('entrada.wav','salida.wav'); exit"
%
%   Autor: Proyecto Simulación Acústica  |  Versión 1.0

    % ── Parámetros de la IR ──────────────────────────────────────────────
    Fs   = 44100;    % Frecuencia de muestreo [Hz]
    RT60 = 2.0;      % Tiempo de reverberación [s]

    % ── Síntesis de la respuesta impulsional ─────────────────────────────
    ir = sintetizar_ir(Fs, RT60);

    % ── Aplicar convolución ───────────────────────────────────────────────
    fprintf('[ir_sala_conciertos] Aplicando IR de sala de conciertos...\n');
    audio_convolve(input_file, output_file, ir, Fs);
    fprintf('[ir_sala_conciertos] Completado.\n');
end


% ═══════════════════════════════════════════════════════════════════════════
%  FUNCIONES LOCALES
% ═══════════════════════════════════════════════════════════════════════════

function ir = sintetizar_ir(Fs, RT60)
%SINTETIZAR_IR  Genera la respuesta impulsional de sala de conciertos.

    duracion = RT60 * 1.5;              % longitud total de la IR [s]
    N  = round(duracion * Fs);          % número de muestras
    t  = (0 : N-1)' / Fs;              % vector de tiempo

    % Coeficiente de decaimiento (−60 dB en RT60 segundos)
    tau = RT60 / log(1000);

    % ── Cola difusa ───────────────────────────────────────────────────────
    rng(100);   % semilla fija → reproducibilidad
    ruido     = randn(N, 1);
    envolvente = exp(-t / tau);

    % Filtrado paso-bajo suave para textura más natural
    b_lpf = fir1(64, 6000 / (Fs/2));
    cola  = filtfilt(b_lpf, 1, ruido .* envolvente);

    ir = cola * 0.25;

    % ── Reflexiones tempranas (modelo de fuente imagen, sala rectangular) ─
    %   Delays [ms]  y ganancias derivados de dimensiones 35×22×18 m.
    delays_ms = [  5.1,  9.7, 14.2, 21.0, 26.8, 33.5, 41.0, 55.0, 68.0, 80.0];
    gains     = [0.82, 0.75, 0.70, 0.62, 0.54, 0.46, 0.38, 0.28, 0.20, 0.14];

    for k = 1:length(delays_ms)
        idx = round(delays_ms(k) * Fs / 1000) + 1;
        if idx <= N
            % Pequeña variación aleatoria de amplitud para mayor realismo
            jitter = 1 + 0.05 * (2*rand()-1);
            ir(idx) = ir(idx) + gains(k) * jitter;
        end
    end

    % ── Impulso directo ────────────────────────────────────────────────────
    ir(1) = 1.0;

    % ── Normalización ─────────────────────────────────────────────────────
    ir = ir / max(abs(ir));
end
