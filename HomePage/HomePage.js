//  המערך הבסיסי (Hardcoded) שתמיד קיים
const tripsDB = [
    { id: 1, name: "פריז", start: "2025-08-01", end: "2025-08-16", budget: 20000 },
    { id: 2, name: "רומא", start: "2025-07-10", end: "2025-07-17", budget: 5000 },
    { id: 3, name: "אתונה", start: "2024-10-10", end: "2024-10-17", budget: 5000 }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // בדיקה האם הגיע טיול חדש דרך ה-URL
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('name')) { // אם יש פרמטר 'name' בכתובת
        const newTrip = {
            id: params.get('id'),
            name: params.get('name'),
            start: params.get('start'),
            end: params.get('end'),
            budget: parseInt(params.get('budget'))
        };

        //  הוספת הטיול החדש למערך
        tripsDB.push(newTrip);

        tripsDB.sort((a, b) => {
        return new Date(b.start) - new Date(a.start);
        });
    }

    // הצגת כל הטיולים מהמערך על המסך
    const listContainer = document.getElementById('tripList');
    listContainer.innerHTML = ''; // ניקוי הרשימה

    tripsDB.forEach(trip => {
        // המרת תאריך לפורמט ישראלי
        const dateObj = new Date(trip.start);
        const dateStr = dateObj.toLocaleDateString('he-IL');

        // יצירת הכפתור
        const link = document.createElement('a');
        link.href = `../ManageTrip/ManageTrip.html?id=${trip.id}`;
        link.className = 'trip-button';
        link.textContent = `${trip.name} - ${dateStr}`;

        listContainer.appendChild(link);
    });
});