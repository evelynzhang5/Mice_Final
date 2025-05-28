/**
 * This script is written for the expandable bar in writeup
 * 
 */
// writeup.js

document.addEventListener("DOMContentLoaded", () => {
    const bars = document.querySelectorAll(".exp-bar");
  
    bars.forEach(bar => {
      const header = bar.querySelector(".exp-bar-header");
      header.addEventListener("click", () => {
        // Toggle open class
        bar.classList.toggle("open");
      });
    });
});
  