/*לקיחת נתונים מהכתובת*/
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    // כפתור חזרה לדף הבית
    const returnBtn = document.getElementById('returnBtn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = `../HomePage/HomePage.html?username=${username}`;
        });
    }

    const form = document.querySelector('form'); //הקוד ירוץ רק אחרי שהדף מוכן 

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // מונע את רענון הדף (התנהגות ברירת מחדל של טופס) כדי שנוכל לשלוח את הנתונים ולבצע בדיקות מקדימות

        // איסוף הנתונים
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const budget = document.getElementById('budget').value;
        const travelers = document.getElementById('travelers').value;

        // המרת המחרוזות לאובייקטי תאריך לצורך השוואה
        const startObj = new Date(startDate);
        const endObj = new Date(endDate);

        // בדיקה אם תאריך החזרה קטן מתאריך היציאה
        if (endObj < startObj) {
            alert("שגיאה: תאריך החזרה לא יכול להיות לפני תאריך היציאה!");
            return; // עוצר את הפונקציה כאן ולא ממשיך לשמירה ומעבר עמוד
        }

        // יצירת פרמטרים לשליחה ב-post
        const tripData = {
            destination: destination,
            startDate: startDate,
            endDate: endDate,
            budget: budget,
            travelers: travelers,
            userName: username
        };

        fetch('/add-trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tripData)
        })
            .then(response => {
                if (response.ok) {
                    // הצלחה - מעבר לדף הבית עם המשתמש
                    window.location.href = `../HomePage/HomePage.html?username=${username}`;
                } else {
                    alert("שגיאה בשמירת הטיול. נסה שוב.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("שגיאה בשמירת הטיול.");
            });
    });
});