(function () {
  "use strict";

  var preloader = document.getElementById("preloader");
  var reel = document.getElementById("reel");
  var reelVideo = document.getElementById("reel-video");
  var nav = document.getElementById("site-nav");
  var main = document.querySelector("main");
  var hero = document.getElementById("hero");
  var body = document.body;

  var transitionStarted = false;
  var videoStarted = false;

  /* ---------------------------------------------------------
     1. PRELOADER -> REEL -> autoplay
     Only runs on the homepage (reel elements present).
     Starts playback as soon as the video itself is ready
     (canplaythrough) instead of waiting on the whole page's
     "load" event — this removes most of the perceived lag.
  --------------------------------------------------------- */
  var introAlreadyPlayed = false;
  try { introAlreadyPlayed = sessionStorage.getItem("mudraIntroPlayed") === "1"; } catch (e) {}

  if (reel && reelVideo && preloader && !introAlreadyPlayed) {

    function showReel() {
      preloader.classList.add("hide");
      reel.classList.add("show");
      enterSite();
    }

    function enterSite() {
      if (videoStarted) return;
      videoStarted = true;

      try { reelVideo.currentTime = 0; } catch (e) {}
      var playPromise = reelVideo.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () { runTransition(); });
      }
    }

    // fire the moment the video has enough data to play through smoothly
    reelVideo.addEventListener("canplaythrough", showReel, { once: true });

    // fallback: if canplaythrough never fires (slow network), don't block
    // the visitor forever — show the reel anyway after 2.5s
    setTimeout(function () {
      if (!preloader.classList.contains("hide")) showReel();
    }, 2500);

    /* -------------------------------------------------------
       2. REEL -> DISSOLVE -> SITE CONTENT
    ------------------------------------------------------- */
    function revealSite() {
      body.classList.remove("lock");
      if (nav) nav.classList.add("reveal");
      if (main) main.classList.add("reveal");
      requestAnimationFrame(function () {
        if (hero) hero.classList.add("play");
      });
    }

    function runTransition() {
      if (transitionStarted) return;
      transitionStarted = true;

      try { sessionStorage.setItem("mudraIntroPlayed", "1"); } catch (e) {}

      var frame = document.querySelector(".reel-frame");
      if (frame) frame.classList.add("dissolve");

      setTimeout(function () {
        reel.classList.add("dissolve-out");
        revealSite();
      }, 400);

      setTimeout(function () {
        reel.style.display = "none";
      }, 1400);
    }

    reelVideo.addEventListener("ended", runTransition);

    // hard cap: never let the intro block the site for more than 8s total
    setTimeout(function () {
      if (videoStarted && !transitionStarted) runTransition();
      else if (!transitionStarted) { showReel(); runTransition(); }
    }, 8000);

  } else {
    // sub-pages (no reel/preloader), OR the homepage on a repeat visit
    // within this browser session — reveal immediately, no intro replay
    if (preloader) preloader.style.display = "none";
    if (reel) reel.style.display = "none";
    body.classList.remove("lock");
    if (nav) nav.classList.add("reveal");
    if (main) main.classList.add("reveal");
    requestAnimationFrame(function () {
      if (hero) hero.classList.add("play");
    });
  }

  /* ---------------------------------------------------------
     3. NAV — scrolled state + mobile toggle (X icon)
  --------------------------------------------------------- */
  if (nav) {
    function onScroll() {
      if (window.scrollY > 20) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     4. SCROLL REVEALS
  --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(".reveal-up");
  if (revealTargets.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     5. Work card videos — play on hover (desktop only)
  --------------------------------------------------------- */
  document.querySelectorAll(".work-card video").forEach(function (v) {
    v.addEventListener("mouseenter", function () { v.play().catch(function(){}); });
    v.addEventListener("mouseleave", function () { v.pause(); });
  });

  var isFinePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------------------------------------------------------
     6. Subtle tilt on work cards (desktop only, gentle)
  --------------------------------------------------------- */
  if (isFinePointer) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(1000px) rotateY(" + (px * 4) + "deg) rotateX(" + (-py * 4) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();