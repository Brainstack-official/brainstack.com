// ============================================================
// BrainStack Chatbot Engine — chatbot.js
// ✅ No API key — 100% offline
// ✅ All 6 BrainStack categories covered
// ✅ Spell correction + case insensitive
// ✅ Greeting, thanks, bye, about, help
// ✅ Topics, projects, roadmaps, PDF search
// ✅ Easy to add new topics and PDFs
// ============================================================

let DB = null;

async function loadDB() {
  try {
    const res = await fetch('data.json');
    DB = await res.json();
    console.log('BrainStack AI: Knowledge base loaded ✅');
  } catch (e) {
    console.error('BrainStack AI: Failed to load data.json ❌', e);
  }
}

// ============================================================
// SPELL CORRECTION — add more typos anytime
// Format: 'wrong': 'correct'
// ============================================================
const TYPOS = {
  // Greetings
  'helo':'hello','hii':'hi','heya':'hey','heyy':'hey','hai':'hi',
  'hiee':'hi','halloo':'hello','hullo':'hello','hallo':'hello',
  // Names
  'rahan':'rehan','rehaan':'rehan','mohamad':'mohammed','muhammed':'mohammed',
  'mohammad':'mohammed','brainstac':'brainstack','brianstack':'brainstack',
  'brainstak':'brainstack','brainstaack':'brainstack',
  // Programming
  'pyhton':'python','pythn':'python','pythoon':'python','phython':'python',
  'pytyon':'python','pyton':'python',
  'javascrip':'javascript','javscript':'javascript','javasript':'javascript',
  'java script':'javascript','javacsript':'javascript',
  'htm':'html','htlm':'html','htnl':'html',
  'csss':'css','ccs':'css',
  'recat':'react','raect':'react','reat':'react','reacr':'react',
  'nodjs':'nodejs','node js':'nodejs','nod js':'nodejs',
  'djnago':'django','dajngo':'django',
  // Engineering
  'mechinical':'mechanical','mechnical':'mechanical','mechnaical':'mechanical',
  'mechanicla':'mechanical','mechanicall':'mechanical',
  'civl':'civil','cival':'civil','ciivl':'civil',
  'thermondynamics':'thermodynamics','thermodynaics':'thermodynamics',
  'thermodyanmics':'thermodynamics','thermidynamics':'thermodynamics',
  'electroncs':'electronics','electornics':'electronics','eletrونics':'electronics',
  'comunicaton':'communication','communcation':'communication',
  // Science
  'chemsitry':'chemistry','chemstry':'chemistry','chmistry':'chemistry',
  'chemisty':'chemistry','chemestry':'chemistry',
  'physcs':'physics','physiscs':'physics','phyics':'physics',
  'mathamatics':'mathematics','mathemtics':'mathematics',
  'matematics':'mathematics','maths':'mathematics','math':'mathematics',
  'botney':'botany','botony':'botany','botaney':'botany',
  'zoologoy':'zoology','zooology':'zoology',
  // AI/CS
  'algorthm':'algorithm','algorithmn':'algorithm','algorithim':'algorithm',
  'alogorithm':'algorithm','algortihm':'algorithm',
  'databse':'database','daatbase':'database','datbase':'database',
  'cybersecurity':'cyber security','cyebr security':'cyber security',
  'cybar security':'cyber security','cybersercurity':'cyber security',
  'nural network':'neural network','nerual network':'neural network',
  'mchine learning':'machine learning','machne learning':'machine learning',
  'mechin learning':'machine learning',
  'artifcial':'artificial','artifical':'artificial','atrificial':'artificial',
  'intellgence':'intelligence','inteligence':'intelligence',
  'deep lerning':'deep learning','dep learning':'deep learning',
  'data sceince':'data science','dat science':'data science',
  // General
  'programing':'programming','progrming':'programming',
  'developement':'development','devlopment':'development',
  'roadmpa':'roadmap','roadmapp':'roadmap','rodmap':'roadmap',
  'projec':'project','proejct':'project','porject':'project',
  'explian':'explain','expalin':'explain','explan':'explain',
  'waht':'what','hwat':'what','teh':'the','nad':'and','adn':'and',
  'becoe':'become','beocme':'become','becme':'become',
  'fullstack':'full stack','full-stack':'full stack',
  'fronend':'frontend','forntend':'frontend',
  'bakend':'backend','backedn':'backend',
  'lows of motion':'laws of motion','law of motion':'laws of motion',
  'newtons law':'laws of motion','newton law':'laws of motion',
};

// ============================================================
// NORMALIZE — lowercase + trim + fix typos
// ============================================================
function normalize(text) {
  let t = text.toLowerCase().trim();
  // single word fixes
  t = t.split(/\s+/).map(w => TYPOS[w] || w).join(' ');
  // multi-word fixes
  for (const [typo, correct] of Object.entries(TYPOS)) {
    if (typo.includes(' ')) t = t.replace(new RegExp(typo, 'g'), correct);
  }
  return t;
}

// ============================================================
// MAIN — get reply
// ============================================================
function getReply(rawMessage) {
  if (!DB) return { text:"Still loading… please try again in a second! 😊", pdfs:[], roadmap:null };

  const msg = normalize(rawMessage);

  // 1. Greeting
  if (isGreeting(msg)) return replyGreeting();

  // 2. Thanks
  if (matchAny(msg, DB.responses.thanks)) return replyThanks();

  // 3. Bye
  if (matchAny(msg, DB.responses.bye)) return replyBye();

  // 4. About BrainStack / Who created / Who are you
  if (isAbout(msg)) return replyAbout();

  // 5. Help / What can you do
  if (matchAny(msg, DB.responses.help)) return replyHelp();

  // 6. Show all categories
  if (matchAny(msg, DB.responses.categories)) return replyCategories();

  // 7. Project request
  if (/project|build me|create me|give.*code|sample code|example code|full code|write code|show.*code/.test(msg)) {
    return replyProject(msg);
  }

  // 8. Roadmap request
  if (/roadmap|how to become|learning path|step.*by.*step|career path|how do i become|how can i become|guide to become/.test(msg)) {
    return replyRoadmap(msg);
  }

  // 9. PDF / notes search
  if (/pdf|notes|resources|study material|books|download|find notes|get pdf|suggest pdf|where.*notes|give.*notes/.test(msg)) {
    return replyPDFSearch(msg);
  }

  // 10. Topic explanation (with trigger word)
  if (/explain|what is|what are|define|tell me|describe|how does|difference|vs |compare|teach|learn about|i want to know|about/.test(msg)) {
    const r = replyTopic(msg);
    if (r.matched) return r;
  }

  // 11. Direct topic match (no trigger word needed)
  const direct = replyTopic(msg);
  if (direct.matched) return direct;

  // 12. Fallback
  return replyFallback();
}


// ============================================================
// INTENT HELPERS
// ============================================================
function isGreeting(msg) {
  const greets = ['hi','hello','hey','hii','heya','heyy','sup','yo','hai',
    'good morning','good evening','good afternoon','good night',
    'namaste','howdy','greetings','what\'s up','wassup',
    'hi there','hello there','hey there','hi brainstack',
    'hello brainstack','start','begin','helo','hullo'];
  return greets.some(g =>
    msg === g || msg.startsWith(g+' ') || msg.startsWith(g+'!') || msg.startsWith(g+',')
  );
}

function isAbout(msg) {
  const phrases = [
    'who made','who created','who built','who developed','who is behind',
    'about brainstack','what is brainstack','tell me about brainstack',
    'founder','rehan','shaik','mohammed rehan','shaik mohammed',
    'who are you','what are you','who made you','who created you',
    'who built you','your creator','your founder','your developer',
    'brainstack team','brainstack founder','brainstack creator',
    'about you','introduce yourself','your name'
  ];
  return phrases.some(p => msg.includes(p));
}

function matchAny(msg, list) {
  return list && list.some(item => msg.includes(item));
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// REPLY HANDLERS
// ============================================================

function replyGreeting() {
  const h = new Date().getHours();
  const time = h<5?'Good night':h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night';
  const replies = [
    `${time}! 👋 I'm **BrainStack AI** — your personal study assistant!\n\nI can help you with:\n• 📖 Explain any topic from all 6 categories\n• 💻 Give complete project code\n• 🗺️ Show learning roadmaps\n• 📄 Find the right PDF notes\n\nWhat would you like to learn today?`,
    `Hey! 😊 Welcome to **BrainStack AI**!\n\nAsk me anything like:\n• "Explain thermodynamics"\n• "What are Newton's laws of motion?"\n• "Give me a Python project"\n• "How to become a web developer"\n\nI'm ready! 🚀`,
    `${time}! 🧠 Great to see you!\n\nI know all about BrainStack's 6 categories:\n⚙️ Engineering · 🔬 B.Sc · 💻 Programming\n🌐 Web Dev · 🤖 AI & ML · 📚 Library\n\nWhat shall we study today? 😊`,
  ];
  return {
    text: random(replies), pdfs:[], roadmap:null,
    chips:['Explain machine learning','What is thermodynamics?','Give me a Python project','Show categories']
  };
}

function replyThanks() {
  const replies = [
    "You're welcome! 😊 Keep studying — you're doing amazing! What's next?",
    "Happy to help! 🎉 That's exactly what BrainStack AI is for!",
    "Glad I could help! 🚀 Keep learning and building. What topic is next?",
    "Always here for you! 🧠 No question is too small. Ask me anything!",
    "My pleasure! 😊 You're doing great — keep going! 💪"
  ];
  return { text:random(replies), pdfs:[], roadmap:null, chips:['Explain a topic','Give me a project','Show roadmap'] };
}

function replyBye() {
  const replies = [
    "Goodbye! 👋 Keep learning and building amazing things. Good luck! 🎓",
    "See you soon! 😊 Every expert was once a beginner. Keep going! 🚀",
    "Bye! 👋 Come back anytime. BrainStack AI is always here! 🧠",
    "Take care! 🌟 Study hard, build cool things, come back whenever you need help!"
  ];
  return { text:random(replies), pdfs:[], roadmap:null, chips:[] };
}

function replyAbout() {
  return {
    text:`I'm **BrainStack AI** 🧠 — your personal free study assistant!\n\n**👨‍💻 Created by:** Shaik Mohammed Rehan\nA student who built BrainStack to make quality education free for everyone!\n\n**🌐 Website:** brainstack-com.vercel.app\n\n**📚 BrainStack has 6 Study Categories:**\n• ⚙️ Engineering Hub — Mechanical, Civil, ECE, CSE notes & PDFs\n• 🔬 Bachelor of Science — Physics, Chemistry, Maths, Botany, Zoology\n• 💻 Programming — Python, Java, C++, DSA, DBMS, Cyber Security\n• 🌐 Web Development — HTML, CSS, JavaScript, React, Node.js\n• 🤖 Artificial Intelligence — ML, Deep Learning, Data Science\n• 📚 BrainStack Library — eBooks, textbooks, reference PDFs\n\n**✨ Everything is completely FREE!**\n\nI work without any API key — all my knowledge is built-in! 🚀`,
    pdfs:[], roadmap:null,
    chips:['Show all categories','Give me a project','Learning roadmap','Explain a topic']
  };
}

function replyHelp() {
  return {
    text:`Here's everything I can do for you! 🧠\n\n**📖 Explain Topics — just ask:**\n• "What is thermodynamics?"\n• "Explain Newton's laws of motion"\n• "What is machine learning?"\n• "Tell me about cyber security"\n• "What is photosynthesis?"\n\n**💻 Project Code:**\n• "Give me an HTML CSS project"\n• "Python project with full code"\n• "JavaScript quiz app code"\n\n**🗺️ Learning Roadmaps:**\n• "How to become a web developer"\n• "Roadmap for AI and machine learning"\n• "How to learn cyber security"\n\n**📄 Find PDF Notes:**\n• "Find notes for mechanical engineering"\n• "PDF for machine learning"\n• "Study material for B.Sc chemistry"\n\n**💡 Tips:**\n• Don't worry about spelling — I understand typos!\n• Works in any case — UPPERCASE or lowercase!\n• Ask follow-up questions freely 😊`,
    pdfs:[], roadmap:null,
    chips:['What is thermodynamics?','Python project','Web dev roadmap','Find civil engineering PDF']
  };
}

function replyCategories() {
  const cats = DB.site.categories.map(c => `• ${c.emoji} **${c.name}** — ${c.url}`).join('\n');
  return {
    text:`BrainStack has **6 main study categories** — all FREE! 🎓\n\n${cats}\n\n🌐 **Main website:** ${DB.site.url}\n\nClick any link above or ask me to explain any topic from these categories! 😊`,
    pdfs:[], roadmap:null,
    chips:['Engineering notes','B.Sc notes','Programming guide','AI and ML resources']
  };
}

function replyTopic(msg) {
  const topics = DB.responses.topics;
  let best = null, bestScore = 0;

  for (const [key, data] of Object.entries(topics)) {
    const score = data.keywords.filter(k => msg.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = { key, data }; }
  }

  if (best && bestScore > 0) {
    const pdfs = best.data.pdfIds
      .map(id => DB.pdfs.find(p => p.id === id))
      .filter(Boolean).slice(0, 2);
    return {
      text: best.data.explanation,
      pdfs, roadmap:null, matched:true,
      chips: getChips(best.key)
    };
  }
  return { text:'', pdfs:[], roadmap:null, matched:false };
}

function replyProject(msg) {
  for (const [key, proj] of Object.entries(DB.responses.projects)) {
    if (proj.keywords.some(k => msg.includes(k))) {
      const pdfs = proj.pdfIds.map(id => DB.pdfs.find(p => p.id === id)).filter(Boolean);
      return {
        text:`Here's a complete **${proj.title}** for you! 🎉\n\n\`\`\`\n${proj.code}\n\`\`\`\n\n**How to run:**\n• Copy the code\n• Save as index.html or main.py\n• Open and run it!\n\n💡 Customize it to make it your own!`,
        pdfs, roadmap:null,
        chips:['Explain the code','Give me another project','Show roadmap']
      };
    }
  }
  return {
    text:"I'd love to help with a project! 💻\n\nAvailable projects:\n• 🌐 **HTML & CSS** — portfolio, landing page\n• ⚡ **JavaScript** — quiz app, calculator\n• 🐍 **Python** — grade calculator, game\n\nTry: **\"Give me a Python project\"** or **\"HTML CSS project with code\"** 😊",
    pdfs:[], roadmap:null,
    chips:['HTML CSS project','Python project','JavaScript project']
  };
}

function replyRoadmap(msg) {
  for (const rm of DB.roadmaps) {
    if (rm.keywords.some(k => msg.includes(k))) {
      const steps = rm.steps.map((s,i) => `${i+1}. ${s}`).join('\n');
      return {
        text:`## 🗺️ ${rm.title} Roadmap\n\nYour complete step-by-step path:\n\n${steps}\n\n**⏱️ Time:** 6–12 months of consistent effort\n**💡 Tip:** Master each step before moving forward!\n\nTap the card below for the full roadmap on BrainStack 👇`,
        pdfs:[], roadmap:rm,
        chips:['Find related PDFs','Give me a project','Explain a concept']
      };
    }
  }
  const list = DB.roadmaps.map(r => `• ${r.emoji} ${r.title}`).join('\n');
  return {
    text:`I have roadmaps for these career paths! 🗺️\n\n${list}\n\nAsk like: **"How to become a web developer"** 😊`,
    pdfs:[], roadmap:null,
    chips: DB.roadmaps.slice(0,4).map(r => `Roadmap for ${r.keywords[0]}`)
  };
}

function replyPDFSearch(msg) {
  const matched = DB.pdfs
    .map(p => ({ ...p, score: p.topics.filter(t => msg.includes(t)).length }))
    .filter(p => p.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0, 3);

  if (matched.length > 0) {
    const names = matched.map(p => `• ${p.emoji} ${p.title} (${p.category})`).join('\n');
    return {
      text:`Found these study materials for you! 📚\n\n${names}\n\nTap the cards below to open on BrainStack 👇\n\n🌐 Browse all resources: ${DB.site.url}`,
      pdfs: matched, roadmap:null,
      chips:['Explain the topic','Give me a project','Show roadmap']
    };
  }

  // Show categories instead of just library
  const cats = DB.site.categories.map(c => `• ${c.emoji} ${c.name}`).join('\n');
  return {
    text:`I can find PDFs from all 6 BrainStack categories:\n\n${cats}\n\n🌐 Browse all: **${DB.site.url}**\n\nTry asking: **"Find notes for mechanical engineering"** or **"PDF for machine learning"** 😊`,
    pdfs:[], roadmap:null,
    chips:['Mechanical engineering PDF','Machine learning notes','Python programming PDF','Civil engineering notes']
  };
}

function replyFallback() {
  return {
    text: random(DB.responses.fallbacks),
    pdfs:[], roadmap:null,
    chips:['What is thermodynamics?','Explain machine learning','Python project','Web dev roadmap']
  };
}

// ============================================================
// FOLLOW-UP CHIPS per topic
// ============================================================
function getChips(key) {
  const map = {
    'thermodynamics':       ['Laws of motion','Fluid mechanics','Mechanical engineering PDF'],
    'laws of motion':       ['Thermodynamics','Physics notes PDF','Mechanics basics'],
    'mechanics':            ['Laws of motion','Thermodynamics','B.Sc physics PDF'],
    'civil engineering':    ['Find civil engineering PDF','Structural engineering','Fluid mechanics'],
    'electronics':          ['ECE engineering PDF','Digital electronics','Microcontroller basics'],
    'mechanical engineering':['Thermodynamics','Find mechanical PDF','Machine design'],
    'chemistry':            ['Organic chemistry','Physical chemistry','B.Sc chemistry PDF'],
    'physics':              ['Laws of motion','Optics basics','B.Sc physics PDF'],
    'mathematics':          ['Calculus basics','Statistics','B.Sc maths PDF'],
    'botany':               ['Photosynthesis','B.Sc botany PDF','Zoology basics'],
    'zoology':              ['Animal kingdom','Genetics basics','B.Sc zoology PDF'],
    'machine learning':     ['Deep learning','Data science','AI roadmap'],
    'artificial intelligence':['Machine learning','Deep learning','AI roadmap'],
    'deep learning':        ['Neural networks','NLP basics','Machine learning'],
    'data science':         ['Machine learning','Python for data','Statistics'],
    'python':               ['Django basics','Machine learning with Python','Python project'],
    'javascript':           ['React basics','Node.js backend','JavaScript project'],
    'html':                 ['CSS styling','JavaScript basics','HTML project'],
    'css':                  ['HTML basics','Flexbox guide','CSS project'],
    'react':                ['Node.js backend','Full stack roadmap','React project'],
    'nodejs':               ['REST API','MongoDB','Full stack roadmap'],
    'java':                 ['OOP concepts','DSA in Java','Java project'],
    'data structures':      ['DSA roadmap','Algorithm complexity','Coding interview prep'],
    'database':             ['SQL queries','MongoDB basics','DBMS PDF'],
    'cyber security':       ['Ethical hacking','Network security','Cyber security roadmap'],
  };
  return map[key] || ['Give me a project','Show roadmap','Find PDF notes'];
}

















// ============================================================
// BRAINSTACK AI: HIGH-INTELLIGENCE EXPERT SYSTEM (v5.2 - DYNAMIC PDF CARDS)
// ============================================================

console.log("BrainStack Intelligence Engine v5.2: Dynamic B.Sc PDF Linking Active ✅");

const BRAINSTACK_DOMAINS = {
  "Web Development": {
    analogy: "building a modern digital restaurant. The frontend is the dining room where users sit, HTML/CSS is the decor, and Javascript is the interactive waiter taking orders.",
    pillars: [
      "Frontend Engineering: Mastery of HTML5, responsive CSS grids, framework components, and UI state tracking.",
      "Backend Architectures: RESTful APIs, routing servers (Node.js/Python), data validation, and secure authentication flows.",
      "Database Layer: Storing structured datasets natively using relational engines (SQL) or flexible collections (NoSQL)."
    ],
    roadmap: "Phase 1: Pure HTML, CSS, and basic JavaScript UI control (Month 1) | Phase 2: Frontend Frameworks like React/Vue and State Management (Months 2-3) | Phase 3: Backend APIs with Node.js/Express and Database systems like MongoDB/PostgreSQL (Months 4-5) | Phase 4: Full Stack deployments, security hardening, and Cloud setups (Month 6+).",
    plan: "Week 1: Visual interfaces, CSS layouts, and semantic tags | Week 2: JavaScript syntax arrays, objects, and DOM tracking event listeners | Week 3: Asynchronous logic, fetching live network APIs, and rendering data | Week 4: Building a functional multi-tier portfolio application from scratch."
  },
  "Computer Science Engineering": {
    analogy: "the systematic study of calculation, information processing, and systemic architecture. It represents the underlying invisible math and physical logic structures that power software.",
    pillars: [
      "Algorithms & Complexities: Writing optimal logic structures to calculate heavy parameters with minimal system overhead.",
      "Data Structures: Organising raw data into clean operational trees, heaps, matrices, queues, and graph systems.",
      "System Internals: Understanding assembly compilers, OS memory operations, processing threads, and microchips."
    ],
    roadmap: "Phase 1: Foundational Programming Languages (C/C++ or Python) & Discrete Math (Month 1) | Phase 2: Core Data Structures, Sorting Algorithms, and Time Complexity (Months 2-3) | Phase 3: Operating Systems, Computer Networks, and Database Designs (Months 4-5) | Phase 4: Systems Architecture, Distributed Computing, or AI/ML Specializations (Month 6+).",
    plan: "Week 1: Object-oriented concepts and memory tracking metrics | Week 2: Linear data storage architectures (LinkedLists, Stacks, Queues) | Week 3: Advanced data trees, key hash patterns, and custom traversal logic | Week 4: Analyzing time complexities ($O(n)$ metrics) and standard algorithm tuning."
  },
  "App Development": {
    analogy: "building a portable digital tool that lives right inside a user's pocket. The layout must handle varying screen profiles, touch inputs, and device battery optimization dynamically.",
    pillars: [
      "Native & Cross-Platform: Constructing interfaces via platforms like Flutter, React Native, Swift, or Kotlin layouts.",
      "State Management: Coordinating background app execution cycles, persistent local storage, and real-time state reactivity.",
      "Device Integration: Communicating with device hardware layers like system notifications, cameras, and GPS tracking coordinates."
    ],
    roadmap: "Phase 1: UI Design Basics, Layout Widgets, and Programming Fundamentals (Month 1) | Phase 2: State Tracking architectures and local device navigation layouts (Months 2-3) | Phase 3: Live API data fetching, asynchronous state tasks, and storage management (Months 4-5) | Phase 4: Production performance optimizations, app store distribution, and testing rules (Month 6+).",
    plan: "Week 1: Core layout tree setups, widget parameters, and basic UI design metrics | Week 2: User input event handlers, form inputs, and multiple application page routing views | Week 3: Background state handling systems and caching network variables locally | Week 4: Debugging memory leaks, compiling application binaries, and emulating device sizes."
  },
  "B.Sc Botany": {
    analogy: "the biological blueprint of plant life forms. It maps out how cellular networks photosynthesize solar energy, process mineral nutrients, maintain ecosystem structures, and evolve over millennia.",
    pillars: [
      "Plant Physiology & Biochemistry: The study of chemical cycles, enzymatic actions, photosynthetic pathways ($C_3/C_4$), and plant growth hormones.",
      "Anatomy & Histology: Investigating the cellular composition, xylem/phloem transport tissues, and structural layers of plant systems.",
      "Taxonomy & Ecology: Cataloging and classifying plant species into distinct families and identifying their biological balance within environments."
    ],
    roadmap: "Phase 1: Basic Plant Morphology, Cryptogams, and Microscopic Cellular Anatomy (Month 1) | Phase 2: Advanced Plant Physiology, Metabolic Photosynthesis Pathways, and Genetics (Months 2-3) | Phase 3: Plant Pathology, Ecology Ecosystem Dynamics, and Applied Biotechnology (Months 4-5) | Phase 4: Advanced Phytochemistry, Molecular Biology, and Taxonomy Systems (Month 6+).",
    plan: "Week 1: Microscopy setup, cellular walls, and classification rules of simple non-flowering plants | Week 2: Vascular plant tissue functions, root layouts, and structural anatomy variants | Week 3: Cellular respiration cycles, light/dark reactions, and enzyme activities | Week 4: Studying local ecosystem distributions and plant-pathogen defense systems."
  },
  "B.Sc Zoology": {
    analogy: "the complete structural mechanics and behavioral biology of the animal kingdom. It breaks down how animal species survive, consume energy, adapt structures, and process physiological functions.",
    pillars: [
      "Invertebrate & Vertebrate Biology: Tracing anatomical progression from unicellular organisms up to complex mammalian networks.",
      "Animal Physiology & Endocrinology: Investigating nervous system grids, digestive tracks, respiratory functions, and hormonal signaling.",
      "Evolutionary Genetics: Mapping out chromosomes, cell divisions (Mitosis/Meiosis), inherited variations, and natural survival tracks."
    ],
    roadmap: "Phase 1: Non-Chordate Taxonomies, Microscopic Cell Biology, and Tissue Architectures (Month 1) | Phase 2: Chordate Morphology, Comparative Vertebrate Anatomy, and Histology (Months 2-3) | Phase 3: Human/Animal Physiology, Complex Metabolic Pathways, and Developmental Embryology (Months 4-5) | Phase 4: Molecular Genetics, Applied Wildlife Conservation, and Animal Behaviorism (Month 6+).",
    plan: "Week 1: Phylum classifications, animal structural hierarchies, and base cell functions | Week 2: Comparative study of organ architectures (heart, lungs, nervous systems) across species | Week 3: Enzymatic digestion kinetics, reproductive biology, and endocrine gland paths | Week 4: Genetic cross-mapping, hereditary mutations, and ecological adaptive behaviors."
  },
  "B.Sc Physics": {
    analogy: "the foundational rules governing space, time, matter, and energy. It answers how everything in our reality interacts, from subatomic quantum states to massive cosmic bodies.",
    pillars: [
      "Classical Mechanics & Dynamics: The math backing movement, force calculations, inertia, wave frequencies, and rotational fields.",
      "Thermodynamics & Electromagnetism: Exploring thermal dynamics, entropy laws, magnetic charges, circuit fields, and light optics.",
      "Modern Physics & Quantum Fields: Breaking down relativity vectors, nuclear structures, atom splits, and wave-particle behavior models."
    ],
    roadmap: "Phase 1: Vector Calculus, Classical Mechanics, Newtonian Motion Laws, and Wave Oscillations (Month 1) | Phase 2: Kinetic Thermodynamics, Thermal Systems, Optics, and Basic Electromagnetism (Months 2-3) | Phase 3: Mathematical Physics, Electrostatics, Electronic Circuit Layouts, and Analog Devices (Months 4-5) | Phase 4: Quantum Physics, Special Relativity Mechanics, and Atomic/Nuclear Physics (Month 6+).",
    plan: "Week 1: Differential equations, rigid body movements, and rotational mechanics math | Week 2: Wave propagation paths, interference interference models, and geometric lens configurations | Week 3: Electric potentials, magnetic flux variables, and circuit loop analysis calculations | Week 4: Blackbody radiation foundations, photon interactions, and introductory quantum numbers."
  },
  "B.Sc Chemistry": {
    analogy: "the molecular code of matter. It looks closely at how atoms bond together, share electrons, form elements, create compounds, and experience structural transformations during reactions.",
    pillars: [
      "Organic Chemistry: Tracking carbon chains, functional group mechanisms, reaction profiles, and synthetic compounds.",
      "Inorganic Chemistry: Studying periodic elements, chemical bonding architectures, metal coordinates, and crystalline systems.",
      "Physical Chemistry: The mathematical calculations of chemical kinetics, thermodynamics, balance variables, and atomic structures."
    ],
    roadmap: "Phase 1: Fundamental Atomic Architectures, Periodic Table Rules, and Chemical Gas Laws (Month 1) | Phase 2: Functional Organic Stereochemistry, Reaction Intermediates, and Solid-State Fields (Months 2-3) | Phase 3: Coordination Chemistry, Electrochemistry Systems, and Reaction Kinetics Equations (Months 4-5) | Phase 4: Advanced Analytical Spectroscopy, Quantum Molecular Modeling, and Polymer Synthesis (Month 6+).",
    plan: "Week 1: Periodic trends, electronic configurations, and molecular orbital diagrams | Week 2: Hydrocarbon naming rules, resonance models, and electrophilic substitution paths | Week 3: Reaction rate models, balancing equilibrium Constants ($K_c$), and activation energy shifts | Week 4: Laboratory purification workflows, titration calculations, and acid-base buffers."
  },
  "B.Sc Mathematics": {
    analogy: "the universal language of abstract relationships and patterns. It creates the deductive logic systems used to calculate multi-dimensional problems, changes, structures, and spaces.",
    pillars: [
      "Real Analysis & Calculus: Evaluating infinity patterns, convergence limits, continuity behaviors, and advanced integration systems.",
      "Abstract Algebra: Exploring group configurations, ring architectures, field theories, and symmetric layouts.",
      "Linear Algebra & Geometry: Solving matrix transformations, vector configurations, linear spaces, and multi-dimensional calculations."
    ],
    roadmap: "Phase 1: Calculus Foundations, Limits, Convergence Tests, and Analytical Solid Geometry (Month 1) | Phase 2: Advanced Real Analysis, Sequence Limits, and Ordinary Differential Equations (Months 2-3) | Phase 3: Abstract Group Theories, Rings, Vector Subspaces, and Matrix Transformations (Months 4-5) | Phase 4: Complex Variable Analysis, Partial Differential Systems, and Numerical Math Approximations (Month 6+).",
    plan: "Week 1: Limits ($ \\epsilon - \delta $ method), continuity criteria, and fundamental derivatives | Week 2: Sequences tests (ratio, root tests), convergence behaviors, and integration methods | Week 3: Matrix ranks, vector independence spaces, and determining eigenvalues/eigenvectors | Week 4: Group structures, modular arithmetic loops, and cyclic group properties."
  },
  "B.Sc Computer Science": {
    analogy: "the bridge between software programming logic and mathematical foundations. It focuses on computation design, information processing structures, and database optimization paradigms.",
    pillars: [
      "Computation Theories: Understanding data logic algorithms, complexity values, and data structures.",
      "Database Administration: Writing stable queries, designing schemas, and configuring system management pipelines.",
      "System Programming: Designing software parameters close to the operating environment hardware layers."
    ],
    roadmap: "Phase 1: Programming Fundamentals with Python or C++, Architecture Layouts (Month 1) | Phase 2: Data Structures, Algorithmic Analysis, and System Paradigms (Months 2-3) | Phase 3: Database Architectures (DBMS), Software Engineering, and Operating Environments (Months 4-5) | Phase 4: Applied Network Protocols, Cyber Architectures, and Framework Deployments (Month 6+).",
    plan: "Week 1: Algorithmic structures, pseudo-coding layouts, and control expressions | Week 2: Array models, search protocols, and collection storage configurations | Week 3: Relational tables structure, key mappings, and indexing performance rules | Week 4: Building an interactive terminal script applying data logic patterns."
  }
};

if (typeof getReply === 'function') {
  const baseEngine = getReply;

  getReply = function(rawMessage) {
    const msg = rawMessage.toLowerCase().trim();
    
    // 1. CORE NAVIGATION ROUTING
    if (msg.includes("library") || msg === "brainstack library") {
      return {
        text: `Welcome to the **BrainStack Library**! 📚 Here, we catalog core syllabus materials, notes, and academic resources into clean directories.\n\n• Use the system menus to jump straight into **Engineering Hub**, **Bachelor of Science**, or **Programming**.\n• Or type your specific topic (e.g., *B.Sc Zoology*, *Web Development roadmap*) for instantly generated assistance!`,
        pdfs: [], roadmap: null, chips: ["Engineering Hub", "Bachelor of Science", "Programming"]
      };
    }
    
    if (msg === "projects" || msg.includes("give me projects")) {
      return {
        text: `Let's build something awesome! 🛠️ Practical applications are where skills are made. Tell me your target field (e.g., *Web Dev projects*, *Botany experiments*, *Python apps*) and I'll generate a custom task blueprint for you!`,
        pdfs: [], roadmap: null, chips: ["Web Dev projects", "Python projects", "AI projects"]
      };
    }

    if (msg === "roadmaps" || msg === "show roadmaps") {
      return {
        text: `Looking for a clear path forward? 🗺️ I can generate structured, step-by-step career and learning blueprints for any course. Just type your field, like **"Roadmap for Physics"** or **"Web development roadmap"**!`,
        pdfs: [], roadmap: null, chips: ["Web dev roadmap", "B.Sc Botany roadmap", "Computer Science roadmap"]
      };
    }

    // 2. CASUAL CONVERSATION & CREATOR ROUTING
    if (/\b(hello|hi|hey|greetings|good morning)\b/.test(msg)) {
      return {
        text: `Hey there! 👋 Welcome to BrainStack. I'm your dedicated study partner. Whether you need a 4-week study routine, a deep career roadmap, or clear explanations for your topics, I've got your back. What field are we exploring today?`,
        pdfs: [], roadmap: null, chips: ["Bachelor of Science", "Web Dev Roadmap", "Programming"]
      };
    }

    if (msg.includes("who created") || msg.includes("creator") || msg.includes("developed by")) {
      return {
        text: `**BrainStack** was conceptualized and engineered by **Shaik Mohammed Rehan**! 🚀 It was built as a high-intelligence learning hub designed to simplify student learning curves, map professional roadmaps, and provide clear structure to academic journeys.`,
        pdfs: [], roadmap: null, chips: ["BrainStack Library", "Engineering Hub"]
      };
    }

    // 3. INTENT DETECTION FLAGS
    const isPlan = /\b(plan|study plan|schedule|routine|timetable|track)\b/.test(msg);
    const isRoadmap = /\b(roadmap|road map|path|career|learning path)\b/.test(msg);
    const isPDFSearch = /\b(pdf|notes|resources|study material|books|download|find notes|get pdf|give.*notes)\b/.test(msg);

 // 4. DETECT CURRENT TARGET DOMAIN FROM MESSAGE
    let domainKey = null;

    if (msg.includes("web dev") || msg.includes("web development") || msg.includes("full stack")) {
      domainKey = "Web Development";
    } 
    else if (msg.includes("app dev") || msg.includes("app development") || msg.includes("mobile dev") || msg.includes("android") || msg.includes("ios")) {
      domainKey = "App Development";
    }
    else if (msg.includes("computer science") || msg.includes("cse")) {
      if (msg.includes("bsc") || msg.includes("b.sc")) {
        domainKey = "B.Sc Computer Science";
      } else {
        domainKey = "Computer Science Engineering";
      }
    }
    else if (msg.includes("botany")) domainKey = "B.Sc Botany";
    else if (msg.includes("zoology")) domainKey = "B.Sc Zoology";
    else if (msg.includes("physics")) domainKey = "B.Sc Physics";
    else if (msg.includes("chemistry")) domainKey = "B.Sc Chemistry";
    else if (msg.includes("mathematics") || msg.includes("maths") || msg.includes("math")) domainKey = "B.Sc Mathematics";
    else if (msg.includes("bsc") || msg.includes("b.sc") || msg.includes("bachelor of science")) domainKey = "B.Sc Mathematics";
 
    // 5. IF VALID MATCH FOUND IN DATA DICTIONARY -> GENERATE EXPLANATION WITH ACTUAL PDF LINKS
    if (domainKey && BRAINSTACK_DOMAINS[domainKey]) {
      const data = BRAINSTACK_DOMAINS[domainKey];
      let outputText = "";

      // DYNAMIC SEARCH INTO DB.PDFS FOR CLICKABLE CARD RENDERING
      const cleanSearchTerm = domainKey.toLowerCase().replace("b.sc ", "");
      const matchedPDFs = DB && DB.pdfs ? DB.pdfs.filter(p => {
        return p.title.toLowerCase().includes(cleanSearchTerm) || 
               p.topics.some(t => cleanSearchTerm.includes(t.toLowerCase())) ||
               (domainKey.startsWith("B.Sc") && p.category.toLowerCase().includes("b.sc"));
      }).slice(0, 2) : [];

      if (isPlan) {
        outputText = `Mapping out a study plan for **${domainKey}** is a brilliant move! Let's break this down into a highly efficient, high-impact 4-week schedule. 🚀\n\n### 📅 Your 4-Week Master Plan\n\n` +
                     `• **Week 1: Core Fundamentals & Framework Rules**\n  ${data.plan.split(" | ")[0]}\n\n` +
                     `• **Week 2: Deep Structure Mechanics**\n  ${data.plan.split(" | ")[1]}\n\n` +
                     `• **Week 3: Practical Projects & Application Exercises**\n  ${data.plan.split(" | ")[2]}\n\n` +
                     `• **Week 4: Review, Edge Cases & Synthesis**\n  ${data.plan.split(" | ")[3]}\n\n` +
                     `--- \n💡 **Pro-Tip:** Consistency beats intensity every single time. 45 minutes every day is 10x better than an 8-hour marathon once a week. You've got this!`;
      } 
      else if (isRoadmap) {
        const phases = data.roadmap.split(" | ");
        outputText = `I've mapped out the industry-standard learning path for **${domainKey}** for you. This is your definitive blueprint from zero to professional capability. 🗺️\n\n### 🗺️ The Competency Roadmap\n\n` +
                     `• **${phases[0].split(": ")[0]}**\n  ${phases[0].split(": ")[1]}\n\n` +
                     `• **${phases[1].split(": ")[0]}**\n  ${phases[1].split(": ")[1]}\n\n` +
                     `• **${phases[2].split(": ")[0]}**\n  ${phases[2].split(": ")[1]}\n\n` +
                     `• **${phases[3].split(": ")[0]}**\n  ${phases[3].split(": ")[1]}\n\n` +
                     `--- \nWould you like me to map out a dedicated day-by-day learning timetable based on this timeline?`;
      } 
      else {
        outputText = `Let's demystify **${domainKey}**! It becomes completely clear when broken down into fundamental building blocks. 🧠\n\n` +
                     `### 🔍 The Big Picture\nAt its absolute core, ${data.analogy}\n\n` +
                     `### 🛠️ The 3 Core Pillars\n` +
                     `1. **${data.pillars[0].split(": ")[0]}:** ${data.pillars[0].split(": ")[1]}\n` +
                     `2. **${data.pillars[1].split(": ")[0]}:** ${data.pillars[1].split(": ")[1]}\n` +
                     `3. **${data.pillars[2].split(": ")[0]}:** ${data.pillars[2].split(": ")[1]}\n\n` +
                     `📥 **Academic Resources:** Tap the interactive panels below to load your custom study notes directly from the BrainStack directory!`;
      }

      return {
        text: typeof formatHTML === 'function' ? formatHTML(outputText) : outputText,
        pdfs: matchedPDFs, // Binds actual matching elements from your data data.json dynamically!
        roadmap: null,
        chips: isPlan ? [`Show roadmap for ${domainKey}`] : [`Give me a study plan for ${domainKey}`]
      };
    }

    // 6. ABSTRACT FALLBACK LOOP FOR NON-DICTIONARY ITEMS
    let abstractSubject = msg
      .replace(/\b(give me a|show me a|how to become a|how to learn|roadmap for|study plan for|explain|what is|tell me about|notes for|course for|can you explain|i want to learn|i need a)\b/g, "")
      .replace(/\b(a|an|the|about|in|of|for|need|want|to|with)\b/g, "")
      .replace(/[?.!]/g, "").replace(/\b(roadmap|road map|study plan|plan|schedule|timetable)\b/g, "").trim();
    
    if (abstractSubject.length > 1) {
      const formattedAbstract = abstractSubject.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (isPlan) return { text: `### 📅 Custom Study Plan: ${formattedAbstract}\n\n• Week 1: Core Fundamentals & Basic Syntax\n• Week 2: Intermediate Implementation Mechanics\n• Week 3: Practical Micro-Projects\n• Week 4: Deep Optimization and Review.`, pdfs: [], roadmap: null, chips: [] };
      if (isRoadmap) return { text: `### 🗺️ Learning Roadmap: ${formattedAbstract}\n\n• Phase 1: Foundational Prerequisites (Month 1)\n• Phase 2: Intermediate Tools & Workflows (Months 2-3)\n• Phase 3: Real-World Portfolio Scaling (Months 4-5)\n• Phase 4: Production Architecture Deployment (Month 6+).`, pdfs: [], roadmap: null, chips: [] };
    }

    return baseEngine(rawMessage);
  };
}
