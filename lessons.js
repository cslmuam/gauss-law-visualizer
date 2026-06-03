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
  }
];
