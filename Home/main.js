const toggleBtn = document.getElementById("toggleBtn");
const sideNav = document.getElementById("sideNav");
const overlay = document.getElementById("overlay");

toggleBtn.addEventListener("click", () => {
  sideNav.classList.toggle("active");
  overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
  sideNav.classList.remove("active");
  overlay.classList.remove("active");
});
