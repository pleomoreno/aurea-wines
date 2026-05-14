const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

document.querySelectorAll(".reveal-stagger").forEach((parent) => {
  const children = parent.children;
  Array.from(children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
    child.classList.add("reveal");
  });
});

const header = document.querySelector(".header");
if (header) {
  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    },
    { passive: true },
  );
}

const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const sections = document.querySelectorAll("section[id]");

if (navLinks.length > 0 && sections.length > 0) {
  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      const scrollMid = window.scrollY + window.innerHeight / 2;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (scrollMid >= top && scrollMid < bottom) current = section.id;
      });

      if (atBottom && sections.length)
        current = sections[sections.length - 1].id;

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`)
          link.classList.add("active");
      });
    },
    { passive: true },
  );
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
