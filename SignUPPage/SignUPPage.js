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

// בדיקת שם משתמש מול השרת
async function checkUserName() {
    const userNameInput = document.getElementById("userName");
    const userName = userNameInput.value;

    try {
        const response = await fetch('/check-username-existence', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: userName })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.exists) {
            alert("שם משתמש כבר תפוס, נא לבחור אחד אחר");
            userNameInput.style.border = "2px solid red";
            userNameInput.focus();
            return false;
        } else {
            userNameInput.style.border = "";
            return true;
        }
    } catch (error) {
        console.error('Error checking username:', error);
        alert("שגיאה בבדיקת שם המשתמש. נסה שוב.");
        return false;
    }
}

// חיבור הטופס – בלי שום בדיקות חדשות
const form = document.getElementById('signupForm');

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (checkPassword() === false) {
        return;
    }

    if (checkPhone() === false) {
        return;
    }

    const isUserNameAvailable = await checkUserName();
    if (!isUserNameAvailable) {
        return;
    }

    // איסוף הנתונים
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // שליחה לשרת
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                // אם ההרשמה הצליחה – מעבר לדף הבית
                const userName = document.getElementById("userName").value;
                window.location.href = `../HomePage/HomePage.html?username=${userName}`;
            } else {
                alert("שגיאה בהרשמה. נסה שוב.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("שגיאה בתקשורת עם השרת.");
        });
});
