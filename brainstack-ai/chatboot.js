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