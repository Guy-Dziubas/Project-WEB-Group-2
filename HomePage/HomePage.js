document.addEventListener('DOMContentLoaded', () => {
    // חילוץ שם המשתמש מהכתובת
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    if (username) {
        // הוספת טיול חדש
        const newTripBtn = document.getElementById('newTripBtn');
        if (newTripBtn) {
            newTripBtn.addEventListener('click', () => {
                window.location.href = `../NewTripPage/NewTripPage.html?username=${username}`;
            });
        }

        // וידוא מחיקה
        const modal = document.getElementById('deleteModal');
        const confirmBtn = document.getElementById('confirmDelete');
        const cancelBtn = document.getElementById('cancelDelete');
        let tripIdToDelete = null;

        // לוחצים על כפתור "כן" בחלונית וידוא מחיקה
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (tripIdToDelete) {
                    // שליחת בקשה לשרת למחיקה
                    fetch('/delete-trip', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tripId: tripIdToDelete })
                    })
                        .then(response => {
                            if (response.ok) {
                                // מחיקה מתצוגה
                                const tripElement = document.getElementById(`trip-${tripIdToDelete}`);
                                if (tripElement) tripElement.remove();

                                // סגירת חלונית
                                modal.style.display = "none";
                                tripIdToDelete = null;

                                // בדיקה אם קיימים טיולים
                                const listContainer = document.getElementById('tripList');
                                if (listContainer.children.length === 0) {
                                    listContainer.innerHTML = '<p class="no-trips-message">אין טיולים עדיין</p>';
                                }
                            } else {
                                console.error('Error deleting trip');
                                alert('שגיאה במחיקת הטיול');
                            }
                        })
                        .catch(error => console.error('Error:', error));
                }
            });
        }

        // לוגיקה לביטול המחיקה (כפתור לא - סגירת החלונית ואיפוס המשתנה)
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.style.display = "none";
                tripIdToDelete = null;
            });
        }

        // סגירת חלונית אם לחצנו מחוץ לה
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
                tripIdToDelete = null;
            }
        });

        // פונקציה להצגת הטיולים
        function renderTrips(trips, username) {
            const listContainer = document.getElementById('tripList');
            listContainer.innerHTML = ''; // ניקוי הרשימה הישנה

            if (trips.length === 0) {
                listContainer.innerHTML = '<p class="no-trips-message">אין טיולים עדיין</p>';
                return;
            }

            // מיון הטיולים לפי תאריך (החדש ביותר למעלה)
            trips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

            trips.forEach(trip => {
                // המרת תאריך מה-DB (פורמט YYYY-MM-DD) לפורמט ישראלי
                const dateObj = new Date(trip.startDate);
                const dateStr = dateObj.toLocaleDateString('he-IL');

                // יצירת Container לטיול
                const container = document.createElement('div');
                container.className = 'trip-item-container';
                container.id = `trip-${trip.tripId}`;

                // יצירת הכפתור
                const link = document.createElement('a');
                link.href = `../ManageTrip/ManageTrip.html?id=${trip.tripId}&username=${username}`;
                link.className = 'trip-button';

                // הצגת היעד והתאריך מתוך מסד הנתונים
                link.textContent = `${trip.destination} - ${dateStr}`;

                // כפתור מחיקה
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = 'X';
                deleteBtn.className = 'delete-trip-btn';
                deleteBtn.title = 'מחק טיול';

                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // למנוע מעבר לעמוד ניהול טיול
                    tripIdToDelete = trip.tripId;
                    modal.style.display = "block";
                });

                // הוספת הקישור וכפתור המחיקה לאלמנט המכיל, והוספתו לרשימה
                container.appendChild(link);
                container.appendChild(deleteBtn);
                listContainer.appendChild(container);
            });
        }

        // שליפת הנתונים מהשרת
        fetch(`/get-user-trips?username=${username}`)
            .then(response => response.json())
            .then(trips => {
                // קריאה לפונקציה החדשה שיוצרת את הכפתורים
                renderTrips(trips, username);
            })
            .catch(error => console.error('שגיאה בשליפת נתונים:', error));

    } else {
        window.location.href = "/";
    }
});