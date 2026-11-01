/* Birthday Surprise interactions — plain JavaScript, no framework needed. */
(() => {
  "use strict";

  const pages = [...document.querySelectorAll(".page")];
  const dots = [...document.querySelectorAll(".progress-dot")];
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const stepCounter = document.getElementById("stepCounter");
  const curtain = document.getElementById("transitionCurtain");
  const giftButton = document.getElementById("giftButton");
  const giftMessage = document.getElementById("giftMessage");
  const restartButton = document.getElementById("restartButton");
  const soundToggle = document.getElementById("soundToggle");
  const homeLink = document.getElementById("homeLink");
  let currentPage = 0;
  let transitionBusy = false;
  let audioContext = null;
  let soundOn = false;
  let toneTimer = null;

  // Create ambient star particles without image assets.
  const sparkleLayer = document.getElementById("sparkles");
  for (let i = 0; i < 44; i++) {
    const star = document.createElement("span");
    star.className = "sparkle";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--duration", `${2.5 + Math.random() * 4}s`);
    star.style.setProperty("--delay", `${Math.random() * -6}s`);
    star.style.opacity = `${0.15 + Math.random() * 0.55}`;
    sparkleLayer.appendChild(star);
  }

  function updateNav() {
    pages.forEach((page, index) => {
      const active = index === currentPage;
      page.classList.toggle("active", active);
      page.hidden = !active;
      page.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentPage);
      if (index === currentPage) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    stepCounter.textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === pages.length - 1;
    nextButton.innerHTML = currentPage === pages.length - 1 ? "FINISHED <span>✓</span>" : 'NEXT <span>→</span>';
  }

  function goToPage(index) {
    if (transitionBusy || index < 0 || index >= pages.length || index === currentPage) return;
    transitionBusy = true;
    curtain.classList.add("show");
    window.setTimeout(() => {
      currentPage = index;
      updateNav();
      // Replay entrance reveals when the first page is revisited.
      if (currentPage === 0) {
        pages[0].querySelectorAll(".reveal").forEach(el => {
          el.style.animation = "none";
          void el.offsetWidth;
          el.style.animation = "";
        });
      }
      window.setTimeout(() => {
        curtain.classList.remove("show");
        window.setTimeout(() => { transitionBusy = false; }, 380);
      }, 300);
    }, 430);
  }

  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", () => goToPage(currentPage + 1));
  });
  prevButton.addEventListener("click", () => goToPage(currentPage - 1));
  nextButton.addEventListener("click", () => goToPage(currentPage + 1));
  dots.forEach(dot => dot.addEventListener("click", () => goToPage(Number(dot.dataset.go))));
  homeLink.addEventListener("click", event => {
    event.preventDefault();
    goToPage(0);
  });
  restartButton.addEventListener("click", () => {
    giftMessage.hidden = true;
    giftButton.hidden = false;
    goToPage(0);
  });

  giftButton.addEventListener("click", () => {
    giftButton.hidden = true;
    giftMessage.hidden = false;
    playChime();
  });

  // A small optional chime using the Web Audio API; no audio file or autoplay.
  function playChime() {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      [523.25, 659.25, 783.99].forEach((frequency, i) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + i * 0.13);
        gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.13 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.13 + 0.55);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now + i * 0.13);
        oscillator.stop(now + i * 0.13 + 0.6);
      });
    } catch (error) {
      console.info("Optional chime is not available in this browser.", error);
    }
  }

  soundToggle.addEventListener("click", async () => {
    soundOn = !soundOn;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.innerHTML = soundOn ? "♫ <span>Sound on</span>" : "♫ <span>Sound off</span>";
    if (soundOn) {
      playChime();
    } else if (audioContext && audioContext.state === "running") {
      await audioContext.suspend();
    }
  });

  // Keyboard navigation helps desktop visitors; ignore when a control is focused.
  document.addEventListener("keydown", event => {
    if (["INPUT", "TEXTAREA", "BUTTON", "A"].includes(document.activeElement?.tagName)) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") goToPage(currentPage + 1);
    if (event.key === "ArrowLeft" || event.key === "PageUp") goToPage(currentPage - 1);
  });

  // Make the birthday year-aware: display date remains 14 November.
  // Update any future countdown here if one is added.
  updateNav();
})();
      
