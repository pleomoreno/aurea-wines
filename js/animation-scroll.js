/* === ANIMAÇÃO DAS SEÇÕES === */
const elements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  {
    threshold: 0.2,
  },
);

elements.forEach((el) => revealObserver.observe(el));

/* === HEADER FIXO COM ESTILO AO SCROLL === */
const header = document.querySelector(".header");
const navLinks = document.querySelectorAll(".nav a");
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);

  let current = "";
  const scrollMiddle = window.scrollY + window.innerHeight / 2;
  const isAtBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 5;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollMiddle >= top && scrollMiddle < bottom) {
      current = section.getAttribute("id");
    }
  });

  // Se chegou no fim da página, ativa o último link (Contato)
  if (isAtBottom) {
    current = sections[sections.length - 1].getAttribute("id");
  }

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});



