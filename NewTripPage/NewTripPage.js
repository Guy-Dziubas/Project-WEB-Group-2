document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form'); //הקוד ירוץ רק אחרי שהדף מוכן 

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // עוצר את השליחה הרגילה

        // איסוף הנתונים
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const budget = document.getElementById('budget').value;

        // המרת המחרוזות לאובייקטי תאריך לצורך השוואה
        const startObj = new Date(startDate);
        const endObj = new Date(endDate);

        // בדיקה אם תאריך החזרה קטן מתאריך היציאה
        if (endObj < startObj) {
            alert("שגיאה: תאריך החזרה לא יכול להיות לפני תאריך היציאה!");
            return; // עוצר את הפונקציה כאן ולא ממשיך לשמירה ומעבר עמוד
        }
        
        // יצירת פרמטרים ל-URL
        // יוצרים "חבילה" של מידע שתעבור לדף הבא
        const params = new URLSearchParams({
            id: Date.now(), // מזהה ייחודי
            name: destination,
            start: startDate,
            end: endDate,
            budget: budget
        });

        // מעבר לדף הבית עם המידע בכתובת
        window.location.href = `../HomePage/HomePage.html?${params.toString()}`;
    });
});