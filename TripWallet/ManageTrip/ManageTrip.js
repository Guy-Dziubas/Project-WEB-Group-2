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
                category: "clothing",
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
    clothing: 'bi-bag',
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

    // 1. אם אין הוצאות - נסתיר את הגרף ונצא
    if (!currentTrip || currentTrip.expenses.length === 0) {
        chartContainer.style.display = 'none';
        return;
    }

    // 2. חישוב סכומים לפי קטגוריה
    const totals = {};
    currentTrip.expenses.forEach(exp => {
        if (totals[exp.category]) {
            totals[exp.category] += exp.cost;
        } else {
            totals[exp.category] = exp.cost;
        }
    });

    chartContainer.style.display = 'block'; // מציג את אזור הגרף

    // 3. הכנת הנתונים לגרף (תרגום שמות לעברית)
    const categoryNames = {
        flights: 'טיסות',
        accommodation: 'לינה',
        food: 'אוכל',
        transport: 'תחבורה',
        clothing: 'ביגוד',
        gifts: 'מתנות',
        other: 'אחר'
    };

    const labels = Object.keys(totals).map(cat => categoryNames[cat] || cat);
    const dataValues = Object.values(totals);

    // 4. מחיקת גרף ישן אם קיים (חשוב כדי למנוע באגים של ריצוד)
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    // 5. יצירת הגרף החדש
    expenseChartInstance = new Chart(ctx, {
        type: 'pie', // סוג הגרף: עוגה
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#1B4332', 
                    '#2D6A4F', 
                    '#40916C', 
                    '#52B788', 
                    '#74C69D',
                    '#95D5B2',
                    '#B7E4C7'
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
                            family: 'Fredoka' // הפונט של האתר שלך
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

    // 1. מיון המערך לפי תאריך
    // אם רוצים שהכי חדש יהיה למעלה: b - a
    // אם רוצים שהכי ישן יהיה למעלה: a - b
    currentTrip.expenses.sort((a, b) => {
        return parseDate(a.date) - parseDate(b.date); // כרגע: החדש ביותר למעלה
    });

    // 2. בניית הרשימה מחדש לפי הסדר הממוין
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
                        ${commissionDisplay}</span>
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
        // מילוי הנתונים בדף (תוקנו שגיאות ה-Template Literals)
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
        
        // // חישוב הוצאות ורינדור
        // totalSpent = 0; // איפוס לפני חישוב מחדש
        // const listContainer = document.getElementById('expenseList');
        
        // if (currentTrip.expenses.length === 0) {
        //     listContainer.innerHTML = '<p style="text-align:center; color:gray;">אין הוצאות עדיין</p>';
        // }
        // else {
        //     // אם יש הוצאות קיימות, קודם ננקה את מה שהיה שם:
        //     listContainer.innerHTML = " "; 
        //     currentTrip.expenses.forEach(exp => {
        //         totalSpent += exp.cost;

        //         // --- 2. הוספנו: מציאת האייקון המתאים להוצאה קיימת ---
        //         // אם אין קטגוריה (להוצאות ישנות), נשים ברירת מחדל 'bi-receipt'
        //         const iconClass = categoryIcons[exp.category] || 'bi-receipt';

        //         // 1. בדיקת אמצעי תשלום
        //         let paymentText = "";
        //         if (exp.paymentMethod === 'credit') paymentText = 'אשראי';
        //         else if (exp.paymentMethod === 'cash') paymentText = 'מזומן';

        //         // 2. בדיקת עמלה (אם קיימת)
        //         let commissionDisplay = "";
        //         if (exp.commissionPercent && exp.commissionPercent > 0) {
        //             commissionDisplay = `| עמלה: ${exp.commissionPercent}%`;
        //         }

        //         // *** שינוי: יצירת DIV במקום LI כדי למנוע נקודות ***
        //         const newExpenseRow = document.createElement('div');
        //         newExpenseRow.classList.add('expense-row');
        //         const rowHTML = `
        //             <div class="expense-info">
        //                 <div class="category-icon" style="margin-left: 10px; font-size: 1.2rem; color: #555;">
        //                     <i class="bi ${iconClass}"></i>
        //                 </div>
        //                 <div>
        //                     <span class="expense-name" style="display:block; font-weight:bold;">${exp.item}</span>
        //                     <span class="expense-date" style="font-size:0.9em; color:gray;">
        //                         ${exp.date} 
        //                         ${paymentText ? `| ${paymentText}` : ''} 
        //                         ${commissionDisplay}</span>
        //                 </div>
        //             </div>
        //             <span class="expense-amount">₪${exp.cost.toLocaleString()}</span>
        //         `;
        //         newExpenseRow.innerHTML = rowHTML;
        //         listContainer.appendChild(newExpenseRow);
        //     });
        // }
        
        // עדכון סך ההוצאות
        // document.getElementById('spent-display').textContent = `₪${totalSpent.toLocaleString()}`;
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

    // --- א. לוגיקה להצגה/הסתרה של הטופס ---

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


    // --- ב. לוגיקה לשמירת הנתונים והצגתם ---

    expenseForm.addEventListener('submit',async (event) => {
        event.preventDefault(); 

        // 1. קבלת נתוני הטופס
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

        // --- בדיקה האם צריך המרה ---
        if (currency !== 'ILS') {
            try {
                document.querySelector('button[type="submit"]').textContent = 'מחשב המרה...';

                // *** שינוי 1: לוגיקה לבחירת התאריך להמרה ***
                // אם המשתמש בחר תאריך - נשתמש בו. אם לא (או שזה היום) - נשתמש ב-latest
                // הערה: נשתמש ב'latest' אם התאריך הוא היום או עתידי, אחרת נשתמש בתאריך שנבחר
                let dateForApi = 'latest';
                const todayStr = new Date().toISOString().split('T')[0]; // התאריך של היום בפורמט YYYY-MM-DD
                
                if (dateInput && dateInput < todayStr) {
                    dateForApi = dateInput; // שימוש בתאריך היסטורי אם הוא בעבר
                }

                // *** שינוי 2: בניית ה-URL עם התאריך המתאים ***
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

        // // אם זו ההוצאה הראשונה (אורך המערך הוא 1), סימן שלפני רגע היה כתוב "אין הוצאות"
        // if (currentTrip.expenses.length === 1) {
        //     document.getElementById('expenseList').innerHTML = ""; // מוחק את הכיתוב "אין הוצאות עדיין"
        // }
        
        // // עדכון סך ההוצאות
        // totalSpent += finalAmount; 
        // document.getElementById('spent-display').textContent = `₪${totalSpent.toLocaleString()}`;
        
        // // --- 4. הוספנו: בחירת האייקון להצגה החדשה ---
        // const iconClass = categoryIcons[categoryVal] || 'bi-receipt';
        // const paymentText = paymentMethod === 'credit' ? 'אשראי' : 'מזומן';
        // const commissionDisplay = commissionPercent > 0 ? `| עמלה: ${commissionPercent}%` : '';

        // // 2. יצירת אלמנט חדש לרשימה (DIV)
        // const newExpenseItem = document.createElement('div');
        // newExpenseItem.classList.add('expense-row'); 
        
        // // 3. הוספת התוכן לאלמנט החדש
        // newExpenseItem.innerHTML = `
        //     <div class="expense-info">
        //          <div class="category-icon" style="margin-left: 10px; font-size: 1.2rem; color: #555;">
        //             <i class="bi ${iconClass}"></i>
        //         </div>
        //         <div>
        //             <span class="expense-name" style="display:block; font-weight:bold;">${description}</span>
        //             <span class="expense-date" style="font-size:0.9em; color:gray;">${displayDate} | ${paymentText} ${commissionDisplay}</span>
        //         </div>
        //     </div>
        //     <span class="expense-amount">₪${finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        // `;

        // // 4. הוספת ההוצאה החדשה לראש הרשימה
        // expenseList.prepend(newExpenseItem); 
        
        // 5. ניקוי הטופס והסתרתו
        expenseForm.reset(); 
        hideContainer.style.display = 'none';
        showButton.style.display = 'block';
        commissionContainer.style.display = 'none';
    });
}); // סגירת DOMContentLoaded