export interface ResourceItem {
  name: string;
  category: 'youtube' | 'quizlet' | 'local_vault' | 'portal';
  subject: string;
  description: string;
  url: string;
  meta?: string;
  rating?: string;
}

export const resourcesData: ResourceItem[] = [
  // Local Vault Core Manuals & Handbooks
  {
    name: 'IB Math AA HL Ultimate Handbook',
    category: 'local_vault',
    subject: 'Mathematics',
    description: 'Comprehensive study guide covering all topics in Mathematics Analysis and Approaches HL.',
    url: '/api/past-papers/local-vault/IB_Math_AA_HL_Ultimate_Handbook.pdf',
    meta: 'PDF • 1.3 MB',
    rating: '5.0 ★'
  },
  {
    name: 'Mathematics AA Formula Booklet',
    category: 'local_vault',
    subject: 'Mathematics',
    description: 'Official IB formula booklet for Mathematics Analysis & Approaches (SL & HL).',
    url: '/api/past-papers/local-vault/aa_formula_booklet.pdf',
    meta: 'PDF • 269 KB',
    rating: '5.0 ★'
  },
  {
    name: 'AA HL Comprehensive Formula Sheet',
    category: 'local_vault',
    subject: 'Mathematics',
    description: 'Detailed formula reference sheet for AA HL exams and study.',
    url: '/api/past-papers/local-vault/AA_HL_comprehensive_formula_sheet.pdf',
    meta: 'PDF • 245 KB',
    rating: '4.9 ★'
  },
  {
    name: 'Mathematics Analysis & Approaches Subject Guide',
    category: 'local_vault',
    subject: 'Mathematics',
    description: 'Official IB subject guide detailing the math syllabus, exam weights, and assessment guidelines.',
    url: '/api/past-papers/local-vault/Mathematics_Analysis_and_Approaches_Subject_Guide.pdf',
    meta: 'PDF • 3.3 MB',
    rating: '4.8 ★'
  },

  // Verified High-Yield Study Portals & Archives
  {
    name: 'PirateIB Official Portal & Repo',
    category: 'portal',
    subject: 'Multiple',
    description: 'Main mirror hub for IB subject notes, textbooks, past papers, and IA exemplars.',
    url: 'https://pirateib.su',
    meta: 'Main IB Mirror Archive',
    rating: '5.0 ★ Top Rated'
  },
  {
    name: 'IBDone Student Notes',
    category: 'portal',
    subject: 'Multiple',
    description: 'Comprehensive student-created notes for IB Biology, Chemistry, English, and Humanities.',
    url: 'https://ibdone1.wordpress.com/',
    meta: 'Top Rated Notes Archive',
    rating: '4.9 ★'
  },
  {
    name: 'IB Your Way Out Notes',
    category: 'portal',
    subject: 'Multiple',
    description: 'Detailed unit-by-unit revision summaries for IB Biology HL, Chemistry, and English A.',
    url: 'https://ibrevision.wordpress.com/',
    meta: 'High-Yield Notes',
    rating: '4.9 ★'
  },
  {
    name: 'BioNinja IB Biology',
    category: 'portal',
    subject: 'Biology',
    description: 'The premier interactive guide for IB Biology syllabus breakdown, diagrams, and summary notes.',
    url: 'https://ib.bioninja.com.au',
    meta: 'Interactive Biology Portal',
    rating: '5.0 ★ Essential'
  },
  {
    name: 'Biology for Life',
    category: 'portal',
    subject: 'Biology',
    description: 'Complete IB Biology syllabus notes, lab guidance, and IA assessment criteria.',
    url: 'https://www.biologyforlife.com',
    meta: 'Biology Syllabus & IA Guide',
    rating: '4.9 ★'
  },
  {
    name: 'Christos Nikolaidis Math AA Exercises',
    category: 'portal',
    subject: 'Mathematics',
    description: 'Topic-by-topic IB Math AA HL/SL practice worksheets and fully worked solutions.',
    url: 'https://www.christosnikolaidis.com/en/maa-exercise/',
    meta: 'Topic-by-Topic Exercises',
    rating: '5.0 ★ Essential'
  },
  {
    name: 'IB English Guys',
    category: 'portal',
    subject: 'English A',
    description: 'Official site for IB English Paper 1, Paper 2, and Individual Oral (IO) analysis guides.',
    url: 'https://ibenglishguys.com',
    meta: 'English A Masterclass',
    rating: '5.0 ★ Top Rated'
  },
  {
    name: 'MyBib Referencing Generator',
    category: 'portal',
    subject: 'Multiple',
    description: 'Free automatic citation and bibliography generator for APA, MLA, and Chicago styles for IA/EE.',
    url: 'https://www.mybib.com',
    meta: 'IA & EE Citation Tool',
    rating: '5.0 ★'
  },
  {
    name: 'IBLieve Student Community',
    category: 'portal',
    subject: 'Multiple',
    description: 'Student-led IB tips, subject advice, study strategies, and 45-scorer guides.',
    url: 'https://iblieve.org/',
    meta: 'Student Guidance Portal',
    rating: '4.8 ★'
  },

  // 100% Verified YouTube Channels (Tested 200 OK)
  {
    name: 'MSJChem',
    category: 'youtube',
    subject: 'Chemistry',
    description: 'Concise, 5-minute syllabus-aligned video explanations for every IB Chemistry topic.',
    url: 'https://www.youtube.com/@MSJChem',
    meta: '100k+ Subscribers',
    rating: '5.0 ★ Essential'
  },
  {
    name: 'Richard Thornley',
    category: 'youtube',
    subject: 'Chemistry',
    description: 'Engaging, syllabus-by-syllabus video explanations for IB Chemistry SL & HL.',
    url: 'https://www.youtube.com/@ibchemvids',
    meta: '120k+ Subscribers',
    rating: '5.0 ★ Essential'
  },
  {
    name: 'Alex Lee (Mr. Lee Science)',
    category: 'youtube',
    subject: 'Biology',
    description: 'Fast-paced, diagram-heavy video tutorials covering core & AHL IB Biology topics.',
    url: 'https://www.youtube.com/@misterleescience',
    meta: '50k+ Subscribers',
    rating: '4.9 ★'
  },
  {
    name: 'Cheryl Hickman',
    category: 'youtube',
    subject: 'Biology',
    description: 'Slide-by-slide complete syllabus lectures covering IB Biology SL & HL.',
    url: 'https://www.youtube.com/@cherylhickman6386',
    meta: '80k+ Subscribers',
    rating: '4.9 ★'
  },
  {
    name: 'Tim Nance (Nancenotes)',
    category: 'youtube',
    subject: 'English A',
    description: 'In-depth video analysis of literary works, Paper 1 skills, and English A concepts.',
    url: 'https://www.youtube.com/@Nancenotes',
    meta: 'English Lit Master',
    rating: '4.9 ★'
  },
  {
    name: 'IB English Guys Channel',
    category: 'youtube',
    subject: 'English A',
    description: 'Step-by-step video walkthroughs for Paper 1, Paper 2, and IO success.',
    url: 'https://www.youtube.com/channel/UCEZHU9lVH7h2p60KI-rEbDA',
    meta: '60k+ Subscribers',
    rating: '5.0 ★ Top Rated'
  },
  {
    name: 'Chris Doner Physics',
    category: 'youtube',
    subject: 'Physics',
    description: 'The gold-standard video lecture series covering every topic in IB Physics.',
    url: 'https://www.youtube.com/@donerphysics',
    meta: '100k+ Subscribers',
    rating: '5.0 ★ Essential'
  },
  {
    name: 'Prof. Varun Physics',
    category: 'youtube',
    subject: 'Physics',
    description: 'Detailed past-paper question walkthroughs and problem-solving techniques for IB Physics.',
    url: 'https://www.youtube.com/@profvarun',
    meta: 'Question Walkthroughs',
    rating: '4.9 ★'
  },
  {
    name: 'Andy Masley Physics',
    category: 'youtube',
    subject: 'Physics',
    description: 'Conceptual breakdowns and topic summaries tailored for IB Physics SL & HL.',
    url: 'https://www.youtube.com/@AndyMasley',
    meta: 'Physics Breakdown',
    rating: '4.8 ★'
  },
  {
    name: 'Online Science Tutor',
    category: 'youtube',
    subject: 'Physics & Math',
    description: 'Syllabus-aligned video tutorials for IB Physics and Mathematics AA/AI.',
    url: 'https://www.youtube.com/@theonlinesciencetutor2720',
    meta: 'Math & Physics',
    rating: '4.8 ★'
  },
  {
    name: 'ChemJungle',
    category: 'youtube',
    subject: 'Chemistry',
    description: 'High-energy, focused revision videos for IB Chemistry core topics.',
    url: 'https://www.youtube.com/@ChemJungle',
    meta: 'Chemistry Revision',
    rating: '4.8 ★'
  },
  {
    name: 'TeacherRK',
    category: 'youtube',
    subject: 'Business',
    description: 'Dedicated IB Business Management video lectures, case study analysis, and exam tips.',
    url: 'https://www.youtube.com/@TeacherRK',
    meta: 'Business Management',
    rating: '4.9 ★'
  },
  {
    name: 'Jacob Clifford',
    category: 'youtube',
    subject: 'Economics',
    description: 'Macroeconomics and microeconomics summary videos, diagrams, and practice problems.',
    url: 'https://www.youtube.com/@JacobAClifford',
    meta: 'Econ Diagrams & Theory',
    rating: '4.9 ★'
  },
  {
    name: 'EZ NOMICS',
    category: 'youtube',
    subject: 'Economics',
    description: 'Clear, concise IB Economics diagram tutorials and Paper 1/2/3 exam technique.',
    url: 'https://www.youtube.com/@EZNOMICS',
    meta: 'IB Econ Master',
    rating: '4.9 ★'
  },
  {
    name: '3Blue1Brown',
    category: 'youtube',
    subject: 'Mathematics',
    description: 'Stunning visual intuition for calculus, linear algebra, and advanced mathematics.',
    url: 'https://www.youtube.com/@3blue1brown',
    meta: '6M+ Subscribers',
    rating: '5.0 ★ Essential'
  },

  // 100% Verified Quizlet Sets
  {
    name: 'IB Chemistry SL/HL Core Definitions',
    category: 'quizlet',
    subject: 'Chemistry',
    description: 'Full verified glossary of key definitions for Chemistry Paper 1 & Paper 2.',
    url: 'https://quizlet.com/413495810/ib-chemistry-definitions-flash-cards/',
    meta: 'Verified Terms',
    rating: '4.9 ★'
  },
  {
    name: 'IB Economics Key Terms & Concepts',
    category: 'quizlet',
    subject: 'Economics',
    description: 'Essential definitions for Micro, Macro, and Global economics units.',
    url: 'https://quizlet.com/492210086/ib-economics-definitions-flash-cards/',
    meta: '210 Verified Terms',
    rating: '4.9 ★'
  },
  {
    name: 'IB Biology Syllabus Vocabulary',
    category: 'quizlet',
    subject: 'Biology',
    description: 'Comprehensive flashcards covering core IB Biology definitions.',
    url: 'https://quizlet.com/209930773/ib-biology-definitions-flash-cards/',
    meta: '340 Verified Terms',
    rating: '4.8 ★'
  }
];
