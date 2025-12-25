const form = document.getElementById('loginForm');

form.addEventListener('submit', function (event) {
  event.preventDefault();           // לא לשלוח POST
  // כאן כל הבדיקות שלך...
  window.location.href = "../HomePage/HomePage.html";  // מעבר לדף הבית
});
