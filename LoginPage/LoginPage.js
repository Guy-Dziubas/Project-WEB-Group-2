const form = document.getElementById('loginForm');

// מאזין לאירוע שליחת הטופס ומדפיס הודעה לקונסול (נועד לבדיקה, השליחה עצמה מתבצעת דרך ה-HTML)
form.addEventListener('submit', function (event) {
  console.log('submit handler עובד'); // בדיקה
});