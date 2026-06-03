#!/usr/bin/env python3
"""
Generador multiagente de lecciones para el Visualizador de la Ley de Gauss.

Arquitectura de agentes:
  CurriculumAgent → PhysicsAgent → ContentAgent → QAAgent (→ revisión si necesario)

Cada agente es una llamada especializada a Claude con herramientas estructuradas.
La salida es lessons.js con window.GAUSS_LESSONS = [...], que el navegador carga
directamente sin API (variable distinta a LESSONS del proyecto de electrostática).

Constantes físicas:
  EPS0 = 8.854187817e-12 F/m
  K    = 8.987551787e9 N·m²/C²

Escenarios del visualizador (8 en total):
  point_charge       — superficie esférica, params: Q (nC), rg (m)
  conducting_sphere  — params: Q, R, rg
  insulating_sphere  — params: Q, R, rg  (E∝r interior, E∝1/r² exterior)
  spherical_shell    — params: Q, R, rg  (E=0 interior, E=kQ/r² exterior)
  infinite_line      — simetría cilíndrica, params: lam (nC/m), rg
  infinite_plane     — pillbox, params: sig (nC/m²), rg (semialtura)
  capacitor          — params: sig, d (separación), rg
  magnetic           — ∮B·dA=0, params: rg únicamente

Requisitos:
  pip install anthropic

Uso:
  export ANTHROPIC_API_KEY=sk-ant-...
  python generate_lessons.py
  python generate_lessons.py --num 12 --level ingenieria --model claude-opus-4-8 --out lessons.js
"""

import anthropic
import argparse
import json
import math
import sys
import textwrap
from pathlib import Path

# ---------------------------------------------------------------------------
# Constantes físicas (para documentación en prompts; el QAAgent las verifica)
# ---------------------------------------------------------------------------

EPS0 = 8.854187817e-12   # F/m
K    = 8.987551787e9     # N·m²/C²

# Fórmulas de referencia inyectadas en los prompts del PhysicsAgent y QAAgent.
PHYSICS_REFERENCE = f"""\
Constantes: EPS0 = {EPS0:.6e} F/m, K = {K:.6e} N·m²/C².
Nota: Q en nC → factor 1e-9; lam en nC/m → factor 1e-9; sig en nC/m² → factor 1e-9.

Fórmulas por escenario (r = rg, la semialtura o radio de la superficie de Gauss):
  point_charge:
      E = K*Q*1e-9 / r²
      Qenc = Q nC  (siempre)
      Flux = Q*1e-9 / EPS0

  conducting_sphere (radio del conductor = R):
      E = 0           si r ≤ R
      E = K*Q*1e-9/r² si r > R
      Qenc = 0 nC si r ≤ R;  Qenc = Q nC si r > R

  insulating_sphere (radio = R, carga uniforme):
      E = K*Q*1e-9 * r / R³  si r ≤ R
      E = K*Q*1e-9 / r²      si r > R
      Qenc = Q*(r/R)³ nC si r ≤ R;  Qenc = Q nC si r > R

  spherical_shell (radio = R, carga superficial):
      E = 0           si r ≤ R
      E = K*Q*1e-9/r² si r > R
      Qenc = 0 nC si r ≤ R;  Qenc = Q nC si r > R

  infinite_line (densidad lineal lam nC/m):
      E = |lam|*1e-9 / (2*π*EPS0*r)
      Qenc_per_m = lam nC/m
      Flux_per_m = lam*1e-9 / EPS0

  infinite_plane (densidad superficial sig nC/m²):
      E = |sig|*1e-9 / (2*EPS0)   [constante, independiente de rg]
      Qenc_per_m2 = sig nC/m²

  capacitor (sig nC/m², separación d):
      E = |sig|*1e-9 / EPS0  si rg < d/2   (campo entre placas)
      E = 0                  si rg ≥ d/2
      Qenc = sig nC/m² si rg < d/2;  Qenc = 0 si rg ≥ d/2

  magnetic:
      E = 0, Qenc = 0, Flux = 0  (siempre; ∮B·dA = 0)
"""

# ---------------------------------------------------------------------------
# Tool schemas
# ---------------------------------------------------------------------------

DEFINE_GAUSS_CURRICULUM_TOOL = {
    "name": "define_gauss_curriculum",
    "description": (
        "Define la secuencia pedagógica de lecciones para el visualizador de la Ley de Gauss. "
        "Ordena de simple (carga puntual) a complejo (capacitor, reto_gauss)."
    ),
    "input_schema": {
        "type": "object",
        "required": ["lessons"],
        "properties": {
            "lessons": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["id", "title", "topic", "difficulty", "scenario_hint"],
                    "properties": {
                        "id": {
                            "type": "string",
                            "description": "Identificador único, ej. G01",
                        },
                        "title": {"type": "string"},
                        "topic": {
                            "type": "string",
                            "enum": [
                                "simetria_esferica",
                                "simetria_cilindrica",
                                "simetria_planar",
                                "gauss_magnetico",
                                "reto_gauss",
                            ],
                        },
                        "difficulty": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 4,
                        },
                        "scenario_hint": {
                            "type": "string",
                            "description": (
                                "Descripción técnica del escenario y parámetros sugeridos "
                                "para el PhysicsAgent. Incluye el nombre del escenario del "
                                "visualizador (uno de: point_charge, conducting_sphere, "
                                "insulating_sphere, spherical_shell, infinite_line, "
                                "infinite_plane, capacitor, magnetic)."
                            ),
                        },
                    },
                },
            }
        },
    },
}

DEFINE_GAUSS_SCENARIO_TOOL = {
    "name": "define_gauss_scenario",
    "description": (
        "Define el escenario y parámetros físicos concretos para una lección de la Ley de Gauss. "
        "Calcula analíticamente los valores de target_readout usando las fórmulas del sistema."
    ),
    "input_schema": {
        "type": "object",
        "required": ["scenario", "params", "initial_rg_region"],
        "properties": {
            "scenario": {
                "type": "string",
                "enum": [
                    "point_charge",
                    "conducting_sphere",
                    "insulating_sphere",
                    "spherical_shell",
                    "infinite_line",
                    "infinite_plane",
                    "capacitor",
                    "magnetic",
                ],
                "description": "Nombre exacto del escenario del visualizador.",
            },
            "params": {
                "type": "object",
                "description": (
                    "Parámetros del escenario. Incluye sólo los relevantes: "
                    "Q (nC, escenarios esféricos), R (m, radio fuente), rg (m, radio/semialtura Gauss), "
                    "lam (nC/m, línea infinita), sig (nC/m², plano/capacitor), d (m, separación capacitor). "
                    "rg debe estar en [0.1, 5.0]."
                ),
                "properties": {
                    "Q":   {"type": "number", "description": "Carga total en nC"},
                    "R":   {"type": "number", "description": "Radio de la distribución fuente en m", "minimum": 0.1},
                    "rg":  {"type": "number", "description": "Radio/semialtura inicial de la sup. de Gauss en m", "minimum": 0.1, "maximum": 5.0},
                    "lam": {"type": "number", "description": "Densidad lineal de carga en nC/m"},
                    "sig": {"type": "number", "description": "Densidad superficial de carga en nC/m²"},
                    "d":   {"type": "number", "description": "Separación entre placas del capacitor en m", "minimum": 0.1},
                },
                "additionalProperties": False,
            },
            "initial_rg_region": {
                "type": "string",
                "enum": ["inside", "outside", "only_region"],
                "description": (
                    "'inside' si rg < R (superficie dentro de la distribución), "
                    "'outside' si rg > R, "
                    "'only_region' para escenarios sin región interior distinguible "
                    "(point_charge, infinite_line, infinite_plane, magnetic)."
                ),
            },
            "challenge_target": {
                "type": "object",
                "description": (
                    "Parámetros del reto (superficie de Gauss alternativa con física diferente). "
                    "OBLIGATORIO para lecciones con reto. "
                    "Debe ser no trivial: rg diferente al inicial (y en región diferente si aplica). "
                    "Incluye target_params con los parámetros a modificar y target_readout con "
                    "los valores calculados analíticamente."
                ),
                "properties": {
                    "target_params": {
                        "type": "object",
                        "description": "Subset de params con los valores objetivo del reto.",
                        "properties": {
                            "Q":   {"type": "number"},
                            "R":   {"type": "number"},
                            "rg":  {"type": "number", "minimum": 0.1, "maximum": 5.0},
                            "lam": {"type": "number"},
                            "sig": {"type": "number"},
                            "d":   {"type": "number"},
                        },
                        "additionalProperties": False,
                    },
                    "target_rg": {
                        "type": "number",
                        "minimum": 0.1,
                        "maximum": 5.0,
                        "description": "Valor de rg para la superficie de Gauss del reto.",
                    },
                    "target_readout": {
                        "type": "object",
                        "required": ["Qenc_nC", "flux_Nm2C", "E_NC"],
                        "description": (
                            "Valores calculados analíticamente con las fórmulas del sistema. "
                            "Para escenarios no esféricos, Qenc_nC es por metro o por m²."
                        ),
                        "properties": {
                            "Qenc_nC":   {"type": "number", "description": "Q_enc en nC (o nC/m, nC/m² según escenario)"},
                            "flux_Nm2C": {"type": "number", "description": "Flujo eléctrico en N·m²/C"},
                            "E_NC":      {"type": "number", "description": "Campo eléctrico en N/C"},
                        },
                    },
                    "tolerance": {
                        "type": "number",
                        "minimum": 0.01,
                        "maximum": 0.20,
                        "description": "Tolerancia relativa para la evaluación del reto (típicamente 0.08).",
                    },
                },
                "required": ["target_params", "target_rg", "target_readout", "tolerance"],
            },
        },
    },
}

WRITE_GAUSS_CONTENT_TOOL = {
    "name": "write_gauss_content",
    "description": (
        "Redacta el contenido pedagógico completo de una lección de la Ley de Gauss. "
        "Nivel ingeniería: teoría con ecuaciones explícitas, preguntas que exigen cálculo, "
        "sin pistas observacionales."
    ),
    "input_schema": {
        "type": "object",
        "required": ["objective", "theory", "hints", "questions", "challenge"],
        "properties": {
            "objective": {
                "type": "string",
                "description": (
                    "Una oración que describe qué calculará o demostrará el estudiante. "
                    "Empieza con verbo infinitivo. Específico al escenario."
                ),
            },
            "theory": {
                "type": "string",
                "description": (
                    "Explicación teórica de 3–5 oraciones. Cita la ley de Gauss en forma integral "
                    "∮E·dA = Q_enc/ε₀, las simetrías que la hacen aplicable, y la fórmula de E "
                    "para este escenario. Conecta con la visualización."
                ),
            },
            "hints": {
                "type": "array",
                "minItems": 0,
                "maxItems": 2,
                "items": {"type": "string"},
                "description": (
                    "Nivel ingeniería: lista vacía [] en la mayoría de casos. "
                    "Si se incluye alguna, debe ser una referencia teórica o ecuacional, "
                    "NUNCA un paso guiado ni una observación directa de la pantalla."
                ),
            },
            "questions": {
                "type": "array",
                "minItems": 2,
                "maxItems": 4,
                "items": {"type": "string"},
                "description": (
                    "Preguntas que exigen cálculo numérico o derivación analítica. "
                    "Al menos dos deben requerir aplicar ∮E·dA = Q_enc/ε₀ con los "
                    "parámetros concretos del escenario y comparar con el visualizador. "
                    "Una puede pedir derivar el comportamiento límite (r→0, r→∞) o "
                    "la discontinuidad en la interfaz."
                ),
            },
            "challenge": {
                "oneOf": [
                    {"type": "null"},
                    {
                        "type": "object",
                        "required": ["description"],
                        "properties": {
                            "description": {
                                "type": "string",
                                "description": (
                                    "Descripción del reto en términos de observables físicos. "
                                    "NO revelar los valores numéricos de target_params ni target_readout. "
                                    "Redactar como especificación de ingeniería: "
                                    "qué debe lograr el estudiante (ej. ajustar rg hasta que el flujo "
                                    "medido coincida con un valor objetivo dado), no cómo hacerlo."
                                ),
                            },
                        },
                    },
                ]
            },
        },
    },
}

REVIEW_GAUSS_LESSON_TOOL = {
    "name": "review_gauss_lesson",
    "description": (
        "Revisa la lección completa de la Ley de Gauss y emite una decisión de calidad. "
        "Verifica corrección física, rigor matemático y no-trivialidad del reto."
    ),
    "input_schema": {
        "type": "object",
        "required": ["decision", "score", "feedback"],
        "properties": {
            "decision": {
                "type": "string",
                "enum": ["approve", "revise"],
                "description": (
                    "'approve' si la lección es físicamente correcta y pedagógicamente rigurosa; "
                    "'revise' si requiere correcciones."
                ),
            },
            "score": {
                "type": "integer",
                "minimum": 0,
                "maximum": 100,
                "description": "Puntaje de calidad (0–100). Aprobar con score ≥ 75.",
            },
            "feedback": {
                "type": "string",
                "description": (
                    "Si decision='revise': especifica exactamente qué corregir "
                    "(ej. 'target_readout.E_NC incorrecto: con Q=3nC y rg=2m, "
                    "E = K*3e-9/4 = 6.74 N/C, no 8.1 N/C'). "
                    "Si decision='approve': dejar vacío."
                ),
            },
        },
    },
}


# ---------------------------------------------------------------------------
# Base Agent
# ---------------------------------------------------------------------------


class Agent:
    """Agente Claude con un system prompt especializado y herramientas fijas."""

    def __init__(self, client: anthropic.Anthropic, system: str, model: str):
        self.client = client
        self.system = system
        self.model = model

    def run(self, user_message: str, tool: dict, context: str = "") -> dict:
        """Ejecuta el agente y devuelve el primer resultado de herramienta."""
        messages = []
        if context:
            messages.append({"role": "user", "content": context})
            messages.append({"role": "assistant", "content": "Entendido, usaré ese contexto."})
        messages.append({"role": "user", "content": user_message})

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=[
                {
                    "type": "text",
                    "text": self.system,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            tools=[tool],
            tool_choice={"type": "tool", "name": tool["name"]},
            messages=messages,
        )

        for block in response.content:
            if block.type == "tool_use":
                return block.input

        raise RuntimeError(
            f"El agente no devolvió salida de herramienta. Respuesta: {response}"
        )


# ---------------------------------------------------------------------------
# System prompts especializados
# ---------------------------------------------------------------------------

CURRICULUM_SYSTEM = f"""\
Eres un diseñador curricular experto en electromagnetismo para ingeniería eléctrica y física \
(nivel licenciatura, 3er–4to semestre). Diseñas secuencias de lecciones progresivas sobre \
la Ley de Gauss (forma integral), donde cada lección construye sobre la anterior con rigor \
matemático creciente.

El visualizador permite seleccionar 8 escenarios con simetrías exactas que hacen aplicable \
∮E·dA = Q_enc/ε₀:
  1. point_charge       — simetría esférica, superficie gaussiana esférica
  2. conducting_sphere  — conductor sólido, E=0 interior
  3. insulating_sphere  — aislante con carga volumétrica uniforme
  4. spherical_shell    — cascarón esférico, E=0 interior
  5. infinite_line      — simetría cilíndrica, superficie cilíndrica
  6. infinite_plane     — simetría planar, superficie "pillbox"
  7. capacitor          — campo confinado entre placas paralelas
  8. magnetic           — ley de Gauss magnética: ∮B·dA = 0

Para nivel ingeniería la secuencia debe:
(1) Progresar desde la simetría más simple (esférica, carga puntual) hasta la más compleja \
    (planar + capacitor) y el caso magnético como contraste conceptual.
(2) Incluir escenarios donde el campo es discontinuo en la interfaz (conducting_sphere, \
    spherical_shell, capacitor) y escenarios donde varía continuamente (insulating_sphere).
(3) El reto final (topic='reto_gauss') debe pedir al estudiante ajustar parámetros para \
    alcanzar un flujo o campo objetivo — problema de diseño inverso.
(4) Cada lección debe ser resoluble analíticamente con ∮E·dA = Q_enc/ε₀ y las simetrías \
    correspondientes; ninguna debe requerir integración numérica.
(5) Distribuir los 8 escenarios del visualizador a lo largo de la secuencia; no repetir \
    el mismo escenario más de una vez salvo que el número de lecciones sea mayor que 8.

{PHYSICS_REFERENCE}
"""

PHYSICS_SYSTEM = f"""\
Eres un físico teórico especializado en electrostática y electromagnetismo clásico. \
Tu tarea es traducir el plan curricular en parámetros concretos del visualizador de \
la Ley de Gauss y calcular los readouts del reto con precisión numérica.

Restricciones de parámetros:
  - Q   : carga total en nC; puede ser positiva o negativa; magnitud típica 1–10 nC
  - R   : radio de la distribución fuente en m; rango sugerido [0.5, 3.0]
  - rg  : radio/semialtura de la superficie de Gauss en m; OBLIGATORIO en [0.1, 5.0]
  - lam : densidad lineal en nC/m; magnitud típica 0.5–5.0
  - sig : densidad superficial en nC/m²; magnitud típica 0.5–5.0
  - d   : separación de placas en m; rango sugerido [0.5, 3.0]

Para el reto (challenge_target):
  - El rg objetivo debe ser DIFERENTE al rg inicial (mínimo 30% de diferencia).
  - Si el escenario tiene región interior (R > 0), elige un rg objetivo en la región \
    opuesta a la inicial (interior↔exterior) para que la física sea cualitativamente \
    diferente.
  - Calcula target_readout ANALÍTICAMENTE usando las fórmulas de referencia.
  - Verifica: Flux = E * A_superficie (A = 4πrg² para esférica, 2πrg*L para cilíndrica, \
    2*A_base para pillbox).
  - tolerance = 0.08 (8%) salvo justificación explícita.

{PHYSICS_REFERENCE}

Ejemplo de cálculo correcto para point_charge con Q=3 nC, rg=2.0 m:
  E = 8.9876e9 * 3e-9 / (2.0)² = 26.963 / 4.0 = 6.741 N/C
  Qenc = 3.0 nC
  Flux = 3e-9 / 8.854e-12 = 338.86 N·m²/C
"""

CONTENT_SYSTEM = """\
Eres un profesor de electromagnetismo para ingeniería (nivel 3er–4to semestre). \
Redactas material pedagógico de nivel universitario que exige trabajo analítico.

El estudiante usa un visualizador de la Ley de Gauss en el navegador donde puede:
  - Seleccionar 8 escenarios con simetrías exactas
  - Ajustar la superficie de Gauss (rg) y ver E, Q_enc y flujo en tiempo real
  - Activar un reto para alcanzar valores objetivo de flujo y campo

Estándares para nivel ingeniería:

OBJETIVO: Una oración específica al escenario, con verbo infinitivo. No genérica.
  Correcto:  "Calcular el campo eléctrico dentro y fuera de una esfera conductora \
              cargada y verificar que ∮E·dA = Q_enc/ε₀ da E=0 en el interior."
  Incorrecto: "Explorar el campo eléctrico de una esfera."

TEORÍA: 3–5 oraciones densas. Obligatorio:
  - Enunciar ∮E·dA = Q_enc/ε₀ y la simetría que permite sacar E de la integral.
  - La fórmula explícita de E para este escenario (con símbolos y factores numéricos).
  - La discontinuidad o continuidad del campo en la interfaz (si aplica).
  - Conexión con lo que el estudiante verá en el visualizador.

PISTAS: [] en nivel ingeniería. Si se incluye una, solo puede ser una referencia \
  teórica/ecuacional, NUNCA un paso guiado ni "observa que..." ni "mueve el slider...".

PREGUNTAS (2–4): Todas deben exigir cálculo o derivación explícita.
  Obligatorio al menos una de cada tipo:
    (a) Numérica: calcular E o flujo con los parámetros concretos del escenario y \
        comparar con el visualizador.
    (b) Conceptual-analítica: demostrar un límite, una discontinuidad o una propiedad \
        de simetría usando las ecuaciones.
  Prohibido: preguntas respondibles sólo con "mueve el slider y observa".

RETO — descripción: Redactar como especificación de ingeniería.
  - Indica el observable objetivo (flujo, Q_enc, E) en términos cualitativos o \
    como relación (ej. "la mitad del flujo máximo"), NO el valor numérico exacto.
  - NO revelar los valores de target_params ni target_readout.
  - El estudiante debe usar la ley de Gauss para calcular qué rg produce el \
    observable pedido, luego verificar en el visualizador.
"""

QA_SYSTEM = f"""\
Eres un evaluador exigente de material educativo para ingeniería eléctrica y física. \
Tu especialidad es la Ley de Gauss y electromagnetismo clásico.

VERIFICACIONES OBLIGATORIAS (rechazar si alguna falla):

1. CORRECCIÓN FÍSICA de target_readout:
   Usa las fórmulas exactas para calcular E, Q_enc y Flux con los target_params dados.
   Si el error relativo en cualquier valor supera 5%, rechazar con corrección explícita.
   {PHYSICS_REFERENCE}

2. RIGOR DE PREGUNTAS:
   Al menos 2 preguntas deben requerir cálculo o derivación (no sólo observación).
   Rechazar si alguna pregunta es respondible con "mueve el slider y observa".

3. TEORÍA:
   Debe citar ∮E·dA = Q_enc/ε₀ y la fórmula de E para el escenario.
   Rechazar si la teoría es descriptiva sin ecuaciones.

4. PISTAS:
   Nivel ingeniería: [] o ≤1 referencia teórica. Rechazar si contiene pasos guiados.

5. RETO NO TRIVIAL:
   - rg del reto difiere del inicial en ≥30%.
   - Si hay región interior/exterior: rg del reto está en la región opuesta a la inicial.
   - La descripción del reto no revela los valores numéricos de target_readout.
   - El reto es resoluble analíticamente con las fórmulas del sistema.

6. CONSISTENCIA escenario–contenido:
   El objetivo, la teoría y las preguntas deben corresponder al escenario declarado.

Criterios de aprobación (score ≥ 75):
  Todos los puntos anteriores aprobados + redacción de nivel universitario técnico.
"""


# ---------------------------------------------------------------------------
# Specialized Agents
# ---------------------------------------------------------------------------


class CurriculumAgent(Agent):
    def __init__(self, client: anthropic.Anthropic, model: str):
        super().__init__(client, CURRICULUM_SYSTEM, model)

    def plan(self, num_lessons: int, level: str, topics: list[str]) -> list[dict]:
        prompt = (
            f"Diseña una secuencia de {num_lessons} lecciones de nivel '{level}' "
            f"para el visualizador de la Ley de Gauss. "
            f"Temas requeridos: {', '.join(topics)}. "
            f"Ordena de menor a mayor complejidad, empezando con point_charge "
            f"y terminando con un reto de diseño inverso (topic='reto_gauss'). "
            f"Distribuye los 8 escenarios del visualizador de forma progresiva. "
            f"Incluye el escenario magnético (magnetic) cerca del final como contraste conceptual."
        )
        result = self.run(prompt, DEFINE_GAUSS_CURRICULUM_TOOL)
        return result["lessons"]


class PhysicsAgent(Agent):
    def __init__(self, client: anthropic.Anthropic, model: str):
        super().__init__(client, PHYSICS_SYSTEM, model)

    def configure(self, lesson_meta: dict) -> dict:
        has_challenge = lesson_meta["topic"] in ("reto_gauss", "simetria_esferica",
                                                   "simetria_cilindrica", "simetria_planar")
        challenge_instruction = (
            " Incluye challenge_target con un rg objetivo en una región diferente a la inicial "
            "(interior↔exterior si aplica) y calcula target_readout analíticamente."
            if has_challenge else
            " No incluyas challenge_target (esta lección es de exploración, no de reto)."
        )
        prompt = (
            f"Configura el escenario para la lección '{lesson_meta['title']}' "
            f"(dificultad {lesson_meta['difficulty']}/4). "
            f"Indicación del currículo: {lesson_meta['scenario_hint']}."
            f"{challenge_instruction} "
            f"Elige parámetros que produzcan física cuantitativamente interesante "
            f"(no Q=1 nC, R=1 m, rg=2 m genérico). "
            f"Justifica el rg inicial (¿está dentro o fuera de la distribución?)."
        )
        return self.run(prompt, DEFINE_GAUSS_SCENARIO_TOOL)


class ContentAgent(Agent):
    def __init__(self, client: anthropic.Anthropic, model: str):
        super().__init__(client, CONTENT_SYSTEM, model)

    def write(
        self,
        lesson_meta: dict,
        physics_config: dict,
        level: str,
        feedback: str = "",
    ) -> dict:
        context = (
            f"Escenario del visualizador: {physics_config['scenario']}. "
            f"Parámetros: {json.dumps(physics_config['params'], ensure_ascii=False)}. "
            f"Región inicial de rg: {physics_config.get('initial_rg_region', 'only_region')}."
        )
        if physics_config.get("challenge_target"):
            ct = physics_config["challenge_target"]
            context += (
                f" El reto tiene rg objetivo = {ct['target_rg']} m "
                f"en la región {'interior' if ct['target_rg'] < physics_config['params'].get('R', 999) else 'exterior'}. "
                f"El readout objetivo es: {json.dumps(ct['target_readout'])}. "
                f"(No reveles estos valores en la descripción del reto; usa términos cualitativos o relacionales.)"
            )

        engineering_note = (
            " NIVEL INGENIERÍA: sin pistas observacionales, preguntas con cálculo "
            "explícito de E y flujo usando los parámetros concretos, reto con descripción "
            "en términos de observable sin revelar el valor numérico exacto."
            if level in ("ingenieria", "avanzado") else ""
        )

        prompt = (
            f"Escribe el contenido pedagógico para la lección '{lesson_meta['title']}' "
            f"(dificultad {lesson_meta['difficulty']}/4, nivel {level}).{engineering_note}"
            + (f" Incorpora esta retroalimentación del revisor: {feedback}" if feedback else "")
        )
        return self.run(prompt, WRITE_GAUSS_CONTENT_TOOL, context=context)


class QAAgent(Agent):
    def __init__(self, client: anthropic.Anthropic, model: str):
        super().__init__(client, QA_SYSTEM, model)

    def review(self, full_lesson: dict) -> dict:
        prompt = (
            "Revisa esta lección completa de la Ley de Gauss y emite tu decisión. "
            "Verifica especialmente la corrección numérica de target_readout:\n"
            + json.dumps(full_lesson, ensure_ascii=False, indent=2)
        )
        return self.run(prompt, REVIEW_GAUSS_LESSON_TOOL)


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------


class GaussLessonPipeline:
    """
    Coordina los cuatro agentes para generar cada lección de la Ley de Gauss.

    Flujo por lección:
      PhysicsAgent → ContentAgent → QAAgent → (revisión si score < 75) → ContentAgent → QAAgent
    """

    MAX_REVISIONS = 2

    def __init__(self, client: anthropic.Anthropic, model: str):
        self.curriculum = CurriculumAgent(client, model)
        self.physics = PhysicsAgent(client, model)
        self.content = ContentAgent(client, model)
        self.qa = QAAgent(client, model)

    def _generate_one(
        self, lesson_meta: dict, level: str, verbose: bool
    ) -> dict:
        if verbose:
            print(f"  [PhysicsAgent]  Configurando {lesson_meta['id']}…")
        physics_config = self.physics.configure(lesson_meta)

        feedback = ""
        for attempt in range(self.MAX_REVISIONS + 1):
            if verbose:
                revision_tag = f" (revisión {attempt})" if attempt else ""
                print(f"  [ContentAgent]{revision_tag}  Redactando contenido…")
            lesson_content = self.content.write(
                lesson_meta, physics_config, level, feedback
            )

            # Ensamblar lección completa para el revisor
            full_lesson = {
                **lesson_meta,
                "scenario": physics_config["scenario"],
                "params": physics_config["params"],
                "initial_rg_region": physics_config.get("initial_rg_region"),
                **lesson_content,
            }
            # Incorporar challenge_target del PhysicsAgent en la lección final
            if physics_config.get("challenge_target") and lesson_content.get("challenge"):
                ct = physics_config["challenge_target"]
                if isinstance(lesson_content["challenge"], dict):
                    full_lesson["challenge"] = {
                        **lesson_content["challenge"],
                        "target_params":  ct["target_params"],
                        "target_rg":      ct["target_rg"],
                        "target_readout": ct["target_readout"],
                        "tolerance":      ct.get("tolerance", 0.08),
                    }

            if verbose:
                print("  [QAAgent]       Revisando…")
            review = self.qa.review(full_lesson)

            if verbose:
                status = (
                    "APROBADA"
                    if review["decision"] == "approve"
                    else f"RECHAZADA (score={review['score']})"
                )
                print(f"  [QAAgent]       {status}")

            if review["decision"] == "approve" or attempt == self.MAX_REVISIONS:
                break
            feedback = review["feedback"]

        return full_lesson

    def run(
        self,
        num_lessons: int,
        level: str,
        topics: list[str],
        verbose: bool = True,
    ) -> list[dict]:
        if verbose:
            print(
                f"[CurriculumAgent] Diseñando secuencia de {num_lessons} lecciones "
                f"de Ley de Gauss ({level})…"
            )
        lesson_metas = self.curriculum.plan(num_lessons, level, topics)

        lessons: list[dict] = []
        for meta in lesson_metas:
            if verbose:
                print(f"\n→ {meta['id']}: {meta['title']}")
            lesson = self._generate_one(meta, level, verbose)
            lessons.append(lesson)

        return lessons


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def write_lessons_js(lessons: list[dict], out_path: Path) -> None:
    json_str = json.dumps(lessons, ensure_ascii=False, indent=2)
    js = textwrap.dedent(f"""\
        // Lecciones de Ley de Gauss — generadas automáticamente; no editar a mano.
        // Para regenerar: python generate_lessons.py
        // Variable distinta a LESSONS (electrostática) para evitar colisión.
        window.GAUSS_LESSONS = {json_str};
    """)
    out_path.write_text(js, encoding="utf-8")
    print(f"\n{len(lessons)} lecciones escritas en {out_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genera lecciones para el visualizador de la Ley de Gauss."
    )
    parser.add_argument(
        "--num",
        type=int,
        default=8,
        help="Número de lecciones a generar (default: 8)",
    )
    parser.add_argument(
        "--level",
        default="ingenieria",
        choices=["introductorio", "intermedio", "avanzado", "ingenieria"],
        help="Nivel del curso (default: ingenieria)",
    )
    parser.add_argument(
        "--model",
        default="claude-opus-4-8",
        help="Modelo Claude a usar (default: claude-opus-4-8)",
    )
    parser.add_argument(
        "--out",
        default="lessons.js",
        help="Archivo de salida (default: lessons.js)",
    )
    args = parser.parse_args()

    topics = [
        "simetria_esferica",
        "simetria_cilindrica",
        "simetria_planar",
        "gauss_magnetico",
        "reto_gauss",
    ]

    try:
        client = anthropic.Anthropic()
    except Exception as e:
        print(f"Error al inicializar cliente Anthropic: {e}", file=sys.stderr)
        print("Asegúrate de que ANTHROPIC_API_KEY está configurada.", file=sys.stderr)
        sys.exit(1)

    pipeline = GaussLessonPipeline(client, args.model)
    lessons = pipeline.run(args.num, args.level, topics, verbose=True)

    out_path = Path(args.out)
    write_lessons_js(lessons, out_path)


if __name__ == "__main__":
    main()
