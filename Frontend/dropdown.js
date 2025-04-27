document.addEventListener("DOMContentLoaded", function () {
  const controlsBtn = document.getElementById("controlsBtn");
  const controlsMenu = document.getElementById("controlsMenu");

  if (controlsBtn && controlsMenu) {
    controlsBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // prevent click from bubbling up
      controlsMenu.classList.toggle("show"); // toggle visibility
    });

    // Optional: Clicking outside should close the menu
    document.addEventListener("click", function () {
      controlsMenu.classList.remove("show");
    });
  }
});
