'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Award, FileText, CheckCircle2, AlertCircle,
  ExternalLink, ChevronRight, BookOpen, Sparkles, Filter, Download,
  BookMarked, Eye, School, GraduationCap
} from 'lucide-react';
import IBBookletViewerModal from '@/app/components/IBBookletViewerModal';
import IBCommandTermsModal from '@/app/components/IBCommandTermsModal';
import IBPDFViewerModal, { EE_VAULT_DOCUMENTS } from '@/app/components/IBPDFViewerModal';

interface RubricCriterion {
  code: string;
  name: string;
  score: number;
  maxScore: number;
  comment: string;
  pdfPage?: number;
}

interface Exemplar {
  id: string;
  title: string;
  subject: string;
  level: 'HL' | 'SL';
  type: 'IA' | 'EE';
  score: string;
  grade: '7' | 'A';
  wordCount: number;
  researchQuestion: string;
  summary: string;
  keyTechniques: string[];
  rubricBreakdown: RubricCriterion[];
  examinerNotes: string;
  pitfallsAvoided: string[];
  rvTopicLink: string;
  rvTopicName: string;
  isRealStudentPdf?: boolean;
  pdfDocId?: string;
  pdfPage?: number;
  sourceSchool?: string;
}

const EXEMPLARS: Exemplar[] = [
  // 1. Math AA HL - Real Sevenoaks Prized EE
  {
    id: 'sevenoaks-math-vectors',
    title: 'A Vector Approach to 3D Reconstruction from Multiple 2D Views',
    subject: 'Mathematics AA',
    level: 'HL',
    type: 'EE',
    score: '34 / 34 (Grade A)',
    grade: 'A',
    wordCount: 3980,
    researchQuestion: 'How can vector algebra and projective camera matrices be utilized to construct an algorithm capable of reconstructing 3D spatial coordinates from multiple 2D camera perspectives, as validated via a Rubik\'s Cube demonstration in Wolfram Mathematica?',
    summary: 'A published Sevenoaks School Extended Essay formulating a complete photogrammetry algorithm from first principles. Formalizes the pinhole camera projection matrix, derives epipolar geometry lines, uses vector cross products to establish ray coplanarity, and tests reconstruction precision against a physical Rubik\'s Cube with Wolfram Mathematica code.',
    keyTechniques: [
      'Pinhole Camera Geometry & Perspective Projection Matrix',
      'Vector Cross Product Ray Coplanarity Constraints',
      'Epipolar Geometry & Essential Matrix Estimation',
      'Rubik\'s Cube Multi-Angle Photogrammetry Calibration',
      'Wolfram Mathematica Demonstration Algorithm (Included in Appendix)'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Focus and Method', score: 6, maxScore: 6, pdfPage: 123, comment: 'Crisp research question with immediate practical relevance to computer vision. Rigorous mathematical formulation from base cases to general 3D reconstruction.' },
      { code: 'B', name: 'Knowledge and Understanding', score: 6, maxScore: 6, pdfPage: 125, comment: 'Exceptional grasp of linear algebra, matrix transformations, and 3D coordinate systems extending significantly beyond syllabus limits.' },
      { code: 'C', name: 'Critical Thinking', score: 12, maxScore: 12, pdfPage: 128, comment: 'Superb analysis of error propagation caused by pixel quantization and optical lens distortion when matching 2D feature coordinates.' },
      { code: 'D', name: 'Presentation', score: 4, maxScore: 4, pdfPage: 132, comment: 'Flawless academic typography, vector ray diagrams, numbered equations, and complete commented Mathematica script in the appendix.' },
      { code: 'E', name: 'Engagement (RPPF)', score: 6, maxScore: 6, pdfPage: 135, comment: 'Supervisor noted profound personal passion and resilience: started from dense computer vision papers and successfully developed an accessible base-case model.' }
    ],
    examinerNotes: 'Sevenoaks School Prized Extended Essay 2015. Supervisor Charley Openshaw & Senior Examiner praised this paper as an exemplary synthesis of rigorous vector mathematics and creative algorithmic implementation.',
    pitfallsAvoided: [
      'Avoided black-box photogrammetry software—built the complete vector transformation equations from scratch.',
      'Did not ignore real-world sensor inaccuracies: quantified pixel coordinate measurement uncertainty.',
      'Maintained clear narrative flow between mathematical derivations and physical Rubik\'s cube empirical tests.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/geometry-trigonometry/',
    rvTopicName: '3D Vectors & Line Geometry (AA HL)',
    isRealStudentPdf: true,
    pdfDocId: 'sevenoaks',
    pdfPage: 123,
    sourceSchool: 'Sevenoaks School Prized Writing Collection (p. 123)'
  },

  // 2. Math AA HL - Epidemic Modeling IA
  {
    id: 'math-aa-hl-sir',
    title: 'Numerical Modeling of Epidemic Dynamics using Modified SIR Differential Equations',
    subject: 'Mathematics AA',
    level: 'HL',
    type: 'IA',
    score: '20 / 20',
    grade: '7',
    wordCount: 3950,
    researchQuestion: 'How accurately can a discretized Susceptible-Infectious-Recovered (SIR) coupled differential equation model predict the trajectory of influenza infection rates when parameterized via fourth-order Runge-Kutta (RK4) numerical integration?',
    summary: 'An exploration that starts from fundamental first-order ODEs, builds the theoretical framework of basic reproduction number (R0), applies Euler\'s forward method to highlight numerical instability and truncation error, and develops a Python-verified RK4 implementation against real epidemiological datasets with parameter sensitivity analysis.',
    keyTechniques: [
      'Coupled First-Order Differential Equations',
      'Euler Method vs. 4th-Order Runge-Kutta (RK4)',
      'Jacobian Matrix & Eigenvalue Stability Analysis',
      'Nonlinear Least-Squares Parameter Estimation',
      'Global Sensitivity Analysis & Truncation Bounds'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Presentation', score: 4, maxScore: 4, comment: 'Flawless document structure. Clear narrative arc, consistent KaTeX math formatting, numbered equations, and legible phase portraits.' },
      { code: 'B', name: 'Mathematical Communication', score: 4, maxScore: 4, comment: 'Precise notation throughout. Variables defined prior to use. Differential operators and discretized indices clearly distinguished.' },
      { code: 'C', name: 'Personal Engagement', score: 3, maxScore: 3, comment: 'Genuine curiosity demonstrated through writing custom numerical code rather than using black-box calculators. Addressed anomalies in real data.' },
      { code: 'D', name: 'Reflection', score: 3, maxScore: 3, comment: 'Substantive analysis of step-size selection (h), numerical convergence limits, and epidemiological assumptions (homogeneous mixing).' },
      { code: 'E', name: 'Use of Mathematics', score: 6, maxScore: 6, comment: 'Demonstrates deep mastery of HL calculus well beyond standard syllabus: derived local truncation errors and stability criteria.' }
    ],
    examinerNotes: 'This investigation represents the gold standard of Mathematics AA HL work. The student did not simply present formulas from a textbook; they explained why first-order Euler failed due to stiff behavior and systematically justified the need for RK4. The reflection is continuous rather than relegated to an afterthought conclusion.',
    pitfallsAvoided: [
      'Avoided the "textbook regurgitation" trap by conducting original numerical simulations.',
      'Did not hide mathematical discrepancies in the data fit—actively explained underlying demographic reasons.',
      'Kept text tightly within the 12-20 page guideline without padding.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-math/analysis-and-approaches-hl/questionbank/calculus-one/',
    rvTopicName: 'Differential Equations & Calculus (AA HL)'
  },

  // 3. Chemistry HL - Real Sevenoaks Prized EE
  {
    id: 'sevenoaks-chem-heavy-metals',
    title: 'Are Chinese Medicines Safe? Heavy Metals in Patent Herbal Medicines',
    subject: 'Chemistry',
    level: 'HL',
    type: 'EE',
    score: '33 / 34 (Grade A)',
    grade: 'A',
    wordCount: 3950,
    researchQuestion: 'To what extent do commercially available Chinese patent herbal medicines exceed World Health Organization (WHO) and Chinese Pharmacopoeia safety thresholds for toxic heavy metals (lead, arsenic, mercury) when analyzed via Inductively Coupled Plasma Optical Emission Spectroscopy (ICP-OES) and mercury sulfide precipitation?',
    summary: 'A published Sevenoaks School Extended Essay investigating heavy metal contamination in five commercial Chinese herbal patent medicines. Compares open-vessel concentrated nitric acid digestion with microwave-assisted digestion, quantifies lead and arsenic concentrations via ICP-OES, and performs quantitative gravimetric sulfide precipitation for mercury.',
    keyTechniques: [
      'Inductively Coupled Plasma Optical Emission Spectroscopy (ICP-OES)',
      'Wet Acid Digestion (HNO3) vs. Microwave Digestion Comparison',
      'Gravimetric Quantitative Precipitation of Mercury Sulphide (HgS)',
      'Calibration Curve Linear Regression & Limit of Detection (LOD)',
      'Toxicological Risk Assessment against WHO & Chinese Pharmacopoeia Limits'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Focus and Method', score: 6, maxScore: 6, pdfPage: 231, comment: 'Clear, compelling public health research question. Rigorous lab safety precautions when handling toxic heavy metals and concentrated acids.' },
      { code: 'B', name: 'Knowledge and Understanding', score: 6, maxScore: 6, pdfPage: 233, comment: 'Deep understanding of atomic emission transitions, plasma ionization mechanics, and precipitation equilibria.' },
      { code: 'C', name: 'Critical Thinking', score: 11, maxScore: 12, pdfPage: 236, comment: 'Exemplary critical reflection on the limitations of nitric acid digestion compared to microwave bombs for refractory mineral residues.' },
      { code: 'D', name: 'Presentation', score: 4, maxScore: 4, pdfPage: 240, comment: 'Standard IUPAC nomenclature, accurate uncertainty budgets with instrumental tolerances, and professional chemical data tables.' },
      { code: 'E', name: 'Engagement (RPPF)', score: 6, maxScore: 6, pdfPage: 242, comment: 'Candidate demonstrated immense laboratory resilience through multiple failed precipitations before mastering sulfide stoichiometric control.' }
    ],
    examinerNotes: 'Sevenoaks School Prized Extended Essay 2015. Author Laura Lau conducted university-grade analytical chemistry. Examiner highlighted the sophisticated discussion of organic matrix interferences in emission spectroscopy.',
    pitfallsAvoided: [
      'Avoided assuming full digestion—systematically checked for unreacted insoluble organic residues.',
      'Did not rely solely on spectroscopy—validated mercury levels via classical gravimetric sulfide chemistry.',
      'Evaluated real human intake doses rather than quoting raw parts-per-million figures in isolation.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
    rvTopicName: 'Analytical Chemistry & Spectroscopy (Chemistry HL)',
    isRealStudentPdf: true,
    pdfDocId: 'sevenoaks',
    pdfPage: 231,
    sourceSchool: 'Sevenoaks School Prized Writing Collection (p. 231)'
  },

  // 4. Physics HL - Viscosity IA
  {
    id: 'physics-hl-viscosity',
    title: 'Temperature Dependence of Dynamic Viscosity in Newtonian Liquids via Stokes\' Law',
    subject: 'Physics',
    level: 'HL',
    type: 'IA',
    score: '24 / 24',
    grade: '7',
    wordCount: 2980,
    researchQuestion: 'How does the temperature of analytical grade glycerol (278 K to 348 K) affect its dynamic viscosity, as determined by the terminal velocity of precision steel spheres and evaluated against the Andrade and Vogel-Fulcher-Tammann (VFT) models?',
    summary: 'A laboratory investigation measuring terminal fall velocity of high-tolerance chrome steel spheres in a thermostatic water bath column. Uses high-speed video photogrammetry (240 fps) to confirm terminal velocity onset, applies Faxén wall boundary corrections, and evaluates activation energy of viscous flow.',
    keyTechniques: [
      'Stokes\' Drag Law & Faxén Wall Effect Corrections',
      'High-Speed Video Analysis (240 fps, Tracker)',
      'Arrhenius-Andrade Exponential Linearization',
      'Compound Instrumental & Systematic Uncertainty Propagation',
      'Vogel-Fulcher-Tammann (VFT) Non-Arrhenius Curve Fitting'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Personal Engagement', score: 2, maxScore: 2, comment: 'Designed custom heating jacket with thermal insulation to eliminate convection currents. Identified Reynolds number limits.' },
      { code: 'B', name: 'Exploration', score: 4, maxScore: 4, comment: 'Thoroughly justified temperature range and liquid choice. Methodically controlled glycerol hygroscopic absorption.' },
      { code: 'C', name: 'Analysis', score: 6, maxScore: 6, comment: 'Exemplary uncertainty propagation: incorporated balance tolerance, micrometer zero error, digital thermometer drift, and boundary effects.' },
      { code: 'D', name: 'Evaluation', score: 6, maxScore: 6, comment: 'Directly compared experimental activation energy (Ea = 54.2 ± 1.8 kJ/mol) with literature values. Proposed pragmatic apparatus improvements.' },
      { code: 'E', name: 'Communication', score: 4, maxScore: 4, comment: 'Graphs feature comprehensive axis labels, SI units, both error bars in x and y, and worst-acceptable-fit lines.' }
    ],
    examinerNotes: 'The standout feature of this investigation is the rigorous treatment of fluid dynamics boundaries. Most students ignore wall friction and turbulent drag; this candidate calculated the Reynolds number (Re < 0.1) to prove laminar flow and applied Faxén\'s correction factors.',
    pitfallsAvoided: [
      'Did not assume constant density with temperature—measured glycerol expansion curve.',
      'Accounted for video parallax error with an submerged reference scale.',
      'Plotted both min and max lines of best fit to determine experimental uncertainty gradient.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-physics/questionbank/',
    rvTopicName: 'Fluids & Classical Mechanics (Physics HL)'
  },

  // 5. Biology HL - Real Sevenoaks Prized EE
  {
    id: 'sevenoaks-bio-lemur',
    title: 'Canopy Stratification & Tree Use in Propithecus Coquereli in Northwest Madagascar',
    subject: 'Biology',
    level: 'HL',
    type: 'EE',
    score: '34 / 34 (Grade A)',
    grade: 'A',
    wordCount: 3970,
    researchQuestion: 'To what extent are Coquerel\'s sifakas (Propithecus coquereli) selective in their tree use based on tree height and crown volume in the dry deciduous forest of Mariarano, Northwest Madagascar, and what are the conservation implications for this critically endangered species?',
    summary: 'A published Sevenoaks School Extended Essay conducted during ecological fieldwork in Madagascar. Systematically samples 150+ forest plots, calculates tree height and diameter at breast height (DBH), records diurnal lemur positioning, and applies Chi-square goodness-of-fit and Ivlev\'s electivity index to prove significant canopy preference.',
    keyTechniques: [
      'Ecological Point-Quarter Vegetation Transect Sampling',
      'Chi-Square Goodness-of-Fit & Jacobs Electivity Index',
      'Canopy Stratification & Microclimate Insolation Profiling',
      'Habitat Fragmentation & Anthropogenic Disturbance Analysis',
      'Field GPS Mapping & Statistical Hypothesis Testing'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Focus and Method', score: 6, maxScore: 6, pdfPage: 67, comment: 'Authentic conservation biology research question. Highly rigorous field sampling protocol minimizing observational bias.' },
      { code: 'B', name: 'Knowledge and Understanding', score: 6, maxScore: 6, pdfPage: 69, comment: 'Comprehensive ecological context: thermoregulation, predator avoidance, and floristic composition of dry deciduous forests.' },
      { code: 'C', name: 'Critical Thinking', score: 12, maxScore: 12, pdfPage: 72, comment: 'Evaluated the subtle confounding factors of seasonal deciduous leaf-drop and food availability on tree selection.' },
      { code: 'D', name: 'Presentation', score: 4, maxScore: 4, pdfPage: 76, comment: 'Superb statistical graphs, maps of Mariarano forest reserves, and thorough citations adhering to APA format.' },
      { code: 'E', name: 'Engagement (RPPF)', score: 6, maxScore: 6, pdfPage: 78, comment: 'Candidate reflected on the physical and logistical hurdles of field conservation and the critical importance of primary ecological data.' }
    ],
    examinerNotes: 'Sevenoaks School Prized Extended Essay 2015. Author Ale Baranowski demonstrated field ecological methods rarely seen before postgraduate studies. Examiner awarded maximum marks across all rubrics.',
    pitfallsAvoided: [
      'Avoided anecdotal observational notes—used quantitative transect protocols and random quadrat sampling.',
      'Controlled for tree species availability vs actual animal preference using electivity indices.',
      'Discussed the impact of human deforestation directly linked to the biological findings.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-biology/questionbank/',
    rvTopicName: 'Ecology, Natural Selection & Conservation (Biology HL)',
    isRealStudentPdf: true,
    pdfDocId: 'sevenoaks',
    pdfPage: 67,
    sourceSchool: 'Sevenoaks School Prized Writing Collection (p. 67)'
  },

  // 6. Economics HL - Real Sevenoaks Prized EE
  {
    id: 'sevenoaks-econ-rupee',
    title: 'Depreciation of the Indian Rupee against the US Dollar and US Federal Reserve Tapering',
    subject: 'Economics',
    level: 'HL',
    type: 'EE',
    score: '33 / 34 (Grade A)',
    grade: 'A',
    wordCount: 3990,
    researchQuestion: 'To what extent can the sharp depreciation of the Indian rupee against the U.S. dollar, from 22nd May 2013 to the end of 2013, be attributed to US Federal Reserve monetary policy announcements regarding Quantitative Easing tapering?',
    summary: 'A published Sevenoaks School Extended Essay analyzing international macroeconomics and currency markets. Weighed external shocks (Ben Bernanke\'s "Taper Tantrum" announcement) against domestic Indian vulnerabilities (widening Current Account Deficit, inflation differential, and capital outflows) using econometric charts and open-economy IS-LM-BP balance-of-payments models.',
    keyTechniques: [
      'Uncovered Interest Rate Parity (UIP) & Capital Flight Dynamics',
      'Current Account Deficit (CAD) & Foreign Institutional Inflow (FII) Analysis',
      'Reserve Bank of India (RBI) Foreign Exchange Intervention Evaluation',
      'Mundell-Fleming Open Economy Macroeconomic Modeling',
      'Counterfactual Multi-Variable Economic Assessment'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Focus and Method', score: 6, maxScore: 6, pdfPage: 203, comment: 'Focused macroeconomic research question anchored in a precise temporal window (May-December 2013). High quality macroeconomic data series.' },
      { code: 'B', name: 'Knowledge and Understanding', score: 6, maxScore: 6, pdfPage: 205, comment: 'Nuanced understanding of monetary transmission channels, carry trade unwinding, and foreign exchange reserves.' },
      { code: 'C', name: 'Critical Thinking', score: 11, maxScore: 12, pdfPage: 208, comment: 'Refused to adopt a single-cause explanation: systematically disentangled the Federal Reserve shock from India\'s structural fiscal and trade deficits.' },
      { code: 'D', name: 'Presentation', score: 4, maxScore: 4, pdfPage: 212, comment: 'Clean macroeconomic diagrams, properly indexed time-series graphs with clear event tags, and impeccable referencing.' },
      { code: 'E', name: 'Engagement (RPPF)', score: 6, maxScore: 6, pdfPage: 214, comment: 'Supervisor noted intellectual maturity in dealing with fluctuating macroeconomic indicators and complex global monetary policy.' }
    ],
    examinerNotes: 'Sevenoaks School Prized Extended Essay 2015. Author Max Kitson constructed an exceptionally sophisticated evaluation comparing external Fed announcements with domestic structural weaknesses.',
    pitfallsAvoided: [
      'Did not oversimplify currency drops as purely domestic incompetence or purely foreign malice.',
      'Diagrams were drawn with specific shift magnitudes and labeled with exact 2013 exchange rates (54 to 68 INR/USD).',
      'Evaluated short-run currency volatility versus long-run macroeconomic stabilization policies.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-economics/questionbank/',
    rvTopicName: 'International Economics & Exchange Rates (Economics HL)',
    isRealStudentPdf: true,
    pdfDocId: 'sevenoaks',
    pdfPage: 203,
    sourceSchool: 'Sevenoaks School Prized Writing Collection (p. 203)'
  },

  // 7. Visual Arts - Real Sevenoaks Prized EE
  {
    id: 'sevenoaks-art-jin-mao',
    title: 'Architecture of the Jin Mao Tower: Chinese vs. Western Influences',
    subject: 'Visual Arts',
    level: 'HL',
    type: 'EE',
    score: '34 / 34 (Grade A)',
    grade: 'A',
    wordCount: 3950,
    researchQuestion: 'Do the design and appearance of the Jin Mao Tower in Shanghai draw more heavily on traditional Chinese architectural paradigms or Western International Style skyscraper influences?',
    summary: 'A published Sevenoaks School Extended Essay examining high-modernist architectural engineering and cultural semiotics. Based on on-site fieldwork at the Longhua Temple pagoda complex and the Jin Mao Tower itself, the candidate evaluates structural engineering, tiered setback proportions, rhythmic references to the number 8, and modern curtain-wall aesthetics.',
    keyTechniques: [
      'Formal Architectural Analysis (Form, Space, Surface, Rhythm)',
      'Comparative Site Fieldwork (Longhua Pagoda vs. SOM Jin Mao Tower)',
      'Proportional Analysis & Traditional Chinese Pagoda Setbacks',
      'Cultural Semiotics of Feng Shui and Numerology in Architecture',
      'Structural Engineering Evaluation of High-Wind Modern Super-Tall Buildings'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Focus and Method', score: 6, maxScore: 6, pdfPage: 5, comment: 'Clear, elegant architectural research question investigated through both primary site observations and structural literature.' },
      { code: 'B', name: 'Knowledge and Understanding', score: 6, maxScore: 6, pdfPage: 7, comment: 'Superb command of architectural terminology, traditional Dougong wooden brackets, and modern steel-concrete core designs.' },
      { code: 'C', name: 'Critical Thinking', score: 12, maxScore: 12, pdfPage: 10, comment: 'Masterful synthesis: concluded that while the outward skin and structural skeleton are Western engineering, the spatial rhythm and cultural soul are deeply Chinese.' },
      { code: 'D', name: 'Presentation', score: 4, maxScore: 4, pdfPage: 14, comment: 'Photographic documentation of site visits, detailed comparative elevations, and flawless academic citations.' },
      { code: 'E', name: 'Engagement (RPPF)', score: 6, maxScore: 6, pdfPage: 16, comment: 'Supervisor Charley Openshaw highlighted the student\'s passionate personal exploration and coolly disciplined analysis of monumental form.' }
    ],
    examinerNotes: 'Sevenoaks School Prized Extended Essay 2015. Author Rory Alexander demonstrated mature architectural critique that impressed both senior examiners and university architecture faculties.',
    pitfallsAvoided: [
      'Avoided superficial tourist praise—analyzed the actual structural mechanics and material textures.',
      'Supported assertions with direct visual evidence from on-site visits rather than stock internet photos.',
      'Balanced symbolic cultural meanings with genuine engineering constraints of typhoon winds.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-history/',
    rvTopicName: 'Cultural Analysis & Architecture',
    isRealStudentPdf: true,
    pdfDocId: 'sevenoaks',
    pdfPage: 5,
    sourceSchool: 'Sevenoaks School Prized Writing Collection (p. 5)'
  },

  // 8. Chemistry HL - Spectrophotometry Kinetics IA
  {
    id: 'chem-hl-kinetics',
    title: 'Spectrophotometric Determination of Activation Energy in the Peroxydisulfate-Iodide Reaction',
    subject: 'Chemistry',
    level: 'HL',
    type: 'IA',
    score: '23 / 24',
    grade: '7',
    wordCount: 3100,
    researchQuestion: 'What is the activation energy of the oxidation of iodide ions by peroxydisulfate (S2O8^2- + 2I- -> 2SO4^2- + I2) when determined spectrophotometrically via triiodide absorbance at 350 nm across 293 K to 328 K?',
    summary: 'A physical chemistry investigation tracking triiodide formation continuously using a Vernier spectrophotometer at 350 nm instead of the traditional manual starch visual endpoint. Employs the method of initial rates, Beer-Lambert calibration curves, and linear Arrhenius modeling (ln k vs 1/T) with error bounds.',
    keyTechniques: [
      'Continuous UV-Vis Spectrophotometry (350 nm)',
      'Beer-Lambert Law Calibration & Extinction Coefficient Determination',
      'Method of Initial Rates (Initial Tangent Slopes)',
      'Linear Arrhenius Modeling with Fractional Uncertainty',
      'Ionic Strength Control using Spectator Electrolytes (KNO3)'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Personal Engagement', score: 2, maxScore: 2, comment: 'Transformed an imprecise color-change experiment into quantitative continuous spectrophotometry to eliminate human reaction time delay.' },
      { code: 'B', name: 'Exploration', score: 4, maxScore: 4, comment: 'Kept ionic strength constant with inert electrolyte KNO3 to prevent salt-effect kinetic deviations. Comprehensive safety risk analysis.' },
      { code: 'C', name: 'Analysis', score: 6, maxScore: 6, comment: 'Clear conversion of raw absorbance voltage into concentration-time slopes. Calculated slope uncertainty via box method.' },
      { code: 'D', name: 'Evaluation', score: 5, maxScore: 6, comment: 'Activation energy calculated as 51.4 kJ/mol vs 53.0 kJ/mol literature (3% discrepancy). Discussed slight cuvette thermal dissipation.' },
      { code: 'E', name: 'Communication', score: 4, maxScore: 4, comment: 'Flawless IUPAC chemical naming, standard thermodynamic state symbols, and clear tabulations with uncertainties.' }
    ],
    examinerNotes: 'Superb transition from qualitative clock reaction to continuous absorption spectroscopy. Controlling ionic strength is an HL topic that showed true subject competence. The candidate\'s reflection on thermal equilibration time in the cuvette earned top marks.',
    pitfallsAvoided: [
      'Avoided the subjective human error of "when does the blue color first appear".',
      'Maintained constant ionic strength across concentration variations.',
      'Included thermometer calibration offset and instrument resolution in combined uncertainty.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-chemistry/questionbank/',
    rvTopicName: 'Chemical Kinetics & Arrhenius Law (Chemistry HL)'
  },

  // 9. Biology HL - Osmosis & Water Potential IA
  {
    id: 'bio-hl-osmosis',
    title: 'Quantitative Plasmolysis & Water Potential in Allium Cepa Epidermal Cells',
    subject: 'Biology',
    level: 'HL',
    type: 'IA',
    score: '23 / 24',
    grade: '7',
    wordCount: 2850,
    researchQuestion: 'How does increasing sodium chloride solute concentration (0.0 M to 1.0 M) quantitatively alter the incipient plasmolysis percentage and computed internal water potential of red onion (Allium cepa var. aggregatum) inner epidermal cells?',
    summary: 'A cell biology investigation examining 500+ cells under light microscopy across 6 concentration levels (5 replicates each). Quantifies protoplast retraction using ImageJ micrometry, calculates incipient plasmolysis (50% contraction threshold) through probit logistic regression, and calculates solute potential via the van \'t Hoff relation.',
    keyTechniques: [
      'High-Replication Cellular Sampling (n = 150 cells per treatment)',
      'Digital Micrograph Measurement via ImageJ Scale Calibration',
      'Probit / Sigmoidal Logistic Curve Fitting for Incipient Plasmolysis',
      'Van \'t Hoff Equation for Solute Potential: Ψs = -iCRT',
      'Two-Way ANOVA & Standard Deviation Precision Analysis'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Personal Engagement', score: 2, maxScore: 2, comment: 'Used red onion to leverage natural anthocyanin vacuolar pigmentation without needing artificial dye that might disrupt membrane permeability.' },
      { code: 'B', name: 'Exploration', score: 4, maxScore: 4, comment: 'Controlled for peel thickness, incubation duration (25 min equilibrium), and osmotic shock. Sample size was statistically robust.' },
      { code: 'C', name: 'Analysis', score: 6, maxScore: 6, comment: 'Sigmoidal regression enabled precise interpolation of 50% plasmolysis at 0.385 M NaCl. Standard deviation error bars plotted.' },
      { code: 'D', name: 'Evaluation', score: 5, maxScore: 6, comment: 'Thorough discussion of cell wall elasticity and non-ideal osmotic reflection coefficient. Proposed sucrose comparison.' },
      { code: 'E', name: 'Communication', score: 4, maxScore: 4, comment: 'Clear micrographs with scale bars, high-resolution graphs, and well-structured biological discussion.' }
    ],
    examinerNotes: 'A classic topic elevated to perfection through sample size and quantitative precision. Instead of simply saying "cells shrank", the candidate calculated exact percentage plasmolysis with digital image processing and determined the cellular water potential with statistical confidence intervals.',
    pitfallsAvoided: [
      'Avoided small sample sizes—analyzed over 750 individual cells to ensure statistical significance.',
      'Did not use potato cylinders (prone to surface drying and blotted weight errors).',
      'Maintained temperature equilibrium to ensure validity of van \'t Hoff factor.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-biology/questionbank/',
    rvTopicName: 'Membrane Transport & Osmosis (Biology HL)'
  },

  // 10. Economics HL - Microeconomics Portfolio IA
  {
    id: 'econ-hl-portfolio',
    title: 'Evaluating the Microeconomic Effectiveness of Singapore’s Carbon Tax Escalation on Industrial Emissions',
    subject: 'Economics',
    level: 'HL',
    type: 'IA',
    score: '43 / 45',
    grade: '7',
    wordCount: 2380,
    researchQuestion: 'To what extent does Singapore’s carbon tax increase from $5 to $25 per tonne of CO2e incentivize technological abatement among large industrial emitters while avoiding carbon leakage?',
    summary: 'A commentary on a real Straits Times economic article analyzing market failure (negative externalities of production). Synthesizes welfare loss triangles, price elasticity of demand for energy-intensive sectors, the deadweight loss reduction, and government revenue recycling mechanisms.',
    keyTechniques: [
      'Negative Production Externality Market Failure Modeling (MSC > MPC)',
      'Deadweight Loss & Social Optimum Welfare Triangles',
      'Price Elasticity of Demand (PED) & Cross-Elasticity of Abatement',
      'Evaluation of Market-Based Taxes vs. Command-and-Control Regulations',
      'Stakeholder Impact Matrix: Emitters, Consumers, Government, Environment'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Diagrams', score: 3, maxScore: 3, comment: 'Hand-drawn, ruler-perfect diagrams with fully shaded welfare loss triangles, shifts clearly indicated with directional arrows.' },
      { code: 'B', name: 'Terminology', score: 2, maxScore: 2, comment: 'Flawless economic lexicon: marginal external cost (MEC), pigouvian tax, allocative efficiency, carbon leakage.' },
      { code: 'C', name: 'Application & Analysis', score: 3, maxScore: 3, comment: 'Directly applied real-world figures from the Singapore budget to the theoretical curves; explained why inelastic demand limits short-run switching.' },
      { code: 'D', name: 'Key Concept Linkage', score: 3, maxScore: 3, comment: 'Seamless integration of the Key Concept of "Sustainability" and "Intervention" throughout the commentary.' },
      { code: 'E', name: 'Evaluation', score: 3, maxScore: 3, comment: 'Balanced critique: short-run regressive cost pass-through vs long-run green R&D subsidies, concluding with conditional effectiveness.' }
    ],
    examinerNotes: 'This portfolio commentary avoids the number one mistake in IB Economics: spending too much space summarizing the article. The candidate moves directly into microeconomic analysis within the first sentence and evaluates with genuine stakeholder trade-offs.',
    pitfallsAvoided: [
      'Did not waste words summarizing the article—quoted only key data points directly in analysis.',
      'Diagrams were customized with Singapore-specific price levels and tax values ($25/t), not generic P1/Q1.',
      'Evaluation was nuanced with short-run vs long-run horizons.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-economics/questionbank/',
    rvTopicName: 'Market Failure & Externalities (Economics HL)'
  },

  // 11. History HL - Schlieffen Plan IA
  {
    id: 'history-hl-schlieffen',
    title: 'Von Moltke’s Modifications and the Failure of the Schlieffen Plan in 1914',
    subject: 'History',
    level: 'HL',
    type: 'IA',
    score: '24 / 25',
    grade: '7',
    wordCount: 2190,
    researchQuestion: 'To what extent were Helmuth von Moltke the Younger\'s tactical modifications the primary cause for the failure of the German Schlieffen Plan at the Battle of the Marne in September 1914?',
    summary: 'A historiographical investigation evaluating Gerhard Ritter\'s thesis that Moltke fatally weakened the decisive right wing versus Terence Zuber\'s revisionist claim that no rigid master plan ever existed. Critically evaluates source values and limitations from Moltke\'s military diaries and British reconnaissance records.',
    keyTechniques: [
      'OPCVL Source Analysis (Origin, Purpose, Content, Value, Limitation)',
      'Comparative Historiography (Traditionalist Ritter vs. Revisionist Zuber)',
      'Tactical Logistics & Railhead Bottleneck Analysis',
      'Synthesis of Military Operational Orders with Diplomatic Contingency'
    ],
    rubricBreakdown: [
      { code: '1', name: 'Identification & Evaluation of Sources', score: 6, maxScore: 6, comment: 'Selected two contrasting primary sources: Moltke\'s wartime letters and French General Joffre\'s orders. Evaluated with acute historical context.' },
      { code: '2', name: 'Investigation', score: 14, maxScore: 15, comment: 'Balanced, highly structured argument. Weighed right-wing troop diversion against Belgian rail sabotage and Russian mobilization speed.' },
      { code: '3', name: 'Reflection', score: 4, maxScore: 4, comment: 'Profound reflection on the limitations facing military historians: post-war German Reichsarchiv document destruction in 1945.' }
    ],
    examinerNotes: 'Outstanding historical analysis. Rather than offering a simplistic "Moltke was incompetent" narrative, the candidate evaluated logistical transport limits: German infantry walked 40 km a day beyond their supply lines. The reflection on surviving archival evidence is masterclass level.',
    pitfallsAvoided: [
      'Avoided purely narrative battle descriptions—focused strictly on causal analysis and logistics.',
      'Did not use formulaic OPCVL bullet points—integrated source evaluations naturally within analytical paragraphs.',
      'Reflection addressed the historian\'s method and source survival, not personal feelings about writing the paper.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-history/',
    rvTopicName: 'Historical Investigation & Causes of War'
  },

  // 12. Physics HL - Chladni Plates EE
  {
    id: 'ee-physics-chladni',
    title: 'Acoustic Resonance & Chladni Nodal Patterns on Two-Dimensional Thin Elastic Plates',
    subject: 'Physics',
    level: 'HL',
    type: 'EE',
    score: '33 / 34 (Grade A)',
    grade: 'A',
    wordCount: 3980,
    researchQuestion: 'How does varying plate boundary geometry (square vs. circular) and thickness influence the resonant eigenfrequencies and nodal line distributions of fine silica particles on vibrated aluminum plates as predicted by the Kirchhoff-Love plate theory?',
    summary: 'An Extended Essay investigating two-dimensional standing waves using a precision frequency generator and mechanical wave driver. Formulates Biharmonic differential equations (∇⁴w = 0), matches experimental nodal geometries against Bessel function zero roots, and explores damping dissipation.',
    keyTechniques: [
      'Biharmonic Plate Differential Equation: D ∇⁴ w + ρ h (∂²w / ∂t²) = 0',
      'Bessel Function Zero-Root Boundary Solutions for Circular Plates',
      'Acoustic Wave Driver Laser Tachometer Verification',
      'High-Resolution Silica Particle Nodal Imaging',
      'Kirchhoff-Love Thin Elastic Plate Theory'
    ],
    rubricBreakdown: [
      { code: 'A', name: 'Focus and Method', score: 6, maxScore: 6, comment: 'Clear, focused research question grounded in continuum mechanics. Systematic methodology with high-resolution digital imaging.' },
      { code: 'B', name: 'Knowledge and Understanding', score: 6, maxScore: 6, comment: 'Exceptional comprehension of boundary value conditions and elastic plate stiffness parameters.' },
      { code: 'C', name: 'Critical Thinking', score: 11, maxScore: 12, comment: 'Rigorous comparison between theoretical eigenfrequencies and measured resonance peaks. Explained acoustic boundary leakage.' },
      { code: 'D', name: 'Presentation', score: 4, maxScore: 4, comment: 'Professional typography, numbered equations, vector diagrams, and accurate scientific citations (IEEE format).' },
      { code: 'E', name: 'Engagement (RPPF)', score: 6, maxScore: 6, comment: 'The Reflections on Planning and Progress Form (RPPF) showed tremendous growth from initial failed plate clamping to final design.' }
    ],
    examinerNotes: 'An extraordinary Extended Essay that would not be out of place in an undergraduate physics journal. The candidate derived the fundamental equations and personally resolved boundary clamping errors that initially skewed the lowest order modes.',
    pitfallsAvoided: [
      'Avoided purely qualitative picture taking—measured eigenfrequencies quantitatively with frequency counters.',
      'RPPF reflections detailed genuine technical setbacks and how the candidate overcame them.',
      'Addressed limitations of thin plate approximations for higher vibrational modes.'
    ],
    rvTopicLink: 'https://www.revisionvillage.com/ib-physics/questionbank/',
    rvTopicName: 'Wave Phenomena & Standing Waves (Physics HL)'
  }
];

export default function ExemplarsPage() {
  const [selectedExemplar, setSelectedExemplar] = useState<Exemplar>(EXEMPLARS[0]);
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [showBookletModal, setShowBookletModal] = useState(false);
  const [showCommandTermsModal, setShowCommandTermsModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfModalDocId, setPdfModalDocId] = useState<string>('sevenoaks');
  const [pdfModalPage, setPdfModalPage] = useState<number | undefined>(undefined);

  const openPDFViewer = (docId: string, page?: number) => {
    setPdfModalDocId(docId);
    setPdfModalPage(page);
    setShowPDFModal(true);
  };

  const filteredExemplars = useMemo(() => {
    return EXEMPLARS.filter(ex => {
      if (subjectFilter === 'sevenoaks') {
        if (!ex.isRealStudentPdf) return false;
      } else if (subjectFilter === 'IA') {
        if (ex.type !== 'IA') return false;
      } else if (subjectFilter === 'EE') {
        if (ex.type !== 'EE') return false;
      } else if (subjectFilter !== 'ALL' && !ex.subject.toLowerCase().includes(subjectFilter.toLowerCase())) {
        return false;
      }

      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        ex.title.toLowerCase().includes(q) ||
        ex.subject.toLowerCase().includes(q) ||
        ex.researchQuestion.toLowerCase().includes(q) ||
        ex.summary.toLowerCase().includes(q) ||
        ex.keyTechniques.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [subjectFilter, search]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.5rem 3rem' }}>
      {/* Top Banner Header */}
      <div
        className="panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '1.75rem',
          background: 'var(--panel-light)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="section-label" style={{ marginBottom: 0 }}>
              Exemplar Vault
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Authentic Grade 7 & Grade A Work • 2025 Curriculum
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', margin: '0.2rem 0' }}>
            IA & EE 7/7 Exemplar Vault
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0, maxWidth: '820px' }}>
            Deconstructed maximum-scoring Internal Assessments and authentic 4,000-word Grade A Extended Essays from Sevenoaks School with full senior examiner rationales, criterion score rubrics, and in-browser PDF readers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => openPDFViewer('sevenoaks', 1)}
            className="filter-btn active"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <BookMarked size={14} /> Sevenoaks EE Book
          </button>
          <button
            onClick={() => setShowCommandTermsModal(true)}
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: 'var(--panel)' }}
          >
            <Sparkles size={14} style={{ color: 'var(--rust)' }} /> Command Terms
          </button>
          <button
            onClick={() => setShowBookletModal(true)}
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: 'var(--panel)' }}
          >
            <BookOpen size={14} style={{ color: 'var(--rust)' }} /> Formula Booklets
          </button>
          <Link
            href="/"
            className="filter-btn"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Official Textbooks & Master Exemplar Shelf */}
      <div
        className="panel"
        style={{
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(184, 74, 57, 0.03)',
          border: '1.5px solid rgba(184, 74, 57, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={18} style={{ color: 'var(--rust)' }} />
              <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, color: 'var(--ink)' }}>
                Official Extended Essay Textbooks & External Exemplar Archives
              </h2>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
              Direct access to complete published textbooks, authentic student EEs from top world schools, and official IBO moderation repositories.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Card 1: Sevenoaks Prized EEs */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', background: 'var(--rust)', color: '#fff' }}>
                  REAL STUDENT WORK
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>7.9 MB • 284 Pages</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, lineHeight: '1.35' }}>
                Sevenoaks School Prized Writing (IB EEs)
              </h3>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: '1.45' }}>
                10 unedited, authentic 4,000-word Grade A Extended Essays in Math, Chemistry, Biology, Economics, History & Art with supervisor commentaries.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => openPDFViewer('sevenoaks', 1)}
                className="filter-btn active"
                style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Eye size={13} /> Read PDF
              </button>
              <a
                href="/vault/ee-guides/sevenoaks-prized-ees-2015.pdf"
                download
                className="filter-btn"
                style={{ textDecoration: 'none', padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Download size={13} />
              </a>
            </div>
          </div>

          {/* Card 2: Hodder 2025 Textbook */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', background: '#059669', color: '#fff' }}>
                  2025 TEXTBOOK
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>76.7 MB • Hodder</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, lineHeight: '1.35' }}>
                Extended Essay: Skills for Success
              </h3>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: '1.45' }}>
                By Paul Hoang & Joseph Koszary. The modern guide covering research questions, RPPF forms, academic referencing, and marking criteria.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => openPDFViewer('hodder-2025', 1)}
                className="filter-btn active"
                style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Eye size={13} /> Read Book
              </button>
              <a
                href="/vault/ee-guides/ee-hodder-2025-hoang.pdf"
                download
                className="filter-btn"
                style={{ textDecoration: 'none', padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Download size={13} />
              </a>
            </div>
          </div>

          {/* Card 3: Oxford 2025 Companion */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', background: '#2563eb', color: '#fff' }}>
                  OXFORD 2025
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>79.1 MB • Lekanides</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, lineHeight: '1.35' }}>
                Oxford Extended Essay Course Companion
              </h3>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: '1.45' }}>
                By Kosta Lekanides. Master class on supervisor interviews, methodology blueprints, and achieving 34/34 Grade A.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => openPDFViewer('oxford-2025', 1)}
                className="filter-btn active"
                style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Eye size={13} /> Read Book
              </button>
              <a
                href="/vault/ee-guides/ee-oxford-2025-lekanides.pdf"
                download
                className="filter-btn"
                style={{ textDecoration: 'none', padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Download size={13} />
              </a>
            </div>
          </div>

          {/* Card 4: Official IBO Assessed Student Work & TSM Portals */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '6px', background: '#8b5cf6', color: '#fff' }}>
                  OFFICIAL IBO
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Live Public Repositories</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, lineHeight: '1.35' }}>
                Official IBO TSM & Assessed Work
              </h3>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--muted)', lineHeight: '1.45' }}>
                Direct access to the IBO\'s authentic assessed student essays and the official Teacher Support Material (TSM) IA archive with moderation remarks.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href="https://ibpublishing.ibo.org/extendedessay/apps/dpapp/assessment.html?doc=d_0_eeyyy_gui_1602_1_e&part=1&chapter=1"
                target="_blank"
                rel="noopener noreferrer"
                className="filter-btn"
                style={{ textDecoration: 'none', flex: 1, padding: '0.35rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}
              >
                <ExternalLink size={12} /> IBO Assessed EE
              </a>
              <a
                href="https://repo.pirateib.sh/index.php?p=IB+TEACHER+SUPPORT+MATERIAL"
                target="_blank"
                rel="noopener noreferrer"
                className="filter-btn"
                style={{ textDecoration: 'none', flex: 1, padding: '0.35rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}
              >
                <ExternalLink size={12} /> Official TSM IAs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search exemplar research questions, methodologies, or topics..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem 0.5rem 2.4rem', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>Filter:</span>
            {[
              { label: 'All Disciplines', value: 'ALL' },
              { label: 'Real Sevenoaks EEs', value: 'sevenoaks' },
              { label: 'Math AA/AI', value: 'math' },
              { label: 'Physics', value: 'physics' },
              { label: 'Chemistry', value: 'chem' },
              { label: 'Biology', value: 'bio' },
              { label: 'Economics', value: 'econ' },
              { label: 'History', value: 'history' },
              { label: 'Internal Assessments (IA)', value: 'IA' },
              { label: 'Extended Essays (EE)', value: 'EE' }
            ].map(tab => (
              <button
                key={tab.value}
                className={`filter-btn ${subjectFilter === tab.value ? 'active' : ''}`}
                onClick={() => setSubjectFilter(tab.value)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Screen Master-Detail Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 390px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: List of Exemplars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tech-label">
              [AVAILABLE_EXEMPLARS: {filteredExemplars.length}]
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              Click to examine rubric & read
            </span>
          </div>

          {filteredExemplars.map(ex => {
            const isSelected = selectedExemplar?.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExemplar(ex)}
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  border: isSelected ? '1.5px solid var(--rust)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(184, 74, 57, 0.06)' : 'var(--panel-light)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: ex.type === 'EE' ? '#2563eb' : 'var(--rust)',
                        color: '#fff'
                      }}
                    >
                      {ex.level} {ex.type}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                      {ex.subject}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    {ex.isRealStudentPdf && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          background: 'rgba(37, 99, 235, 0.1)',
                          padding: '1px 5px',
                          borderRadius: '6px'
                        }}
                      >
                        PDF In-Book
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: 'rgba(5, 150, 105, 0.1)',
                        padding: '1px 7px',
                        borderRadius: '6px'
                      }}
                    >
                      ★ {ex.score}
                    </span>
                  </div>
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: '0.93rem',
                    fontWeight: isSelected ? 700 : 600,
                    lineHeight: '1.35',
                    color: 'var(--ink)'
                  }}
                >
                  {ex.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--muted)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {ex.researchQuestion}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {ex.wordCount} words {ex.sourceSchool ? `• Sevenoaks` : ''}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--rust)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                    Examine Rubric <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Breakdown Panel */}
        {selectedExemplar && (
          <div className="panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--panel)' }}>
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: selectedExemplar.type === 'EE' ? '#2563eb' : 'var(--rust)', color: '#fff' }}>
                    {selectedExemplar.subject} • {selectedExemplar.level} {selectedExemplar.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: '#059669', color: '#fff' }}>
                    Official Mark: {selectedExemplar.score} (Grade {selectedExemplar.grade})
                  </span>
                  {selectedExemplar.sourceSchool && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                      {selectedExemplar.sourceSchool}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedExemplar.isRealStudentPdf && selectedExemplar.pdfDocId && (
                    <button
                      onClick={() => openPDFViewer(selectedExemplar.pdfDocId!, selectedExemplar.pdfPage)}
                      className="filter-btn active"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        padding: '0.35rem 0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={13} /> Read Full 4,000-Word Essay PDF (p. {selectedExemplar.pdfPage})
                    </button>
                  )}

                  <a
                    href={selectedExemplar.rvTopicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="filter-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.85rem'
                    }}
                  >
                    <ExternalLink size={12} /> Practice Related Qs on Revision Village
                  </a>
                </div>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', margin: '0.3rem 0 0.6rem', lineHeight: '1.25' }}>
                {selectedExemplar.title}
              </h2>

              {/* Research Question Card */}
              <div style={{ background: 'var(--panel-light)', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  Formal Research Question (RQ)
                </span>
                <p style={{ margin: 0, fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--ink)', lineHeight: '1.5' }}>
                  "{selectedExemplar.researchQuestion}"
                </p>
              </div>
            </div>

            {/* Methodology & Abstract */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} style={{ color: 'var(--rust)' }} /> Investigation Summary & Approach
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: '1.6', margin: 0 }}>
                {selectedExemplar.summary}
              </p>
            </div>

            {/* Core Mathematical / Scientific Apparatus */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Key Analytical Techniques & Mathematical Modeling
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selectedExemplar.keyTechniques.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '4px 9px',
                      borderRadius: '4px',
                      background: 'var(--panel-light)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)'
                    }}
                  >
                    • {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Official Rubric Criterion Breakdown Table */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} style={{ color: '#059669' }} /> Criterion-by-Criterion Rubric Scoring
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--panel-light)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.8rem', width: '80px' }}>Criterion</th>
                      <th style={{ padding: '0.6rem 0.8rem', width: '200px' }}>Descriptor</th>
                      <th style={{ padding: '0.6rem 0.8rem', width: '90px' }}>Mark Awarded</th>
                      <th style={{ padding: '0.6rem 0.8rem' }}>Senior Examiner Evaluation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExemplar.rubricBreakdown.map((crit, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: idx < selectedExemplar.rubricBreakdown.length - 1 ? '1px solid var(--border)' : 'none',
                          background: idx % 2 === 0 ? 'var(--panel)' : 'var(--panel-light)'
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: 700, color: 'var(--rust)', fontFamily: 'var(--font-mono)' }}>
                          Crit {crit.code}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: 600, color: 'var(--ink)' }}>
                          {crit.name}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem' }}>
                          <span style={{ fontWeight: 700, color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                            {crit.score} / {crit.maxScore}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', color: 'var(--ink)', lineHeight: '1.45' }}>
                          <div>{crit.comment}</div>
                          {selectedExemplar.isRealStudentPdf && selectedExemplar.pdfDocId && (
                            <button
                              type="button"
                              onClick={() => openPDFViewer(selectedExemplar.pdfDocId!, crit.pdfPage || selectedExemplar.pdfPage || 1)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                marginTop: '6px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: 'rgba(37, 99, 235, 0.08)',
                                border: '1px solid rgba(37, 99, 235, 0.25)',
                                color: '#2563eb',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <ExternalLink size={11} />
                              <span>View Evidence in Authentic Paper (p. {crit.pdfPage || selectedExemplar.pdfPage})</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Senior Examiner Commentary Card */}
            <div style={{ background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.25)', borderRadius: '6px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={16} /> SENIOR EXAMINER RATIONALE (WHY THIS SCORED TOP BAND)
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--ink)', lineHeight: '1.5' }}>
                {selectedExemplar.examinerNotes}
              </p>
            </div>

            {/* Pitfalls Avoided (What students can learn) */}
            <div style={{ background: 'rgba(184, 74, 57, 0.05)', border: '1px solid rgba(184, 74, 57, 0.25)', borderRadius: '6px', padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--rust)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <AlertCircle size={16} /> COMMON STUDENT PITFALLS AVOIDED IN THIS WORK
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.84rem', color: 'var(--ink)', lineHeight: '1.5' }}>
                {selectedExemplar.pitfallsAvoided.map((pitfall, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {pitfall}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer action bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                Aligned to current IBDP Assessment Guides • {selectedExemplar.rvTopicName}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {selectedExemplar.isRealStudentPdf && selectedExemplar.pdfDocId && (
                  <button
                    onClick={() => openPDFViewer(selectedExemplar.pdfDocId!, selectedExemplar.pdfPage)}
                    className="filter-btn active"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.4rem 0.85rem', cursor: 'pointer' }}
                  >
                    <BookOpen size={13} /> View in Sevenoaks EE Book (p. {selectedExemplar.pdfPage})
                  </button>
                )}
                <a
                  href={selectedExemplar.rvTopicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="filter-btn"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                >
                  <ExternalLink size={12} /> Free Practice on Revision Village ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booklets Modal */}
      <IBBookletViewerModal
        isOpen={showBookletModal}
        onClose={() => setShowBookletModal(false)}
      />

      {/* Command Terms Modal */}
      <IBCommandTermsModal
        isOpen={showCommandTermsModal}
        onClose={() => setShowCommandTermsModal(false)}
      />

      {/* Inline PDF Viewer Modal */}
      <IBPDFViewerModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        activeDocId={pdfModalDocId}
        page={pdfModalPage}
      />
    </div>
  );
}
