// Show the context menu on right-click
document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
  console.log("CLICK");
  var cMenu = document.getElementById("contextMenu");
  cMenu.style.display = "block";
  cMenu.style.left = (e.pageX) + "px";
  cMenu.style.top = (e.pageY) + "px";
});

// Hide the context menu on right-click
document.addEventListener("click", function(e) {
  var cMenu = document.getElementById("contextMenu");
  cMenu.style.display = "none";
});
