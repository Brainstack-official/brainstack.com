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
  'newtons law':'laws of motion','newton law':'laws of motion'
};

// ============================================================
// NORMALIZE — lowercase + trim + fix typos
// ============================================================
function normalize(text) {
  let t = text.toLowerCase().trim();
  t = t.split(/\s+/).map(w => TYPOS[w] || w).join(' ');
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

  if (isGreeting(msg)) return replyGreeting();
  if (matchAny(msg, DB.responses.thanks)) return replyThanks();
  if (matchAny(msg, DB.responses.bye)) return replyBye();
  if (isAbout(msg)) return replyAbout();
  if (matchAny(msg, DB.responses.help)) return replyHelp();
  if (matchAny(msg, DB.responses.categories)) return replyCategories();

  if (/project|build me|create me|give.*code|sample code|example code|full code|write code|show.*code/.test(msg)) {
    return replyProject(msg);
  }

  if (/roadmap|how to become|learning path|step.*by.*step|career path|how do i become|how can i become|guide to become/.test(msg)) {
    return replyRoadmap(msg);
  }

  if (/pdf|notes|resources|study material|books|download|find notes|get pdf|suggest pdf|where.*notes|give.*notes/.test(msg)) {
    return replyPDFSearch(msg);
  }

  if (/explain|what is|what are|define|tell me|describe|how does|difference|vs |compare|teach|learn about|i want to know|about/.test(msg)) {
    const r = replyTopic(msg);
    if (r.matched) return r;
  }

  const direct = replyTopic(msg);
  if (direct.matched) return direct;

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
    msg === g || msg.startsWith(g+' ') || msg.startsWith(g+'!') || msg.startsWith(g+'规律') || msg.startsWith(g+',')
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
    `${time}! 👋 I'm **BrainStack AI** — your personal study assistant!\n\nI can help you with:\n• 📖 Explain any topic from our hosted tracks\n• 💻 Give complete project code\n• 🗺️ Show learning roadmaps\n• 📄 Find the right PDF notes\n\nWhat would you like to learn today?`,
    `Hey! 😊 Welcome to **BrainStack AI**!\n\nAsk me anything like:\n• "Explain 5G Technology"\n• "What is prompt engineering?"\n• "Give me a Python project"\n• "How to become a web developer"\n\nI'm ready! 🚀`,
    `${time}! 🧠 Great to see you!\n\nI know all about BrainStack's core categories:\n⚙️ Engineering · 🔬 B.Sc · 💻 Programming\n🌐 Web Dev · 🤖 AI & ML · 📚 Library\n\nWhat shall we study today? 😊`,
  ];
  return {
    text: random(replies), pdfs:[], roadmap:null,
    chips:['Explain 5G technology','What is prompt engineering?','Give me a Python project','Show categories']
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
    text:`I'm **BrainStack AI** 🧠 — your personal free study assistant!\n\n**👨‍💻 Created by:** Shaik Mohammed Rehan\nA student who built BrainStack to make quality education free for everyone!\n\n**🌐 Website:** brainstack-com.vercel.app\n\n**📚 BrainStack has 6 Study Categories:**\n• ⚙️ Engineering Hub — Mechanical, Civil, ECE, CSE notes & PDFs\n• 🔬 Bachelor of Science — Physics, Chemistry, Botany, Zoology\n• 💻 Programming — Python, Java, C++, DSA, DBMS, Cyber Security\n• 🌐 Web Development — HTML, CSS, JavaScript, React, Node.js\n• 🤖 Artificial Intelligence — ML, Deep Learning, Prompt Engineering, BrainStake AI\n• 📚 BrainStack Library — Business, Career building, templates, and textbooks\n\n**✨ Everything is completely FREE and hosted on the website!**`,
    pdfs:[], roadmap:null,
    chips:['Show all categories','Give me a project','Learning roadmap','Explain a topic']
  };
}

function replyHelp() {
  return {
    text:`Here's everything I can do for you! 🧠\n\n**📖 Explain Topics — just ask:**\n• "What is concrete technology?"\n• "Explain prompt engineering"\n• "What is biochemistry?"\n• "Tell me about website deployment"\n\n**💻 Project Code:**\n• "Give me an HTML CSS project"\n• "Python project with full code"\n\n**🗺️ Learning Roadmaps:**\n• "How to become a web developer"\n• "Roadmap for AI and machine learning"\n\n**📄 Find PDF Notes:**\n• "Find notes for civil engineering"\n• "PDF for quantum mechanics"\n\n💡 **Tips:** All study resources are fully hosted on the BrainStack server platforms!`,
    pdfs:[], roadmap:null,
    chips:['What is 5G technology?','Python project','Web dev roadmap','Find botany PDF']
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

// ============================================================
// UPDATED REPLYSYSTEM — HIGH ACCURACY SCORING
// ============================================================
function replyTopic(msg) {
  const topics = DB.responses.topics;
  let best = null;
  let bestScore = 0;

  // Split input into clean individual words to check exact whole-word matches
  const inputWords = msg.split(/\s+/);

  for (const [key, data] of Object.entries(topics)) {
    let score = 0;

    data.keywords.forEach(keyword => {
      // RULE A: Give huge priority to exact multi-word phrase matches
      if (keyword.includes(' ') && msg.includes(keyword)) {
        score += 5; 
      } 
      // RULE B: Check for exact whole-word matches to avoid accidental substring hits
      else {
        const isWholeWord = inputWords.includes(keyword);
        if (isWholeWord) {
          score += 2;
        } else if (msg.includes(keyword)) {
          score += 0.5; // Weak fallback if it's only a partial substring match
        }
      }
    });

    // If scores are tied, select the topic where the master Key matches the query exactly
    if (score > bestScore) {
      bestScore = score;
      best = { key, data };
    } else if (score === bestScore && score > 0 && msg.includes(key)) {
      best = { key, data };
    }
  }

  if (best && bestScore > 0) {
    const pdfs = best.data.pdfIds
      .map(id => DB.pdfs.find(p => p.id === id))
      .filter(Boolean).slice(0, 2);
    return {
      text: best.data.explanation,
      pdfs, roadmap: null, matched: true,
      chips: getChips(best.key)
    };
  }
  return { text: '', pdfs: [], roadmap: null, matched: false };
}

function replyProject(msg) {
  for (const [key, proj] of Object.entries(DB.responses.projects)) {
    if (proj.keywords.some(k => msg.includes(k))) {
      const pdfs = proj.pdfIds.map(id => DB.pdfs.find(p => p.id === id)).filter(Boolean);
      return {
        text:`Here's a complete **${proj.title}** for you! 🎉\n\n\`\`\`\n${proj.code}\n\`\`\`\n\n**How to run:**\n• Copy the code\n• Save appropriately\n• Open and run it!\n\n💡 Customize it to make it your own!`,
        pdfs, roadmap:null,
        chips:['Explain the code','Give me another project','Show roadmap']
      };
    }
  }
  return {
    text:"I'd love to help with a project! 💻\n\nAvailable projects:\n• 🌐 **HTML & CSS** — portfolio website\n• ⚡ **JavaScript** — interactive quiz app\n• 🐍 **Python** — grade calculator\n\nTry: **\"Give me a Python project\"** 😊",
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
      text:`Found these study materials for you! 📚\n\n${names}\n\nTap the cards below to open directly on BrainStack 👇\n\n🌐 Browse all resources: ${DB.site.url}`,
      pdfs: matched, roadmap:null,
      chips:['Explain the topic','Give me a project','Show roadmap']
    };
  }

  const cats = DB.site.categories.map(c => `• ${c.emoji} ${c.name}`).join('\n');
  return {
    text:`I can find PDFs from all BrainStack categories:\n\n${cats}\n\n🌐 Browse all: **${DB.site.url}**\n\nTry asking: **"Find notes for concrete technology"** or **"PDF for prompt engineering"** 😊`,
    pdfs:[], roadmap:null,
    chips:['5G technology notes','Prompt engineering PDF','Organic chemistry PDF','Civil engineering notes']
  };
}

function replyFallback() {
  return {
    text: random(DB.responses.fallbacks),
    pdfs:[], roadmap:null,
    chips:['What is 5G technology?','Explain prompt engineering','Python project','Web dev roadmap']
  };
}

// ============================================================
// FOLLOW-UP CHIPS per topic
// ============================================================
function getChips(key) {
  const map = {
    'thermodynamics':       ['Fluid mechanic','Heat transfer','Mechanical engineering PDF'],
    'laws of motion':       ['Thermodynamics','Physics notes PDF','Engineering physics'],
    'mechanics':            ['Laws of motion','Thermal physics','B.Sc physics PDF'],
    'civil engineering':    ['Building construction','Concrete technology','Find civil PDF'],
    'electronics':          ['Fundamentals of electronics','Internet of things','ECE PDF'],
    'mechanical engineering':['Automobile engineering','Material science','Mechatronics robotics'],
    'chemistry':            ['Organic chemistry','Inorganic chemistry','B.Sc chemistry PDF'],
    'physics':              ['Quantum mechanics','Electricity magnetism','B.Sc physics PDF'],
    'botany':               ['Plant diversity','Plant physiology','B.Sc botany PDF'],
    'zoology':              ['Cell biology and genetic','Animal physiology','B.Sc zoology PDF'],
    'machine learning':     ['Deep learning','Prompt engineering','AI roadmap'],
    'artificial intelligence':['Chat gpt vs perplexity','How to do startup with ai','Brainstake ai'],
    'prompt engineering':   ['Chat gpt vs perplexity','Brainstake ai','AI guide PDF'],
    '5g technology':        ['Communication system','Internet of things','ECE engineering PDF'],
    'building construction':['Concrete technology','Civil engineering Notes','Find civil PDF'],
    'resume template with copy paste example': ['Resume templates copy paste','Communication skills','Aptitude']
  };
  return map[key] || ['Give me a project','Show roadmap','Find PDF notes'];
}

// ============================================================
// BRAINSTACK AI: HIGH-INTELLIGENCE OVERRIDE ROUTING ENGINE (UNIFIED & UPDATED)
// ============================================================
if (typeof getReply === 'function') {
  const baseEngine = getReply;

  getReply = function(rawMessage) {
    const msg = rawMessage.toLowerCase().trim();
    
    // 1️⃣ NEW FIX: Explicitly intercept "chat gpt vs perplexity" to bypass accidental fallback/bye triggers
    if (msg.includes("perplexity") || msg.includes("chat gpt vs perplexity")) {
      const topicData = DB.responses.topics["chat gpt vs perplexity"];
      const matchedPDFs = DB.pdfs.filter(p => topicData.pdfIds.includes(p.id));
      return {
        text: topicData.explanation,
        pdfs: matchedPDFs,
        roadmap: null,
        chips: ["Prompt engineering", "Brainstake ai", "AI guide PDF"]
      };
    }

    // 2️⃣ NEW FIX: Route "Bachelor of Science" directly to its hosted B.Sc resource cards instead of hitting a fallback
    if (msg === "bachelor of science" || msg === "bsc" || msg === "bsc notes") {
      const bscPDFs = DB.pdfs.filter(p => p.category === "Bachelor of Science");
      return {
        text: `### 🔬 Bachelor of Science Hub\n\nWelcome to the **B.Sc academic repository**! 🚀\n\nSelect your department below to view comprehensive study guides and complete lecture notes:\n• ⚛️ **Physics** — Quantum mechanics, thermodynamics, and optics\n• 🧪 **Chemistry** — Organic synthesis, reaction mechanisms, and biochemistry\n• 🌿 **Botany** — Plant physiology, diversity, and cell biology\n• 🦁 **Zoology** — Animal anatomy, evolutionary genetics, and cell biology`,
        pdfs: bscPDFs,
        roadmap: null,
        chips: ["B.Sc Physics", "B.Sc Chemistry", "B.Sc Botany", "B.Sc Zoology"]
      };
    }

    // 3️⃣ NEW FIX: Clean mapping for specific B.Sc sub-domains to match their hosted PDF databases properly
    if (msg.includes("b.sc physics") || msg.includes("bachelor of physics")) {
      return {
        text: DB.responses.topics["what is bachelor of physics"].explanation,
        pdfs: DB.pdfs.filter(p => p.id === "bsc_phy"),
        roadmap: null,
        chips: ["Quantum mechanics", "Thermal physics", "Laws of motion"]
      };
    }

    // 4️⃣ RETAINED: Core Library and Navigation Links
    if (msg.includes("library") || msg === "brainstack library") {
      return {
        text: `Welcome to the **BrainStack Library**! 📚 Hosted directories catalog core academic notes, professional text outlines, and career modules.\n\n• Explore the menus to jump straight into **Engineering Hub**, **Bachelor of Science**, **Web Development**, or **Programming**.\n• Or search any specific topic for real-time generative support!`,
        pdfs: [], roadmap: null, chips: ["Engineering Hub", "Bachelor of Science", "Programming"]
      };
    }
    
    if (msg === "projects" || msg.includes("give me projects")) {
      return {
        text: `Let's build something awesome! 🛠️ Hands-on micro-projects reinforce knowledge fields. Name your target field (e.g., *Web Dev projects*, *Python programs*) and I'll generate a production outline!`,
        pdfs: [], roadmap: null, chips: ["Web Dev projects", "Python projects", "AI projects"]
      };
    }

    if (msg === "roadmaps" || msg === "show roadmaps") {
      return {
        text: `Looking for a clear path forward? 🗺️ I can generate step-by-step career and learning roadmaps for any course. Try: **"Web development roadmap"** or **"Roadmap for AI"**!`,
        pdfs: [], roadmap: null, chips: ["Web dev roadmap", "AI roadmap", "Cyber security roadmap"]
      };
    }

    // 5️⃣ RETAINED: Dynamic Greetings Trigger
    if (/\b(hello|hi|hey|greetings|good morning)\b/.test(msg)) {
      return {
        text: `Hey there! 👋 Welcome to BrainStack. I'm your dedicated AI study partner. Whether you need an organized study roadmap, complete project codes, or quick definitions, I've got your back. What topic are we tracking today?`,
        pdfs: [], roadmap: null, chips: ["Bachelor of Science", "Web Dev Roadmap", "Programming"]
      };
    }

    // 6️⃣ RETAINED: Shaik Mohammed Rehan Creator Attribution
    if (msg.includes("who created") || msg.includes("creator") || msg.includes("developed by")) {
      return {
        text: `**BrainStack** was conceptualized and engineered by **Shaik Mohammed Rehan**! 🚀 It was built as a high-intelligence learning hub to simplify student learning curves, build professional roadmaps, and host critical academic notes completely for free.`,
        pdfs: [], roadmap: null, chips: ["BrainStack Library", "Engineering Hub"]
      };
    }

    // 7️⃣ RETAINED: Structural Domain Configuration Matrices (Web Dev, App Dev, CSE, and B.Sc subjects)
    const isPlan = /\b(plan|study plan|schedule|routine|timetable|track)\b/.test(msg);
    const isRoadmap = /\b(roadmap|road map|path|career|learning path)\b/.test(msg);

    let domainKey = null;
    if (msg.includes("web dev") || msg.includes("web development") || msg.includes("full stack")) domainKey = "Web Development";
    else if (msg.includes("app dev") || msg.includes("app development")) domainKey = "App Development";
    else if (msg.includes("computer science") || msg.includes("cse")) domainKey = "Computer Science Engineering";
    else if (msg.includes("botany")) domainKey = "B.Sc Botany";
    else if (msg.includes("zoology")) domainKey = "B.Sc Zoology";
    else if (msg.includes("physics")) domainKey = "B.Sc Physics";
    else if (msg.includes("chemistry")) domainKey = "B.Sc Chemistry";

    if (domainKey) {
      const cleanSearch = domainKey.toLowerCase();
      if (DB && DB.responses.topics[cleanSearch]) {
        const matchedPDFs = DB.pdfs.filter(p => p.topics.includes(cleanSearch) || p.category.toLowerCase().includes(cleanSearch)).slice(0, 2);
        let outText = `### 🔍 ${domainKey} Configuration Matrix\nAll material resources are completely loaded and hosted inside the digital repository directory. Use the cards below to access active paths!`;
        return { text: outText, pdfs: matchedPDFs, roadmap: null, chips: isPlan ? [`Show roadmap`] : [`Give me a study plan`] };
      } else if (cleanSearch.includes("computer science") || cleanSearch.includes("cse")) {
        const csePDF = DB.pdfs.filter(p => p.id === "cse");
        return {
          text: `### 💻 Computer Science Engineering Notes\n\nWelcome to the **Computer Science Engineering** track! 🚀\n\nWe host resources covering:\n• 🌐 Software Engineering & Web Deployment\n• 💾 Operating Systems & Architecture\n• 🗄️ Database Management (SQL Basics)\n• 💻 Version Control with GitHub\n\nTap the resource card below to open the official engineering notes directory! 👇`,
          pdfs: csePDF, roadmap: null, chips: ["SQL Basics", "What is GitHub", "Operating System"]
        };
      }
    }

    // 8️⃣ GLOBAL FALLBACK: Pass the request down to the base logic matching engine if no override intercepted it
    return baseEngine(rawMessage);
  };
}
