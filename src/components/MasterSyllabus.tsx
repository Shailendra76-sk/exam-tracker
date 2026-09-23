import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Download,
  Upload,
  Filter,
  BookOpen,
  Layers3,
  Circle,
} from 'lucide-react';

export type SubtopicStatus = 'Not Started' | 'Learning' | 'Completed' | 'Revision';

export type MasterExamFilter =
  | 'All Exams'
  | 'SSC CHSL'
  | 'Railway Group D'
  | 'UP Lekhpal';

type ExamScope = {
  'SSC CHSL': 'core' | 'extra';
  'Railway Group D': 'core' | 'extra';
  'UP Lekhpal': 'core' | 'extra';
};

type MathsSubtopic = {
  id: string;
  title: string;
  hint: string;
};

type MathsChapter = {
  id: string;
  title: string;
  hint: string;
  scope: ExamScope;
  subtopics: MathsSubtopic[];
};

type MathsSection = {
  id: string;
  title: string;
  hint: string;
  priority?: boolean;
  chapters: MathsChapter[];
};

const CORE_ALL: ExamScope = {
  'SSC CHSL': 'core',
  'Railway Group D': 'core',
  'UP Lekhpal': 'core',
};

const EXTRA_ALL: ExamScope = {
  'SSC CHSL': 'extra',
  'Railway Group D': 'extra',
  'UP Lekhpal': 'extra',
};

const scope = (ssc: 'core' | 'extra', railway: 'core' | 'extra', lekhpal: 'core' | 'extra'): ExamScope => ({
  'SSC CHSL': ssc,
  'Railway Group D': railway,
  'UP Lekhpal': lekhpal,
});

const chapter = (
  id: string,
  title: string,
  hint: string,
  subtopics: Array<[string, string]>,
  examScope: ExamScope = CORE_ALL,
): MathsChapter => ({
  id,
  title,
  hint,
  scope: examScope,
  subtopics: subtopics.map(([subtopicId, subtopicTitle]) => {
    const separator = subtopicTitle.indexOf('|');
    const cleanTitle = separator >= 0 ? subtopicTitle.slice(0, separator).trim() : subtopicTitle;
    const cleanHint = separator >= 0 ? subtopicTitle.slice(separator + 1).trim() : '';
    return {
      id: subtopicId,
      title: cleanTitle,
      hint: cleanHint,
    };
  }),
});

export const MATHS_MASTER_SYLLABUS: MathsSection[] = [
  {
    id: 'arithmetic',
    title: '1️⃣ Arithmetic Math',
    hint: 'Core arithmetic track • Sir’s Priority',
    priority: true,
    chapters: [
      chapter('percentage', 'Percentage', 'प्रतिशत', [
        ['percentage-01', 'Basic Fractions & Conversions | भिन्न से प्रतिशत और प्रतिशत से भिन्न'],
        ['percentage-02', 'Percentage Increase / Decrease | प्रतिशत वृद्धि और कमी'],
        ['percentage-03', 'Successive Percentage | क्रमिक प्रतिशत परिवर्तन'],
        ['percentage-04', 'Population-based Problems | जनसंख्या पर आधारित प्रश्न'],
        ['percentage-05', 'Marks & Election Problems | अंक और चुनाव आधारित प्रश्न'],
        ['percentage-06', 'Income / Expenditure Problems | आय-व्यय आधारित प्रश्न'],
      ]),
      chapter('ratio-proportion', 'Ratio & Proportion', 'अनुपात एवं समानुपात', [
        ['ratio-01', 'Basic Ratio Concepts | मूल अनुपात'],
        ['ratio-02', 'Equivalent Ratios & Proportion | समतुल्य अनुपात और समानुपात'],
        ['ratio-03', 'Direct & Inverse Proportion | प्रत्यक्ष और व्युत्क्रमानुपात'],
        ['ratio-04', 'Compound Ratio | मिश्रित अनुपात'],
        ['ratio-05', 'Partnership Linkage | साझेदारी में अनुपात का उपयोग'],
      ]),
      chapter('profit-loss', 'Profit & Loss', 'लाभ एवं हानि', [
        ['profit-loss-01', 'CP/SP & Basic P/L % | क्रय मूल्य, विक्रय मूल्य और लाभ-हानि प्रतिशत'],
        ['profit-loss-02', 'Dishonest Shopkeeper | बेईमान दुकानदार'],
        ['profit-loss-03', 'Article-based Problems | वस्तु आधारित प्रश्न'],
        ['profit-loss-04', 'CP-MP Relation | क्रय मूल्य और अंकित मूल्य का संबंध'],
        ['profit-loss-05', 'Successive Profit / Loss | क्रमिक लाभ और हानि'],
      ]),
      chapter('discount', 'Discount & Dishonest Shopkeeper', 'छूट एवं बेईमान दुकानदार', [
        ['discount-01', 'Marked Price & Discount | अंकित मूल्य और छूट'],
        ['discount-02', 'Successive Discounts | क्रमिक छूट'],
        ['discount-03', 'Discount + Profit Combined | छूट और लाभ का संयुक्त प्रश्न'],
        ['discount-04', 'False Weight / Measure | कम तौल और गलत माप'],
        ['discount-05', 'Effective Gain from Dishonesty | बेईमानी से वास्तविक लाभ'],
      ]),
      chapter('time-work', 'Time & Work', 'समय एवं कार्य', [
        ['time-work-01', 'Basic LCM Method | LCM से काम करने का तरीका'],
        ['time-work-02', 'Efficiency | कार्यक्षमता'],
        ['time-work-03', 'Men / Women / Children | पुरुष, महिला और बच्चों की कार्यक्षमता'],
        ['time-work-04', 'Combined Work & Wages | संयुक्त कार्य और मजदूरी'],
        ['time-work-05', 'Pipes & Cisterns | पाइप और टंकी'],
      ]),
      chapter('pipe-cistern', 'Pipe & Cistern', 'पाइप एवं टंकी', [
        ['pipe-01', 'Inlet / Outlet Basics | भरने और खाली करने की दर'],
        ['pipe-02', 'Net Rate Method | शुद्ध दर विधि'],
        ['pipe-03', 'Alternate Pipes | बारी-बारी से चलने वाले पाइप'],
        ['pipe-04', 'Leakage Problems | रिसाव वाले प्रश्न'],
        ['pipe-05', 'Capacity-based Questions | क्षमता आधारित प्रश्न'],
      ]),
      chapter('simple-interest', 'Simple Interest', 'साधारण ब्याज', [
        ['si-01', 'Principal, Rate & Time | मूलधन, दर और समय'],
        ['si-02', 'Interest and Amount | ब्याज और मिश्रधन'],
        ['si-03', 'Changing Rate / Time | दर और समय में परिवर्तन'],
        ['si-04', 'Installment-based SI | किस्त आधारित साधारण ब्याज'],
        ['si-05', 'Word Problems | शब्द-आधारित प्रश्न'],
      ]),
      chapter('compound-interest', 'Compound Interest', 'चक्रवृद्धि ब्याज', [
        ['ci-01', 'Annual Compounding | वार्षिक चक्रवृद्धि'],
        ['ci-02', 'Half-yearly / Quarterly Compounding | अर्धवार्षिक और त्रैमासिक चक्रवृद्धि'],
        ['ci-03', 'CI-SI Difference | CI और SI का अंतर'],
        ['ci-04', 'Variable Rate / Time | बदलती दर और समय'],
        ['ci-05', 'Growth / Depreciation Applications | वृद्धि और ह्रास'],
      ]),
      chapter('installment', 'Installment', 'किस्त प्रणाली', [
        ['installment-01', 'Basic Installment Concept | मूल किस्त अवधारणा'],
        ['installment-02', 'Present Value Style Questions | वर्तमान मूल्य प्रकार'],
        ['installment-03', 'CI Installments | चक्रवृद्धि ब्याज वाली किस्त'],
        ['installment-04', 'Equal / Unequal Installments | समान और असमान किस्त'],
        ['installment-05', 'Time-based Payment Questions | समय आधारित भुगतान'],
      ]),
      chapter('average', 'Average', 'औसत', [
        ['average-01', 'Basic Average | मूल औसत'],
        ['average-02', 'Missing Value | अज्ञात संख्या'],
        ['average-03', 'Replacement & New Average | संख्या बदलने पर नया औसत'],
        ['average-04', 'Age / Marks / Salary Average | आयु, अंक और वेतन का औसत'],
        ['average-05', 'Weighted Average Basics | भारित औसत की मूल बातें'],
      ]),
      chapter('time-speed-distance', 'Time, Speed & Distance', 'समय, चाल एवं दूरी', [
        ['tsd-01', 'Basic Formula T = D/S | मूल सूत्र'],
        ['tsd-02', 'Relative Speed | सापेक्ष चाल'],
        ['tsd-03', 'Unit Conversion | इकाई परिवर्तन'],
        ['tsd-04', 'Average Speed | औसत चाल'],
        ['tsd-05', 'Meeting / Overtaking | मिलने और ओवरटेक करने के प्रश्न'],
      ]),
      chapter('train', 'Problems on Train', 'ट्रेन आधारित प्रश्न', [
        ['train-01', 'Train Crossing Pole | खंभा पार करना'],
        ['train-02', 'Train Crossing Platform | प्लेटफॉर्म पार करना'],
        ['train-03', 'Two Trains Opposite Direction | विपरीत दिशा में दो ट्रेन'],
        ['train-04', 'Two Trains Same Direction | समान दिशा में दो ट्रेन'],
        ['train-05', 'Train Length / Speed | ट्रेन की लंबाई और चाल'],
      ]),
      chapter('boat-stream', 'Boat & Stream', 'नाव एवं धारा', [
        ['boat-01', 'Upstream & Downstream | धारा के विरुद्ध और साथ'],
        ['boat-02', 'Still Water Speed | स्थिर जल में नाव की चाल'],
        ['boat-03', 'Stream Speed | धारा की चाल'],
        ['boat-04', 'Time-Distance Problems | समय और दूरी'],
        ['boat-05', 'Round Trip Problems | आने-जाने की यात्रा'],
      ]),
      chapter('race', 'Circular & Linear Race', 'वृत्तीय एवं सीधी दौड़', [
        ['race-01', 'Linear Race Basics | सीधी दौड़ की मूल बातें'],
        ['race-02', 'Head Start / Lead | बढ़त और शुरुआती लाभ'],
        ['race-03', 'Circular Track Meeting | वृत्तीय ट्रैक पर मिलने के प्रश्न'],
        ['race-04', 'Speed Ratio in Race | दौड़ में चाल का अनुपात'],
        ['race-05', 'Multiple Round Problems | कई चक्कर वाले प्रश्न'],
      ]),
      chapter('ages', 'Problems on Ages', 'आयु आधारित प्रश्न', [
        ['ages-01', 'Present Age Relations | वर्तमान आयु संबंध'],
        ['ages-02', 'Past Age | पिछली आयु'],
        ['ages-03', 'Future Age | भविष्य की आयु'],
        ['ages-04', 'Ratio of Ages | आयु का अनुपात'],
        ['ages-05', 'Family Age Problems | परिवार की आयु पर प्रश्न'],
      ]),
      chapter('partnership', 'Partnership', 'साझेदारी', [
        ['partnership-01', 'Capital Ratio | पूंजी अनुपात'],
        ['partnership-02', 'Time-based Investment | समय आधारित निवेश'],
        ['partnership-03', 'Profit Sharing | लाभ का बंटवारा'],
        ['partnership-04', 'Working Partner Salary / Commission | काम करने वाले साझेदार का वेतन/कमीशन'],
        ['partnership-05', 'Change in Capital | पूंजी में बदलाव'],
      ]),
      chapter('mixture-alligation', 'Mixture & Alligation', 'मिश्रण एवं मिश्रानुपात', [
        ['mixture-01', 'Basic Mixture | मिश्रण की मूल अवधारणा'],
        ['mixture-02', 'Alligation Rule | मिश्रानुपात नियम'],
        ['mixture-03', 'Mean Price | औसत मूल्य'],
        ['mixture-04', 'Replacement Method | प्रतिस्थापन विधि'],
        ['mixture-05', 'Milk-Water / Alloy Problems | दूध-पानी और मिश्रधातु'],
      ]),
      chapter('di', 'Data Interpretation (DI)', 'आंकड़ा विश्लेषण', [
        ['di-01', 'Tables | सारणी आधारित DI'],
        ['di-02', 'Bar Graph | बार ग्राफ'],
        ['di-03', 'Line Graph | रेखा ग्राफ'],
        ['di-04', 'Pie Chart | पाई चार्ट'],
        ['di-05', 'Caselet DI | केसलेट आधारित DI'],
        ['di-06', 'Percentage / Ratio in DI | DI में प्रतिशत और अनुपात'],
      ]),
    ],
  },
  {
    id: 'number-system',
    title: '2️⃣ Number System',
    hint: 'Calculation foundation • Fast accuracy',
    chapters: [
      chapter('number-system', 'Number System', 'संख्या पद्धति', [
        ['ns-01', 'Natural, Whole & Integers | प्राकृतिक, पूर्ण एवं पूर्णांक'],
        ['ns-02', 'Prime / Composite Numbers | अभाज्य और भाज्य संख्याएँ'],
        ['ns-03', 'Even, Odd & Co-prime Numbers | सम, विषम और सह-अभाज्य'],
        ['ns-04', 'Divisibility Rules | विभाज्यता के नियम'],
        ['ns-05', 'Remainder Basics | शेषफल की मूल अवधारणा'],
        ['ns-06', 'Unit Digit / Last Digit | इकाई अंक'],
      ]),
      chapter('calculation-simplification', 'Calculation & Simplification', 'गणना एवं सरलीकरण', [
        ['calc-01', 'BODMAS / VBODMAS | क्रमवार संक्रियाएँ'],
        ['calc-02', 'Fractions | भिन्न'],
        ['calc-03', 'Decimals | दशमलव'],
        ['calc-04', 'Recurring Decimals | आवर्ती दशमलव'],
        ['calc-05', 'Approximation | सन्निकटन'],
        ['calc-06', 'Square / Cube Basics | वर्ग और घन की मूल बातें'],
      ]),
      chapter('surds-indices', 'Surds & Indices', 'करणी एवं घातांक', [
        ['surds-01', 'Laws of Indices | घातांक के नियम'],
        ['surds-02', 'Positive / Negative / Fractional Powers | धनात्मक, ऋणात्मक और भिन्न घात'],
        ['surds-03', 'Surd Simplification | करणी का सरलीकरण'],
        ['surds-04', 'Rationalisation | हर का परिमेयीकरण'],
        ['surds-05', 'Comparison of Surds | करणी की तुलना'],
      ]),
      chapter('lcm-hcf', 'LCM & HCF', 'लघुत्तम समापवर्त्य एवं महत्तम समापवर्तक', [
        ['lcm-hcf-01', 'Prime Factorisation | अभाज्य गुणनखंड'],
        ['lcm-hcf-02', 'LCM / HCF of Numbers | संख्याओं का LCM और HCF'],
        ['lcm-hcf-03', 'Fractions & LCM/HCF | भिन्नों के साथ LCM/HCF'],
        ['lcm-hcf-04', 'Word Problems | शब्द-आधारित प्रश्न'],
        ['lcm-hcf-05', 'LCM-HCF Relation | LCM और HCF का संबंध'],
      ]),
    ],
  },
  {
    id: 'advanced-math',
    title: '3️⃣ Advanced Math',
    hint: 'Concept-heavy chapters • Build after arithmetic',
    chapters: [
      chapter('algebra-quadratic', 'Algebra + Quadratic Equation', 'बीजगणित एवं द्विघात समीकरण', [
        ['alg-01', 'Algebraic Identities | बीजगणितीय सर्वसमिकाएँ'],
        ['alg-02', 'Linear Equations | रैखिक समीकरण'],
        ['alg-03', 'Factorisation | गुणनखंड'],
        ['alg-04', 'Quadratic Equation Basics | द्विघात समीकरण की मूल बातें'],
        ['alg-05', 'Roots & Nature of Roots | मूल और मूलों की प्रकृति'],
        ['alg-06', 'Algebraic Word Problems | बीजगणितीय शब्द-प्रश्न'],
      ]),
      chapter('trigonometry-height-distance', 'Trigonometry + Heights & Distance', 'त्रिकोणमिति एवं ऊंचाई-दूरी', [
        ['trig-01', 'Trigonometric Ratios | त्रिकोणमितीय अनुपात'],
        ['trig-02', 'Standard Angles | मानक कोण'],
        ['trig-03', 'Identities | त्रिकोणमितीय सर्वसमिकाएँ'],
        ['trig-04', 'Complementary Angles | पूरक कोण'],
        ['trig-05', 'Heights & Distance | ऊंचाई और दूरी'],
        ['trig-06', 'Application-based Questions | अनुप्रयोग आधारित प्रश्न'],
      ]),
      chapter('geometry', 'Geometry', 'ज्यामिति', [
        ['geo-01', 'Lines & Angles | रेखाएँ और कोण'],
        ['geo-02', 'Triangles & Congruency | त्रिभुज और सर्वांगसमता'],
        ['geo-03', 'Similarity & Pythagoras | समरूपता और पाइथागोरस'],
        ['geo-04', 'Quadrilaterals & Polygons | चतुर्भुज और बहुभुज'],
        ['geo-05', 'Circles & Chords | वृत्त और जीवा'],
        ['geo-06', 'Theorems & Angle Chasing | प्रमेय और कोण-आधारित प्रश्न'],
      ]),
      chapter(
        'coordinate-geometry',
        'Coordinate Geometry',
        'निर्देशांक ज्यामिति',
        [
          ['coord-01', 'Cartesian Plane | कार्तीय तल'],
          ['coord-02', 'Coordinates & Quadrants | निर्देशांक और चतुर्थांश'],
          ['coord-03', 'Distance Formula | दूरी सूत्र'],
          ['coord-04', 'Section / Midpoint Basics | मध्यबिंदु और विभाजन'],
          ['coord-05', 'Straight Line Basics | सीधी रेखा की मूल बातें'],
        ],
        scope('core', 'core', 'extra'),
      ),
      chapter('mensuration', 'Mensuration 2D & 3D', 'क्षेत्रमिति', [
        ['mens-01', 'Perimeter & Area | परिमाप और क्षेत्रफल'],
        ['mens-02', 'Triangle / Quadrilateral | त्रिभुज और चतुर्भुज'],
        ['mens-03', 'Circle | वृत्त'],
        ['mens-04', 'Cube / Cuboid | घन और घनाभ'],
        ['mens-05', 'Cylinder / Cone / Sphere | बेलन, शंकु और गोला'],
        ['mens-06', 'Combined Solids | संयुक्त ठोस आकृतियाँ'],
      ]),
      chapter('statistics', 'Statistics', 'सांख्यिकी', [
        ['stats-01', 'Mean | माध्य'],
        ['stats-02', 'Median | माध्यिका'],
        ['stats-03', 'Mode | बहुलक'],
        ['stats-04', 'Data Tables & Frequency | आंकड़े और आवृत्ति'],
        ['stats-05', 'Basic Charts & Interpretation | चार्ट और व्याख्या'],
      ]),
    ],
  },
  {
    id: 'extra-special',
    title: '4️⃣ Extra Exams Special',
    hint: 'Useful beyond the common core',
    chapters: [
      chapter(
        'clock-calendar',
        'Clock & Calendar',
        'घड़ी एवं कैलेंडर',
        [
          ['clock-01', 'Clock Angle Basics | घड़ी में कोण'],
          ['clock-02', 'Coinciding / Opposite Hands | सुइयों का मिलना और विपरीत होना'],
          ['clock-03', 'Faulty Clock Basics | गलत घड़ी के प्रश्न'],
          ['calendar-01', 'Odd Days | विषम दिन'],
          ['calendar-02', 'Day / Date Finding | दिन और तारीख ज्ञात करना'],
          ['calendar-03', 'Leap Year Rules | लीप वर्ष के नियम'],
        ],
        scope('extra', 'core', 'core'),
      ),
      chapter(
        'permutation-combination',
        'Permutation & Combination',
        'क्रमचय एवं संचय',
        [
          ['pc-01', 'Factorial Basics | फैक्टोरियल'],
          ['pc-02', 'Fundamental Counting Principle | गणना का मूल सिद्धांत'],
          ['pc-03', 'Permutation Basics | क्रमचय'],
          ['pc-04', 'Combination Basics | संचय'],
          ['pc-05', 'Selection / Arrangement Problems | चयन और व्यवस्था'],
        ],
        EXTRA_ALL,
      ),
      chapter(
        'probability',
        'Probability',
        'प्रायिकता',
        [
          ['prob-01', 'Sample Space & Events | नमूना समष्टि और घटनाएँ'],
          ['prob-02', 'Basic Probability Formula | मूल प्रायिकता सूत्र'],
          ['prob-03', 'Cards / Dice / Coins | ताश, पासा और सिक्का'],
          ['prob-04', 'Complementary Probability | पूरक प्रायिकता'],
          ['prob-05', 'Simple Independent Events | सरल स्वतंत्र घटनाएँ'],
        ],
        EXTRA_ALL,
      ),
    ],
  },
];

const FILTERS: MasterExamFilter[] = [
  'All Exams',
  'SSC CHSL',
  'Railway Group D',
  'UP Lekhpal',
];

const STORAGE_KEY = 'field-log:v2:master-syllabus:maths';
const BACKUP_VERSION = 1;

const STATUS_ORDER: SubtopicStatus[] = [
  'Not Started',
  'Learning',
  'Completed',
  'Revision',
];

const STATUS_META: Record<
  SubtopicStatus,
  { label: string; classes: string; iconClasses: string }
> = {
  'Not Started': {
    label: 'Not Started',
    classes: 'bg-slate-900 border-slate-700 text-slate-300',
    iconClasses: 'text-slate-500',
  },
  Learning: {
    label: 'Learning',
    classes: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
    iconClasses: 'text-amber-400',
  },
  Completed: {
    label: 'Completed',
    classes: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
    iconClasses: 'text-emerald-400',
  },
  Revision: {
    label: 'Revision',
    classes: 'bg-purple-950/40 border-purple-500/40 text-purple-200',
    iconClasses: 'text-purple-400',
  },
};

const allSubtopicIds = MATHS_MASTER_SYLLABUS.flatMap(section =>
  section.chapters.flatMap(chapterItem =>
    chapterItem.subtopics.map(subtopic => subtopic.id),
  ),
);

const createInitialProgress = (): Record<string, SubtopicStatus> =>
  Object.fromEntries(allSubtopicIds.map(id => [id, 'Not Started' as SubtopicStatus]));

const loadProgress = (): Record<string, SubtopicStatus> => {
  if (typeof window === 'undefined') return createInitialProgress();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return createInitialProgress();

    const candidate = parsed as Record<string, unknown>;
    const defaults = createInitialProgress();

    allSubtopicIds.forEach(id => {
      const value = candidate[id];
      if (typeof value === 'string' && STATUS_ORDER.includes(value as SubtopicStatus)) {
        defaults[id] = value as SubtopicStatus;
      }
    });

    return defaults;
  } catch {
    return createInitialProgress();
  }
};

const scopeFor = (chapterItem: MathsChapter, filter: MasterExamFilter): 'core' | 'extra' => {
  if (filter === 'All Exams') return 'core';
  return chapterItem.scope[filter];
};

const MasterSyllabus = ({
  selectedExam,
  onSelectedExamChange,
}: {
  selectedExam?: string;
  onSelectedExamChange?: (exam: string) => void;
}) => {
  const normalizedExternalFilter: MasterExamFilter =
    FILTERS.includes(selectedExam as MasterExamFilter)
      ? (selectedExam as MasterExamFilter)
      : 'All Exams';

  const [activeFilter, setActiveFilter] = useState<MasterExamFilter>(normalizedExternalFilter);
  const [progress, setProgress] = useState<Record<string, SubtopicStatus>>(loadProgress);
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({
    percentage: true,
  });
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    setActiveFilter(normalizedExternalFilter);
  }, [normalizedExternalFilter]);

  const visibleStats = useMemo(() => {
    const all = MATHS_MASTER_SYLLABUS.flatMap(sectionItem => sectionItem.chapters)
      .flatMap(chapterItem => chapterItem.subtopics);

    const completed = all.filter(subtopic => progress[subtopic.id] === 'Completed').length;
    const learning = all.filter(subtopic => progress[subtopic.id] === 'Learning').length;
    const revision = all.filter(subtopic => progress[subtopic.id] === 'Revision').length;
    const tracked = all.filter(subtopic => progress[subtopic.id] !== 'Not Started').length;

    return {
      total: all.length,
      completed,
      learning,
      revision,
      tracked,
      percent: Math.round((completed / Math.max(1, all.length)) * 100),
    };
  }, [progress]);

  const cycleStatus = (id: string) => {
    setProgress(previous => {
      const current = previous[id] ?? 'Not Started';
      const currentIndex = STATUS_ORDER.indexOf(current);
      const next = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
      return { ...previous, [id]: next };
    });
  };

  const toggleChapter = (id: string) => {
    setOpenChapters(previous => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const setFilter = (filter: MasterExamFilter) => {
    setActiveFilter(filter);
    onSelectedExamChange?.(filter);
  };

  const exportBackup = () => {
    const payload = {
      app: 'Field Log',
      component: 'MasterSyllabus',
      subject: 'Maths',
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      progress,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `field-log-master-syllabus-maths-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    if (file.size > 1_000_000) {
      alert('Backup file 1 MB se chhoti honi chahiye.');
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as {
        app?: unknown;
        component?: unknown;
        subject?: unknown;
        version?: unknown;
        progress?: unknown;
      };

      if (
        parsed.app !== 'Field Log' ||
        parsed.component !== 'MasterSyllabus' ||
        parsed.subject !== 'Maths' ||
        parsed.version !== BACKUP_VERSION ||
        !parsed.progress ||
        typeof parsed.progress !== 'object'
      ) {
        throw new Error('Invalid MasterSyllabus backup');
      }

      const source = parsed.progress as Record<string, unknown>;
      const restored = createInitialProgress();

      allSubtopicIds.forEach(id => {
        const value = source[id];
        if (typeof value === 'string' && STATUS_ORDER.includes(value as SubtopicStatus)) {
          restored[id] = value as SubtopicStatus;
        }
      });

      setProgress(restored);
      alert('MasterSyllabus progress restore ho gaya.');
    } catch {
      alert('MasterSyllabus backup file valid nahi hai.');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const chapterProgress = (chapterItem: MathsChapter) => {
    const completed = chapterItem.subtopics.filter(
      subtopic => progress[subtopic.id] === 'Completed',
    ).length;
    const tracked = chapterItem.subtopics.filter(
      subtopic => progress[subtopic.id] !== 'Not Started',
    ).length;
    const percent = Math.round(
      (completed / Math.max(1, chapterItem.subtopics.length)) * 100,
    );

    return { completed, tracked, percent };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase font-bold tracking-widest mb-2">
              <BookOpen size={14} />
              Master Syllabus
              <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-400 tracking-normal">
                Maths
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 font-serif">
              Mathematics MasterSyllabus
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Chapter → Subtopic hierarchy ke saath individual status tracking. Sir’s Priority arithmetic track pehle, phir number system, advanced aur extra-exam topics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button
              type="button"
              onClick={exportBackup}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 hover:border-amber-500 hover:text-amber-300 transition-colors text-xs font-semibold"
            >
              <Download size={15} />
              Export Backup
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 hover:border-emerald-500 hover:text-emerald-300 transition-colors text-xs font-semibold"
            >
              <Upload size={15} />
              Import Backup
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) void importBackup(file);
              }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Completion</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              {visibleStats.percent}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Completed</div>
            <div className="text-xl font-mono font-bold text-slate-100 mt-1">
              {visibleStats.completed}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Learning</div>
            <div className="text-xl font-mono font-bold text-amber-300 mt-1">
              {visibleStats.learning}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Revision</div>
            <div className="text-xl font-mono font-bold text-purple-300 mt-1">
              {visibleStats.revision}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
          <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider font-semibold text-slate-400">
            <Filter size={14} />
            Smart Hybrid Filter
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(filter => {
              const active = activeFilter === filter;
              return (
                <button
                  type="button"
                  key={filter}
                  onClick={() => setFilter(filter)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Extra chapters remain visible for planning, but are softly dimmed and labelled when outside the selected core filter.
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {MATHS_MASTER_SYLLABUS.map(sectionItem => {
          const sectionChapters = sectionItem.chapters;
          const sectionCompleted = sectionChapters.flatMap(item => item.subtopics).filter(
            subtopic => progress[subtopic.id] === 'Completed',
          ).length;
          const sectionTotal = sectionChapters.reduce(
            (sum, chapterItem) => sum + chapterItem.subtopics.length,
            0,
          );
          const sectionPercent = Math.round(
            (sectionCompleted / Math.max(1, sectionTotal)) * 100,
          );

          return (
            <section
              key={sectionItem.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers3 size={16} className="text-amber-500" />
                    <h3 className="font-semibold text-slate-100">{sectionItem.title}</h3>
                    {sectionItem.priority && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        Sir’s Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{sectionItem.hint}</p>
                </div>
                <div className="w-full md:w-72">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    <span>Section progress</span>
                    <span>{sectionCompleted}/{sectionTotal} completed</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${sectionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {sectionItem.chapters.map(chapterItem => {
                  const chapterState = chapterProgress(chapterItem);
                  const isOpen = Boolean(openChapters[chapterItem.id]);
                  const isExtra = activeFilter !== 'All Exams' && scopeFor(chapterItem, activeFilter) === 'extra';

                  return (
                    <div
                      key={chapterItem.id}
                      className={`transition-opacity ${isExtra ? 'opacity-55' : 'opacity-100'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleChapter(chapterItem.id)}
                        className="w-full text-left px-5 py-4 hover:bg-slate-800/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 text-slate-500">
                            {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm md:text-base font-semibold text-slate-200">
                                {chapterItem.title}
                              </h4>
                              {isExtra && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                  Extra
                                </span>
                              )}
                              {activeFilter !== 'All Exams' && !isExtra && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] uppercase tracking-wider font-bold text-emerald-400">
                                  Core
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {chapterItem.hint}
                            </p>
                          </div>
                          <div className="hidden sm:block text-right shrink-0">
                            <div className="text-xs font-mono text-slate-300">
                              {chapterState.completed}/{chapterItem.subtopics.length}
                            </div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-600">
                              Completed
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 ml-7 sm:ml-8 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${chapterState.percent}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-[10px] font-mono text-slate-500">
                            {chapterState.percent}%
                          </span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pl-10 md:pl-14 space-y-2">
                          {chapterItem.subtopics.map(subtopic => {
                            const status = progress[subtopic.id] ?? 'Not Started';
                            const meta = STATUS_META[status];

                            return (
                              <button
                                key={subtopic.id}
                                type="button"
                                role="checkbox"
                                aria-checked={status === 'Completed'}
                                onClick={() => cycleStatus(subtopic.id)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 ${meta.classes}`}
                                title="Click to cycle: Not Started → Learning → Completed → Revision"
                              >
                                <span className={`mt-0.5 shrink-0 ${meta.iconClasses}`}>
                                  {status === 'Completed' ? (
                                    <CheckCircle size={18} />
                                  ) : status === 'Not Started' ? (
                                    <Circle size={18} />
                                  ) : (
                                    <CheckCircle size={18} />
                                  )}
                                </span>

                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm font-medium ${
                                      status === 'Completed'
                                        ? 'text-emerald-100 line-through decoration-emerald-500/60'
                                        : 'text-slate-200'
                                    }`}>
                                      {subtopic.title}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                                      {meta.label}
                                    </span>
                                  </span>
                                  {subtopic.hint && (
                                    <span className="block text-xs text-slate-500 mt-1">
                                      {subtopic.hint}
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-500">
        <span className="text-slate-300 font-semibold">Status loop:</span>{' '}
        Not Started → Learning → Completed → Revision → Not Started. Every subtopic is stored independently in this browser.
      </div>
    </div>
  );
};

export default MasterSyllabus;
