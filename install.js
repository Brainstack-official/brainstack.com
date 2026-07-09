let deferredPrompt;

const installBtn = document.getElementById("installBtn");

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
  // iPhone
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if(isIOS){
    document.getElementById("installModal").classList.add("show");
    return;
  }

  // Android + Desktop
  if(deferredPrompt){
    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    // CHANGED HERE: Uses classList instead of inline styles
    if(result.outcome === "accepted"){
      installBtn.classList.remove("show");
    }

    deferredPrompt = null;
  }
});

// After installation
// CHANGED HERE: Uses classList instead of inline styles
window.addEventListener("appinstalled", () => {
  installBtn.classList.remove("show");
  console.log("BrainStack Installed");
});

// Close iPhone guide
document.getElementById("closeInstallGuide").addEventListener("click", () => {
  document.getElementById("installModal").classList.remove("show");
});
