#!/usr/bin/env python3
"""
chemistry_taxonomy.py
=====================
Defines the 2025 IB Chemistry Curriculum structure (Themes S1–S3, R1–R3, Sub-Topics S1.1–R3.4),
keyword & formula signatures for each sub-topic, legacy Paper 3 Option mappings,
and retired syllabus exclusion filters.
"""

import re
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, field

# ==============================================================================
# 1. 2025 IB CHEMISTRY CURRICULUM DEFINITION (Themes S1–S3, R1–R3)
# ==============================================================================

THEMES = {
    "S1": {
        "title": "Models of the Particulate Nature of Matter",
        "description": "Particulate nature of matter, nuclear atom, electron configurations, the mole, and ideal gases.",
        "color": "#0969da",
        "accent": "rgba(9, 105, 218, 0.12)",
    },
    "S2": {
        "title": "Models of Bonding and Structure",
        "description": "Ionic, covalent, and metallic models, intermolecular forces, giant networks, and materials.",
        "color": "#1f883d",
        "accent": "rgba(31, 136, 61, 0.12)",
    },
    "S3": {
        "title": "Classification of Matter",
        "description": "Periodic table trends, transition elements, and organic functional groups classification.",
        "color": "#8250df",
        "accent": "rgba(130, 80, 223, 0.12)",
    },
    "R1": {
        "title": "What Drives Chemical Reactions?",
        "description": "Measuring enthalpy changes, energy cycles, fuels, and entropy & spontaneity.",
        "color": "#cf222e",
        "accent": "rgba(207, 34, 46, 0.12)",
    },
    "R2": {
        "title": "How Much, How Fast and How Far?",
        "description": "Stoichiometry amounts, rate of chemical change (kinetics), and equilibrium extent.",
        "color": "#d97706",
        "accent": "rgba(217, 119, 6, 0.12)",
    },
    "R3": {
        "title": "What Are the Mechanisms of Chemical Change?",
        "description": "Proton transfer (acids/bases), electron transfer (redox), and electron sharing/pair sharing mechanisms.",
        "color": "#0891b2",
        "accent": "rgba(8, 145, 178, 0.12)",
    }
}

SUBTOPICS = {
    # --------------------------------------------------------------------------
    # Theme S1: Models of the Particulate Nature of Matter
    # --------------------------------------------------------------------------
    "S1.1": {
        "theme": "S1",
        "title": "Introduction to the Particulate Nature of Matter",
        "hl_only": False,
        "description": "Kinetic molecular theory, states of matter, phase changes, heating/cooling curves, mixtures, filtration, distillation, and chromatography.",
        "keywords": [
            "particulate nature", "kinetic molecular theory", "states of matter", "heating curve", "cooling curve",
            "phase change", "melting point", "boiling point", "sublimation", "deposition", "condensation", "freezing",
            "homogeneous mixture", "heterogeneous mixture", "pure substance", "filtration", "distillation",
            "fractional distillation", "paper chromatography", "thin-layer chromatography", "retention factor",
            "rf value", "chromatogram", "stationary phase", "mobile phase", "solubility in water", "miscible"
        ],
        "formulas": [
            r"\bR_?f\b", r"\bkinetic\s+molecular\b", r"\bheating\s+curve\b", r"\bcooling\s+curve\b",
            r"\bhomogeneous\s+mixture\b", r"\bretention\s+factor\b"
        ],
        "weight_boost": 1.2
    },
    "S1.2": {
        "theme": "S1",
        "title": "The Nuclear Atom",
        "hl_only": False,
        "description": "Protons, neutrons, electrons, mass number, atomic number, isotopes, relative atomic mass, and mass spectrometry.",
        "keywords": [
            "proton", "protons", "neutron", "neutrons", "electron", "electrons", "mass number", "atomic number",
            "nucleon number", "isotope", "isotopes", "isotopic abundance", "relative atomic mass", "mass spectrometry",
            "mass spectrometer", "mass-to-charge", "mass/charge", "m/z", "mass spectrum", "abundance of isotopes",
            "relative molecular mass", "vaporization", "ionization in mass spec", "deflection", "atomic symbol"
        ],
        "formulas": [
            r"\bA_?r\b", r"\bm\s*/\s*z\b", r"\bM_?r\b", r"\bisotope\b", r"\bmass\s*spectrom\w+\b"
        ],
        "weight_boost": 1.3
    },
    "S1.3": {
        "theme": "S1",
        "title": "Electron Configurations",
        "hl_only": False,
        "description": "Emission and absorption line spectra, Lyman/Balmer series, orbitals s, p, d, f, Aufbau, Hund, Pauli, and successive ionization energies.",
        "keywords": [
            "electron configuration", "emission spectrum", "absorption spectrum", "line spectrum", "continuous spectrum",
            "lyman series", "balmer series", "paschen series", "ultraviolet radiation", "visible spectrum", "photon energy",
            "ground state", "excited state", "atomic orbital", "s orbital", "p orbital", "d orbital", "f orbital",
            "sublevel", "sub-level", "aufbau principle", "hund's rule", "pauli exclusion", "condensed electron configuration",
            "noble gas core", "successive ionization energies", "first ionization energy", "convergence limit",
            "limit of convergence", "ionization energy jump", "shielding effect", "effective nuclear charge",
            "valence electrons", "energy levels"
        ],
        "formulas": [
            r"\bE\s*=\s*h\s*f\b", r"\bE\s*=\s*hc\s*/\s*λ\b", r"\b1s\^?2\b", r"\b2s\^?2\b", r"\b2p\^?6\b",
            r"\b3d\^?\d+\b", r"\bionization\s*energ\w+\b", r"\baufbau\b"
        ],
        "weight_boost": 1.3
    },
    "S1.4": {
        "theme": "S1",
        "title": "Counting Particles by Mass: The Mole",
        "hl_only": False,
        "description": "Avogadro constant, molar mass, empirical/molecular formulas, combustion analysis, molar concentration, and standard solutions.",
        "keywords": [
            "mole", "moles", "avogadro constant", "avogadro's number", "molar mass", "empirical formula",
            "molecular formula", "combustion analysis", "percentage composition", "percentage by mass", "elemental analysis",
            "standard solution", "volumetric flask", "molar concentration", "mol dm^-3", "mol dm⁻³", "serial dilution",
            "concentration of solution", "avogadro's law", "molar gas volume", "dm^3 mol^-1", "mass of one mole",
            "number of particles"
        ],
        "formulas": [
            r"\bn\s*=\s*m\s*/\s*M\b", r"\bc\s*=\s*n\s*/\s*V\b", r"\b6\.02\s*×\s*10\^?23\b",
            r"\bempirical\s*formula\b", r"\bmolar\s*mass\b"
        ],
        "weight_boost": 1.2
    },
    "S1.5": {
        "theme": "S1",
        "title": "Ideal Gases",
        "hl_only": False,
        "description": "Boyle, Charles, Gay-Lussac gas laws, combined gas equation, PV = nRT, and real gas deviations at low T / high P.",
        "keywords": [
            "ideal gas", "ideal gas equation", "ideal gas law", "boyle's law", "charles's law", "gay-lussac",
            "combined gas equation", "combined gas law", "real gas", "deviations from ideal behavior",
            "deviations from ideal gas", "high pressure and low temperature", "gas particles negligible volume",
            "intermolecular forces negligible", "universal gas constant", "gas constant 8.31", "pressure and volume",
            "kelvin temperature scale", "absolute temperature", "gas syringe"
        ],
        "formulas": [
            r"\bPV\s*=\s*nRT\b", r"\bP_?1\s*V_?1\s*/\s*T_?1\b", r"\bideal\s*gas\b", r"\breal\s*gas\b",
            r"\b8\.31\b"
        ],
        "weight_boost": 1.4
    },

    # --------------------------------------------------------------------------
    # Theme S2: Models of Bonding and Structure
    # --------------------------------------------------------------------------
    "S2.1": {
        "theme": "S2",
        "title": "The Ionic Model",
        "hl_only": False,
        "description": "Cations, anions, polyatomic ions, giant ionic lattice, lattice enthalpy, electrical conductivity, and solubility.",
        "keywords": [
            "ionic bond", "ionic bonding", "ionic compound", "ionic lattice", "giant ionic lattice",
            "cation", "anion", "polyatomic ion", "polyatomic ions", "electrostatic attraction",
            "lattice enthalpy", "volatility", "electrical conductivity molten", "conduct electricity when molten",
            "electrical conductivity aqueous", "brittleness", "cleavage planes", "ionic radius", "ionic charge",
            "magnesium oxide lattice", "sodium chloride lattice"
        ],
        "formulas": [
            r"\bionic\s*bond\w*\b", r"\bionic\s*lattice\b", r"\blattice\s*enthalpy\b",
            r"\bpolyatomic\s*ion\w*\b", r"\belectrostatic\s*attraction\b"
        ],
        "weight_boost": 1.2
    },
    "S2.2": {
        "theme": "S2",
        "title": "The Covalent Model",
        "hl_only": False,
        "description": "Lewis structures, octet rule, VSEPR geometry, bond polarity, intermolecular forces, resonance, formal charge, and hybridization.",
        "keywords": [
            "covalent bond", "covalent bonding", "octet rule", "lewis structure", "lewis formula", "electron dot structure",
            "single covalent bond", "double bond", "triple bond", "bond length", "bond strength", "coordinate bond",
            "dative bond", "dative covalent", "vsepr theory", "electron domain geometry", "molecular geometry",
            "linear", "trigonal planar", "tetrahedral", "trigonal pyramidal", "bent", "trigonal bipyramidal",
            "octahedral", "see-saw", "t-shaped", "square planar", "square pyramidal", "bond angle",
            "electronegativity difference", "bond polarity", "dipole moment", "polar molecule", "non-polar molecule",
            "london dispersion forces", "van der waals", "dipole-dipole attraction", "hydrogen bonding", "hydrogen bond",
            "resonance structure", "resonance hybrid", "formal charge", "delocalization of electrons",
            "delocalised electrons", "benzene delocalization", "hybridization", "hybridisation", "sp3", "sp2", "sp",
            "sigma bond", "pi bond"
        ],
        "formulas": [
            r"\blewis\s*structure\b", r"\bvsepr\b", r"\bhybridization\b", r"\bhybridisation\b",
            r"\bformal\s*charge\b", r"\bsigma\s*bond\b", r"\bpi\s*bond\b", r"\bresonance\b",
            r"\belectron\s*domain\b"
        ],
        "weight_boost": 1.3
    },
    "S2.3": {
        "theme": "S2",
        "title": "The Metallic Model",
        "hl_only": False,
        "description": "Delocalized sea of electrons, malleability, ductility, thermal and electrical conductivity, and alloys.",
        "keywords": [
            "metallic bond", "metallic bonding", "metallic lattice", "delocalized electrons", "delocalised electrons",
            "sea of electrons", "positive metal ions", "cations in a sea", "malleability", "malleable", "ductility",
            "ductile", "electrical conductivity of metals", "thermal conductivity", "alloy", "alloys", "brass",
            "bronze", "steel", "interstitial alloy", "substitutional alloy", "strength of metallic bond"
        ],
        "formulas": [
            r"\bmetallic\s*bond\w*\b", r"\bsea\s*of\s*electrons\b", r"\balloy\b",
            r"\bmalleab(le|ility)\b", r"\bductil(e|ity)\b"
        ],
        "weight_boost": 1.4
    },
    "S2.4": {
        "theme": "S2",
        "title": "From Models to Materials",
        "hl_only": False,
        "description": "Bonding triangle, van Arkel-Ketelaar diagram, giant covalent networks (diamond, graphite, graphene, SiO2, fullerenes), and addition polymers.",
        "keywords": [
            "bonding triangle", "van arkel-ketelaar", "van arkel", "electronegativity difference and average",
            "giant covalent", "network covalent", "macromolecular", "allotropes of carbon", "diamond", "graphite",
            "graphene", "silicon dioxide", "sio2", "fullerene", "fullerenes", "buckminsterfullerene", "c60",
            "carbon nanotube", "nanotubes", "polymer", "polymers", "addition polymerization", "addition polymerisation",
            "repeating unit", "monomer", "polyethene", "polythene", "polyvinyl chloride", "pvc", "polypropene"
        ],
        "formulas": [
            r"\bvan\s*arkel\b", r"\bbonding\s*triangle\b", r"\bgraphene\b", r"\bgiant\s*covalent\b",
            r"\baddition\s*polymeri[sz]ation\b", r"\brepeating\s*unit\b", r"\bmonomer\b", r"\bfullerene\b"
        ],
        "weight_boost": 1.4,
        "legacy_sources": ["Option A"]
    },

    # --------------------------------------------------------------------------
    # Theme S3: Classification of Matter
    # --------------------------------------------------------------------------
    "S3.1": {
        "theme": "S3",
        "title": "The Periodic Table: Classification of Elements",
        "hl_only": False,
        "description": "Periods, groups, s/p/d/f blocks, atomic/ionic radii, ionization energy and electronegativity trends, Group 1/17, Period 3 oxides, and transition elements.",
        "keywords": [
            "periodic table", "periodicity", "group 1", "alkali metals", "group 17", "halogens", "halide ions",
            "noble gases", "transition metals", "transition elements", "s-block", "p-block", "d-block", "f-block",
            "atomic radius", "ionic radius", "first ionization energy trend", "electron affinity",
            "electronegativity trend", "period 3 oxides", "acidic oxide", "basic oxide", "amphoteric oxide",
            "aluminium oxide", "variable oxidation states", "complex ion", "complex ions", "coordination number",
            "ligand", "ligands", "monodentate", "bidentate", "polydentate", "d-orbital splitting", "crystal field",
            "coloured complexes", "colored complexes", "absorption of visible light", "complementary colour",
            "spectrophotometry", "colorimetry", "catalytic properties of transition metals"
        ],
        "formulas": [
            r"\bperiodic\s*table\b", r"\belectron\s*affinity\b", r"\bperiod\s*3\s*oxide\b",
            r"\bcomplex\s*ion\b", r"\btransition\s*metal\b", r"\bd-orbital\b", r"\bligand\w*\b"
        ],
        "weight_boost": 1.3
    },
    "S3.2": {
        "theme": "S3",
        "title": "Functional Groups: Classification of Organic Compounds",
        "hl_only": False,
        "description": "Homologous series, IUPAC nomenclature, structural/stereoisomerism (cis-trans, chiral enantiomers), IR spectroscopy, 1H NMR, and mass spec fragmentation.",
        "keywords": [
            "homologous series", "functional group", "functional groups", "empirical formula", "molecular formula",
            "structural formula", "displayed formula", "skeletal formula", "iupac name", "iupac nomenclature",
            "alkane", "alkene", "alkyne", "halogenoalkane", "alcohol", "aldehyde", "ketone", "carboxylic acid",
            "ester", "amine", "amide", "nitrile", "ether", "arene", "benzene ring", "primary secondary tertiary",
            "structural isomerism", "positional isomer", "functional group isomer", "stereoisomerism", "cis-trans",
            "e/z isomerism", "chiral center", "asymmetric carbon", "enantiomers", "optical isomerism", "polarimeter",
            "plane-polarized light", "infrared spectroscopy", "ir spectrum", "wavenumber", "cm^-1", "1h nmr",
            "nuclear magnetic resonance", "chemical shift", "ppm", "tetramethylsilane", "tms", "integration trace",
            "spin-spin splitting", "doublet", "triplet", "quartet", "multiplet", "mass spectrometry fragmentation",
            "molecular ion peak", "m/z peak", "loss of m/z"
        ],
        "formulas": [
            r"\bhomologous\s*series\b", r"\biupac\b", r"\bfunctional\s*group\b", r"\bskeletal\s*formula\b",
            r"\bchiral\b", r"\benantiomer\b", r"\b1h\s*nmr\b", r"\binfrared\b", r"\bchemical\s*shift\b",
            r"\bwavenumber\b"
        ],
        "weight_boost": 1.3,
        "legacy_sources": ["Topic 11.3", "Topic 21.1"]
    },

    # --------------------------------------------------------------------------
    # Theme R1: What Drives Chemical Reactions?
    # --------------------------------------------------------------------------
    "R1.1": {
        "theme": "R1",
        "title": "Measuring Enthalpy Changes",
        "hl_only": False,
        "description": "Exothermic vs endothermic, enthalpy profile diagrams, activation energy, standard enthalpy of combustion/formation, and calorimetry (q = mcΔT).",
        "keywords": [
            "enthalpy change", "enthalpy changes", "exothermic", "endothermic", "enthalpy profile diagram",
            "activation energy", "standard enthalpy change", "standard conditions", "standard state",
            "standard enthalpy of combustion", "standard enthalpy of formation", "calorimetry", "calorimeter",
            "specific heat capacity", "q = mcΔT", "heat capacity", "temperature change", "heat loss errors",
            "polystyrene cup calorimeter", "combustion of alcohol", "heat released", "heat absorbed"
        ],
        "formulas": [
            r"\bq\s*=\s*mcΔT\b", r"\bΔH\^?⦵?_?[cf]\b", r"\benthalpy\s*profile\b",
            r"\bcalorimet\w+\b", r"\bexothermic\b", r"\bendothermic\b"
        ],
        "weight_boost": 1.2
    },
    "R1.2": {
        "theme": "R1",
        "title": "Energy Cycles in Reactions",
        "hl_only": False,
        "description": "Hess's law, enthalpy cycles, bond enthalpies, Born-Haber cycles, lattice enthalpy, enthalpy of hydration and solution.",
        "keywords": [
            "hess's law", "hess law", "enthalpy cycle", "hess cycle", "bond enthalpy", "average bond enthalpy",
            "bond dissociation energy", "bonds broken minus bonds formed", "breaking bonds endothermic",
            "making bonds exothermic", "born-haber cycle", "born haber", "lattice enthalpy", "enthalpy of atomization",
            "atomisation", "electron affinity in born-haber", "enthalpy of hydration", "enthalpy of solution",
            "dissolving ionic solid"
        ],
        "formulas": [
            r"\bhess('s)?\s*law\b", r"\bbond\s*enthalp\w+\b", r"\bborn-haber\b",
            r"\blattice\s*enthalpy\b", r"\bΔH_?(sol|hyd|at)\b"
        ],
        "weight_boost": 1.3
    },
    "R1.3": {
        "theme": "R1",
        "title": "Energy from Fuels",
        "hl_only": False,
        "description": "Complete/incomplete combustion, fossil fuels, biofuels, ethanol, hydrogen fuel cells, specific energy and energy density.",
        "keywords": [
            "fuel", "fuels", "fossil fuel", "fossil fuels", "crude oil", "petroleum", "octane rating",
            "combustion of fuels", "incomplete combustion", "carbon monoxide toxicity", "soot formation",
            "biofuel", "biofuels", "bioethanol", "biodiesel", "renewable energy fuel", "hydrogen fuel cell",
            "fuel cell", "proton exchange membrane", "specific energy", "energy density", "carbon footprint",
            "efficiency of fuel"
        ],
        "formulas": [
            r"\bspecific\s*energy\b", r"\benergy\s*density\b", r"\bfuel\s*cell\b",
            r"\bbiofuel\b", r"\bbioethanol\b"
        ],
        "weight_boost": 1.4,
        "legacy_sources": ["Option C"]
    },
    "R1.4": {
        "theme": "R1",
        "title": "Entropy and Spontaneity",
        "hl_only": True,
        "description": "Standard entropy, ΔS, Gibbs free energy (ΔG = ΔH - TΔS), spontaneity criteria, and ΔG = -RT ln K.",
        "keywords": [
            "entropy", "standard entropy", "delta s", "ΔS", "disorder", "degrees of freedom", "increase in entropy",
            "decrease in entropy", "gibbs free energy", "gibbs energy", "delta g", "ΔG", "spontaneous reaction",
            "spontaneity", "feasible reaction", "feasibility", "non-spontaneous", "spontaneous at all temperatures",
            "temperature at which reaction becomes spontaneous", "gibbs free energy change and equilibrium",
            "delta g = -rt ln k", "ΔG = -RT ln K"
        ],
        "formulas": [
            r"\bΔG\^?⦵?\b", r"\bΔS\^?⦵?\b", r"\bΔG\s*=\s*ΔH\s*-\s*TΔS\b",
            r"\bΔG\^?⦵?\s*=\s*-RT\s*ln\s*K\b", r"\bentropy\b", r"\bgibbs\b"
        ],
        "weight_boost": 1.5
    },

    # --------------------------------------------------------------------------
    # Theme R2: How Much, How Fast and How Far?
    # --------------------------------------------------------------------------
    "R2.1": {
        "theme": "R2",
        "title": "How Much? The Amount of Chemical Change",
        "hl_only": False,
        "description": "Stoichiometric equations, limiting and excess reactants, theoretical and percentage yield, atom economy, and back titrations.",
        "keywords": [
            "stoichiometry", "stoichiometric equation", "balanced chemical equation", "mole ratio",
            "limiting reactant", "limiting reagent", "excess reactant", "excess reagent", "theoretical yield",
            "experimental yield", "percentage yield", "atom economy", "back titration", "titration calculation",
            "volume of gas stoichiometry", "reacting masses", "reacting volumes", "gravimetric analysis"
        ],
        "formulas": [
            r"\blimiting\s*reactant\b", r"\bpercentage\s*yield\b", r"\batom\s*economy\b",
            r"\bback\s*titration\b", r"\btheoretical\s*yield\b"
        ],
        "weight_boost": 1.3
    },
    "R2.2": {
        "theme": "R2",
        "title": "How Fast? The Rate of Chemical Change",
        "hl_only": False,
        "description": "Rate of reaction, collision theory, Maxwell-Boltzmann curves, catalysts, rate equations, reaction order, mechanism, and Arrhenius equation.",
        "keywords": [
            "rate of reaction", "reaction rate", "collision theory", "collision frequency", "activation energy in kinetics",
            "successful collisions", "maxwell-boltzmann distribution", "kinetic energy distribution", "effect of concentration",
            "effect of temperature on rate", "effect of surface area", "catalyst", "catalysts", "homogeneous catalyst",
            "heterogeneous catalyst", "rate equation", "rate expression", "rate = k", "order of reaction",
            "zero order", "first order", "second order", "rate constant", "units of rate constant", "reaction mechanism",
            "elementary step", "rate-determining step", "reaction intermediate", "molecularity", "arrhenius equation",
            "arrhenius plot", "ln k vs 1/t", "frequency factor", "pre-exponential factor A"
        ],
        "formulas": [
            r"\brate\s*=\s*k\b", r"\barrhenius\b", r"\bln\s*k\b", r"\bmaxwell-boltzmann\b",
            r"\brate-determining\s*step\b", r"\border\s*of\s*reaction\b"
        ],
        "weight_boost": 1.3
    },
    "R2.3": {
        "theme": "R2",
        "title": "How Far? The Extent of Chemical Change",
        "hl_only": False,
        "description": "Dynamic equilibrium, reversible reactions, equilibrium constant Kc, reaction quotient Q, Le Chatelier's principle, and ICE tables.",
        "keywords": [
            "dynamic equilibrium", "chemical equilibrium", "reversible reaction", "closed system",
            "equilibrium constant", "Kc expression", "reaction quotient", "Q vs Kc", "position of equilibrium",
            "le chatelier's principle", "le chatelier", "effect of pressure on equilibrium",
            "effect of temperature on equilibrium", "effect of concentration on equilibrium", "haber process",
            "contact process", "ice table", "equilibrium concentrations", "homogeneous equilibrium"
        ],
        "formulas": [
            r"\bK_?c\b", r"\ble\s*chatelier\b", r"\bequilibrium\s*constant\b",
            r"\breaction\s*quotient\b", r"\bice\s*table\b"
        ],
        "weight_boost": 1.3
    },

    # --------------------------------------------------------------------------
    # Theme R3: What Are the Mechanisms of Chemical Change?
    # --------------------------------------------------------------------------
    "R3.1": {
        "theme": "R3",
        "title": "Proton Transfer Reactions",
        "hl_only": False,
        "description": "Brønsted-Lowry acids/bases, conjugate pairs, pH scale, Kw, titrations, pH curves, Ka, Kb, pKa, pKb, salt hydrolysis, indicators, and buffer solutions.",
        "keywords": [
            "bronsted-lowry", "bronsted lowry", "acid", "base", "proton donor", "proton acceptor",
            "conjugate acid", "conjugate base", "conjugate acid-base pair", "amphiprotic", "amphoteric",
            "strong acid", "weak acid", "strong base", "weak base", "ph scale", "ph calculation", "ionic product of water",
            "kw", "acid-base titration", "titration curve", "ph curve", "equivalence point", "end point",
            "half-equivalence point", "ka", "kb", "pka", "pkb", "acid dissociation constant",
            "base dissociation constant", "salt hydrolysis", "acidic salt", "basic salt", "buffer solution",
            "acidic buffer", "basic buffer", "buffer capacity", "acid-base indicator", "pkin", "indicator color change"
        ],
        "formulas": [
            r"\bpH\s*=\s*-log\b", r"\bK_?w\b", r"\bK_?[ab]\b", r"\bpK_?[ab]\b",
            r"\bbronsted-lowry\b", r"\bbuffer\s*solution\b", r"\btitration\s*curve\b", r"\bpH\s*curve\b"
        ],
        "weight_boost": 1.3
    },
    "R3.2": {
        "theme": "R3",
        "title": "Electron Transfer Reactions",
        "hl_only": False,
        "description": "Redox, oxidation numbers, oxidizing/reducing agents, half-equations, Winkler method, voltaic cells, electrolytic cells, SHE, Ecell, and electrolysis calculations.",
        "keywords": [
            "oxidation", "reduction", "redox", "oxidation state", "oxidation number", "oxidizing agent",
            "oxidising agent", "reducing agent", "half-equation", "redox titration", "winkler method",
            "biochemical oxygen demand", "bod", "voltaic cell", "galvanic cell", "electrochemical cell",
            "anode", "cathode", "salt bridge", "cell diagram", "electrolytic cell", "electrolysis",
            "molten electrolyte", "aqueous electrolyte", "standard electrode potential", "standard hydrogen electrode",
            "she", "electrochemical series", "cell potential", "ecell", "delta g = -nfe", "faraday constant",
            "q = it", "electroplating", "activity series"
        ],
        "formulas": [
            r"\boxidation\s*state\b", r"\bhalf-equation\b", r"\bvoltaic\s*cell\b",
            r"\belectroly(tic|sis)\b", r"\bE\^?⦵?\b", r"\bstandard\s*electrode\s*potential\b",
            r"\bwinkler\b", r"\bQ\s*=\s*It\b"
        ],
        "weight_boost": 1.3
    },
    "R3.3": {
        "theme": "R3",
        "title": "Electron Sharing Reactions",
        "hl_only": False,
        "description": "Homolytic fission, free radicals, photochemical free-radical substitution of alkanes with halogens (initiation, propagation, termination).",
        "keywords": [
            "homolytic fission", "free radical", "free radicals", "photochemical", "initiation step",
            "propagation step", "termination step", "halogenation of alkanes", "free-radical substitution",
            "chlorine radical", "uv light in substitution", "chlorination of methane", "bromination of ethane",
            "photochemical chlorination"
        ],
        "formulas": [
            r"\bhomolytic\s*fission\b", r"\bfree\s*radical\b", r"\binitiation\b",
            r"\bpropagation\b", r"\btermination\b", r"\bfree-radical\s*substitution\b"
        ],
        "weight_boost": 1.5
    },
    "R3.4": {
        "theme": "R3",
        "title": "Electron-Pair Sharing Reactions",
        "hl_only": False,
        "description": "Heterolytic fission, nucleophilic substitution (SN1/SN2), electrophilic addition to alkenes, Markovnikov's rule, benzene nitration, and carbonyl reductions.",
        "keywords": [
            "heterolytic fission", "nucleophile", "nucleophiles", "electrophile", "electrophiles",
            "nucleophilic substitution", "sn1 mechanism", "sn2 mechanism", "curly arrow", "curly arrows",
            "carbocation intermediate", "transition state in substitution", "steric hindrance",
            "inversion of configuration", "retention of configuration", "electrophilic addition",
            "markovnikov's rule", "carbocation stability", "halogenation of alkenes", "hydration of alkenes",
            "hydrogenation", "electrophilic substitution", "nitration of benzene", "nitronium ion", "no2+",
            "reduction of carbonyl", "sodium borohydride", "nabh4", "lithium aluminium hydride", "lialh4",
            "reduction of aldehyde", "reduction of ketone", "reduction of carboxylic acid", "lewis acid",
            "lewis base", "electron pair donor", "electron pair acceptor"
        ],
        "formulas": [
            r"\bS_?N[12]\b", r"\bnucleophil(e|ic)\b", r"\belectrophil(e|ic)\b",
            r"\bmarkovnikov\b", r"\bcurly\s*arrow\b", r"\bcarbocation\b",
            r"\bNaBH_?4\b", r"\bLiAlH_?4\b", r"\blewis\s*(acid|base)\b"
        ],
        "weight_boost": 1.4
    }
}

# ==============================================================================
# 2. RETIRED SYLLABUS EXCLUSION FILTER DEFINITIONS
# ==============================================================================

RETIRED_SYLLABUS_RULES = [
    {
        "id": "retired_biochemistry",
        "reason": "Legacy Paper 3 Option B (Biochemistry) removed from 2025 syllabus",
        "keywords": [
            "option b", "amino acid", "amino acids", "protein structure", "polypeptide chain",
            "alpha helix", "beta pleated sheet", "beta-pleated", "enzyme", "enzymes", "active site of enzyme",
            "michaelis-menten", "vmax", "km value", "enzyme inhibition", "competitive inhibition",
            "non-competitive inhibition", "lipid", "lipids", "triglyceride", "triglycerides", "phospholipid",
            "iodine number", "iodine value", "carbohydrate", "carbohydrates", "monosaccharide", "disaccharide",
            "polysaccharide", "glucose", "fructose", "sucrose", "starch", "glycogen", "cellulose",
            "vitamin a", "vitamin c", "vitamin d", "vitamins", "nucleic acid", "nucleic acids",
            "dna structure", "rna structure", "nucleotide", "nucleotides", "base pairing", "adenine",
            "thymine", "cytosine", "guanine", "uracil", "double helix", "denaturation of protein"
        ]
    },
    {
        "id": "retired_medicinal_chemistry",
        "reason": "Legacy Paper 3 Option D (Medicinal Chemistry) removed from 2025 syllabus",
        "keywords": [
            "option d", "therapeutic window", "therapeutic index", "bioavailability", "aspirin",
            "salicylic acid", "penicillin", "beta-lactam ring", "beta-lactam", "antibiotic resistance",
            "opiate", "opiates", "morphine", "codeine", "diamorphine", "heroin", "antacid", "antacids",
            "ranitidine", "omeprazole", "antiviral", "antivirals", "oseltamivir", "zanamivir", "tamiflu",
            "relenza", "viral replication", "hiv virus", "aids virus", "chiral auxiliary", "taxol",
            "paclitaxel", "nuclear medicine", "radiotherapy", "targeted alpha therapy", "boron neutron capture",
            "technetium-99m", "radioisotope in medicine"
        ]
    },
    {
        "id": "retired_materials_energy_specials",
        "reason": "Legacy Option A/C specialized topics (superconductors, liquid crystals, DSSC, zeolites) removed from 2025 syllabus",
        "keywords": [
            "superconductor", "superconductors", "superconductivity", "critical temperature tc", "meissner effect",
            "bcs theory", "liquid crystal", "liquid crystals", "nematic phase", "thermotropic", "lyotropic",
            "liquid crystal display", "zeolite", "zeolites", "catalytic cracking with zeolite",
            "dye-sensitized solar cell", "dssc", "gratzel cell", "ruthenium dye", "photovoltaic cell efficiency"
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

    # Check Paper 3 explicit Option headers
    if paper_info and paper_info.get("option"):
        opt = str(paper_info["option"]).upper()
        if opt == "B":
            return True, "Legacy Paper 3 Option B (Biochemistry) is retired in 2025"
        elif opt == "D":
            return True, "Legacy Paper 3 Option D (Medicinal Chemistry) is retired in 2025"

    distinct_signatures = [
        "michaelis-menten", "beta-lactam ring", "beta-lactam", "therapeutic window", "therapeutic index",
        "taxol", "paclitaxel", "chiral auxiliary", "superconductor", "superconductivity",
        "liquid crystal", "nematic phase", "dye-sensitized solar cell", "dssc", "gratzel cell",
        "alpha helix", "beta pleated", "amino acid", "penicillin", "aspirin", "morphine",
        "diamorphine", "heroin", "ranitidine", "omeprazole", "tamiflu", "zanamivir",
        "targeted alpha therapy", "boron neutron capture", "technetium-99m", "iodine number",
        "triglyceride", "phospholipid"
    ]
    for sig in distinct_signatures:
        if sig in text_lower:
            return True, f"Retired syllabus topic (matched: {sig})"

    for rule in RETIRED_SYLLABUS_RULES:
        match_count = 0
        matched_words = []
        for kw in rule["keywords"]:
            pattern = r"\b" + re.escape(kw) + r"\b"
            if re.search(pattern, text_lower):
                match_count += 1
                matched_words.append(kw)

        if match_count >= 2:
            return True, f"{rule['reason']} (matched: {', '.join(matched_words[:3])})"

    return False, None

def classify_chemistry_question(
    text: str,
    subpart_texts: Optional[List[str]] = None,
    paper_info: Optional[Dict[str, Any]] = None
) -> ClassificationResult:
    """
    Classifies an IB Chemistry question into 2025 Syllabus Themes (S1-S3, R1-R3) and Sub-Topics (S1.1-R3.4).
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

    # 2. Score text against all 22 subtopics
    scores: Dict[str, float] = {code: 0.0 for code in SUBTOPICS}
    text_lower = text.lower()

    # Check Option context from legacy Paper 3
    if paper_info and paper_info.get("option"):
        opt = paper_info["option"].upper()
        if opt == "A":
            # Materials -> S2.4
            scores["S2.4"] += 6.0
        elif opt == "C":
            # Energy -> R1.3
            scores["R1.3"] += 6.0

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

    # Evaluate subparts if provided
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

    # No clear syllabus signal: leave it out rather than dumping it into a default topic
    if top_score < 1.5:
        return ClassificationResult(
            is_excluded=True,
            exclusion_reason="Unclassified: no clear syllabus keyword match",
            primary_subtopics=[],
            scores=scores,
            is_pure=False,
            is_mixed=False,
            is_intra_theme=False,
            is_cross_theme=False,
            badge="[UNCLASSIFIED]",
            target_themes=[],
            target_subtopics=[]
        )

    candidates = [top_code]

    # Significant secondary candidates must be >= 2.2 and at least 50% of top score
    secondary_threshold = max(2.2, top_score * 0.50)
    for code, score in sorted_scores[1:]:
        if score >= secondary_threshold and code not in candidates:
            candidates.append(code)

    # Include strong subpart winners
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
    sample_pure = "Calculate the molar mass of an unknown gas which has a density of 1.43 g dm^-3 at standard temperature and pressure using PV = nRT."
    res1 = classify_chemistry_question(sample_pure)
    print("Test 1 (S1.5):", res1.badge, res1.primary_subtopics, "Themes:", res1.target_themes)

    sample_bonding = "Draw the Lewis structure of sulfur tetrafluoride, SF4. Predict the electron domain geometry and the molecular geometry using VSEPR theory."
    res2 = classify_chemistry_question(sample_bonding)
    print("Test 2 (S2.2):", res2.badge, res2.primary_subtopics, "Themes:", res2.target_themes)

    sample_mixed = "A 25.0 cm^3 sample of 0.100 mol dm^-3 ethanoic acid is titrated with 0.100 mol dm^-3 sodium hydroxide. (a) Calculate the pH at the equivalence point. (b) Explain why a buffer solution forms when 12.5 cm^3 of NaOH is added."
    res3 = classify_chemistry_question(sample_mixed)
    print("Test 3 (R3.1):", res3.badge, res3.primary_subtopics, "Themes:", res3.target_themes)

    sample_synthesis = "Compound X has the molecular formula C4H8O. The infrared spectrum shows a strong absorption at 1720 cm^-1. Reaction with NaBH4 produces compound Y, which undergoes nucleophilic substitution."
    res4 = classify_chemistry_question(sample_synthesis)
    print("Test 4 (Synthesis S3.2 + R3.4):", res4.badge, res4.primary_subtopics, "Themes:", res4.target_themes)

    sample_excluded = "Explain how the secondary structure of a protein is maintained by hydrogen bonds between amino acid residues in an alpha helix."
    res5 = classify_chemistry_question(sample_excluded)
    print("Test 5 (Excluded):", res5.is_excluded, res5.exclusion_reason)
