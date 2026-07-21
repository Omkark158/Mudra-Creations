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
  --------------------------------------------------------- */
  function showReel() {
    preloader.classList.add("hide");
    reel.classList.add("show");
    enterSite();
  }

  window.addEventListener("load", function () {
    setTimeout(showReel, 500);
  });

  setTimeout(function () {
    if (preloader && !preloader.classList.contains("hide")) showReel();
  }, 4000);

  function enterSite() {
    if (videoStarted) return;
    videoStarted = true;

    try { reelVideo.currentTime = 0; } catch (e) {}
    var playPromise = reelVideo.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () { runTransition(); });
    }
  }

  /* ---------------------------------------------------------
     2. REEL -> DISSOLVE -> SITE CONTENT
  --------------------------------------------------------- */
  function revealSite() {
    body.classList.remove("lock");
    nav.classList.add("reveal");
    main.classList.add("reveal");
    requestAnimationFrame(function () {
      hero.classList.add("play");
    });
  }

  function runTransition() {
    if (transitionStarted) return;
    transitionStarted = true;

    var frame = document.querySelector(".reel-frame");
    frame.classList.add("dissolve");

    setTimeout(function () {
      reel.classList.add("dissolve-out");
      revealSite();
    }, 400);

    setTimeout(function () {
      reel.style.display = "none";
    }, 1400);
  }

  reelVideo.addEventListener("ended", runTransition);

  setTimeout(function () {
    if (videoStarted && !transitionStarted) runTransition();
  }, 12000);

  /* ---------------------------------------------------------
     3. NAV — scrolled state + mobile toggle
  --------------------------------------------------------- */
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
    });
  });

  /* ---------------------------------------------------------
     4. SCROLL REVEALS
  --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(".reveal-up");
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