const tripsDB = {
    1: {
        name: "פריז",
        budget: 20000,
        start: "01/08/2025",
        end: "16/08/2025",
        expenses: [
            {
                item: "טיסה הלוך ושוב",
                cost: 4500,
                date: "01/08/2025",
                category: "flights",
                paymentMethod: "credit",
                commissionPercent: 0
            },
            {
                item: "מלון (5 לילות ראשונים)",
                cost: 6200,
                date: "01/08/2025",
                category: "accommodation",
                paymentMethod: "credit",
                commissionPercent: 0
            },
            {
                item: "ארוחת ערב חגיגית",
                cost: 450,
                date: "02/08/2025",
                category: "food",
                paymentMethod: "cash",
                commissionPercent: 0
            },
            {
                item: "כרטיס נסיעה במטרו",
                cost: 120,
                date: "03/08/2025",
                category: "transport",
                paymentMethod: "cash",
                commissionPercent: 0
            },
            {
                item: "קניית מעיל",
                cost: 850,
                date: "04/08/2025",
                category: "shopping",
                paymentMethod: "credit",
                commissionPercent: 1.5
            }
        ]
    },
    2: {
        name: "רומא",
        budget: 5000,
        start: "10/07/2025",
        end: "17/07/2025",
        expenses: [
            {
                item: "פיצה",
                cost: 60,
                date: "10/07/2025",
                category: "food",
                paymentMethod: "cash",
                commissionPercent: 0
            }
        ]
    },
    3: {
        name: "אתונה",
        budget: 5000,
        start: "10/10/2024",
        end: "17/10/2024",
        expenses: []
    }
};

const categoryIcons = {
    flights: 'bi-airplane',
    accommodation: 'bi-house-door',
    food: 'bi-cup-straw',
    transport: 'bi-bus-front',
    shopping: 'bi-bag',
    gifts: 'bi-gift',
    other: 'bi-receipt'
};

function parseDate(dateStr) { 
    const parts = dateStr.replace(/\./g, '/').split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// משתנים גלובליים
let currentTripId = null; 
let currentTrip = null; 
let totalSpent = 0; 
let expenseChartInstance = null; // משתנה שיחזיק את הגרף

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
                borderColor: '#FAF9EE' // צבע רקע האתר כדי שייראה יפה
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
                            family: 'Fredoka' // הפונט של האתר
                        }
                    }
                }
            }
        }
    });
}

// המטרה: לקרוא לפונקציה הזו כל פעם שמשהו משתנה, והיא תסדר את הכל מחדש
function renderExpensesList() {
    const listContainer = document.getElementById('expenseList');
    listContainer.innerHTML = ""; // ניקוי הרשימה הקיימת
    totalSpent = 0; // איפוס סכום לחישוב מחדש

    if (currentTrip.expenses.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:gray;">אין הוצאות עדיין</p>';
        document.getElementById('spent-display').textContent = `₪0`;
        return;
    }

    // מיון המערך לפי תאריך
    currentTrip.expenses.sort((a, b) => {
        return parseDate(a.date) - parseDate(b.date);
    });

    // בניית הרשימה מחדש לפי הסדר הממוין
    currentTrip.expenses.forEach(exp => {
        totalSpent += exp.cost; // חישוב סכום מצטבר

        const iconClass = categoryIcons[exp.category] || 'bi-receipt';
        
        // בדיקת אמצעי תשלום
        let paymentText = "";
        if (exp.paymentMethod === 'credit') paymentText = 'אשראי';
        else if (exp.paymentMethod === 'cash') paymentText = 'מזומן';

        // בדיקת עמלה
        let commissionDisplay = "";
        if (exp.commissionPercent && exp.commissionPercent > 0) {
            commissionDisplay = `| עמלה: ${exp.commissionPercent}%`;
        }

        const newExpenseRow = document.createElement('div');
        newExpenseRow.classList.add('expense-row');
        
        const rowHTML = `
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

// --- לוגיקה לטעינת העמוד ---
document.addEventListener('DOMContentLoaded', () => {
    // קריאת ה-ID משורת הכתובת
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    currentTripId = id;
    
    currentTrip = tripsDB[id]; // משתנה הטיול הראשי!

    if (currentTrip) {
        // מילוי הנתונים בדף
        document.getElementById('destination-display').textContent = currentTrip.name;
        document.getElementById('dates-display').textContent = `${currentTrip.start} - ${currentTrip.end}`;
        document.getElementById('budget-display').textContent = `₪${currentTrip.budget.toLocaleString()}`;

        const startDate = parseDate(currentTrip.start);
        const endDate = parseDate(currentTrip.end);
    
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

    const paymentMethodSelect = document.getElementById('paymentMethod');
    const commissionContainer = document.getElementById('commissionContainer');
    const commissionInput = document.getElementById('commission');

    // מאזין לשינוי בשדה "אמצעי תשלום"
    paymentMethodSelect.addEventListener('change', function() {
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

    expenseForm.addEventListener('submit',async (event) => {
        event.preventDefault(); 

        // קבלת נתוני הטופס
        const description = document.getElementById('description').value;
        const rawAmount = parseFloat(document.getElementById('amount').value);
        const dateInput = document.getElementById('date').value; // תאריך גולמי
        const categoryVal = document.getElementById('category').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const commissionPercent = parseFloat(document.getElementById('commission').value) || 0;
        const currency = document.getElementById('currency').value;

        if (!currentTrip || isNaN(rawAmount)) return; // בדיקה בסיסית

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
        const commissionAmount = amountInILS * (commissionPercent / 100);
        const finalAmount = amountInILS + commissionAmount;

        if (totalSpent + finalAmount > currentTrip.budget) {
            alert(`שים לב! ⚠️\nההוצאה הזו תגרום לחריגה מתקציב הטיול.\n(תקציב: ₪${currentTrip.budget.toLocaleString()}, סה"כ אחרי הוספה: ₪${(totalSpent + finalAmount).toLocaleString()})`);
        }

        // --- שמירה ועדכון סכום ---
        
        // המרת התאריך לפורמט קריא לשמירה/תצוגה (DD/MM/YYYY)
        const displayDate = new Date(dateInput).toLocaleDateString('he-IL');

        const newExpense = {
            item: description,
            cost: finalAmount,
            date: displayDate,
            category: categoryVal,
            paymentMethod: paymentMethod,
            commissionPercent: commissionPercent
        };
        currentTrip.expenses.push(newExpense);
        renderExpensesList();
        
        // ניקוי הטופס והסתרתו
        expenseForm.reset(); 
        hideContainer.style.display = 'none';
        showButton.style.display = 'block';
        commissionContainer.style.display = 'none';
    });
});