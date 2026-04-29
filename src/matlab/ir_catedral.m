function ir_catedral(input_file, output_file)
%IR_CATEDRAL  Simula la acústica de una catedral gótica.
%
%   ir_catedral(input_file, output_file)
%
%   Parámetros:
%       input_file  (char) - Ruta al archivo .wav de entrada.
%       output_file (char) - Ruta al archivo .wav de salida procesado.
%
%   Descripción del espacio modelado:
%       Catedral gótica de tamaño mediano.
%       Dimensiones aproximadas: 80 m (nave) × 28 m (ancho) × 30 m (altura).
%       Volumen ≈ 67 000 m³.
%       Superficies: piedra, bóvedas nervadas, vitrales, bancos de madera.
%       RT60 ≈ 5.5 s  (típico de catedrales europeas medievales).
%       Tipo de reverberación: reflexiones tempranas muy espaciadas,
%       cola extremadamente larga y densa, construcción de densidad lenta.
%
%   Características acústicas incluidas:
%       - Baja absorción de las paredes de piedra (α ≈ 0.01–0.03).
%       - Acumulación de energía en bajas frecuencias (efecto de sala grande).
%       - Onset suave: la densidad de reflexiones crece gradualmente.
%       - Decaimiento no perfectamente lineal (efectos de difracción en bóvedas).
%
%   Modelo de síntesis:
%       Modelo de Moorer extendido con reflexiones de orden 1–4 para
%       una sala de grandes dimensiones y cola estocástica de muy largo
%       decaimiento modulada en frecuencia.
%
%   Invocación desde Node.js (ejemplo):
%       matlab -nodisplay -nosplash -r \
%         "ir_catedral('entrada.wav','salida.wav'); exit"
%
%   Autor: Proyecto Simulación Acústica  |  Versión 1.0

    % ── Parámetros de la IR ──────────────────────────────────────────────
    Fs   = 44100;    % Frecuencia de muestreo [Hz]
    RT60 = 5.5;      % Tiempo de reverberación [s]

    % ── Síntesis de la respuesta impulsional ─────────────────────────────
    ir = sintetizar_ir(Fs, RT60);

    % ── Aplicar convolución ───────────────────────────────────────────────
    fprintf('[ir_catedral] Aplicando IR de catedral (puede tomar unos segundos)...\n');
    audio_convolve(input_file, output_file, ir, Fs);
    fprintf('[ir_catedral] Completado.\n');
end


% ═══════════════════════════════════════════════════════════════════════════
%  FUNCIONES LOCALES
% ═══════════════════════════════════════════════════════════════════════════

function ir = sintetizar_ir(Fs, RT60)
%SINTETIZAR_IR  Genera la respuesta impulsional de catedral.

    duracion = RT60 * 1.3;              % cola larga
    N  = round(duracion * Fs);
    t  = (0 : N-1)' / Fs;

    tau = RT60 / log(1000);

    % ── Cola difusa principal ─────────────────────────────────────────────
    rng(500);
    ruido = randn(N, 1);
    envolvente = exp(-t / tau);

    % En una catedral, las bajas frecuencias reverberan más.
    % Se usan dos ramas espectrales con diferentes RT60 efectivos.
    b_grave = fir1(128, 300  / (Fs/2), 'low');
    b_medio = fir1(128, 3000 / (Fs/2), 'low');

    cola_grave = filtfilt(b_grave, 1, ruido) .* exp(-t / (tau * 1.25));
    cola_medio = filtfilt(b_medio, 1, ruido) .* envolvente;
    cola_alta  = (ruido - filtfilt(b_medio, 1, ruido)) .* exp(-t / (tau * 0.7));

    cola = 0.5 * cola_grave + 0.35 * cola_medio + 0.15 * cola_alta;

    ir = cola * 0.12;   % energía reverberante alta pero controlada

    % ── Onset gradual ─────────────────────────────────────────────────────
    %   En catedrales, la densidad de reflexiones crece lentamente porque
    %   las paredes están muy alejadas. Se aplica un fade-in inicial.
    onset_len = round(0.08 * Fs);   % 80 ms de crecimiento gradual
    onset = linspace(0, 1, onset_len)'.^2;
    ir(1:onset_len) = ir(1:onset_len) .* onset;

    % ── Reflexiones tempranas (grandes distancias → delays largos) ────────
    %   Nave: 80 m; ancho: 28 m; altura bóveda: 30 m.
    %   Velocidad del sonido: 343 m/s.
    %   Reflexión de pared lateral (14 m): t = 2·14/343 ≈ 81.6 ms.
    %   Bóveda (30 m):                    t = 2·30/343 ≈ 174.9 ms.
    delays_ms = [ 34.0,  61.5,  81.6,  98.0, 120.0, 144.5, 174.9, 210.0, 250.0];
    gains     = [ 0.72,  0.65,  0.60,  0.52,  0.44,  0.36,  0.28,  0.18,  0.10];

    for k = 1:length(delays_ms)
        idx = round(delays_ms(k) * Fs / 1000) + 1;
        if idx <= N
            % Dispersión angular: cada reflexión llega con ligera variación
            spread = round((2*rand()-1) * 0.003 * Fs);
            idx2 = max(1, min(N, idx + spread));
            ir(idx2) = ir(idx2) + gains(k);
        end
    end

    % ── Impulso directo ────────────────────────────────────────────────────
    ir(1) = 1.0;

    % ── Fade-out ──────────────────────────────────────────────────────────
    fade_len = round(0.05 * Fs);
    fade = linspace(1, 0, fade_len)';
    ir(end - fade_len + 1 : end) = ir(end - fade_len + 1 : end) .* fade;

    % ── Normalización ─────────────────────────────────────────────────────
    ir = ir / max(abs(ir));
end
