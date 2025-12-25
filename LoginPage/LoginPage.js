const form = document.getElementById('loginForm');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  console.log('submit handler עובד'); // בדיקה
  window.location.href = "../HomePage/HomePage.html";
});
