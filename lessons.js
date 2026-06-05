// Lecciones generadas automáticamente — no editar a mano.
// Para regenerar: python generate_lessons.py
// Física verificada: K=8.9876e9, EPS0=8.854e-12
window.GAUSS_LESSONS = [
  {
    "id": "G01",
    "title": "Carga puntual: la ley de Gauss en su forma más simple",
    "topic": "simetria_esferica",
    "difficulty": 1,
    "scenario": "point_charge",
    "params": { "Q": 2.0, "rg": 2.5 },
    "objective": "Demostrar que el flujo eléctrico a través de cualquier esfera centrada en una carga puntual es independiente del radio y vale Q/ε₀.",
    "theory": "Para una carga puntual Q, la Ley de Gauss establece ∮E·dA = Q_enc/ε₀. Eligiendo una superficie esférica de radio r, la simetría exige que E sea radial y constante sobre la superficie: E·4πr² = Q/ε₀, lo que da E = kQ/r² con k = 1/(4πε₀). El flujo total Φ = Q/ε₀ no depende de r: todas las líneas de campo que salen de Q atraviesan cualquier esfera, sin importar su tamaño. La densidad de líneas de campo ∝ E ∝ 1/r² refleja este decaimiento.",
    "hints": [],
    "questions": [
      "Con Q = 2 nC, calcula E en r = 1 m, 2 m y 4 m. Verifica que E(2r) = E(r)/4.",
      "¿Cuánto vale Φ si Q se duplica? ¿Y si r se duplica manteniendo Q fija? Justifica usando Φ = Q/ε₀.",
      "Si desplazas el origen de la carga al punto (1, 0), ¿sigue siendo Φ el mismo para una esfera centrada en el origen? Argumenta usando la Ley de Gauss (teorema de Gauss).",
      "Deduce la Ley de Coulomb a partir de la Ley de Gauss para una sola carga puntual, indicando explícitamente cada paso y qué argumento de simetría se usa."
    ],
    "challenge": {
      "description": "El sistema de referencia tiene un flujo objetivo Φ = 565 N·m²/C. Ajusta Q hasta reproducir exactamente ese flujo. Antes de mover el slider, calcula analíticamente el valor de Q requerido usando Φ = Q/ε₀.",
      "target_params": { "Q": 5.0, "rg": 2.5 },
      "target_rg": 2.5,
      "target_readout": { "Qenc_nC": 5.0, "flux_Nm2C": 565.0, "E_NC": 7.19 },
      "tolerance": 0.07
    }
  },
  {
    "id": "G02",
    "title": "Esfera conductora: campo nulo en el interior",
    "topic": "simetria_esferica",
    "difficulty": 2,
    "scenario": "conducting_sphere",
    "params": { "Q": 4.0, "R": 1.0, "rg": 0.7 },
    "objective": "Comprobar que el campo eléctrico es rigurosamente nulo en el interior de un conductor en equilibrio electrostático, y que toda la carga libre reside en la superficie.",
    "theory": "En equilibrio electrostático, E = 0 en el interior de cualquier conductor. Aplicando Gauss a una superficie dentro del conductor (r < R): ∮E·dA = 0 implica Q_enc = 0. Por lo tanto, toda la carga Q reside en la superficie con densidad σ = Q/(4πR²). Para r > R, la situación es equivalente a una carga puntual: E = kQ/r². La discontinuidad de E en r = R vale σ/ε₀ = Q/(4πR²ε₀).",
    "hints": [],
    "questions": [
      "Para Q = 4 nC y R = 1 m, calcula σ en la superficie. Luego verifica que la discontinuidad ΔE = E(R⁺) − E(R⁻) = σ/ε₀.",
      "Calcula numéricamente E en r = 2 m y compara con la predicción de Gauss. ¿Coinciden?",
      "Si el conductor tiene un hueco interior vacío, ¿puede haber carga en la superficie interior? Argumenta con Gauss. ¿Qué cambia si se coloca una carga puntual +q dentro del hueco?",
      "Demuestra que dos conductores esféricos concéntricos de radios R₁ < R₂ con cargas Q₁ y Q₂ producen E = k(Q₁+Q₂)/r² para r > R₂."
    ],
    "challenge": {
      "description": "Desplaza la superficie gaussiana hasta encontrar el radio donde E = 9.0 N/C. Calcula ese radio analíticamente antes de arrastrar el círculo. La esfera tiene Q = 4 nC y R = 1 m.",
      "target_params": { "Q": 4.0, "R": 1.0, "rg": 2.0 },
      "target_rg": 2.0,
      "target_readout": { "Qenc_nC": 4.0, "flux_Nm2C": 452.0, "E_NC": 8.99 },
      "tolerance": 0.07
    }
  },
  {
    "id": "G03",
    "title": "Esfera aislante de densidad uniforme: campo lineal interior",
    "topic": "simetria_esferica",
    "difficulty": 2,
    "scenario": "insulating_sphere",
    "params": { "Q": 4.0, "R": 2.0, "rg": 2.5 },
    "objective": "Demostrar que el campo eléctrico crece linealmente con r dentro de una distribución esférica uniforme de carga y decae como 1/r² fuera.",
    "theory": "Una esfera aislante de radio R con densidad volumétrica ρ = 3Q/(4πR³) uniforme. Para r ≤ R, la Ley de Gauss con una esfera de radio r encierra Q_enc = Q(r/R)³, dando E = kQr/R³ (∝ r). Para r > R, Q_enc = Q y E = kQ/r² (∝ 1/r²). El máximo de E ocurre exactamente en r = R. La gráfica E vs r muestra un vértice en r = R, característica única de esta distribución.",
    "hints": [],
    "questions": [
      "Para Q = 4 nC, R = 2 m, calcula E en r = 1 m (interior) y en r = 3 m (exterior). Comprueba continuidad en r = R.",
      "¿En qué radio interior r₀ < R el campo vale exactamente la mitad de E(R)? Despeja r₀ analíticamente.",
      "Calcula Q_enc cuando rg = 1 m. Usa Q_enc = Q(r/R)³ y verifica con el panel del simulador.",
      "Demuestra que la condición E(r=R⁻) = E(r=R⁺) implica continuidad del campo en r = R para una distribución volumétrica (a diferencia de una distribución superficial)."
    ],
    "challenge": {
      "description": "Mueve la superficie gaussiana al interior de la esfera hasta que Q_enc = 0.5 nC. Calcula ese radio antes de arrastrarlo. La esfera tiene Q = 4 nC y R = 2 m.",
      "target_params": { "Q": 4.0, "R": 2.0, "rg": 1.0 },
      "target_rg": 1.0,
      "target_readout": { "Qenc_nC": 0.5, "flux_Nm2C": 56.5, "E_NC": 4.49 },
      "tolerance": 0.08
    }
  },
  {
    "id": "G04",
    "title": "Concha esférica: blindaje gaussiano",
    "topic": "simetria_esferica",
    "difficulty": 2,
    "scenario": "spherical_shell",
    "params": { "Q": 5.0, "R": 1.5, "rg": 1.0 },
    "objective": "Verificar que una cáscara esférica cargada produce campo nulo en su interior y comportamiento de carga puntual en el exterior, con salto abrupto de Q_enc en r = R.",
    "theory": "Toda la carga Q de la concha reside en r = R (capa infinitesimalmente delgada). Para r < R: ninguna carga está encerrada por la superficie gaussiana, luego Φ = 0 y E = 0. Para r > R: Q_enc = Q y E = kQ/r², idéntico al de una carga puntual. La discontinuidad en Q_enc en r = R refleja la densidad superficial σ = Q/(4πR²). Este es el resultado que Gauss demostró geométricamente antes del formalismo vectorial.",
    "hints": [],
    "questions": [
      "¿Cuál es la densidad superficial σ de la concha con Q = 5 nC y R = 1.5 m? ¿Cuánto vale E justo afuera de la superficie (r → R⁺)?",
      "Coloca rg = 1.0 m (interior). Lee Q_enc y Φ. Luego mueve a rg = 2.0 m. ¿Cómo cambian? Interpreta usando Gauss.",
      "Compara E(r = 2 m) para la concha con Q = 5 nC y para una esfera aislante uniforme con la misma Q y R. ¿Son iguales? ¿Por qué?",
      "Una concha esférica de radio R₁ = 1 m cargada con Q₁ = 3 nC está dentro de otra de radio R₂ = 2 m con Q₂ = −3 nC. Calcula E en r = 0.5 m, r = 1.5 m y r = 3 m."
    ],
    "challenge": {
      "description": "Encuentra el radio gaussiano donde E = 5.0 N/C con Q = 5 nC y R = 1.5 m. La concha ya está configurada. Calcula r analíticamente y luego verifica arrastrando.",
      "target_params": { "Q": 5.0, "R": 1.5, "rg": 3.0 },
      "target_rg": 3.0,
      "target_readout": { "Qenc_nC": 5.0, "flux_Nm2C": 565.0, "E_NC": 4.99 },
      "tolerance": 0.07
    }
  },
  {
    "id": "G05",
    "title": "Línea de carga infinita: simetría cilíndrica y decaimiento 1/r",
    "topic": "simetria_cilindrica",
    "difficulty": 2,
    "scenario": "infinite_line",
    "params": { "lam": 2.0, "rg": 1.0 },
    "objective": "Aplicar la Ley de Gauss con simetría cilíndrica para deducir E = λ/(2πε₀r) y comparar con el decaimiento esférico 1/r².",
    "theory": "Para una línea de carga infinita con densidad lineal λ, eligiendo un cilindro gaussiano de radio r y largo L: las dos bases no contribuyen (E ⊥ normal), y el campo es radial y constante en la superficie lateral. Gauss da E·2πrL = λL/ε₀, de donde E = λ/(2πε₀r). El decaimiento es más lento (1/r) que para la carga puntual (1/r²), porque el flujo está distribuido en el área lateral 2πrL que crece linealmente con r. Por unidad de longitud, Φ/L = λ/ε₀.",
    "hints": [],
    "questions": [
      "Con λ = 2 nC/m, calcula E en r = 1 m y en r = 2 m. Verifica que E(2r) = E(r)/2 (no E(r)/4 como en el caso esférico).",
      "¿A qué radio r₀ el campo de esta línea de carga iguala al campo de una carga puntual Q = 10 nC ubicada en el mismo origen? Plantea la ecuación y resuélvela.",
      "Estima el flujo Φ/L que atraviesa un cilindro gaussiano de radio r = 3 m. ¿Depende de r? Justifica.",
      "La línea de carga tiene λ = 2 nC/m. ¿Cuánto vale el campo a r = 0.5 m? ¿Y a r = 0.1 m? ¿Qué implica esto para la singularidad en r = 0?"
    ],
    "challenge": {
      "description": "Con λ = 2 nC/m, encuentra el radio donde E se reduce exactamente a la mitad del valor en r = 1 m. Calcula ese radio analíticamente usando E = λ/(2πε₀r) antes de mover el slider.",
      "target_params": { "lam": 2.0, "rg": 2.0 },
      "target_rg": 2.0,
      "target_readout": { "Qenc_nC": 2.0, "flux_Nm2C": 226.0, "E_NC": 17.97 },
      "tolerance": 0.07
    }
  },
  {
    "id": "G06",
    "title": "Plano infinito: campo uniforme e independencia de la distancia",
    "topic": "simetria_planar",
    "difficulty": 2,
    "scenario": "infinite_plane",
    "params": { "sig": 2.0, "rg": 1.5 },
    "objective": "Demostrar con la Ley de Gauss (superficie pillbox) que el campo de un plano infinito es uniforme y perpendicular al plano, independiente de la distancia.",
    "theory": "Para un plano de densidad superficial σ, el pillbox gaussiano con caras de área A paralelas al plano da: 2AE = σA/ε₀ → E = σ/(2ε₀). El factor 2 surge porque el flujo sale por ambas caras. El campo es independiente de la distancia, una consecuencia directa de la geometría plana y la infinitud del plano. El plano actúa como fuente de flujo constante por unidad de área: Φ/A = σ/ε₀. En la práctica, esta aproximación es válida para r ≪ dimensiones del plano.",
    "hints": [],
    "questions": [
      "Con σ = 2 nC/m², calcula E numéricamente usando la fórmula. Verifica con el readout del simulador.",
      "¿Por qué el campo NO depende de la distancia al plano? Mueve el pillbox a distintas alturas h y observa que E es constante. Explica geométricamente.",
      "Un condensador ideal de placas paralelas tiene σ = 3 nC/m². ¿Cuánto vale E entre las placas? ¿Y fuera? Usa superposición de dos planos.",
      "Estima σ para producir E = 1 MV/m (el umbral de ruptura del aire). ¿Cuánta carga por cm² requiere ese campo?"
    ],
    "challenge": {
      "description": "El sistema objetivo tiene E = 56.5 N/C. Calcula analíticamente la densidad superficial σ necesaria usando E = σ/(2ε₀) y ajústala con el slider. La altura del pillbox no cambia el resultado.",
      "target_params": { "sig": 1.0, "rg": 1.5 },
      "target_rg": 1.5,
      "target_readout": { "Qenc_nC": 1.0, "flux_Nm2C": 113.0, "E_NC": 56.5 },
      "tolerance": 0.07
    }
  },
  {
    "id": "G07",
    "title": "Condensador de placas paralelas: cancelación exterior y suma interior",
    "topic": "simetria_planar",
    "difficulty": 3,
    "scenario": "capacitor",
    "params": { "sig": 3.0, "d": 3.0, "rg": 0.5 },
    "objective": "Usar la Ley de Gauss para demostrar que el campo entre las placas de un condensador es σ/ε₀ y es exactamente cero en el exterior por cancelación de los dos planos.",
    "theory": "El condensador está formado por dos planos paralelos con ±σ. El campo de cada plano es E_i = σ/(2ε₀) perpendicular al plano. Entre las placas: ambos campos apuntan en la misma dirección → E_total = σ/ε₀. Fuera: los campos se cancelan → E = 0. Aplicando un pillbox que cruce la placa positiva: Q_enc = +σ·A → E·A = σA/ε₀ → E = σ/ε₀ (sólo hay flujo por la cara interior). Si el pillbox envuelve ambas placas: Q_enc = 0 → E = 0.",
    "hints": [
      "Aplica el principio de superposición: cada placa produce E = σ/(2ε₀). Suma vectorialmente para cada región del espacio."
    ],
    "questions": [
      "Con σ = 3 nC/m², calcula E entre las placas y verifica con el readout. ¿Por qué es el doble que el de un solo plano?",
      "Mueve el pillbox con rg > d/2 = 1.5 m. ¿Qué sucede con Q_enc y E? Interpreta con Gauss.",
      "¿Qué relación hay entre la diferencia de potencial V = E·d y la capacitancia C = ε₀A/d? Deriva C a partir de Gauss y la definición V = Q/C.",
      "Si las placas no son infinitas sino cuadradas de lado L = 10 cm y d = 1 mm, estima el error en el campo en el borde comparado con el campo central usando la aproximación de placa infinita."
    ],
    "challenge": {
      "description": "Configura el pillbox gaussiano para que envuelva ambas placas (h > d/2). El objetivo es Q_enc = 0 y E = 0, demostrando que la carga total del condensador es neutra. Luego vuelve al interior (h < d/2) con σ = 3 nC/m² y verifica E = 339 N/C.",
      "target_params": { "sig": 3.0, "d": 3.0, "rg": 2.0 },
      "target_rg": 2.0,
      "target_readout": { "Qenc_nC": 0.0, "flux_Nm2C": 0.0, "E_NC": 0.0 },
      "tolerance": 0.09
    }
  },
  {
    "id": "G08",
    "title": "Ley de Gauss magnética: ∮B·dA = 0 y la ausencia de monopolos",
    "topic": "gauss_magnetico",
    "difficulty": 3,
    "scenario": "magnetic",
    "params": { "rg": 2.0 },
    "objective": "Verificar experimentalmente que el flujo magnético a través de cualquier superficie cerrada es identicamente nulo, y relacionar esto con la no-existencia de monopolos magnéticos.",
    "theory": "La cuarta ley de Maxwell, ∮B·dA = 0, es el análogo magnético de la Ley de Gauss pero con 'carga magnética' siempre nula. Las líneas de campo B son siempre cerradas: no tienen fuentes ni sumideros. Esto contrasta con ∮E·dA = Q_enc/ε₀ donde Q_enc puede ser no nulo. El dipolo magnético visualizado tiene el mismo flujo de entrada que de salida a través de cualquier superficie cerrada: las líneas que salen del polo norte regresan por el polo sur sin excepción. La búsqueda experimental de monopolos magnéticos (partículas con Q_mag ≠ 0) no ha tenido éxito hasta la fecha.",
    "hints": [
      "Observa en el panel: Φ_B = 0 para cualquier radio de la superficie gaussiana. Contrasta con el escenario point_charge donde Φ_E = Q/ε₀ ≠ 0."
    ],
    "questions": [
      "Arrastra el radio gaussiano de 0.5 m a 4.5 m. ¿Varía el flujo magnético? ¿Qué implica esto sobre la naturaleza de las fuentes del campo B?",
      "Si existiera un monopolo magnético con 'carga' g_m, ¿qué forma tendría la Ley de Gauss magnética? Escribe la ecuación modificada y discute cómo cambiaría la topología de las líneas de B.",
      "El dipolo magnético tiene momento m. ¿Cómo escala B con r sobre el eje del dipolo (θ=0)? ¿Y en el ecuador (θ=π/2)? Compara con el dipolo eléctrico.",
      "Demuestra que ∮B·dA = 0 implica que las líneas de campo B nunca pueden comenzar ni terminar en el interior de una superficie cerrada. ¿Qué ocurriría con la conservación de la carga magnética si ∮B·dA ≠ 0?"
    ],
    "challenge": {
      "description": "Verifica que ∮B·dA = 0 para tres radios gaussianos muy diferentes: r = 0.8 m (dentro del dipolo), r = 2.5 m (a media distancia) y r = 4.5 m (lejos). Registra Φ en cada posición y concluye. Finalmente, fija r = 3.5 m para la verificación final.",
      "target_params": { "rg": 3.5 },
      "target_rg": 3.5,
      "target_readout": { "Qenc_nC": 0.0, "flux_Nm2C": 0.0, "E_NC": 0.0 },
      "tolerance": 0.99
    }
  },
  {
    "id": "G09",
    "title": "Cascarón conductor de ancho finito: cuatro regiones de campo",
    "topic": "simetria_esferica",
    "difficulty": 4,
    "scenario": "thick_shell",
    "params": { "Q": 3.0, "Q2": -1.0, "R": 0.8, "b": 1.5, "c": 2.5, "rg": 1.1 },
    "objective": "Aplicar la Ley de Gauss a un sistema de dos objetos concéntricos con cuatro regiones distintas y verificar el blindaje electrostático en el interior del conductor.",
    "theory": "El sistema consiste en una esfera aislante (radio a = R, carga Q₁ uniforme) dentro de un cascarón conductor esférico (radios b–c, carga total Q₂). Aplicando ∮E·dA = Q_enc/ε₀ a cada región: (1) r < a: E = kQ₁r/a³ ∝ r; (2) a < r < b: E = kQ₁/r² (solo la esfera interior contribuye); (3) b < r < c: E = 0, pues Q_enc = Q₁ + Q₁_inducida_interior = Q₁ − Q₁ = 0 (la cara interna del conductor adquiere −Q₁ por inducción); (4) r > c: E = k(Q₁+Q₂)/r², donde Q₁+Q₂ es la carga total del sistema. La gráfica E(r) exhibe una discontinuidad en r = a, un tramo nulo en b–c y un segundo pico en r = c si Q₁+Q₂ ≠ Q₁.",
    "hints": [],
    "questions": [
      "Con Q₁ = 3 nC, a = 0.8 m, calcula E en r = 0.5 m (interior esfera), r = 1.1 m (vacío), r = 1.9 m (conductor) y r = 3.5 m (exterior). Verifica cada valor con el visualizador.",
      "Demuestra que la cara interna del cascarón adquiere carga −Q₁ y la cara externa tiene carga Q₁+Q₂, usando el argumento gaussiano sobre el campo nulo dentro del conductor.",
      "¿Cuánto vale el flujo total Φ = Q_enc/ε₀ para una superficie de Gauss en cada una de las cuatro regiones? ¿Cuál es el único dominio donde Q_enc cambia al variar rg?",
      "Si Q₂ = −Q₁ (cascarón que neutraliza la esfera), ¿cómo queda E(r) para r > c? Calcula numéricamente con Q₁ = 3 nC, Q₂ = −3 nC y verifica cambiando Q2 en el simulador."
    ],
    "challenge": {
      "description": "Con la configuración actual (Q₁ = 3 nC, Q₂ = −1 nC), calcula analíticamente el campo eléctrico que se mediría en el exterior del sistema, a r = 3.5 m. Luego arrastra la superficie gaussiana hasta esa posición y confirma que tu cálculo coincide con el visualizador. El objetivo es verificar que E exterior depende únicamente de la carga total Q₁+Q₂.",
      "target_params": { "Q": 3.0, "Q2": -1.0, "R": 0.8, "b": 1.5, "c": 2.5, "rg": 3.5 },
      "target_rg": 3.5,
      "target_readout": { "Qenc_nC": 2.0, "flux_Nm2C": 225.9, "E_NC": 1.47 },
      "tolerance": 0.08
    }
  },
  {
    "id": "G10",
    "title": "Cilindro sólido aislante: campo lineal en el interior (E ∝ r)",
    "topic": "simetria_cilindrica",
    "difficulty": 3,
    "scenario": "insulating_cylinder",
    "params": { "lam": 2.0, "R": 1.5, "rg": 0.8 },
    "objective": "Derivar mediante la Ley de Gauss el campo eléctrico dentro y fuera de un cilindro sólido cargado uniformemente, y verificar el contraste entre el crecimiento lineal interior y la caída 1/r exterior.",
    "theory": "Un cilindro infinito de radio R con densidad volumétrica uniforme ρ = λ/(πR²) (siendo λ la carga por unidad de longitud) tiene simetría cilíndrica. La superficie de Gauss natural es un cilindro coaxial de radio r y longitud L. Para r ≤ R: ∮E·dA = E·2πrL = Q_enc/ε₀ = ρπr²L/ε₀ = λ(r/R)²L/ε₀, de donde E = λr/(2πε₀R²) ∝ r — el campo crece linealmente como en el interior de la esfera aislante pero con simetría cilíndrica. Para r > R: E·2πrL = λL/ε₀, de donde E = λ/(2πε₀r) ∝ 1/r, idéntico a la línea de carga. La distinción clave respecto al cilindro conductor (E=0 interior) reside en que aquí la carga reside en todo el volumen, no en la superficie.",
    "hints": [],
    "questions": [
      "Con λ = 2 nC/m y R = 1.5 m, calcula E en r = 0.8 m (interior) y r = 2.5 m (exterior). Verifica ambos valores con la lectura del visualizador al arrastrar la superficie gaussiana.",
      "Demuestra que E es continuo en r = R: evalúa la expresión interior E = λr/(2πε₀R²) en r = R y la exterior E = λ/(2πε₀r) en r = R; compara con E de la línea de carga infinita de densidad λ.",
      "Calcula la razón E(r)/E(R) para r = 0.4R, 0.7R y 1.5R, tanto analíticamente como leyendo el visualizador. ¿Qué ley de escala tiene el campo en la región interior?",
      "Si duplicas R manteniendo λ fija, ¿cómo cambia E en r = 0.8 m (que ahora podría quedar dentro o fuera según el nuevo R)? Argumenta antes de verificar con el slider."
    ],
    "challenge": {
      "description": "La superficie gaussiana está actualmente en r = 0.8 m, en el interior del cilindro. Determina analíticamente a qué radio exterior r* debería moverse la superficie para que el campo eléctrico medido sea exactamente el mismo valor que el leído ahora en r = 0.8 m. (Pista: iguala las expresiones de E interior y exterior y despeja r*.) Arrastra la superficie hasta ese radio y verifica que el campo coincide.",
      "target_params": { "lam": 2.0, "R": 1.5, "rg": 2.5 },
      "target_rg": 2.5,
      "target_readout": { "Qenc_nC": 2.0, "flux_Nm2C": 225.9, "E_NC": 14.36 },
      "tolerance": 0.08
    }
  },
  {
    "id": "G11",
    "title": "Cable coaxial: apantallamiento electrostático perfecto",
    "topic": "simetria_cilindrica",
    "difficulty": 3,
    "scenario": "coaxial_cable",
    "params": { "lam": 2.0, "R": 0.5, "b": 2.5, "rg": 1.2 },
    "objective": "Demostrar con la Ley de Gauss que un cable coaxial ideal (conductor central +λ y cubierta −λ) produce campo nulo en el exterior, y calcular el campo en la región activa entre conductores.",
    "theory": "El cable coaxial consta de un conductor central (radio R, carga +λ por unidad de longitud) y una cubierta cilíndrica conductora (radio b, carga −λ). Para r < R: E = 0 (conductor). Para R < r < b: Q_enc/L = +λ, luego E·2πrL = λL/ε₀ → E = λ/(2πε₀r) ∝ 1/r; el campo es idéntico al de una línea de carga aislada. Para r > b: Q_enc/L = +λ + (−λ) = 0 → E = 0. Este blindaje perfecto — campo nulo fuera — es la propiedad que hace al cable coaxial imprescindible en telecomunicaciones (TV, radiofrecuencia, instrumentación): las señales eléctricas se propagan en la región activa sin radiar ni recibir interferencia electromagnética del exterior.",
    "hints": [],
    "questions": [
      "Con λ = 2 nC/m, R = 0.5 m y b = 2.5 m, calcula E en r = 1.2 m (entre conductores). Verifica con el visualizador. Luego mueve la superficie a r = 3.0 m y confirma E = 0.",
      "¿A qué radio r* entre los conductores el campo es exactamente la mitad del valor en r = 1.2 m? Calcula analíticamente usando E ∝ 1/r y verifica con el slider.",
      "Calcula el flujo Φ/L = E·2πrL para r = 0.8 m, 1.5 m y 3.0 m. ¿Cuándo cambia Q_enc/L al variar r? Relaciona con las tres regiones del cable.",
      "Si la cubierta exterior tuviera carga −2λ en lugar de −λ, ¿cuánto valdría E para r > b? ¿Y el flujo total? Argumenta con la Ley de Gauss antes de modificar los parámetros."
    ],
    "challenge": {
      "description": "Actualmente la superficie gaussiana está en r = 1.2 m y mide un campo E₀. Calcula analíticamente en qué radio r* (entre los dos conductores) el campo es exactamente la mitad de E₀. Arrastra la superficie hasta r* y verifica que el visualizador confirma tu predicción. El objetivo es aplicar la relación E ∝ 1/r para encontrar la posición sin tanteo.",
      "target_params": { "lam": 2.0, "R": 0.5, "b": 2.5, "rg": 2.4 },
      "target_rg": 2.4,
      "target_readout": { "Qenc_nC": 2.0, "flux_Nm2C": 225.9, "E_NC": 15.0 },
      "tolerance": 0.08
    }
  },
  {
    "id": "G12",
    "title": "Condensador esférico: campo confinado y capacidad 4πε₀ab/(b−a)",
    "topic": "simetria_esferica",
    "difficulty": 4,
    "scenario": "spherical_cap",
    "params": { "Q": 3.0, "Q2": -3.0, "R": 0.8, "b": 2.5, "rg": 1.5 },
    "objective": "Calcular el campo eléctrico en las tres regiones del condensador esférico, derivar la capacidad C = 4πε₀ab/(b−a) y verificar el blindaje exterior cuando Q₂ = −Q.",
    "theory": "El condensador esférico consiste en una esfera conductora interna (radio a = R, carga +Q) y una cáscara conductora externa (radio b, carga Q₂). Aplicando ∮E·dA = Q_enc/ε₀ con superficies esféricas: (1) r < a: E = 0 (conductor); (2) a < r < b: Q_enc = Q → E = kQ/r²; (3) r > b: Q_enc = Q+Q₂ → E = k(Q+Q₂)/r². Para el condensador ideal (Q₂ = −Q): E exterior = 0 y el campo queda completamente confinado entre las esferas. La diferencia de potencial entre las superficies es ΔV = kQ(1/a − 1/b), de donde la capacidad C = Q/ΔV = 4πε₀ab/(b−a), que diverge cuando b→a (separación infinitesimal) y tiende a 4πε₀a cuando b→∞ (esfera aislada).",
    "hints": [],
    "questions": [
      "Con Q = 3 nC, a = 0.8 m y b = 2.5 m, calcula E en r = 1.5 m (entre esferas). Verifica con el visualizador. Luego confirma que E = 0 para r = 3.0 m cuando Q₂ = −Q.",
      "Calcula la capacidad C = 4πε₀ab/(b−a) para a = 0.8 m y b = 2.5 m. Expresa el resultado en picofaradios (pF) usando ε₀ = 8.854×10⁻¹² F/m.",
      "Si cambias Q₂ de −3 nC a −1 nC (carga total 2 nC), ¿cómo cambia E en r = 1.5 m? ¿Y en r = 3.5 m? Calcula analíticamente antes de ajustar el slider Q2.",
      "Demuestra que la diferencia de potencial ΔV = V(a)−V(b) = kQ(1/a − 1/b). Con los valores del escenario, calcula ΔV numéricamente y comprueba que C = Q/ΔV coincide con la fórmula 4πε₀ab/(b−a)."
    ],
    "challenge": {
      "description": "Modifica los parámetros del sistema para obtener la siguiente situación: carga total Q₁+Q₂ = 3 nC pero con Q₁ ≠ 3 nC, y superficie gaussiana en el exterior (r > b). El observable objetivo es un campo eléctrico en r = 3.5 m que depende únicamente de la carga total, no de la distribución interna. Calcula analíticamente qué E deberías medir, ajusta Q₁ y Q₂ libremente (manteniendo su suma = 3 nC) y arrastra rg hasta 3.5 m para verificar que el campo exterior solo depende de Q_total.",
      "target_params": { "Q": 5.0, "Q2": -2.0, "R": 0.8, "b": 2.5, "rg": 3.5 },
      "target_rg": 3.5,
      "target_readout": { "Qenc_nC": 3.0, "flux_Nm2C": 338.9, "E_NC": 2.20 },
      "tolerance": 0.08
    }
  },
  {
    "id": "G13",
    "title": "Esfera aislante con ρ ∝ r: campo cuadrático y Q_enc ∝ r⁴",
    "topic": "simetria_esferica",
    "difficulty": 4,
    "scenario": "nonuniform_sphere",
    "params": { "Q": 3.0, "R": 1.5, "rg": 1.0 },
    "objective": "Derivar el campo eléctrico de una esfera con densidad volumétrica no uniforme ρ(r) = ρ₀r/R, demostrar que E ∝ r² en el interior (contraste con E ∝ r para ρ uniforme), y verificar que el exterior es indistinguible de una carga puntual.",
    "theory": "Una esfera de radio R con ρ(r) = ρ₀(r/R) tiene carga total Q = 4π∫₀^R ρ r² dr = 4πρ₀∫₀^R r³/R dr = πρ₀R³, de donde ρ₀ = Q/(πR³). La carga encerrada hasta radio r ≤ R es Q_enc(r) = 4πρ₀/R ∫₀^r r'³ dr' = (πρ₀r⁴/R) = Q(r/R)⁴. Aplicando ∮E·dA = Q_enc/ε₀ con una esfera de radio r: E·4πr² = Q(r/R)⁴/ε₀, de donde E = kQ r²/R⁴ ∝ r². Este crecimiento cuadrático (vs lineal para ρ uniforme) refleja que la carga se acumula preferentemente en la periferia: las capas externas son más densas. Para r > R el resultado es E = kQ/r², idéntico al de una carga puntual, independientemente de la distribución interna. La visualización muestra un gradiente de color más intenso en la periferia de la esfera.",
    "hints": [],
    "questions": [
      "Con Q = 3 nC y R = 1.5 m, calcula E en r = 1.0 m usando E = kQr²/R⁴. Verifica con el visualizador. Compara con el valor que daría la esfera uniforme (insulating_sphere) a igual r: E_unif = kQr/R³.",
      "Calcula la razón Q_enc(r)/Q para r = 0.5R, 0.75R y R. ¿Por qué Q_enc ∝ r⁴ en vez de r³? ¿Qué dice esto sobre dónde se concentra la carga en ρ ∝ r?",
      "Para r > R, muestra analíticamente que E = kQ/r² sin importar la forma de ρ(r). ¿Qué propiedad de la Ley de Gauss garantiza este resultado universal para cualquier distribución esféricamente simétrica?",
      "Determina el radio r* donde la esfera no uniforme produce el mismo campo que la esfera uniforme de igual Q y R. Plantea la ecuación kQr*²/R⁴ = kQr*/R³ y resuélvela. ¿Tiene sentido físico?"
    ],
    "challenge": {
      "description": "La superficie gaussiana está actualmente en r = 1.0 m (interior de la esfera, región cuadrática). Calcula analíticamente qué flujo Φ = Q_enc/ε₀ mediría una superficie exterior a r = 2.5 m. Después arrastra rg hasta 2.5 m y verifica que el flujo coincide con tu predicción. El punto clave: aunque las distribuciones de carga interior son completamente diferentes, el flujo exterior solo depende de la carga total Q.",
      "target_params": { "Q": 3.0, "R": 1.5, "rg": 2.5 },
      "target_rg": 2.5,
      "target_readout": { "Qenc_nC": 3.0, "flux_Nm2C": 338.9, "E_NC": 4.31 },
      "tolerance": 0.08
    }
  }
];
