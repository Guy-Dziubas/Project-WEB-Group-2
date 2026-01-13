const categoryIcons = {
    flights: 'bi-airplane',
    accommodation: 'bi-house-door',
    food: 'bi-cup-straw',
    transport: 'bi-bus-front',
    shopping: 'bi-bag',
    gifts: 'bi-gift',
    other: 'bi-receipt'
};

/* פונקציית עזר לפורמט תאריך ישראלי */
function formatDateToIL(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput; // אם לא תקין, החזר את המקור

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/* חישוב תקציב יומי */
function parseDate(dateStr) {
    // אם התאריך כבר בפורמט DD/MM/YYYY
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    return new Date();
}

// משתנים גלובליים
let currentTripId = null; // מזהה (מספר) של הטיול הנוכחי
let currentTrip = null;   // אובייקט המכיל את כל פרטי הטיול (יעד, תאריכים, תקציב ורשימת הוצאות)
let totalSpent = 0;
let expenseChartInstance = null; // משתנה שיחזיק את הגרף
let expenseToDeleteIndex = null; // משתנה מחיקה

// פונקציה שפותחת חלונית מחיקה
window.openDeleteModal = function (index) {
    console.log("openDeleteModal called for index:", index);
    expenseToDeleteIndex = index;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        console.error("Modal element not found!");
    }
};

/* פונקציה שמציגה את הוצאות הטיול בתרשים עוגה */
function renderChart() {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    const chartContainer = document.getElementById('chartContainer');

    //  אם אין הוצאות - נסתיר את הגרף 
    if (!currentTrip || currentTrip.expenses.length === 0) {
        chartContainer.style.display = 'none';
        return;
    }

    //  חישוב סכומים לפי קטגוריה
    const totals = {};
    currentTrip.expenses.forEach(exp => {
        if (totals[exp.category]) {
            totals[exp.category] += exp.cost;
        } else {
            totals[exp.category] = exp.cost;
        }
    });

    chartContainer.style.display = 'block'; // מציג את אזור הגרף

    //  הכנת הנתונים לגרף (תרגום שמות לעברית)
    const categoryNames = {
        flights: 'טיסות',
        accommodation: 'לינה',
        food: 'אוכל',
        transport: 'תחבורה',
        shopping: 'קניות',
        gifts: 'מתנות',
        other: 'אחר'
    };

    // יצירת תוויות (שמות קטגוריות בעברית) וערכים (סכומים) לגרף
    const labels = Object.keys(totals).map(cat => categoryNames[cat] || cat);
    const dataValues = Object.values(totals);

    // מחיקת גרף ישן אם קיים (חשוב כדי למנוע באגים של ריצוד)
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    // יצירת הגרף החדש
    expenseChartInstance = new Chart(ctx, {
        type: 'pie', // סוג הגרף: עוגה
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#D90429',
                    '#219EBC',
                    '#40916C',
                    '#7B2CBF',
                    '#FF5C8A',
                    '#FF9500',
                    '#BB9457'
                ],
                borderWidth: 2,
                borderColor: '#FAF9EE' // צבע רקע
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', // המקרא יהיה למטה
                    labels: {
                        font: {
                            family: 'Fredoka'
                        }
                    }
                }
            }
        }
    });
}

// נקרא לפונקציה הזו כל פעם שמשהו משתנה, ונסדר את ההוצאות מחדש
function renderExpensesList() {
    const listContainer = document.getElementById('expenseList');
    listContainer.innerHTML = ""; // ניקוי הרשימה הקיימת
    totalSpent = 0; // איפוס סכום לחישוב מחדש

    if (currentTrip.expenses.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:gray;">אין הוצאות עדיין</p>';
        document.getElementById('spent-display').textContent = `₪0`;
        renderChart(); // אי הצגת גרף
        return;
    }

    // מיון המערך לפי תאריך
    currentTrip.expenses.sort((a, b) => {
        return parseDate(a.date) - parseDate(b.date);
    });

    // בניית הרשימה מחדש לפי הסדר הממוין
    currentTrip.expenses.forEach((exp, index) => {
        totalSpent += exp.cost; // חישוב סכום מצטבר

        const iconClass = categoryIcons[exp.category] || 'bi-receipt';

        // בדיקת אמצעי תשלום
        let paymentText = "";
        if (exp.paymentMethod === 'credit') paymentText = 'אשראי';
        else if (exp.paymentMethod === 'cash') paymentText = 'מזומן';

        // בדיקת עמלה
        let commissionDisplay = "";
        if (exp.commission && exp.commission > 0) {
            commissionDisplay = `| עמלה: ${exp.commission}%`;
        }

        const newExpenseRow = document.createElement('div');
        newExpenseRow.classList.add('expense-row');

        const rowHTML = `
            <button class="delete-btn" onclick="openDeleteModal(${index})"><i class="bi bi-x-lg"></i></button>
            <div class="expense-info">
                <div class="category-icon" style="margin-left: 10px; font-size: 1.2rem; color: #555;">
                    <i class="bi ${iconClass}"></i>
                </div>
                <div>
                    <span class="expense-name" style="display:block; font-weight:bold;">${exp.item}</span>
                    <span class="expense-date" style="font-size:0.9em; color:gray;">
                        ${exp.date} 
                        ${paymentText ? `| ${paymentText}` : ''} 
                        ${commissionDisplay}
                    </span>
                </div>
            </div>
            <span class="expense-amount">₪${exp.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        `;
        newExpenseRow.innerHTML = rowHTML;
        listContainer.appendChild(newExpenseRow);
    });

    // עדכון סך ההוצאות בסוף הלולאה
    document.getElementById('spent-display').textContent = `₪${totalSpent.toLocaleString()}`;
    renderChart(); // עדכון הגרף
}

// לוגיקה לטעינת העמוד 
document.addEventListener('DOMContentLoaded', async () => {

    // קריאת ה-ID משורת הכתובת
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const username = params.get('username');

    const returnBtn = document.getElementById('returnBtn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            window.location.href = `../HomePage/HomePage.html?username=${username}`;
        });
    }
    currentTripId = id;

    // בקשת נתונים מהשרת עבור הטיול הספציפי
    const response = await fetch(`/get-trip-data?id=${id}`);
    currentTrip = await response.json();

    if (currentTrip) {
        // מילוי הנתונים בדף
        document.getElementById('destination-display').textContent = currentTrip.destination;
        const startDate = parseDate(currentTrip.startDate);
        const endDate = parseDate(currentTrip.endDate);

        document.getElementById('dates-display').textContent = `${formatDateToIL(currentTrip.startDate)} - ${formatDateToIL(currentTrip.endDate)}`;
        document.getElementById('budget-display').textContent = `₪${currentTrip.budget.toLocaleString()}`;

        // חישוב ימים
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 0) {
            const dailyBudget = Math.floor(currentTrip.budget / diffDays);
            document.getElementById('daily-budget-display').textContent = `₪${dailyBudget.toLocaleString()}`;
        }
        else {
            document.getElementById('daily-budget-display').textContent = "-";
        }

        renderExpensesList();
    }

    // קבלת אלמנטים מה-HTML
    const showButton = document.getElementById('showFormButton');
    const hideContainer = document.getElementById('expenseFormContainer');
    const cancelButton = document.getElementById('cancelFormButton');
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');

    // מחיקת הוצאה
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    confirmDeleteBtn.addEventListener('click', async () => {
        if (expenseToDeleteIndex !== null) {

            // מציאת ID של ההוצאה לצורך מחיקה
            const expense = currentTrip.expenses[expenseToDeleteIndex];

            if (expense && expense.id) {
                try {
                    const response = await fetch('/delete-expense', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ expId: expense.id })
                    });

                    if (response.ok) {
                        // מוחק הוצאה מהתצוגה ומעדכן
                        currentTrip.expenses.splice(expenseToDeleteIndex, 1);
                        renderExpensesList();
                    } else {
                        alert("שגיאה במחיקת ההוצאה מהשרת.");
                    }
                } catch (error) {
                    console.error("Error deleting expense:", error);
                    alert("שגיאה בתקשורת עם השרת.");
                }
            } else {
                currentTrip.expenses.splice(expenseToDeleteIndex, 1);
                renderExpensesList();
            }

            // סגירת החלונית ואיפוס המשתנה (פעולה זהה לביטול, אך קורית כאן אחרי אישור המחיקה)
            deleteModal.classList.remove('show');
            expenseToDeleteIndex = null;
        }
    });

    // ביטול מחיקה: סגירת החלונית ואיפוס המשתנה
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('show');
        expenseToDeleteIndex = null;
    });

    const paymentMethodSelect = document.getElementById('paymentMethod');
    const commissionContainer = document.getElementById('commissionContainer');
    const commissionInput = document.getElementById('commission');

    // מאזין לשינוי בשדה "אמצעי תשלום"
    paymentMethodSelect.addEventListener('change', function () {
        if (this.value === 'credit') {
            commissionContainer.style.display = 'block'; // מציג את העמלה
        } else {
            commissionContainer.style.display = 'none';  // מסתיר את העמלה
            commissionInput.value = ""; // מאפס ערך כדי שלא יחושב
        }
    });

    // לוגיקה להצגה/הסתרה של הטופס
    showButton.addEventListener('click', () => {
        hideContainer.style.display = 'block';
        showButton.style.display = 'none';
    });

    cancelButton.addEventListener('click', () => {
        hideContainer.style.display = 'none';
        showButton.style.display = 'block';
        expenseForm.reset(); // ניקוי הטופס בביטול
        commissionContainer.style.display = 'none';
    });

    // לוגיקה לשמירת הנתונים והצגתם
    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // קבלת נתוני הטופס
        const description = document.getElementById('description').value;
        const rawAmount = parseFloat(document.getElementById('amount').value);
        const dateInput = document.getElementById('date').value;
        const categoryVal = document.getElementById('category').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const commission = parseFloat(document.getElementById('commission').value) || 0;
        const currency = document.getElementById('currency').value;

        if (!currentTrip || isNaN(rawAmount)) {
            console.error("Missing trip data or invalid amount", { currentTrip, rawAmount });
            return;
        }

        console.log("Submitting expense for Trip ID:", currentTripId);

        // משתנה שיחזיק את הסכום בשקלים
        let amountInILS = rawAmount;

        // בדיקה האם צריך המרה
        if (currency !== 'ILS') {
            try {
                document.querySelector('button[type="submit"]').textContent = 'מחשב המרה...';

                // לוגיקה לבחירת התאריך להמרה
                // אם המשתמש בחר תאריך - נשתמש בו. אם לא (או שזה היום) - נשתמש ב-latest
                let dateForApi = 'latest';
                const todayStr = new Date().toISOString().split('T')[0]; // התאריך של היום בפורמט YYYY-MM-DD

                if (dateInput && dateInput < todayStr) {
                    dateForApi = dateInput; // שימוש בתאריך היסטורי אם הוא בעבר
                }

                const response = await fetch(`https://api.frankfurter.app/${dateForApi}?amount=${rawAmount}&from=${currency}&to=ILS`);
                const data = await response.json();

                amountInILS = data.rates.ILS;

            } catch (error) {
                console.error("Error converting currency:", error);
                alert("שגיאה בחיבור לשרת ההמרה (או שאין שער לתאריך זה).");
                document.querySelector('button[type="submit"]').textContent = 'הוסף הוצאה';
                return;
            } finally {
                document.querySelector('button[type="submit"]').textContent = 'הוסף הוצאה';
            }
        }

        //חישוב עמלה בשקלים
        const commissionAmount = amountInILS * (commission / 100);
        const finalAmount = amountInILS + commissionAmount;

        if (totalSpent + finalAmount > currentTrip.budget) {
            alert(`שים לב! ⚠️\nההוצאה הזו תגרום לחריגה מתקציב הטיול.\n(תקציב: ₪${currentTrip.budget.toLocaleString()}, סה"כ אחרי הוספה: ₪${(totalSpent + finalAmount).toLocaleString()})`);
        }

        const newExpense = {
            tripId: currentTripId,
            item: description,
            cost: finalAmount, // הסכום הסופי בשקלים
            currency: currency, // המטבע המקורי
            date: dateInput, // שומרים בפורמט YYYY-MM-DD עבור ה-DB
            category: categoryVal,
            paymentMethod: paymentMethod,
            commission: commission
        };

        try {
            const response = await fetch('/add-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newExpense)
            });

            if (response.ok) {
                const responseData = await response.json();

                // רק אם השמירה בשרת הצליחה, נעדכן את הממשק
                // שימוש בפונקציית העזר לפורמט אחיד
                newExpense.date = formatDateToIL(dateInput);
                newExpense.id = responseData.id; // הוספת ID מהשרת

                currentTrip.expenses.push(newExpense);
                renderExpensesList();

                // ניקוי הטופס והסתרתו
                expenseForm.reset();
                hideContainer.style.display = 'none';
                showButton.style.display = 'block';
                commissionContainer.style.display = 'none';
            } else {
                alert("שגיאה בשמירת ההוצאה בשרת.");
            }
        } catch (error) {
            console.error("Error saving expense:", error);
            alert("שגיאה בתקשורת עם השרת.");
        }

        // ניקוי הטופס והסתרתו
        expenseForm.reset();
        hideContainer.style.display = 'none';
        showButton.style.display = 'block';
        commissionContainer.style.display = 'none';
    });
});