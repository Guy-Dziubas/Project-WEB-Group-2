// בדיקת סיסמה 
function checkPassword() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var confirmField = document.getElementById("confirmPassword");

    if (password !== confirmPassword) {
        alert("שגיאה: הסיסמאות אינן תואמות!");
        confirmField.style.border = "2px solid red";
        confirmField.focus(); // שם את הסמן בשדה הבעייתי
        return false; 
    }

    // אם קלט תקין, מנקים מסגרת אדומה
    confirmField.style.border = "";
    return true;
}

// בדיקת טלפון
function checkPhone() {
    var phone = document.getElementById("phone").value;
    var phoneField = document.getElementById("phone");
    var phonePattern = /^0\d{9}$/; // מתחיל בספרה 0 ואחריו עוד 9 ספרות

    if (!phonePattern.test(phone)) {
        alert("שגיאה: מספר טלפון חייב להכיל 10 ספרות בדיוק ולהתחיל בספרה 0.");
        phoneField.style.border = "2px solid red";
        phoneField.focus();
        return false;
    }

    // אם תקין
    phoneField.style.border = "";
    return true;
}

const form = document.getElementById('signupForm');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  console.log('submit handler עובד'); // בדיקה
  window.location.href = "../LoginPage/LoginPage.html";
});

function validateForm() {
    // קודם כל בודקים סיסמה. אם היא נכשלה - עוצרים הכל
    if (checkPassword() === false) {
        return false;
    }

    // אחר כך בודקים טלפון. אם הוא נכשל - עוצרים הכל
    if (checkPhone() === false) {
        return false;
    }

    // אם שתי הבדיקות עברו בהצלחה, מאשרים את שליחת הטופס
    return true;
}
