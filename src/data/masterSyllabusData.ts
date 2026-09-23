export type SubtopicStatus = 'Not Started' | 'Learning' | 'Completed' | 'Revision';

export type MasterExamFilter =
  | 'All Exams'
  | 'SSC CHSL'
  | 'Railway Group D'
  | 'RRB NTPC (12th Level)'
  | 'AOC JOA'
  | 'UP Lekhpal'
  | '12th-Level Govt Core';

export type ExamScope = Record<MasterExamFilter, 'core' | 'extra'>;

export type MathsSubtopic = {
  id: string;
  title: string;
  hint: string;
};

export type SubjectChapter = {
  id: string;
  title: string;
  hint: string;
  scope: ExamScope;
  subtopics: MathsSubtopic[];
};

export type SubjectSection = {
  id: string;
  title: string;
  hint: string;
  priority?: boolean;
  chapters: SubjectChapter[];
};

export const MASTER_SUBJECTS = [
  'Maths',
  'Reasoning',
  'English',
  'GK & Science',
  'General Hindi',
] as const;

export type MasterSubject = (typeof MASTER_SUBJECTS)[number];

const ALL_CORE: ExamScope = {
  'All Exams': 'core',
  'SSC CHSL': 'core',
  'Railway Group D': 'core',
  'RRB NTPC (12th Level)': 'core',
  'AOC JOA': 'core',
  'UP Lekhpal': 'core',
  '12th-Level Govt Core': 'core',
};

const ALL_EXTRA: ExamScope = {
  'All Exams': 'extra',
  'SSC CHSL': 'extra',
  'Railway Group D': 'extra',
  'RRB NTPC (12th Level)': 'extra',
  'AOC JOA': 'extra',
  'UP Lekhpal': 'extra',
  '12th-Level Govt Core': 'extra',
};

const makeScope = (
  ssc: 'core' | 'extra',
  groupD: 'core' | 'extra',
  ntpc: 'core' | 'extra',
  aoc: 'core' | 'extra',
  lekhpal: 'core' | 'extra',
  govtCore: 'core' | 'extra' = 'core',
): ExamScope => ({
  'All Exams': 'core',
  'SSC CHSL': ssc,
  'Railway Group D': groupD,
  'RRB NTPC (12th Level)': ntpc,
  'AOC JOA': aoc,
  'UP Lekhpal': lekhpal,
  '12th-Level Govt Core': govtCore,
});

const makeChapter = (
  id: string,
  title: string,
  hint: string,
  subtopics: Array<[string, string, string]>,
  scope: ExamScope = ALL_CORE,
): SubjectChapter => ({
  id,
  title,
  hint,
  scope,
  subtopics: subtopics.map(([subtopicId, subtopicTitle, subtopicHint]) => ({
    id: subtopicId,
    title: subtopicTitle,
    hint: subtopicHint,
  })),
});

export const MASTER_SYLLABUS: Record<MasterSubject, SubjectSection[]> = {
  Maths: [
    {
      id: 'math-arithmetic',
      title: '1️⃣ Arithmetic Math',
      hint: 'Sir’s Priority • Common quantitative foundation',
      priority: true,
      chapters: [
        makeChapter('percentage', 'Percentage', 'प्रतिशत', [
          ['percentage-01', 'Basic Fractions & Conversions', 'भिन्न से प्रतिशत और प्रतिशत से भिन्न'],
          ['percentage-02', 'Percentage Increase / Decrease', 'प्रतिशत वृद्धि और कमी'],
          ['percentage-03', 'Successive Percentage', 'क्रमिक प्रतिशत परिवर्तन'],
          ['percentage-04', 'Population-based Problems', 'जनसंख्या पर आधारित प्रश्न'],
          ['percentage-05', 'Marks & Election Problems', 'अंक और चुनाव आधारित प्रश्न'],
          ['percentage-06', 'Income / Expenditure Problems', 'आय-व्यय आधारित प्रश्न'],
        ]),
        makeChapter('ratio-proportion', 'Ratio & Proportion', 'अनुपात एवं समानुपात', [
          ['ratio-01', 'Basic Ratio Concepts', 'मूल अनुपात'],
          ['ratio-02', 'Equivalent Ratios & Proportion', 'समतुल्य अनुपात और समानुपात'],
          ['ratio-03', 'Direct & Inverse Proportion', 'प्रत्यक्ष और व्युत्क्रमानुपात'],
          ['ratio-04', 'Compound Ratio', 'मिश्रित अनुपात'],
          ['ratio-05', 'Partnership Linkage', 'साझेदारी में अनुपात का उपयोग'],
        ]),
        makeChapter('profit-loss', 'Profit & Loss', 'लाभ एवं हानि', [
          ['profit-01', 'CP / SP & Basic P/L %', 'क्रय मूल्य, विक्रय मूल्य और लाभ-हानि प्रतिशत'],
          ['profit-02', 'Dishonest Shopkeeper', 'बेईमान दुकानदार'],
          ['profit-03', 'Article-based Problems', 'वस्तु आधारित प्रश्न'],
          ['profit-04', 'CP-MP Relation', 'क्रय मूल्य और अंकित मूल्य का संबंध'],
          ['profit-05', 'Successive Profit / Loss', 'क्रमिक लाभ और हानि'],
        ]),
        makeChapter('discount', 'Discount & Dishonest Shopkeeper', 'छूट एवं बेईमान दुकानदार', [
          ['discount-01', 'Marked Price & Discount', 'अंकित मूल्य और छूट'],
          ['discount-02', 'Successive Discounts', 'क्रमिक छूट'],
          ['discount-03', 'Discount + Profit Combined', 'छूट और लाभ का संयुक्त प्रश्न'],
          ['discount-04', 'False Weight / Measure', 'कम तौल और गलत माप'],
          ['discount-05', 'Effective Gain from Dishonesty', 'बेईमानी से वास्तविक लाभ'],
        ]),
        makeChapter('time-work', 'Time & Work', 'समय एवं कार्य', [
          ['time-work-01', 'Basic LCM Method', 'LCM से काम करने का तरीका'],
          ['time-work-02', 'Efficiency', 'कार्यक्षमता'],
          ['time-work-03', 'Men / Women / Children', 'पुरुष, महिला और बच्चों की कार्यक्षमता'],
          ['time-work-04', 'Combined Work & Wages', 'संयुक्त कार्य और मजदूरी'],
          ['time-work-05', 'Pipes & Cisterns', 'पाइप और टंकी'],
        ]),
        makeChapter('pipe-cistern', 'Pipe & Cistern', 'पाइप एवं टंकी', [
          ['pipe-01', 'Inlet / Outlet Basics', 'भरने और खाली करने की दर'],
          ['pipe-02', 'Net Rate Method', 'शुद्ध दर विधि'],
          ['pipe-03', 'Alternate Pipes', 'बारी-बारी से चलने वाले पाइप'],
          ['pipe-04', 'Leakage Problems', 'रिसाव वाले प्रश्न'],
          ['pipe-05', 'Capacity-based Questions', 'क्षमता आधारित प्रश्न'],
        ]),
        makeChapter('simple-interest', 'Simple Interest', 'साधारण ब्याज', [
          ['si-01', 'Principal, Rate & Time', 'मूलधन, दर और समय'],
          ['si-02', 'Interest and Amount', 'ब्याज और मिश्रधन'],
          ['si-03', 'Changing Rate / Time', 'दर और समय में परिवर्तन'],
          ['si-04', 'Installment-based SI', 'किस्त आधारित साधारण ब्याज'],
          ['si-05', 'Word Problems', 'शब्द-आधारित प्रश्न'],
        ]),
        makeChapter('compound-interest', 'Compound Interest', 'चक्रवृद्धि ब्याज', [
          ['ci-01', 'Annual Compounding', 'वार्षिक चक्रवृद्धि'],
          ['ci-02', 'Half-yearly / Quarterly Compounding', 'अर्धवार्षिक और त्रैमासिक चक्रवृद्धि'],
          ['ci-03', 'CI-SI Difference', 'CI और SI का अंतर'],
          ['ci-04', 'Variable Rate / Time', 'बदलती दर और समय'],
          ['ci-05', 'Growth / Depreciation Applications', 'वृद्धि और ह्रास'],
        ]),
        makeChapter('installment', 'Installment', 'किस्त प्रणाली', [
          ['installment-01', 'Basic Installment Concept', 'मूल किस्त अवधारणा'],
          ['installment-02', 'Present Value Style Questions', 'वर्तमान मूल्य प्रकार'],
          ['installment-03', 'CI Installments', 'चक्रवृद्धि ब्याज वाली किस्त'],
          ['installment-04', 'Equal / Unequal Installments', 'समान और असमान किस्त'],
          ['installment-05', 'Time-based Payment Questions', 'समय आधारित भुगतान'],
        ]),
        makeChapter('average', 'Average', 'औसत', [
          ['average-01', 'Basic Average', 'मूल औसत'],
          ['average-02', 'Missing Value', 'अज्ञात संख्या'],
          ['average-03', 'Replacement & New Average', 'संख्या बदलने पर नया औसत'],
          ['average-04', 'Age / Marks / Salary Average', 'आयु, अंक और वेतन का औसत'],
          ['average-05', 'Weighted Average Basics', 'भारित औसत की मूल बातें'],
        ]),
        makeChapter('time-speed-distance', 'Time, Speed & Distance', 'समय, चाल एवं दूरी', [
          ['tsd-01', 'Basic Formula T = D / S', 'मूल सूत्र'],
          ['tsd-02', 'Relative Speed', 'सापेक्ष चाल'],
          ['tsd-03', 'Unit Conversion', 'इकाई परिवर्तन'],
          ['tsd-04', 'Average Speed', 'औसत चाल'],
          ['tsd-05', 'Meeting / Overtaking', 'मिलने और ओवरटेक करने के प्रश्न'],
        ]),
        makeChapter('train', 'Problems on Train', 'ट्रेन आधारित प्रश्न', [
          ['train-01', 'Train Crossing Pole', 'खंभा पार करना'],
          ['train-02', 'Train Crossing Platform', 'प्लेटफॉर्म पार करना'],
          ['train-03', 'Two Trains Opposite Direction', 'विपरीत दिशा में दो ट्रेन'],
          ['train-04', 'Two Trains Same Direction', 'समान दिशा में दो ट्रेन'],
          ['train-05', 'Train Length / Speed', 'ट्रेन की लंबाई और चाल'],
        ]),
        makeChapter('boat-stream', 'Boat & Stream', 'नाव एवं धारा', [
          ['boat-01', 'Upstream & Downstream', 'धारा के विरुद्ध और साथ'],
          ['boat-02', 'Still Water Speed', 'स्थिर जल में नाव की चाल'],
          ['boat-03', 'Stream Speed', 'धारा की चाल'],
          ['boat-04', 'Time-Distance Problems', 'समय और दूरी'],
          ['boat-05', 'Round Trip Problems', 'आने-जाने की यात्रा'],
        ]),
        makeChapter('race', 'Circular & Linear Race', 'वृत्तीय एवं सीधी दौड़', [
          ['race-01', 'Linear Race Basics', 'सीधी दौड़ की मूल बातें'],
          ['race-02', 'Head Start / Lead', 'बढ़त और शुरुआती लाभ'],
          ['race-03', 'Circular Track Meeting', 'वृत्तीय ट्रैक पर मिलने के प्रश्न'],
          ['race-04', 'Speed Ratio in Race', 'दौड़ में चाल का अनुपात'],
          ['race-05', 'Multiple Round Problems', 'कई चक्कर वाले प्रश्न'],
        ]),
        makeChapter('ages', 'Problems on Ages', 'आयु आधारित प्रश्न', [
          ['ages-01', 'Present Age Relations', 'वर्तमान आयु संबंध'],
          ['ages-02', 'Past Age', 'पिछली आयु'],
          ['ages-03', 'Future Age', 'भविष्य की आयु'],
          ['ages-04', 'Ratio of Ages', 'आयु का अनुपात'],
          ['ages-05', 'Family Age Problems', 'परिवार की आयु पर प्रश्न'],
        ]),
        makeChapter('partnership', 'Partnership', 'साझेदारी', [
          ['partnership-01', 'Capital Ratio', 'पूंजी अनुपात'],
          ['partnership-02', 'Time-based Investment', 'समय आधारित निवेश'],
          ['partnership-03', 'Profit Sharing', 'लाभ का बंटवारा'],
          ['partnership-04', 'Working Partner Salary / Commission', 'काम करने वाले साझेदार का वेतन/कमीशन'],
          ['partnership-05', 'Change in Capital', 'पूंजी में बदलाव'],
        ]),
        makeChapter('mixture-alligation', 'Mixture & Alligation', 'मिश्रण एवं मिश्रानुपात', [
          ['mixture-01', 'Basic Mixture', 'मिश्रण की मूल अवधारणा'],
          ['mixture-02', 'Alligation Rule', 'मिश्रानुपात नियम'],
          ['mixture-03', 'Mean Price', 'औसत मूल्य'],
          ['mixture-04', 'Replacement Method', 'प्रतिस्थापन विधि'],
          ['mixture-05', 'Milk-Water / Alloy Problems', 'दूध-पानी और मिश्रधातु'],
        ]),
        makeChapter('di', 'Data Interpretation (DI)', 'आंकड़ा विश्लेषण', [
          ['di-01', 'Tables', 'सारणी आधारित DI'],
          ['di-02', 'Bar Graph', 'बार ग्राफ'],
          ['di-03', 'Line Graph', 'रेखा ग्राफ'],
          ['di-04', 'Pie Chart', 'पाई चार्ट'],
          ['di-05', 'Caselet DI', 'केसलेट आधारित DI'],
          ['di-06', 'Percentage / Ratio in DI', 'DI में प्रतिशत और अनुपात'],
        ]),
      ],
    },
    {
      id: 'math-number-system',
      title: '2️⃣ Number System',
      hint: 'Calculation foundation • तेज accuracy के लिए',
      chapters: [
        makeChapter('number-system', 'Number System', 'संख्या पद्धति', [
          ['ns-01', 'Natural, Whole & Integers', 'प्राकृतिक, पूर्ण एवं पूर्णांक'],
          ['ns-02', 'Prime / Composite Numbers', 'अभाज्य और भाज्य संख्याएँ'],
          ['ns-03', 'Even, Odd & Co-prime Numbers', 'सम, विषम और सह-अभाज्य'],
          ['ns-04', 'Divisibility Rules', 'विभाज्यता के नियम'],
          ['ns-05', 'Remainder Basics', 'शेषफल की मूल अवधारणा'],
          ['ns-06', 'Unit Digit / Last Digit', 'इकाई अंक'],
        ]),
        makeChapter('calculation-simplification', 'Calculation & Simplification', 'गणना एवं सरलीकरण', [
          ['calc-01', 'BODMAS / VBODMAS', 'क्रमवार संक्रियाएँ'],
          ['calc-02', 'Fractions', 'भिन्न'],
          ['calc-03', 'Decimals', 'दशमलव'],
          ['calc-04', 'Recurring Decimals', 'आवर्ती दशमलव'],
          ['calc-05', 'Approximation', 'सन्निकटन'],
          ['calc-06', 'Square / Cube Basics', 'वर्ग और घन की मूल बातें'],
        ]),
        makeChapter('surds-indices', 'Surds & Indices', 'करणी एवं घातांक', [
          ['surds-01', 'Laws of Indices', 'घातांक के नियम'],
          ['surds-02', 'Positive / Negative / Fractional Powers', 'धनात्मक, ऋणात्मक और भिन्न घात'],
          ['surds-03', 'Surd Simplification', 'करणी का सरलीकरण'],
          ['surds-04', 'Rationalisation', 'हर का परिमेयीकरण'],
          ['surds-05', 'Comparison of Surds', 'करणी की तुलना'],
        ]),
        makeChapter('lcm-hcf', 'LCM & HCF', 'लघुत्तम समापवर्त्य एवं महत्तम समापवर्तक', [
          ['lcm-hcf-01', 'Prime Factorisation', 'अभाज्य गुणनखंड'],
          ['lcm-hcf-02', 'LCM / HCF of Numbers', 'संख्याओं का LCM और HCF'],
          ['lcm-hcf-03', 'Fractions & LCM / HCF', 'भिन्नों के साथ LCM/HCF'],
          ['lcm-hcf-04', 'Word Problems', 'शब्द-आधारित प्रश्न'],
          ['lcm-hcf-05', 'LCM-HCF Relation', 'LCM और HCF का संबंध'],
        ]),
      ],
    },
    {
      id: 'math-advanced',
      title: '3️⃣ Advanced Math',
      hint: 'Concept-heavy chapters • arithmetic के बाद',
      chapters: [
        makeChapter('algebra-quadratic', 'Algebra + Quadratic Equation', 'बीजगणित एवं द्विघात समीकरण', [
          ['alg-01', 'Algebraic Identities', 'बीजगणितीय सर्वसमिकाएँ'],
          ['alg-02', 'Linear Equations', 'रैखिक समीकरण'],
          ['alg-03', 'Factorisation', 'गुणनखंड'],
          ['alg-04', 'Quadratic Equation Basics', 'द्विघात समीकरण की मूल बातें'],
          ['alg-05', 'Roots & Nature of Roots', 'मूल और मूलों की प्रकृति'],
          ['alg-06', 'Algebraic Word Problems', 'बीजगणितीय शब्द-प्रश्न'],
        ]),
        makeChapter('trigonometry-height-distance', 'Trigonometry + Heights & Distance', 'त्रिकोणमिति एवं ऊंचाई-दूरी', [
          ['trig-01', 'Trigonometric Ratios', 'त्रिकोणमितीय अनुपात'],
          ['trig-02', 'Standard Angles', 'मानक कोण'],
          ['trig-03', 'Identities', 'त्रिकोणमितीय सर्वसमिकाएँ'],
          ['trig-04', 'Complementary Angles', 'पूरक कोण'],
          ['trig-05', 'Heights & Distance', 'ऊंचाई और दूरी'],
          ['trig-06', 'Application-based Questions', 'अनुप्रयोग आधारित प्रश्न'],
        ]),
        makeChapter('geometry', 'Geometry', 'ज्यामिति', [
          ['geo-01', 'Lines & Angles', 'रेखाएँ और कोण'],
          ['geo-02', 'Triangles & Congruency', 'त्रिभुज और सर्वांगसमता'],
          ['geo-03', 'Similarity & Pythagoras', 'समरूपता और पाइथागोरस'],
          ['geo-04', 'Quadrilaterals & Polygons', 'चतुर्भुज और बहुभुज'],
          ['geo-05', 'Circles & Chords', 'वृत्त और जीवा'],
          ['geo-06', 'Theorems & Angle Chasing', 'प्रमेय और कोण-आधारित प्रश्न'],
        ]),
        makeChapter('coordinate-geometry', 'Coordinate Geometry', 'निर्देशांक ज्यामिति', [
          ['coord-01', 'Cartesian Plane', 'कार्तीय तल'],
          ['coord-02', 'Coordinates & Quadrants', 'निर्देशांक और चतुर्थांश'],
          ['coord-03', 'Distance Formula', 'दूरी सूत्र'],
          ['coord-04', 'Section / Midpoint Basics', 'मध्यबिंदु और विभाजन'],
          ['coord-05', 'Straight Line Basics', 'सीधी रेखा की मूल बातें'],
        ], makeScope('core', 'core', 'core', 'extra', 'extra')),
        makeChapter('mensuration', 'Mensuration 2D & 3D', 'क्षेत्रमिति', [
          ['mens-01', 'Perimeter & Area', 'परिमाप और क्षेत्रफल'],
          ['mens-02', 'Triangle / Quadrilateral', 'त्रिभुज और चतुर्भुज'],
          ['mens-03', 'Circle', 'वृत्त'],
          ['mens-04', 'Cube / Cuboid', 'घन और घनाभ'],
          ['mens-05', 'Cylinder / Cone / Sphere', 'बेलन, शंकु और गोला'],
          ['mens-06', 'Combined Solids', 'संयुक्त ठोस आकृतियाँ'],
        ]),
        makeChapter('statistics', 'Statistics', 'सांख्यिकी', [
          ['stats-01', 'Mean', 'माध्य'],
          ['stats-02', 'Median', 'माध्यिका'],
          ['stats-03', 'Mode', 'बहुलक'],
          ['stats-04', 'Data Tables & Frequency', 'आंकड़े और आवृत्ति'],
          ['stats-05', 'Basic Charts & Interpretation', 'चार्ट और व्याख्या'],
        ]),
      ],
    },
    {
      id: 'math-extra',
      title: '4️⃣ Extra / Extended Math',
      hint: 'कुछ exams में extra advantage वाले topics',
      chapters: [
        makeChapter('clock-calendar', 'Clock & Calendar', 'घड़ी एवं कैलेंडर', [
          ['clock-01', 'Clock Angle Basics', 'घड़ी में कोण'],
          ['clock-02', 'Coinciding / Opposite Hands', 'सुइयों का मिलना और विपरीत होना'],
          ['clock-03', 'Faulty Clock Basics', 'गलत घड़ी के प्रश्न'],
          ['calendar-01', 'Odd Days', 'विषम दिन'],
          ['calendar-02', 'Day / Date Finding', 'दिन और तारीख ज्ञात करना'],
          ['calendar-03', 'Leap Year Rules', 'लीप वर्ष के नियम'],
        ], makeScope('extra', 'core', 'core', 'extra', 'core')),
        makeChapter('permutation-combination', 'Permutation & Combination', 'क्रमचय एवं संचय', [
          ['pc-01', 'Factorial Basics', 'फैक्टोरियल'],
          ['pc-02', 'Fundamental Counting Principle', 'गणना का मूल सिद्धांत'],
          ['pc-03', 'Permutation Basics', 'क्रमचय'],
          ['pc-04', 'Combination Basics', 'संचय'],
          ['pc-05', 'Selection / Arrangement Problems', 'चयन और व्यवस्था'],
        ], ALL_EXTRA),
        makeChapter('probability', 'Probability', 'प्रायिकता', [
          ['prob-01', 'Sample Space & Events', 'नमूना समष्टि और घटनाएँ'],
          ['prob-02', 'Basic Probability Formula', 'मूल प्रायिकता सूत्र'],
          ['prob-03', 'Cards / Dice / Coins', 'ताश, पासा और सिक्का'],
          ['prob-04', 'Complementary Probability', 'पूरक प्रायिकता'],
          ['prob-05', 'Simple Independent Events', 'सरल स्वतंत्र घटनाएँ'],
        ], ALL_EXTRA),
      ],
    },
  ],

  Reasoning: [
    {
      id: 'reasoning-verbal',
      title: '1️⃣ Core Verbal Reasoning',
      hint: 'High-frequency logic chapters for SSC/Railway/UP exams',
      priority: true,
      chapters: [
        makeChapter('syllogism', 'Syllogism', 'न्यायवाक्य', [
          ['syl-01', 'Statement & Conclusion', 'कथन और निष्कर्ष'],
          ['syl-02', 'Venn Diagram Method', 'वेन आरेख से हल करना'],
          ['syl-03', 'All / Some / No Cases', 'सभी, कुछ और कोई नहीं वाले मामले'],
          ['syl-04', 'Either-Or Cases', 'Either-Or वाले प्रश्न'],
          ['syl-05', 'Only a Few Cases', 'केवल कुछ वाले प्रश्न'],
          ['syl-06', 'Possibility-based Questions', 'संभावना आधारित प्रश्न'],
        ]),
        makeChapter('blood-relations', 'Blood Relations', 'रक्त संबंध', [
          ['blood-01', 'Family Tree Basics', 'परिवार वृक्ष की मूल बातें'],
          ['blood-02', 'Direct Relations', 'सीधे संबंध'],
          ['blood-03', 'Coded Blood Relations', 'कोडित रक्त संबंध'],
          ['blood-04', 'Generation Identification', 'पीढ़ी की पहचान'],
          ['blood-05', 'Mixed Family Statements', 'मिश्रित परिवार कथन'],
        ]),
        makeChapter('coding-decoding', 'Coding-Decoding', 'कूटलेखन एवं कूटवाचन', [
          ['coding-01', 'Letter Shift Coding', 'अक्षर स्थान परिवर्तन'],
          ['coding-02', 'Number / Symbol Coding', 'संख्या और चिन्ह कोडिंग'],
          ['coding-03', 'Word Coding', 'शब्द आधारित कोडिंग'],
          ['coding-04', 'Conditional Coding', 'शर्त आधारित कोडिंग'],
          ['coding-05', 'Decoding from Examples', 'उदाहरण से कूट निकालना'],
        ]),
        makeChapter('analogy', 'Analogy', 'सादृश्य', [
          ['analogy-01', 'Word Analogy', 'शब्द सादृश्य'],
          ['analogy-02', 'Number Analogy', 'संख्या सादृश्य'],
          ['analogy-03', 'Letter Analogy', 'अक्षर सादृश्य'],
          ['analogy-04', 'Mixed Analogy', 'मिश्रित सादृश्य'],
          ['analogy-05', 'Classification-based Analogy', 'वर्गीकरण आधारित सादृश्य'],
        ]),
        makeChapter('series', 'Series', 'श्रृंखला', [
          ['series-01', 'Number Series', 'संख्या श्रृंखला'],
          ['series-02', 'Alphabet Series', 'अक्षर श्रृंखला'],
          ['series-03', 'Alphanumeric Series', 'अक्षर-संख्या श्रृंखला'],
          ['series-04', 'Missing Term', 'लुप्त पद'],
          ['series-05', 'Wrong Term', 'गलत पद'],
        ]),
        makeChapter('classification', 'Classification', 'वर्गीकरण', [
          ['classification-01', 'Odd One Out - Words', 'शब्दों में अलग तत्व'],
          ['classification-02', 'Odd One Out - Numbers', 'संख्याओं में अलग तत्व'],
          ['classification-03', 'Letter Classification', 'अक्षर वर्गीकरण'],
          ['classification-04', 'Figure Classification', 'आकृति वर्गीकरण'],
        ]),
      ],
    },
    {
      id: 'reasoning-logical',
      title: '2️⃣ Logical & Spatial Reasoning',
      hint: 'Diagram-based, ordering and direction questions',
      chapters: [
        makeChapter('direction-distance', 'Direction & Distance', 'दिशा एवं दूरी', [
          ['direction-01', 'Basic Directions', 'मुख्य दिशाएँ'],
          ['direction-02', 'Turn-based Questions', 'मोड़ आधारित प्रश्न'],
          ['direction-03', 'Shortest Distance', 'सबसे छोटी दूरी'],
          ['direction-04', 'Complex Direction Routes', 'जटिल दिशा मार्ग'],
        ]),
        makeChapter('order-ranking', 'Order & Ranking', 'क्रम एवं रैंकिंग', [
          ['ranking-01', 'Basic Ranking', 'मूल रैंकिंग'],
          ['ranking-02', 'Left / Right Position', 'बाएँ और दाएँ स्थान'],
          ['ranking-03', 'Top / Bottom Ranking', 'ऊपर और नीचे की रैंकिंग'],
          ['ranking-04', 'Combined Ranking', 'संयुक्त रैंकिंग'],
        ]),
        makeChapter('seating-arrangement', 'Seating Arrangement', 'बैठक व्यवस्था', [
          ['seating-01', 'Linear Seating', 'सीधी पंक्ति'],
          ['seating-02', 'Circular Seating', 'वृत्ताकार बैठक'],
          ['seating-03', 'Facing North / South', 'उत्तर-दक्षिण मुखी व्यवस्था'],
          ['seating-04', 'Facing Inside / Outside', 'अंदर और बाहर मुखी'],
          ['seating-05', 'Multiple Conditions', 'बहु-शर्त प्रश्न'],
        ]),
        makeChapter('venn-diagram', 'Venn Diagrams', 'वेन आरेख', [
          ['venn-01', 'Two-set Problems', 'दो समुच्चय वाले प्रश्न'],
          ['venn-02', 'Three-set Problems', 'तीन समुच्चय वाले प्रश्न'],
          ['venn-03', 'Category Relationships', 'श्रेणी संबंध'],
          ['venn-04', 'Set Counting', 'समुच्चय गणना'],
        ]),
        makeChapter('non-verbal', 'Non-Verbal Reasoning', 'अशाब्दिक तर्कशक्ति', [
          ['nonverbal-01', 'Mirror Image', 'दर्पण प्रतिबिंब'],
          ['nonverbal-02', 'Water Image', 'जल प्रतिबिंब'],
          ['nonverbal-03', 'Paper Folding', 'कागज मोड़ना'],
          ['nonverbal-04', 'Paper Cutting', 'कागज काटना'],
          ['nonverbal-05', 'Embedded Figures', 'छिपी आकृतियाँ'],
          ['nonverbal-06', 'Figure Completion', 'आकृति पूर्ण करना'],
        ]),
        makeChapter('mathematical-operations', 'Mathematical Operations', 'गणितीय संक्रियाएँ', [
          ['ops-01', 'Symbol Interchange', 'चिन्ह परिवर्तन'],
          ['ops-02', 'Equation Balancing', 'समीकरण संतुलन'],
          ['ops-03', 'Operator Substitution', 'ऑपरेटर बदलना'],
          ['ops-04', 'Mixed Operations', 'मिश्रित संक्रियाएँ'],
        ]),
      ],
    },
    {
      id: 'reasoning-special',
      title: '3️⃣ Reasoning Special',
      hint: 'Railway/UP special emphasis where applicable',
      chapters: [
        makeChapter('clock-calendar-reasoning', 'Clock & Calendar', 'घड़ी एवं कैलेंडर', [
          ['rc-clock-01', 'Clock Time & Angle', 'समय और कोण'],
          ['rc-clock-02', 'Coinciding / Opposite Hands', 'सुइयों का मिलना और विपरीत होना'],
          ['rc-calendar-01', 'Odd Days', 'विषम दिन'],
          ['rc-calendar-02', 'Day / Date Finding', 'दिन और तारीख ज्ञात करना'],
          ['rc-calendar-03', 'Leap Year', 'लीप वर्ष'],
        ], makeScope('extra', 'core', 'core', 'extra', 'core')),
        makeChapter('puzzle', 'Puzzles & Logical Arrangement', 'पहेली एवं तार्किक व्यवस्था', [
          ['puzzle-01', 'Floor-based Puzzle', 'मंजिल आधारित पहेली'],
          ['puzzle-02', 'Box / Shelf Arrangement', 'डिब्बा और शेल्फ व्यवस्था'],
          ['puzzle-03', 'Distribution Puzzle', 'वितरण आधारित पहेली'],
          ['puzzle-04', 'Scheduling Puzzle', 'समय-सारणी आधारित पहेली'],
          ['puzzle-05', 'Multiple Attribute Puzzle', 'बहु-विशेषता पहेली'],
        ], makeScope('core', 'core', 'core', 'extra', 'core')),
        makeChapter('data-sufficiency-reasoning', 'Data Sufficiency', 'डेटा पर्याप्तता', [
          ['ds-01', 'Statement Analysis', 'कथन विश्लेषण'],
          ['ds-02', 'One Statement Sufficiency', 'एक कथन पर्याप्तता'],
          ['ds-03', 'Two Statement Sufficiency', 'दो कथन पर्याप्तता'],
          ['ds-04', 'Combined Data Sufficiency', 'संयुक्त डेटा पर्याप्तता'],
        ], makeScope('core', 'core', 'core', 'extra', 'extra')),
      ],
    },
  ],

  English: [
    {
      id: 'english-grammar',
      title: '1️⃣ Grammar & Error Detection',
      hint: 'Core SSC/RRB English foundation',
      priority: true,
      chapters: [
        makeChapter('error-spotting', 'Error Spotting', 'त्रुटि पहचान', [
          ['error-01', 'Subject-Verb Error', 'कर्ता-क्रिया सामंजस्य की त्रुटि'],
          ['error-02', 'Tense Error', 'काल की त्रुटि'],
          ['error-03', 'Article Error', 'A, An, The की त्रुटि'],
          ['error-04', 'Preposition Error', 'पूर्वसर्ग की त्रुटि'],
          ['error-05', 'Pronoun Error', 'सर्वनाम की त्रुटि'],
          ['error-06', 'Adjective / Adverb Error', 'विशेषण और क्रिया-विशेषण की त्रुटि'],
        ]),
        makeChapter('subject-verb-agreement', 'Subject-Verb Agreement', 'कर्ता-क्रिया सामंजस्य', [
          ['sva-01', 'Singular / Plural Subject', 'एकवचन और बहुवचन कर्ता'],
          ['sva-02', 'Either / Neither / Each', 'Either, Neither, Each के नियम'],
          ['sva-03', 'Collective Nouns', 'समूहवाचक संज्ञाएँ'],
          ['sva-04', 'As well as / Along with', 'सहायक वाक्यांशों के नियम'],
          ['sva-05', 'Advanced Agreement Patterns', 'उन्नत सामंजस्य पैटर्न'],
        ]),
        makeChapter('tenses', 'Tenses', 'काल', [
          ['tenses-01', 'Present Tense', 'वर्तमान काल'],
          ['tenses-02', 'Past Tense', 'भूतकाल'],
          ['tenses-03', 'Future Tense', 'भविष्यत् काल'],
          ['tenses-04', 'Mixed Tense Practice', 'मिश्रित काल अभ्यास'],
        ]),
        makeChapter('voice-narration', 'Voice & Narration', 'वाच्य एवं कथन', [
          ['voice-01', 'Active to Passive', 'कर्तृवाच्य से कर्मवाच्य'],
          ['voice-02', 'Passive to Active', 'कर्मवाच्य से कर्तृवाच्य'],
          ['voice-03', 'Direct to Indirect Speech', 'प्रत्यक्ष से अप्रत्यक्ष कथन'],
          ['voice-04', 'Imperative / Interrogative Narration', 'आज्ञार्थक और प्रश्नवाचक कथन'],
        ]),
        makeChapter('fill-blanks', 'Fill in the Blanks', 'रिक्त स्थान भरना', [
          ['fill-01', 'Grammar-based Blanks', 'व्याकरण आधारित रिक्त स्थान'],
          ['fill-02', 'Vocabulary-based Blanks', 'शब्दावली आधारित रिक्त स्थान'],
          ['fill-03', 'Preposition / Article Blanks', 'पूर्वसर्ग और आर्टिकल'],
          ['fill-04', 'Contextual Blanks', 'संदर्भ आधारित रिक्त स्थान'],
        ]),
      ],
    },
    {
      id: 'english-vocabulary',
      title: '2️⃣ Vocabulary & Usage',
      hint: 'High-yield vocabulary for objective exams',
      chapters: [
        makeChapter('synonyms-antonyms', 'Synonyms / Antonyms', 'पर्यायवाची एवं विलोम', [
          ['syn-01', 'Common Synonyms', 'सामान्य पर्यायवाची'],
          ['syn-02', 'Common Antonyms', 'सामान्य विलोम'],
          ['syn-03', 'Context-based Meaning', 'संदर्भ आधारित अर्थ'],
          ['syn-04', 'PYQ Vocabulary', 'PYQ से महत्वपूर्ण शब्द'],
        ]),
        makeChapter('idioms', 'Idioms & Phrases', 'मुहावरे एवं वाक्यांश', [
          ['idiom-01', 'Common Idioms', 'सामान्य मुहावरे'],
          ['idiom-02', 'Meaning-based Questions', 'अर्थ आधारित प्रश्न'],
          ['idiom-03', 'Usage in Sentence', 'वाक्य में प्रयोग'],
          ['idiom-04', 'PYQ Idioms', 'पिछले वर्षों के महत्वपूर्ण मुहावरे'],
        ]),
        makeChapter('one-word', 'One Word Substitution', 'एक शब्द प्रतिस्थापन', [
          ['ows-01', 'People / Persons', 'व्यक्ति आधारित शब्द'],
          ['ows-02', 'Places / Things', 'स्थान और वस्तु आधारित शब्द'],
          ['ows-03', 'Processes / Ideas', 'प्रक्रिया और विचार आधारित शब्द'],
          ['ows-04', 'Common PYQ Substitutions', 'महत्वपूर्ण PYQ शब्द'],
        ]),
        makeChapter('spelling', 'Spelling & Word Usage', 'वर्तनी एवं शब्द प्रयोग', [
          ['spell-01', 'Common Misspellings', 'सामान्य गलत वर्तनी'],
          ['spell-02', 'Confusing Words', 'भ्रमित करने वाले शब्द'],
          ['spell-03', 'Homophones', 'समोच्चरित भिन्नार्थक शब्द'],
          ['spell-04', 'Correct Word Usage', 'सही शब्द प्रयोग'],
        ]),
      ],
    },
    {
      id: 'english-comprehension',
      title: '3️⃣ Comprehension & Arrangement',
      hint: 'Reading and sentence-logic practice',
      chapters: [
        makeChapter('cloze-test', 'Cloze Test', 'गद्यांश रिक्त स्थान', [
          ['cloze-01', 'Grammar Cloze', 'व्याकरण आधारित क्लोज टेस्ट'],
          ['cloze-02', 'Vocabulary Cloze', 'शब्दावली आधारित क्लोज टेस्ट'],
          ['cloze-03', 'Contextual Choice', 'संदर्भ आधारित विकल्प'],
          ['cloze-04', 'Connector / Preposition Cloze', 'कनेक्टर और प्रीपोजीशन'],
        ]),
        makeChapter('reading-comprehension', 'Reading Comprehension', 'अपठित गद्यांश', [
          ['rc-01', 'Main Idea', 'मुख्य विचार'],
          ['rc-02', 'Factual Questions', 'तथ्यात्मक प्रश्न'],
          ['rc-03', 'Inference Questions', 'निष्कर्ष आधारित प्रश्न'],
          ['rc-04', 'Vocabulary in Context', 'संदर्भ में शब्द का अर्थ'],
          ['rc-05', 'Title / Tone', 'शीर्षक और भाव'],
        ]),
        makeChapter('para-jumbles', 'Para Jumbles', 'वाक्य क्रम व्यवस्थित करना', [
          ['para-01', 'Opening Sentence Identification', 'प्रारंभिक वाक्य की पहचान'],
          ['para-02', 'Linking Words', 'संबंध जोड़ने वाले शब्द'],
          ['para-03', 'Sequence & Chronology', 'क्रम और कालानुक्रम'],
          ['para-04', 'Complete Paragraph Arrangement', 'पूर्ण अनुच्छेद व्यवस्था'],
        ]),
        makeChapter('sentence-improvement', 'Sentence Improvement', 'वाक्य सुधार', [
          ['sentence-01', 'Grammar Correction', 'व्याकरण सुधार'],
          ['sentence-02', 'Word Choice', 'सही शब्द का चयन'],
          ['sentence-03', 'Phrase Replacement', 'वाक्यांश परिवर्तन'],
          ['sentence-04', 'Contextual Improvement', 'संदर्भ आधारित सुधार'],
        ]),
      ],
    },
  ],

  'GK & Science': [
    {
      id: 'gk-history-polity',
      title: '1️⃣ History & Constitution',
      hint: 'Static GK + Indian polity foundation',
      priority: true,
      chapters: [
        makeChapter('indian-history', 'Indian History', 'भारतीय इतिहास', [
          ['history-01', 'Ancient India & Indus Valley', 'प्राचीन भारत और सिंधु घाटी'],
          ['history-02', 'Vedic Age & Mahajanapadas', 'वैदिक काल और महाजनपद'],
          ['history-03', 'Buddhism & Jainism', 'बौद्ध एवं जैन धर्म'],
          ['history-04', 'Maurya & Gupta Period', 'मौर्य और गुप्त काल'],
          ['history-05', 'Medieval India', 'मध्यकालीन भारत'],
          ['history-06', 'Delhi Sultanate & Mughals', 'दिल्ली सल्तनत और मुगल'],
          ['history-07', 'Bhakti & Sufi Movements', 'भक्ति और सूफी आंदोलन'],
          ['history-08', 'Modern India & 1857 Revolt', 'आधुनिक भारत और 1857 का विद्रोह'],
          ['history-09', 'Freedom Movement', 'स्वतंत्रता आंदोलन'],
          ['history-10', 'Constitutional Developments', 'संवैधानिक विकास'],
        ]),
        makeChapter('constitution-polity', 'Constitution & Polity', 'संविधान एवं राजव्यवस्था', [
          ['polity-01', 'Preamble', 'प्रस्तावना'],
          ['polity-02', 'Fundamental Rights', 'मौलिक अधिकार'],
          ['polity-03', 'Directive Principles', 'राज्य के नीति-निर्देशक तत्व'],
          ['polity-04', 'Fundamental Duties', 'मौलिक कर्तव्य'],
          ['polity-05', 'President & Vice-President', 'राष्ट्रपति एवं उपराष्ट्रपति'],
          ['polity-06', 'Prime Minister & Council of Ministers', 'प्रधानमंत्री और मंत्रिपरिषद'],
          ['polity-07', 'Parliament', 'संसद'],
          ['polity-08', 'Supreme Court & High Courts', 'सर्वोच्च और उच्च न्यायालय'],
          ['polity-09', 'Election Commission & Constitutional Bodies', 'निर्वाचन आयोग और संवैधानिक निकाय'],
          ['polity-10', 'Important Articles & Schedules', 'महत्वपूर्ण अनुच्छेद और अनुसूचियाँ'],
        ]),
        makeChapter('economy-basics', 'Economy Basics', 'अर्थव्यवस्था की मूल बातें', [
          ['economy-01', 'GDP / GNP / National Income', 'राष्ट्रीय आय से जुड़े माप'],
          ['economy-02', 'Inflation & Deflation', 'मुद्रास्फीति और अपस्फीति'],
          ['economy-03', 'Banking Basics', 'बैंकिंग की मूल बातें'],
          ['economy-04', 'Budget & Taxation Basics', 'बजट और कराधान'],
          ['economy-05', 'Employment / Poverty / Development', 'रोजगार, गरीबी और विकास'],
        ]),
      ],
    },
    {
      id: 'gk-geography-environment',
      title: '2️⃣ Geography & Environment',
      hint: 'India-focused geography for SSC/Railway/UP',
      chapters: [
        makeChapter('rivers-geography', 'Rivers & Geography', 'नदियाँ एवं भूगोल', [
          ['geo-01', 'Indian River Systems', 'भारतीय नदी तंत्र'],
          ['geo-02', 'Himalayan Rivers', 'हिमालयी नदियाँ'],
          ['geo-03', 'Peninsular Rivers', 'प्रायद्वीपीय नदियाँ'],
          ['geo-04', 'Mountains / Plateaus / Plains', 'पर्वत, पठार और मैदान'],
          ['geo-05', 'Passes / Deserts / Coasts', 'दर्रे, मरुस्थल और तट'],
          ['geo-06', 'Soils of India', 'भारत की मिट्टियाँ'],
          ['geo-07', 'Climate & Monsoon', 'जलवायु और मानसून'],
          ['geo-08', 'Agriculture & Crops', 'कृषि और फसलें'],
        ]),
        makeChapter('states-capitals', 'States, Capitals & Physical Features', 'राज्य, राजधानी एवं भौतिक विशेषताएँ', [
          ['states-01', 'States & Capitals', 'राज्य और राजधानियाँ'],
          ['states-02', 'Union Territories', 'केंद्रशासित प्रदेश'],
          ['states-03', 'Neighbouring Countries', 'पड़ोसी देश'],
          ['states-04', 'Important Borders & Lines', 'महत्वपूर्ण सीमाएँ और रेखाएँ'],
        ]),
        makeChapter('environment-ecology', 'Environment & Ecology', 'पर्यावरण एवं पारिस्थितिकी', [
          ['env-01', 'Ecosystem Basics', 'पारिस्थितिकी तंत्र की मूल बातें'],
          ['env-02', 'Food Chain & Food Web', 'खाद्य श्रृंखला और जाल'],
          ['env-03', 'Biodiversity', 'जैव विविधता'],
          ['env-04', 'Pollution', 'प्रदूषण'],
          ['env-05', 'Climate Change & Ozone', 'जलवायु परिवर्तन और ओजोन'],
          ['env-06', 'National Parks & Wildlife', 'राष्ट्रीय उद्यान और वन्यजीव'],
        ]),
      ],
    },
    {
      id: 'gk-science',
      title: '3️⃣ General Science',
      hint: 'Physics + Chemistry + Biology • Railway depth friendly',
      chapters: [
        makeChapter('physics-optics-electricity', 'Physics: Optics & Electricity', 'भौतिकी: प्रकाशिकी एवं विद्युत', [
          ['phy-01', 'Reflection of Light', 'प्रकाश का परावर्तन'],
          ['phy-02', 'Refraction of Light', 'प्रकाश का अपवर्तन'],
          ['phy-03', 'Mirrors & Lenses', 'दर्पण और लेंस'],
          ['phy-04', 'Human Eye & Optical Instruments', 'मानव नेत्र और प्रकाशीय यंत्र'],
          ['phy-05', 'Current, Voltage & Resistance', 'धारा, विभव और प्रतिरोध'],
          ['phy-06', 'Ohm’s Law & Circuits', 'ओम का नियम और परिपथ'],
          ['phy-07', 'Electrical Power & Energy', 'विद्युत शक्ति और ऊर्जा'],
        ]),
        makeChapter('physics-mechanics', 'Physics: Motion, Force, Work & Energy', 'भौतिकी: गति, बल, कार्य एवं ऊर्जा', [
          ['mech-01', 'Units & Measurements', 'इकाइयाँ और मापन'],
          ['mech-02', 'Motion & Graphs', 'गति और ग्राफ'],
          ['mech-03', 'Laws of Motion', 'गति के नियम'],
          ['mech-04', 'Gravitation', 'गुरुत्वाकर्षण'],
          ['mech-05', 'Work, Energy & Power', 'कार्य, ऊर्जा और शक्ति'],
          ['mech-06', 'Pressure & Fluids', 'दाब और द्रव'],
        ]),
        makeChapter('chemistry-basics', 'Chemistry: Matter, Atoms & Reactions', 'रसायन: पदार्थ, परमाणु और अभिक्रियाएँ', [
          ['chem-01', 'Matter & Its States', 'पदार्थ की अवस्थाएँ'],
          ['chem-02', 'Atoms & Molecules', 'परमाणु और अणु'],
          ['chem-03', 'Elements & Compounds', 'तत्व और यौगिक'],
          ['chem-04', 'Chemical Reactions', 'रासायनिक अभिक्रियाएँ'],
          ['chem-05', 'Acids, Bases & Salts', 'अम्ल, क्षार और लवण'],
          ['chem-06', 'Periodic Table Basics', 'आवर्त सारणी की मूल बातें'],
          ['chem-07', 'Metals / Non-metals & Alloys', 'धातु, अधातु और मिश्रधातु'],
        ]),
        makeChapter('biology-vitamins-diseases', 'Biology: Vitamins, Diseases & Human Body', 'जीवविज्ञान: विटामिन, रोग एवं मानव शरीर', [
          ['bio-01', 'Cell Structure', 'कोशिका संरचना'],
          ['bio-02', 'Human Digestive System', 'मानव पाचन तंत्र'],
          ['bio-03', 'Circulatory System', 'रक्त परिसंचरण तंत्र'],
          ['bio-04', 'Respiratory System', 'श्वसन तंत्र'],
          ['bio-05', 'Nervous System', 'तंत्रिका तंत्र'],
          ['bio-06', 'Vitamins & Deficiency Diseases', 'विटामिन और कमी से होने वाले रोग'],
          ['bio-07', 'Communicable Diseases', 'संक्रामक रोग'],
          ['bio-08', 'Blood, Hormones & Immunity', 'रक्त, हार्मोन और प्रतिरक्षा'],
        ]),
        makeChapter('biology-plants-genetics', 'Biology: Plants & Genetics', 'जीवविज्ञान: वनस्पति एवं आनुवंशिकी', [
          ['plant-01', 'Photosynthesis', 'प्रकाश संश्लेषण'],
          ['plant-02', 'Plant Tissues', 'पादप ऊतक'],
          ['plant-03', 'Reproduction in Plants', 'पौधों में प्रजनन'],
          ['plant-04', 'Cell Division', 'कोशिका विभाजन'],
          ['plant-05', 'Basic Genetics & Heredity', 'आनुवंशिकी और वंशागति'],
        ]),
      ],
    },
    {
      id: 'gk-special',
      title: '4️⃣ State & Rural Special',
      hint: 'UP-focused topics • extra for SSC/Railway, core for UP Lekhpal',
      chapters: [
        makeChapter('up-special-gk', 'UP Special GK', 'उत्तर प्रदेश विशेष सामान्य ज्ञान', [
          ['upgk-01', 'UP History & Culture', 'उत्तर प्रदेश का इतिहास और संस्कृति'],
          ['upgk-02', 'UP Geography', 'उत्तर प्रदेश का भूगोल'],
          ['upgk-03', 'UP Rivers & Irrigation', 'उत्तर प्रदेश की नदियाँ और सिंचाई'],
          ['upgk-04', 'UP Districts / Divisions', 'जिले और मंडल'],
          ['upgk-05', 'UP Important Places', 'महत्वपूर्ण स्थान'],
          ['upgk-06', 'UP Government Institutions', 'राज्य के प्रमुख संस्थान'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('rural-schemes', 'Rural Schemes & Panchayati Raj', 'ग्रामीण योजनाएँ एवं पंचायती राज', [
          ['rural-01', 'Panchayati Raj Structure', 'पंचायती राज की संरचना'],
          ['rural-02', 'Gram Panchayat Functions', 'ग्राम पंचायत के कार्य'],
          ['rural-03', 'Rural Development Schemes', 'ग्रामीण विकास योजनाएँ'],
          ['rural-04', 'Agriculture & Rural Livelihood Schemes', 'कृषि और ग्रामीण आजीविका योजनाएँ'],
          ['rural-05', 'Land Records Basics', 'भूमि अभिलेख की मूल बातें'],
          ['rural-06', 'Village Administration Basics', 'ग्राम प्रशासन की मूल बातें'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('static-gk-art-culture', 'Art, Culture, Books & Awards', 'कला, संस्कृति, पुस्तकें एवं पुरस्कार', [
          ['static-01', 'Classical Dances', 'शास्त्रीय नृत्य'],
          ['static-02', 'Folk Dances & Festivals', 'लोक नृत्य और त्योहार'],
          ['static-03', 'Books & Authors', 'पुस्तकें और लेखक'],
          ['static-04', 'Awards & Honours', 'पुरस्कार और सम्मान'],
          ['static-05', 'Important Firsts in India', 'भारत में प्रथम'],
        ]),
        makeChapter('sports-current-affairs', 'Sports & Current Affairs Basics', 'खेल एवं समसामयिक घटनाओं की बुनियाद', [
          ['ca-01', 'Major Sports Events', 'प्रमुख खेल आयोजन'],
          ['ca-02', 'Cups, Trophies & Venues', 'कप, ट्रॉफी और आयोजन स्थल'],
          ['ca-03', 'Government Schemes & Appointments', 'सरकारी योजनाएँ और नियुक्तियाँ'],
          ['ca-04', 'Important National / International Events', 'महत्वपूर्ण राष्ट्रीय और अंतरराष्ट्रीय घटनाएँ'],
          ['ca-05', 'Science & Technology Current Affairs', 'विज्ञान-तकनीक समसामयिक घटनाएँ'],
        ]),
      ],
    },
  ],

  'General Hindi': [
    {
      id: 'hindi-vyakaran',
      title: '1️⃣ Hindi Grammar',
      hint: 'मुख्य हिंदी व्याकरण • UP-focused core',
      priority: true,
      chapters: [
        makeChapter('sandhi', 'Sandhi', 'संधि एवं संधि-विच्छेद', [
          ['sandhi-01', 'Swar Sandhi', 'स्वर संधि'],
          ['sandhi-02', 'Vyanjan Sandhi', 'व्यंजन संधि'],
          ['sandhi-03', 'Visarga Sandhi', 'विसर्ग संधि'],
          ['sandhi-04', 'Sandhi-Viched Practice', 'संधि-विच्छेद अभ्यास'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('samas', 'Samas', 'समास एवं समास-विग्रह', [
          ['samas-01', 'Avyayibhav Samas', 'अव्ययीभाव समास'],
          ['samas-02', 'Tatpurush Samas', 'तत्पुरुष समास'],
          ['samas-03', 'Karmdharay / Dwandva', 'कर्मधारय और द्वंद्व'],
          ['samas-04', 'Bahuvrihi / Dvigu', 'बहुव्रीहि और द्विगु'],
          ['samas-05', 'Samas-Vigrah Practice', 'समास-विग्रह अभ्यास'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('upsarg-pratyay', 'Upsarg & Pratyay', 'उपसर्ग एवं प्रत्यय', [
          ['up-01', 'Common Prefixes', 'प्रमुख उपसर्ग'],
          ['up-02', 'Common Suffixes', 'प्रमुख प्रत्यय'],
          ['up-03', 'Word Formation', 'शब्द निर्माण'],
          ['up-04', 'Identify Upsarg / Pratyay', 'उपसर्ग-प्रत्यय पहचानना'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('ling-vachan-karak', 'Ling, Vachan & Karak', 'लिंग, वचन एवं कारक', [
          ['lvk-01', 'Gender Identification', 'लिंग की पहचान'],
          ['lvk-02', 'Singular / Plural', 'एकवचन और बहुवचन'],
          ['lvk-03', 'Karak & Their Markers', 'कारक और उनके चिन्ह'],
          ['lvk-04', 'Usage-based Questions', 'प्रयोग आधारित प्रश्न'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('vakya-shuddhi', 'Vakya Shuddhi & Grammar Usage', 'वाक्य शुद्धि एवं व्याकरण प्रयोग', [
          ['vakya-01', 'Grammar Error Detection', 'व्याकरण त्रुटि पहचान'],
          ['vakya-02', 'Word Order', 'शब्द क्रम'],
          ['vakya-03', 'Tense / Agreement in Hindi', 'काल और सामंजस्य'],
          ['vakya-04', 'Sentence Correction', 'वाक्य सुधार'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
      ],
    },
    {
      id: 'hindi-vocabulary',
      title: '2️⃣ Hindi Vocabulary',
      hint: 'शब्द भंडार • objective exam practice',
      chapters: [
        makeChapter('paryayvachi-vilom', 'Paryayvachi / Vilom', 'पर्यायवाची एवं विलोम शब्द', [
          ['pv-01', 'Common Paryayvachi', 'सामान्य पर्यायवाची'],
          ['pv-02', 'Common Vilom', 'सामान्य विलोम'],
          ['pv-03', 'Context-based Word Selection', 'संदर्भ आधारित शब्द चयन'],
          ['pv-04', 'PYQ Word Revision', 'PYQ आधारित शब्द पुनरावृत्ति'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('anekarthi', 'Anekarthi & Samroopi', 'अनेकार्थी एवं समरूपी भिन्नार्थक शब्द', [
          ['anek-01', 'Anekarthi Words', 'अनेकार्थी शब्द'],
          ['anek-02', 'Samroopi Bhinnarthak', 'समरूपी भिन्नार्थक शब्द'],
          ['anek-03', 'Context Identification', 'संदर्भ से सही अर्थ पहचानना'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('muhavare', 'Muhavare & Lokokti', 'मुहावरे और लोकोक्तियाँ', [
          ['muh-01', 'Common Muhavare', 'सामान्य मुहावरे'],
          ['muh-02', 'Meaning Identification', 'अर्थ पहचानना'],
          ['muh-03', 'Sentence Usage', 'वाक्य में प्रयोग'],
          ['muh-04', 'Lokokti Meaning', 'लोकोक्ति का अर्थ'],
          ['muh-05', 'PYQ Revision', 'PYQ पुनरावृत्ति'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('alankar', 'Alankar & Figures of Speech', 'अलंकार एवं काव्यात्मक प्रयोग', [
          ['alankar-01', 'Anupras', 'अनुप्रास अलंकार'],
          ['alankar-02', 'Upma', 'उपमा अलंकार'],
          ['alankar-03', 'Roopak', 'रूपक अलंकार'],
          ['alankar-04', 'Atishyokti / Manvikaran', 'अतिशयोक्ति और मानवीकरण'],
          ['alankar-05', 'Identification Practice', 'अलंकार पहचान अभ्यास'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
      ],
    },
    {
      id: 'hindi-reading',
      title: '3️⃣ Hindi Usage & Comprehension',
      hint: 'Reading, sentence and word-usage practice',
      chapters: [
        makeChapter('one-word-hindi', 'Vakyansh Ke Liye Ek Shabd', 'वाक्यांश के लिए एक शब्द', [
          ['hone-01', 'People / Persons', 'व्यक्ति आधारित शब्द'],
          ['hone-02', 'Places / Objects', 'स्थान और वस्तु आधारित शब्द'],
          ['hone-03', 'Qualities / Conditions', 'गुण और अवस्थाएँ'],
          ['hone-04', 'PYQ One-word Revision', 'PYQ आधारित पुनरावृत्ति'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('shabd-shuddhi', 'Shabd Shuddhi', 'शब्द शुद्धि एवं वर्तनी', [
          ['shuddhi-01', 'Common Spelling Errors', 'सामान्य वर्तनी त्रुटियाँ'],
          ['shuddhi-02', 'Correct Word Forms', 'शुद्ध शब्द रूप'],
          ['shuddhi-03', 'Similar-looking Words', 'समान दिखने वाले शब्द'],
          ['shuddhi-04', 'PYQ Spelling Practice', 'PYQ वर्तनी अभ्यास'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
        makeChapter('hindi-comprehension', 'Hindi Comprehension', 'हिंदी गद्यांश बोध', [
          ['hcomp-01', 'Main Idea', 'मुख्य विचार'],
          ['hcomp-02', 'Factual Questions', 'तथ्यात्मक प्रश्न'],
          ['hcomp-03', 'Inference', 'निष्कर्ष आधारित प्रश्न'],
          ['hcomp-04', 'Vocabulary in Context', 'संदर्भ में शब्दार्थ'],
        ], makeScope('extra', 'extra', 'extra', 'extra', 'core')),
      ],
    },
  ],
};

export const SUBJECT_FILTER_HINTS: Record<MasterSubject, string> = {
  Maths: 'Maths core across SSC/RRB/UP/AOC; advanced extras remain visible.',
  Reasoning: 'Clock & Calendar is Railway/UP core but marked extra for SSC CHSL.',
  English: 'English is core for SSC CHSL, RRB NTPC and AOC; extra for UP-focused exams.',
  'GK & Science': 'General Science is kept broad for Railway; UP Special becomes core for UP Lekhpal.',
  'General Hindi': 'Hindi is core for UP Lekhpal and intentionally marked extra for SSC/RRB/AOC.',
};

export const EXAM_FILTERS: MasterExamFilter[] = [
  'All Exams',
  'SSC CHSL',
  'Railway Group D',
  'RRB NTPC (12th Level)',
  'AOC JOA',
  'UP Lekhpal',
  '12th-Level Govt Core',
];

export const normalizeMasterExam = (value?: string): MasterExamFilter => {
  if (value === 'RRB NTPC' || value === 'RRB NTPC (UG)') return 'RRB NTPC (12th Level)';
  if (value === 'AOC JOA (12th Level)') return 'AOC JOA';
  if (EXAM_FILTERS.includes(value as MasterExamFilter)) return value as MasterExamFilter;
  return 'All Exams';
};
