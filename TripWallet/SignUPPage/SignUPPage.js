// --- פונקציה 1: בדיקת סיסמה בלבד ---
function checkPassword() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var confirmField = document.getElementById("confirmPassword");

    if (password !== confirmPassword) {
        alert("שגיאה: הסיסמאות אינן תואמות!");
        confirmField.style.border = "2px solid red";
        confirmField.focus(); // שם את הסמן בשדה הבעייתי
        return false; // החזרת "שקר" - הבדיקה נכשלה
    }

    // אם תקין - מנקים עיצוב ומחזירים "אמת"
    confirmField.style.border = "";
    return true;
}

// --- פונקציה 2: בדיקת טלפון בלבד ---
function checkPhone() {
    var phone = document.getElementById("phone").value;
    var phoneField = document.getElementById("phone");
    var phonePattern = /^\d{10}$/; // בדיוק 10 ספרות

    if (!phonePattern.test(phone)) {
        alert("שגיאה: מספר טלפון חייב להכיל 10 ספרות בדיוק.");
        phoneField.style.border = "2px solid red";
        phoneField.focus();
        return false; // הבדיקה נכשלה
    }

    // אם תקין
    phoneField.style.border = "";
    return true;
}

// --- פונקציה 3: המנהלת (אותה נחבר לטופס) ---
function validateForm() {
    // קודם כל בודקים סיסמה. אם היא נכשלה - עוצרים הכל!
    if (checkPassword() === false) {
        return false;
    }

    // אחר כך בודקים טלפון. אם הוא נכשל - עוצרים הכל!
    if (checkPhone() === false) {
        return false;
    }

    // אם שתי הבדיקות עברו בהצלחה, מאשרים את שליחת הטופס
    return true;
}