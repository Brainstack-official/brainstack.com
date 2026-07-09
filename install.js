let deferredPrompt;

const installBtn = document.getElementById("installBtn");

// Detect if already running as installed app
function isInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches ||
           window.navigator.standalone === true;
}

// Show button only if app isn't installed
if (!isInstalled()) {

    window.addEventListener("beforeinstallprompt", (e) => {

        e.preventDefault();

        deferredPrompt = e;

        installBtn.classList.add("show");

    });

}



// Install button click
installBtn.addEventListener("click", async () => {

    // iPhone / iPad
    const isIOS =
        /iphone|ipad|ipod/i.test(navigator.userAgent);

    const isSafari =
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if(isIOS && isSafari){

       document
.getElementById("installModal")
.classList.add("show");

    if(!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if(outcome==="accepted"){

        installBtn.style.display="none";

     } }

    deferredPrompt=null;

});

// Hide after installation
window.addEventListener("appinstalled",()=>{

installBtn.style.display="none";

console.log("BrainStack Installed");

});

document
.getElementById("closeInstallGuide")
.addEventListener("click",()=>{

document
.getElementById("installModal")
.classList.remove("show");

});
