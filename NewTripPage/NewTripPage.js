document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form'); // תופס את הטופס

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // עוצר את השליחה הרגילה

        // איסוף הנתונים
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const budget = document.getElementById('budget').value;

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
        // הכתובת תיראה ככה: HomePage.html?name=Paris&budget=2000...
        window.location.href = `../HomePage/HomePage.html?${params.toString()}`;
    });
});