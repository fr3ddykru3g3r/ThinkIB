#!/usr/bin/env python3
"""
physics_taxonomy.py
===================
Defines the 2025 IB Physics Curriculum structure (Themes A-E, Sub-Topics A.1-E.5),
keyword & formula signatures for each sub-topic, legacy Paper 3 Option mappings,
and retired syllabus exclusion filters.
"""

import re
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, field

# ==============================================================================
# 1. 2025 IB PHYSICS CURRICULUM DEFINITION
# ==============================================================================

THEMES = {
    "A": {
        "title": "Space, Time and Motion",
        "description": "Kinematics, forces, momentum, work, energy, rigid bodies, and relativistic mechanics.",
        "color": "#0969da",
        "accent": "rgba(9, 105, 218, 0.12)",
    },
    "B": {
        "title": "The Particulate Nature of Matter",
        "description": "Thermal energy transfers, greenhouse effect, gas laws, thermodynamics, and electric circuits.",
        "color": "#b84a39",
        "accent": "rgba(184, 74, 57, 0.12)",
    },
    "C": {
        "title": "Wave Behaviour",
        "description": "Simple harmonic motion, wave model, wave phenomena, standing waves, resonance, and Doppler effect.",
        "color": "#1f883d",
        "accent": "rgba(31, 136, 61, 0.12)",
    },
    "D": {
        "title": "Fields",
        "description": "Gravitational fields, electric and magnetic fields, motion in EM fields, and electromagnetic induction.",
        "color": "#8250df",
        "accent": "rgba(130, 80, 223, 0.12)",
    },
    "E": {
        "title": "Nuclear and Quantum Physics",
        "description": "Structure of the atom, quantum physics, radioactive decay, nuclear fission, fusion, and stars.",
        "color": "#cf222e",
        "accent": "rgba(207, 34, 46, 0.12)",
    }
}

SUBTOPICS = {
    # Theme A: Space, Time and Motion
    "A.1": {
        "theme": "A",
        "title": "Kinematics",
        "hl_only": False,
        "description": "SUVAT equations, projectile motion, graphs of motion, terminal velocity, and fluid resistance.",
        "keywords": [
            "suvat", "projectile", "projectile motion", "trajectory", "displacement-time", "velocity-time", "acceleration-time",
            "terminal velocity", "fluid resistance", "air resistance", "horizontal component",
            "vertical component", "parabolic", "free fall", "uniform acceleration", "stopping distance",
            "relative velocity", "initial speed", "range of projectile", "maximum height", "equations of motion",
            "instantaneous speed", "average velocity", "accelerate from rest", "falling object", "motion graph",
            "initial velocity", "constant acceleration", "horizontal velocity", "vertical velocity", "speed of launch"
        ],
        "formulas": [
            r"\bu\s*\+\s*at\b", r"\but\s*\+\s*½\s*at\^?2\b", r"\bv\^?2\s*=\s*u\^?2\b",
            r"\bs\s*=\s*ut\b", r"\b\(\s*u\s*\+\s*v\s*\)\s*t\s*/\s*2\b"
        ],
        "weight_boost": 1.2
    },
    "A.2": {
        "theme": "A",
        "title": "Forces and Momentum",
        "hl_only": False,
        "description": "Free-body diagrams, Newton's laws of motion, friction, impulse, linear momentum, collisions, and circular motion.",
        "keywords": [
            "free-body diagram", "free body", "free body diagram", "newton's first", "newton's second", "newton's third", "newton's law",
            "friction", "static friction", "dynamic friction", "coefficient of friction", "normal reaction", "normal force",
            "impulse", "momentum", "conservation of momentum", "conservation of linear momentum", "linear momentum",
            "elastic collision", "inelastic collision", "centripetal", "centripetal acceleration",
            "centripetal force", "banked track", "circular motion", "angular speed", "tension in string",
            "net force", "resultant force", "equilibrium of forces", "drag force", "collision", "collides with",
            "change in momentum", "force-time", "uniform circular motion"
        ],
        "formulas": [
            r"\bF\s*=\s*ma\b", r"\bF\s*=\s*Δp/Δt\b", r"\bp\s*=\s*mv\b", r"\bv\^?2\s*/\s*r\b",
            r"\bω\^?2\s*r\b", r"\bμ_?[sk]\b", r"\bF\s*Δt\b"
        ],
        "weight_boost": 1.3
    },
    "A.3": {
        "theme": "A",
        "title": "Work, Energy and Power",
        "hl_only": False,
        "description": "Kinetic energy, gravitational and elastic potential energy, work done, power, efficiency, and Sankey diagrams.",
        "keywords": [
            "kinetic energy", "gravitational potential energy", "elastic potential energy", "work done",
            "power", "efficiency", "sankey diagram", "sankey", "spring constant", "hooke's law",
            "conservation of energy", "useful work", "rate of doing work", "dissipated energy",
            "energy transfer", "watt", "joule", "energy losses", "friction does work", "mechanical energy",
            "useful power", "power output", "power input", "rate of energy"
        ],
        "formulas": [
            r"\b½\s*m\s*v\^?2\b", r"\bmgh\b", r"\b½\s*k\s*x\^?2\b", r"\bFd\s*cos\b",
            r"\bP\s*=\s*Fv\b", r"\bwork\s*done\b", r"\befficiency\b"
        ],
        "weight_boost": 1.2
    },
    "A.4": {
        "theme": "A",
        "title": "Rigid Body Mechanics",
        "hl_only": True,
        "description": "Torque, moment of inertia, angular momentum, rotational kinetic energy, rolling without slipping.",
        "keywords": [
            "torque", "moment of inertia", "angular momentum", "rotational kinetic energy",
            "rolling without slipping", "rolling", "angular acceleration", "angular velocity",
            "angular impulse", "couple", "flywheel", "rotational dynamics", "parallel axis theorem",
            "cylinder rolling", "sphere rolling", "angular displacement", "rad s^-1", "rad s^-2",
            "rigid body", "rotational equilibrium"
        ],
        "formulas": [
            r"\bτ\s*=\s*I\s*α\b", r"\bI\s*ω\b", r"\b½\s*I\s*ω\^?2\b", r"\bFr\s*sin\b",
            r"\bmoment\s*of\s*inertia\b"
        ],
        "weight_boost": 1.5,
        "legacy_sources": ["Option B.1"]
    },
    "A.5": {
        "theme": "A",
        "title": "Galilean and Special Relativity",
        "hl_only": True,
        "description": "Inertial frames of reference, Lorentz transformation, time dilation, length contraction, simultaneity, spacetime diagrams, muon decay.",
        "keywords": [
            "special relativity", "relativity", "inertial reference frame", "reference frame",
            "lorentz transformation", "galilean transformation", "gamma factor", "lorentz factor",
            "time dilation", "proper time", "length contraction", "proper length", "simultaneity",
            "spacetime diagram", "worldline", "muon decay", "invariant spacetime interval",
            "twin paradox", "speed of light postulate", "rest frame", "event coordinates"
        ],
        "formulas": [
            r"\bγ\b", r"\b1\s*/\s*√\s*\(\s*1\s*-\s*v\^?2/c\^?2\s*\)", r"\bΔt\s*=\s*γ\s*Δt_?0\b",
            r"\bL\s*=\s*L_?0\s*/\s*γ\b", r"\bspacetime\b"
        ],
        "weight_boost": 1.6,
        "legacy_sources": ["Option A"]
    },

    # Theme B: The Particulate Nature of Matter
    "B.1": {
        "theme": "B",
        "title": "Thermal Energy Transfers",
        "hl_only": False,
        "description": "Internal energy, specific heat capacity, latent heat, phase change, thermal conduction, Stefan-Boltzmann, Wien's displacement law.",
        "keywords": [
            "internal energy", "kelvin", "absolute temperature", "specific heat capacity", "heat capacity",
            "specific latent heat", "latent heat of fusion", "latent heat of vaporization", "phase change",
            "thermal conduction", "thermal conductivity", "stefan-boltzmann", "wien's displacement",
            "wien", "apparent brightness", "black body", "black-body", "emissivity",
            "thermal equilibrium", "rate of heat transfer", "calorimeter", "melting", "boiling",
            "thermal energy", "conduction", "convection", "cooling curve", "temperature difference"
        ],
        "formulas": [
            r"\bmcΔT\b", r"\bmL\b", r"\bσ\s*A\s*T\^?4\b", r"\bλ_?max\s*T\b",
            r"\bL\s*/\s*\(?\s*4π\s*d\^?2\s*\)?\b", r"\bQ\s*=\s*mc\b"
        ],
        "weight_boost": 1.2
    },
    "B.2": {
        "theme": "B",
        "title": "Greenhouse Effect",
        "hl_only": False,
        "description": "Albedo, solar constant, greenhouse gases, infrared absorption, planetary energy balance.",
        "keywords": [
            "greenhouse effect", "greenhouse gas", "greenhouse gases", "albedo", "solar constant",
            "planetary energy balance", "emissivity of earth", "infrared radiation", "infrared absorption",
            "methane", "carbon dioxide", "surface temperature of earth", "radiative balance",
            "re-radiation", "black body radiation of the earth", "global warming"
        ],
        "formulas": [
            r"\balbedo\b", r"\bsolar\s*constant\b", r"\b136[0-8]\s*W\s*m\^-2\b"
        ],
        "weight_boost": 1.4
    },
    "B.3": {
        "theme": "B",
        "title": "Gas Laws",
        "hl_only": False,
        "description": "Pressure, ideal gas law, Boyle's law, Charles's law, Gay-Lussac, root-mean-square speed, average kinetic energy, Avogadro.",
        "keywords": [
            "ideal gas", "ideal gas equation", "boyle's law", "charles's law", "gay-lussac",
            "root-mean-square", "rms speed", "rms velocity", "translational kinetic energy",
            "avogadro constant", "avogadro", "moles", "mole", "molar mass", "kelvin temperature",
            "gas container", "rigid cylinder", "piston", "number of gas molecules", "kinetic theory of gases",
            "ideal gas law", "gas molecules", "gas pressure"
        ],
        "formulas": [
            r"\bPV\s*=\s*nRT\b", r"\bPV\s*=\s*Nk_?BT\b", r"\b3/2\s*k_?BT\b", r"\bc_?rms\b"
        ],
        "weight_boost": 1.3
    },
    "B.4": {
        "theme": "B",
        "title": "Thermodynamics",
        "hl_only": True,
        "description": "First law of thermodynamics, isobaric, isochoric, isothermal, adiabatic processes, P-V diagrams, Carnot cycle, entropy, second law.",
        "keywords": [
            "first law of thermodynamics", "thermodynamics", "isobaric", "isochoric", "isothermal",
            "adiabatic", "p-v diagram", "indicator diagram", "carnot cycle", "carnot engine",
            "carnot efficiency", "thermal efficiency", "entropy", "second law of thermodynamics",
            "heat engine", "working substance", "heat pump", "refrigerator", "work done on gas",
            "work done by gas", "cyclic process"
        ],
        "formulas": [
            r"\bQ\s*=\s*ΔU\s*\+\s*W\b", r"\bPV\^?[γ5/3]\b", r"\bη\s*=\s*1\s*-\s*T_?[Cc]/T_?[Hh]\b",
            r"\bΔS\s*=\s*ΔQ/T\b", r"\bW\s*=\s*P\s*ΔV\b"
        ],
        "weight_boost": 1.5,
        "legacy_sources": ["Option B.2"]
    },
    "B.5": {
        "theme": "B",
        "title": "Current and Circuits",
        "hl_only": False,
        "description": "Electric current, potential difference, EMF, internal resistance, Ohm's law, resistivity, Kirchhoff's laws, potential divider, LDR, thermistor.",
        "keywords": [
            "electric current", "potential difference", "electromotive force", "emf", "internal resistance",
            "terminal potential difference", "ohm's law", "ohmic", "non-ohmic", "resistivity",
            "kirchhoff's first law", "kirchhoff's second law", "kirchhoff", "series resistor",
            "parallel resistor", "potential divider", "potentiometer", "light-dependent resistor",
            "ldr", "thermistor", "ammeter", "voltmeter", "drift speed", "drift velocity",
            "resistor", "circuit", "cell", "electric cell", "internal resistance r"
        ],
        "formulas": [
            r"\bI\s*=\s*Δq/Δt\b", r"\bV\s*=\s*IR\b", r"\bε\s*=\s*I\s*\(?\s*R\s*\+\s*r\s*\)?\b",
            r"\bρ\s*=\s*RA/L\b", r"\bI\s*=\s*nAvq\b", r"\bP\s*=\s*VI\b", r"\bP\s*=\s*I\^?2\s*R\b"
        ],
        "weight_boost": 1.3
    },

    # Theme C: Wave Behaviour
    "C.1": {
        "theme": "C",
        "title": "Simple Harmonic Motion",
        "hl_only": False,
        "description": "Restoring force, acceleration proportional to negative displacement, mass-spring, simple pendulum, phase angle, SHM energy interchange.",
        "keywords": [
            "simple harmonic motion", "shm", "restoring force", "acceleration proportional to displacement",
            "mass-spring", "spring-mass", "simple pendulum", "phase angle", "phase difference",
            "shm energy", "interchange of kinetic and potential energy", "angular frequency of oscillation",
            "period of oscillation", "amplitude of oscillation", "oscillator", "undamped oscillation",
            "periodic motion", "oscillating"
        ],
        "formulas": [
            r"\ba\s*=\s*-\s*ω\^?2\s*x\b", r"\bT\s*=\s*2π\s*√\s*\(?\s*m/k\s*\)?\b",
            r"\bT\s*=\s*2π\s*√\s*\(?\s*L/g\s*\)?\b", r"\bx\s*=\s*x_?0\s*sin\b", r"\bx\s*=\s*x_?0\s*cos\b"
        ],
        "weight_boost": 1.3
    },
    "C.2": {
        "theme": "C",
        "title": "Wave Model",
        "hl_only": False,
        "description": "Transverse and longitudinal waves, wavelength, frequency, period, wave speed, EM spectrum, sound waves, intensity inverse square law.",
        "keywords": [
            "transverse wave", "longitudinal wave", "crest", "trough", "compression", "rarefaction",
            "wavelength", "wave speed", "wave frequency", "period of wave", "electromagnetic spectrum",
            "sound wave", "sound waves", "wavefront", "rays", "intensity of wave", "inverse square law",
            "amplitude of wave", "mechanical wave", "speed of light in vacuum", "displacement-distance graph",
            "displacement-time graph of wave"
        ],
        "formulas": [
            r"\bv\s*=\s*f\s*λ\b", r"\bc\s*=\s*f\s*λ\b", r"\bT\s*=\s*1/f\b", r"\bI\s*∝\s*A\^?2\b",
            r"\bI\s*=\s*P/\(?4πr\^?2\)?\b"
        ],
        "weight_boost": 1.2
    },
    "C.3": {
        "theme": "C",
        "title": "Wave Phenomena",
        "hl_only": False,
        "description": "Refraction, Snell's law, critical angle, total internal reflection, superposition, double-slit interference, single-slit diffraction, diffraction grating.",
        "keywords": [
            "snell's law", "refraction", "refractive index", "critical angle", "total internal reflection",
            "superposition", "interference", "constructive interference", "destructive interference",
            "path difference", "double-slit", "double slit", "young's double slit", "fringe spacing",
            "fringe separation", "single-slit diffraction", "diffraction grating", "grating",
            "diffraction pattern", "central maximum", "secondary maximum", "ray diagram reflection",
            "angle of incidence", "angle of refraction"
        ],
        "formulas": [
            r"\bn_?1\s*sin\s*θ_?1\s*=\s*n_?2\s*sin\s*θ_?2\b", r"\bs\s*=\s*λD/d\b",
            r"\bθ\s*=\s*λ/b\b", r"\bnλ\s*=\s*d\s*sin\s*θ\b", r"\bsin\s*θ_?c\s*=\s*1/n\b"
        ],
        "weight_boost": 1.3
    },
    "C.4": {
        "theme": "C",
        "title": "Standing Waves and Resonance",
        "hl_only": False,
        "description": "Standing waves, nodes, antinodes, boundary conditions in strings and pipes, harmonics, damping, natural frequency, driven resonance.",
        "keywords": [
            "standing wave", "standing waves", "stationary wave", "node", "nodes", "antinode", "antinodes",
            "boundary conditions", "harmonics", "first harmonic", "fundamental frequency",
            "resonant frequency", "resonance", "driven resonance", "damping", "light damping",
            "critical damping", "overdamping", "string fixed at both ends", "pipe open at both ends",
            "pipe closed at one end", "natural frequency of vibration", "quality factor"
        ],
        "formulas": [
            r"\bλ\s*=\s*2L/n\b", r"\bλ\s*=\s*4L/n\b", r"\bf_?1\b", r"\bnode\b", r"\bantinode\b"
        ],
        "weight_boost": 1.4
    },
    "C.5": {
        "theme": "C",
        "title": "Doppler Effect",
        "hl_only": False,
        "description": "Doppler effect for sound and light, redshift, blueshift, moving source, moving observer frequency shift formulas.",
        "keywords": [
            "doppler effect", "doppler shift", "doppler frequency", "moving source", "moving observer",
            "stationary observer", "observer receives sound", "frequency measured by the observer",
            "frequency heard by the observer", "observed frequency", "detected frequency", "emitted frequency",
            "moves towards a stationary observer", "moves away from a stationary observer",
            "moves towards the observer", "moves away from the observer", "source moves with constant velocity",
            "source moves", "source of sound moves", "approaching observer", "receding observer",
            "approaches the observer", "recedes from the observer", "siren", "whistle",
            "redshift", "blueshift", "recessional speed", "apparent frequency", "frequency shift",
            "acoustic doppler", "wavelength shift", "moving towards observer", "moving away from observer",
            "change in observed frequency"
        ],
        "formulas": [
            r"\bΔλ/λ\b", r"\bv/c\b", r"\bf'\s*=\s*f\b", r"\bv\s*/\s*\(\s*v\s*[±+-]\s*u_?[so]\s*\)\b"
        ],
        "weight_boost": 1.7
    },

    # Theme D: Fields
    "D.1": {
        "theme": "D",
        "title": "Gravitational Fields",
        "hl_only": False,
        "description": "Newton's law of gravitation, gravitational field strength, Kepler's third law, gravitational potential, escape speed, orbital mechanics.",
        "keywords": [
            "gravitational field", "newton's law of gravitation", "gravitational force", "gravitational field strength",
            "kepler's third law", "gravitational potential", "gravitational potential energy", "equipotential",
            "escape speed", "escape velocity", "orbital speed", "orbital period", "satellite orbit",
            "geostationary", "circular orbit", "point mass", "spherical mass", "orbit around planet"
        ],
        "formulas": [
            r"\bGMm/r\^?2\b", r"\bg\s*=\s*GM/r\^?2\b", r"\bV_?g\s*=\s*-\s*GM/r\b",
            r"\bT\^?2\s*∝\s*r\^?3\b", r"\b√\s*\(?\s*2GM/r\s*\)?\b", r"\b6\.67\s*×\s*10\^-11\b"
        ],
        "weight_boost": 1.3
    },
    "D.2": {
        "theme": "D",
        "title": "Electric and Magnetic Fields",
        "hl_only": False,
        "description": "Coulomb's law, electric field lines, uniform parallel plates, electric potential, magnetic field lines around wires and solenoids.",
        "keywords": [
            "coulomb's law", "electric field", "electric field strength", "electric field lines",
            "parallel plates", "uniform electric field", "electric potential", "electric potential energy",
            "equipotential line", "magnetic field", "magnetic field lines", "magnetic flux density", "solenoid",
            "straight wire magnetic field", "permittivity of free space", "point charge",
            "direction of magnetic field", "magnetic field around wire", "wire normal to", "wire carrying current"
        ],
        "formulas": [
            r"\bkq_?1q_?2/r\^?2\b", r"\bE\s*=\s*F/q\b", r"\bE\s*=\s*V/d\b", r"\bV_?e\s*=\s*kQ/r\b",
            r"\b8\.99\s*×\s*10\^9\b"
        ],
        "weight_boost": 1.2
    },
    "D.3": {
        "theme": "D",
        "title": "Motion in Electromagnetic Fields",
        "hl_only": False,
        "description": "Lorentz force, charged particles in magnetic fields, magnetic force on current-carrying conductors, parallel conductors, velocity selectors.",
        "keywords": [
            "magnetic force", "lorentz force", "charge in magnetic field", "qvB", "circular path in magnetic field",
            "cyclotron radius", "current-carrying conductor", "current-carrying wire", "BIL",
            "force between parallel wires", "force between parallel conductors", "velocity selector",
            "crossed fields", "mass spectrometer", "right-hand rule", "fleming's left-hand rule",
            "deflection of charge", "helical path", "particle enters a magnetic field",
            "electron enters a magnetic field", "proton enters a magnetic field", "charged particle in a magnetic field",
            "enters a region of uniform magnetic field", "magnetic field into the page", "magnetic field out of the page",
            "path of the electron", "path of the proton", "radius of the circular path", "magnetic force on the charge",
            "magnetic force on the electron"
        ],
        "formulas": [
            r"\bqvB\s*sin\b", r"\bBIL\s*sin\b", r"\bF\s*=\s*qvB\b", r"\bF\s*=\s*BIL\b",
            r"\bv\s*=\s*E/B\b", r"\br\s*=\s*mv/qB\b"
        ],
        "weight_boost": 1.5
    },
    "D.4": {
        "theme": "D",
        "title": "Electromagnetic Induction",
        "hl_only": True,
        "description": "Magnetic flux, flux linkage, Faraday's law of induction, Lenz's law, AC generator, motional EMF, alternating current.",
        "keywords": [
            "electromagnetic induction", "magnetic flux", "magnetic flux linkage", "flux linkage",
            "faraday's law", "faraday", "lenz's law", "lenz", "induced emf", "induced current",
            "ac generator", "alternating current", "motional emf", "rotating coil", "peak voltage",
            "peak current", "rms current", "rms voltage", "eddy currents",
            "magnetic flux through a coil", "rate of change of magnetic flux", "change in magnetic flux",
            "induced electromotive force", "emf is induced", "conducting loop", "conducting rod",
            "coil is rotated in a magnetic field", "variation with time of the induced emf",
            "variation with time of the magnetic flux"
        ],
        "formulas": [
            r"\bΦ\s*=\s*BA\s*cos\b", r"\bN\s*Φ\b", r"\bε\s*=\s*-\s*N\s*ΔΦ/Δt\b",
            r"\bε\s*=\s*BvL\b", r"\bV_?rms\b", r"\bI_?rms\b"
        ],
        "weight_boost": 1.6
    },

    # Theme E: Nuclear and Quantum Physics
    "E.1": {
        "theme": "E",
        "title": "Structure of the Atom",
        "hl_only": False,
        "description": "Rutherford alpha scattering experiment, discrete energy levels, photon emission and absorption, line spectra, nuclear radius, Bohr model quantization.",
        "keywords": [
            "rutherford", "alpha particle scattering", "geiger-marsden", "gold foil experiment",
            "discrete energy levels", "atomic energy levels", "photon emission", "photon absorption",
            "emission spectrum", "absorption spectrum", "line spectrum", "spectral lines",
            "nuclear radius", "bohr model", "angular momentum quantization", "energy level diagram",
            "ground state", "excited state", "ionization energy"
        ],
        "formulas": [
            r"\bE\s*=\s*hf\b", r"\bE\s*=\s*hc/λ\b", r"\bR\s*=\s*R_?0\s*A\^?\(?1/3\)?\b",
            r"\bmvr\s*=\s*nh/2π\b", r"\bhf\s*=\s*E_?2\s*-\s*E_?1\b"
        ],
        "weight_boost": 1.2
    },
    "E.2": {
        "theme": "E",
        "title": "Quantum Physics",
        "hl_only": True,
        "description": "Photoelectric effect, work function, stopping potential, threshold frequency, de Broglie wavelength, Compton scattering, matter waves.",
        "keywords": [
            "photoelectric effect", "photoelectrons", "work function", "threshold frequency",
            "stopping potential", "einstein photoelectric equation", "de broglie", "de broglie wavelength",
            "matter waves", "electron diffraction", "davisson-germer", "compton scattering",
            "compton wavelength", "wave-particle duality", "wave function", "probability density",
            "heisenberg uncertainty principle", "quantum tunnelling"
        ],
        "formulas": [
            r"\bhf\s*=\s*Φ\s*\+\s*E_?k\b", r"\beV_?s\b", r"\bλ\s*=\s*h/p\b",
            r"\bΔλ\s*=\s*\(?h/m_?ec\)?\s*\(?1\s*-\s*cos\s*θ\)?\b", r"\bΔx\s*Δp\b"
        ],
        "weight_boost": 1.4
    },
    "E.3": {
        "theme": "E",
        "title": "Radioactive Decay",
        "hl_only": False,
        "description": "Nuclide notation, isotopes, alpha, beta, gamma radiation, neutrinos, half-life, decay constant, mass defect, binding energy per nucleon.",
        "keywords": [
            "radioactive decay", "alpha decay", "beta decay", "beta minus", "beta plus", "positron",
            "gamma ray", "gamma emission", "neutrino", "antineutrino", "half-life", "decay constant",
            "activity of sample", "becquerel", "mass defect", "binding energy", "binding energy per nucleon",
            "nuclide", "isotope", "unified atomic mass unit", "nuclear stability", "feynman decay"
        ],
        "formulas": [
            r"\bN\s*=\s*N_?0\s*e\^?-\s*λt\b", r"\bA\s*=\s*λN\b", r"\bT_?1/2\s*=\s*ln\s*2/λ\b",
            r"\bE\s*=\s*Δm\s*c\^?2\b", r"\b931\.5\s*MeV\b"
        ],
        "weight_boost": 1.3
    },
    "E.4": {
        "theme": "E",
        "title": "Fission",
        "hl_only": False,
        "description": "Induced nuclear fission, chain reaction, critical mass, nuclear reactor components: moderator, control rods, heat exchanger, radioactive waste.",
        "keywords": [
            "nuclear fission", "fission", "induced fission", "uranium-235", "plutonium-239",
            "chain reaction", "critical mass", "nuclear reactor", "moderator", "thermal neutron",
            "control rods", "boron rods", "cadmium rods", "heat exchanger", "coolant",
            "radioactive waste", "fission fragments", "prompt neutrons"
        ],
        "formulas": [
            r"\b235\s*_?92\s*U\b", r"\b\^?1_0\s*n\b", r"\bchain\s*reaction\b"
        ],
        "weight_boost": 1.4
    },
    "E.5": {
        "theme": "E",
        "title": "Fusion and Stars",
        "hl_only": False,
        "description": "Nuclear fusion in stars, proton-proton chain, hydrostatic equilibrium, Hertzsprung-Russell diagram, stellar evolution, black holes, parallax.",
        "keywords": [
            "nuclear fusion", "fusion", "proton-proton cycle", "stellar evolution", "hertzsprung-russell",
            "h-r diagram", "hr diagram", "main sequence", "red giant", "supergiant", "white dwarf",
            "neutron star", "black hole", "hydrostatic equilibrium", "chandrasekhar limit",
            "oppenheimer-volkoff", "stellar parallax", "parsec", "cepheid variable", "standard candle",
            "hubble's law", "cosmic scale factor", "big bang", "cbr", "cosmic microwave background"
        ],
        "formulas": [
            r"\bd\s*=\s*1/p\b", r"\bv\s*=\s*H_?0\s*d\b", r"\bL\s*=\s*4π\s*d\^?2\s*b\b",
            r"\bproton-proton\b"
        ],
        "weight_boost": 1.4,
        "legacy_sources": ["Option D"]
    }
}

# ==============================================================================
# 2. RETIRED SYLLABUS EXCLUSION FILTER DEFINITIONS
# ==============================================================================

RETIRED_SYLLABUS_RULES = [
    {
        "id": "retired_particle_physics",
        "reason": "Old Topic 7.3: Quarks, Leptons, Mesons, Baryons, Strangeness & Feynman Diagrams removed from 2025 syllabus",
        "keywords": [
            "quark", "quarks", "lepton", "leptons", "hadron", "hadrons", "baryon", "baryons",
            "meson", "mesons", "strangeness", "strange quark", "charm quark", "bottom quark",
            "top quark", "feynman diagram", "feynman diagrams", "higgs boson", "higgs",
            "gluon", "gluons", "w- boson", "w+ boson", "z0 boson", "exchange particle",
            "quark confinement", "colour charge"
        ]
    },
    {
        "id": "retired_capacitance_transformers",
        "reason": "Old Topic 11.2/11.3: Capacitors, RC circuits, Diode bridge rectifiers & Transformers removed from 2025 syllabus",
        "keywords": [
            "capacitance", "capacitor", "capacitors", "dielectric", "rc circuit", "time constant rc",
            "exponential discharge of capacitor", "diode bridge", "bridge rectifier", "full-wave rectification",
            "half-wave rectification", "transformer", "transformers", "step-up transformer",
            "step-down transformer", "primary coil", "secondary coil", "turns ratio"
        ]
    },
    {
        "id": "retired_polarization",
        "reason": "Old Polarization, Malus's Law & Brewster's Angle removed from 2025 syllabus",
        "keywords": [
            "polarization", "polarisation", "polarizer", "polariser", "analyzer", "analyser",
            "malus's law", "malus law", "brewster's angle", "brewster angle", "brewster's law",
            "plane polarized", "plane polarised", "optically active"
        ]
    },
    {
        "id": "retired_legacy_option_c",
        "reason": "Legacy Paper 3 Option C: Imaging, Lenses, Medical Imaging & Fiber Optics removed from 2025 syllabus",
        "keywords": [
            "option c", "converging lens", "diverging lens", "lens formula", "thin lens",
            "focal length of lens", "compound microscope", "astronomical telescope",
            "angular magnification", "simple magnifier", "optical fibre", "optical fiber",
            "attenuation in db", "acoustic impedance", "ultrasound a-scan", "ultrasound b-scan",
            "x-ray attenuation", "mri scan", "nmr imaging"
        ]
    }
]

# ==============================================================================
# 3. CLASSIFICATION ENGINE
# ==============================================================================

@dataclass
class ClassificationResult:
    is_excluded: bool
    exclusion_reason: Optional[str]
    primary_subtopics: List[str]
    scores: Dict[str, float]
    is_pure: bool
    is_mixed: bool
    is_intra_theme: bool
    is_cross_theme: bool
    badge: str
    target_themes: List[str]
    target_subtopics: List[str]

def check_exclusion(text: str, paper_info: Optional[Dict[str, Any]] = None) -> Tuple[bool, Optional[str]]:
    """Check if the text primarily belongs to retired syllabus topics."""
    text_lower = text.lower()
    
    # Check paper 3 option C explicitly
    if paper_info and paper_info.get("option") == "C":
        return True, "Legacy Paper 3 Option C (Imaging) is retired in 2025"

    for rule in RETIRED_SYLLABUS_RULES:
        match_count = 0
        matched_words = []
        for kw in rule["keywords"]:
            pattern = r"\b" + re.escape(kw) + r"\b"
            if re.search(pattern, text_lower):
                match_count += 1
                matched_words.append(kw)
        
        distinct_signatures = [
            "feynman diagram", "higgs boson", "malus's law", "brewster's angle",
            "dielectric", "diode bridge", "step-up transformer", "step-down transformer",
            "compound microscope", "acoustic impedance", "polarizer", "polariser"
        ]
        has_distinct = any(sig in text_lower for sig in distinct_signatures)
        
        if has_distinct or match_count >= 2:
            return True, f"{rule['reason']} (matched: {', '.join(matched_words[:3])})"
            
    return False, None

def classify_physics_question(
    text: str,
    subpart_texts: Optional[List[str]] = None,
    paper_info: Optional[Dict[str, Any]] = None
) -> ClassificationResult:
    """
    Classifies an IB Physics question into 2025 Syllabus Themes and Sub-Topics.
    Detects Pure questions vs Intra-Theme Mixed vs Cross-Theme Synthesis.
    """
    # 1. Check exclusion filter
    is_excl, excl_reason = check_exclusion(text, paper_info)
    if is_excl:
        return ClassificationResult(
            is_excluded=True,
            exclusion_reason=excl_reason,
            primary_subtopics=[],
            scores={},
            is_pure=False,
            is_mixed=False,
            is_intra_theme=False,
            is_cross_theme=False,
            badge="[EXCLUDED: RETIRED]",
            target_themes=[],
            target_subtopics=[]
        )

    # 2. Score text against all 24 subtopics
    scores: Dict[str, float] = {code: 0.0 for code in SUBTOPICS}
    text_lower = text.lower()
    
    # Check Option context from legacy Paper 3
    if paper_info and paper_info.get("option"):
        opt = paper_info["option"]
        if opt == "A":
            scores["A.5"] += 15.0
        elif opt == "B":
            # Option B Engineering: B.1 Rigid Bodies -> A.4, B.2 Thermo -> B.4
            scores["A.4"] += 2.0
            scores["B.4"] += 2.0
        elif opt == "D":
            scores["E.5"] += 15.0

    # Match keywords and formulas
    for code, data in SUBTOPICS.items():
        base_weight = data["weight_boost"]
        # Match keywords
        for kw in data["keywords"]:
            pattern = r"\b" + re.escape(kw) + r"\b"
            matches = len(re.findall(pattern, text_lower))
            if matches > 0:
                word_count = len(kw.split())
                scores[code] += matches * (1.6 * word_count) * base_weight

        # Match formulas
        for f_regex in data["formulas"]:
            if re.search(f_regex, text, re.IGNORECASE):
                scores[code] += 3.5 * base_weight

    # Also evaluate subparts if provided
    subpart_winners = []
    if subpart_texts:
        for sp_text in subpart_texts:
            sp_scores = {code: 0.0 for code in SUBTOPICS}
            sp_lower = sp_text.lower()
            for code, data in SUBTOPICS.items():
                for kw in data["keywords"]:
                    if re.search(r"\b" + re.escape(kw) + r"\b", sp_lower):
                        sp_scores[code] += 1.8 * data["weight_boost"]
            best_sp = max(sp_scores.items(), key=lambda x: x[1])
            if best_sp[1] >= 2.0:
                subpart_winners.append(best_sp[0])

    # 3. Determine primary subtopics and thresholding
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_code, top_score = sorted_scores[0]

    # If top score is essentially zero, assign A.1 as base kinematics default
    if top_score <= 0.5:
        top_code = "A.1"
        top_score = 1.0
        scores["A.1"] = 1.0

    candidates = [top_code]

    # Significant secondary candidates must be >= 2.2 and at least 50% of top score
    secondary_threshold = max(2.2, top_score * 0.50)
    for code, score in sorted_scores[1:]:
        if score >= secondary_threshold and code not in candidates:
            candidates.append(code)

    # Include strong subpart winners (different topics tested in distinct subparts)
    for sw in set(subpart_winners):
        if sw not in candidates and scores[sw] >= 2.0 and scores[sw] >= top_score * 0.40:
            candidates.append(sw)

    # Sort candidates logically
    candidates = sorted(candidates, key=lambda c: (SUBTOPICS[c]["theme"], c))

    # Determine Pure vs Mixed
    is_pure = len(candidates) == 1
    is_mixed = len(candidates) > 1

    candidate_themes = list(dict.fromkeys(SUBTOPICS[c]["theme"] for c in candidates))
    is_intra_theme = is_mixed and len(candidate_themes) == 1
    is_cross_theme = is_mixed and len(candidate_themes) > 1

    # Generate badge
    if is_pure:
        badge = f"[Pure: {candidates[0]}]"
    elif is_intra_theme:
        badge = f"[MIXED: {' + '.join(candidates)}]"
    else:
        badge = f"[SYNTHESIS: {' + '.join(candidates)}]"

    target_themes = candidate_themes
    target_subtopics = candidates

    return ClassificationResult(
        is_excluded=False,
        exclusion_reason=None,
        primary_subtopics=candidates,
        scores=scores,
        is_pure=is_pure,
        is_mixed=is_mixed,
        is_intra_theme=is_intra_theme,
        is_cross_theme=is_cross_theme,
        badge=badge,
        target_themes=target_themes,
        target_subtopics=target_subtopics
    )


if __name__ == "__main__":
    # Test classifier on sample stems
    sample_pure = "A projectile is launched from a cliff of height 45 m with an initial horizontal velocity of 20 m s^-1. Calculate the time of flight."
    res1 = classify_physics_question(sample_pure)
    print("Test 1 (A.1):", res1.badge, res1.primary_subtopics, "Themes:", res1.target_themes)

    sample_mixed_intra = "A block of mass 2.0 kg accelerates along a horizontal surface due to a constant force of 10 N. Friction is 2.0 N. (a) Find the acceleration. (b) Find the kinetic energy after traveling 5.0 m."
    res2 = classify_physics_question(sample_mixed_intra)
    print("Test 2 (A.2 + A.3):", res2.badge, res2.primary_subtopics, "Themes:", res2.target_themes)

    sample_synthesis = "An electron with kinetic energy E moves into a uniform magnetic field of flux density B. The force causes circular motion."
    res3 = classify_physics_question(sample_synthesis)
    print("Test 3 (Synthesis):", res3.badge, res3.primary_subtopics, "Themes:", res3.target_themes)

    sample_excluded = "A proton collides with an antiproton producing a Higgs boson and two strange quarks. Draw a Feynman diagram."
    res4 = classify_physics_question(sample_excluded)
    print("Test 4 (Excluded):", res4.is_excluded, res4.exclusion_reason)
