// Initialize Supabase Connection
// Change the initialization lines at the very top of install.js to this:
const SUPABASE_URL = "https://waeeeyktjujpvpcprhbv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4HE-L3GRIKDq4wSIaxWyJw_vtngeHdj"; 

// Use window.supabase library loaded by your secondary cdn script tag
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let deferredPrompt;
const installBtn = document.getElementById("installBtn");
// ... leave everything else in install.js exactly as it is below

function isInstalled(){
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}

// Detect install availability
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if(!isInstalled()){
    installBtn.classList.add("show");
  }
});

// Click install button
installBtn.addEventListener("click", async () => {
  // iPhone / iOS Detection
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if(isIOS){
    document.getElementById("installModal").classList.add("show");
    
    // 👉 TRIGGER TELEMETRY FOR iOS STEP GUIDE OPENED
    trackPWAInstallation("pwa_install_ios_guide", "iOS");
    return;
  }

  // Android + Desktop
  if(deferredPrompt){
    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if(result.outcome === "accepted"){
      installBtn.classList.remove("show");
      
      // 👉 TRIGGER TELEMETRY FOR ACCEPTED INSTALLATION
      const platformLabel = navigator.userAgent.includes("Android") ? "Android" : "Desktop";
      trackPWAInstallation("pwa_install_accepted", platformLabel);
    }

    deferredPrompt = null;
  }
});

// After installation via Native App Hook (Mostly Chrome / Android)
window.addEventListener("appinstalled", () => {
  installBtn.classList.remove("show");
  console.log("BrainStack Installed Successfully");
  
  // 👉 TRIGGER TELEMETRY FOR SUCCESSFUL BACKGROUND SYSTEM REGISTRATION
  trackPWAInstallation("pwa_installed_success", "Native App Hook");
});

// Close iPhone guide
document.getElementById("closeInstallGuide").addEventListener("click", () => {
  document.getElementById("installModal").classList.remove("show");
});


// =====================================================================
// CENTRALIZED TELEMETRY TRACKER (SUPABASE DB + GOOGLE ANALYTICS GA4)
// =====================================================================
async function trackPWAInstallation(eventName, platform) {
  console.log(`Firing Installation Telemetry: ${eventName} (${platform})`);

  // 1. Sync Event Data into Supabase Database Table
  try {
    if (typeof supabase !== 'undefined') {
      const { error } = await supabase
        .from('pwa_installs')
        .insert([
          { event_name: eventName, platform: platform }
        ]);
        
      if (error) throw error;
      console.log("Telemetry synced with Supabase successfully!");
    } else {
      console.warn("Supabase client is not defined. Skipping database log.");
    }
  } catch (err) {
    console.error("Supabase write failed:", err.message);
  }

  // 2. Push Event Data directly to Google Analytics Dashboard
  if (typeof gtag === 'function') {
    gtag('event', eventName, {
      'event_category': 'PWA_Metrics',
      'event_label': platform,
      'transport_type': 'beacon' // Ensures background delivery completes even if tab closes
    });
    console.log("Telemetry sent to Google Analytics!");
  } else {
    console.warn("Google Analytics (gtag.js) script not detected on this client device.");
  }
}
