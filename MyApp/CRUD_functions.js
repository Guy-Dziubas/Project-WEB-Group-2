const sql = require("./db.js");
const path = require("path");

const checkUser = (req, res) => {
    const userName = req.body.username;
    const password = req.body.password;

    console.log("מנסה לבצע אימות עבור:", userName);

    // שאילתה הבודקת התאמה מדויקת גם של שם המשתמש וגם של הסיסמה
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";

    sql.query(query, [userName, password], (err, results) => {
        // בדיקה של תקינות שאילתה
        if (err) {
            console.log("error is: " + err);
            res.status(400).send("error in finding user " + err);
            return;
        }

        // בדיקה האם המערך שחזר מכיל לפחות משתמש אחד (כלומר נמצאה התאמה)
        if (results.length > 0) {
            console.log("found users: ", results);
            // הצלחה - מעבר לדף הבית
            res.redirect(`../HomePage/HomePage.html?username=${userName}`);
        } else {
            // כישלון - הקפצת Alert וחזרה לדף הכניסה
            res.send(`
                <script>
                    alert("שם משתמש או סיסמה אינם תואמים. נסה שוב.");
                    window.location.href = "/"; 
                </script>
            `);
        }
    });
};

const getUserTrips = (req, res) => {
    // כאן המידע מגיע מה-URL (כי ה-JS של דף הבית שלח אותו ככה)
    const username = req.query.username;

    const query = "SELECT * FROM trips WHERE username = ? AND (is_deleted IS NULL OR is_deleted = 0)";

    sql.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "שגיאה בשליפת נתונים" });
        }
        // שולח את רשימת הטיולים של המשתמש הספציפי כ-JSON
        res.json(results);
    });
};

// פונקציה להוספת טיול ל-Database
const addTrip = (req, res) => {
    const { destination, startDate, endDate, budget, userName, travelers } = req.body;

    const query = "INSERT INTO trips (destination, startDate, endDate, budget, userName, travelers) VALUES (?, ?, ?, ?, ?, ?)";

    sql.query(query, [destination, startDate, endDate, budget, userName, travelers], (err, result) => {
        if (err) {
            console.error("שגיאה בהוספת טיול:", err);
            return res.status(500).send("שגיאה בשמירת הטיול");
        }
        res.status(200).send("Trip added successfully");
    });
};

// פונקציה ליצירת משתמש חדש
const createNewUser = (req, res) => {
    // השמות חייבים להתאים למה שנשלח מה-SignUPPage.js (שמבוסס על ה-name ב-HTML)
    const { firstName, lastName, userName, password, email, phone, gender } = req.body;

    // שאילתת ההכנסה לטבלה users
    const query = "INSERT INTO users (firstName, lastName, userName, password, email, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?)";

    sql.query(query, [firstName, lastName, userName, password, email, phone, gender], (err, result) => {
        if (err) {
            console.error("שגיאה ביצירת משתמש:", err);
            return res.status(500).send("שגיאה ביצירת המשתמש");
        }
        res.status(200).send("User created successfully");
    });
};

// פונקציה להחזרת נתוני הטיול לפי ID
const getTripData = (req, res) => {
    const id = req.query.id;
    const queryTrip = "SELECT * FROM trips WHERE tripId = ?";
    // מציג הוצאות לא מחוקות
    const queryExpenses = "SELECT * FROM expenses WHERE tripId = ? AND (is_deleted IS NULL OR is_deleted = 0)";

    sql.query(queryTrip, [id], (err, resultsTrip) => {
        if (err) {
            console.error("שגיאה בשליפת פרטי אירוע:", err);
            return res.status(500).json({ error: "שגיאה בשליפת נתונים" });
        }

        if (resultsTrip.length === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        const trip = resultsTrip[0];

        // שליפת ההוצאות
        sql.query(queryExpenses, [id], (err, resultsExpenses) => {
            if (err) {
                console.error("שגיאה בשליפת הוצאות:", err);
                trip.expenses = [];
                return res.json(trip);
            }

            // עיבוד ההוצאות
            const processedExpenses = resultsExpenses.map(exp => {
                let dateStr = "";
                if (exp.date) {
                    const d = new Date(exp.date);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    dateStr = `${day}/${month}/${year}`;
                }

                return {
                    id: exp.expId,
                    tripId: exp.tripId,
                    category: exp.category,
                    paymentMethod: exp.paymentMethod,
                    currency: exp.currency,
                    date: dateStr,
                    item: exp.description,
                    cost: Number(exp.amount),
                    commissionPercent: Number(exp.commission)
                };
            });

            trip.expenses = processedExpenses;
            res.json(trip);
        });
    });
};

// פונקציה להוספת הוצאה חדשה
const createNewExpense = (req, res) => {
    const { tripId, item, category, paymentMethod, cost, currency, date, commission } = req.body;

    // אם אין עמלה (או שהיא undefined/null), נציב 0
    const finalCommission = commission || 0.0;

    console.log("Adding new expense:", { tripId, item, cost, currency, date, finalCommission });

    const query = "INSERT INTO expenses (tripId, description, category, paymentMethod, amount, currency, date, commission) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    sql.query(query, [tripId, item, category, paymentMethod, cost, currency, date, finalCommission], (err, result) => {
        if (err) {
            console.error("שגיאה בהוספת הוצאה:", err);
            return res.status(500).send("שגיאה בשמירת ההוצאה");
        }
        console.log("Expense added successfully, ID:", result.insertId);
        res.status(200).json({ message: "Expense added successfully", id: result.insertId });
    });
};

// מחיקת הוצאה
const deleteExpense = (req, res) => {
    const { expId } = req.body;

    // מעדכן עמודה בוליאנית לאחר מחיקה
    const query = "UPDATE expenses SET is_deleted = 1 WHERE expId = ?";

    sql.query(query, [expId], (err, result) => {
        if (err) {
            console.error("Error deleting expense:", err);
            return res.status(500).send("Error deleting expense");
        }
        res.status(200).send("Expense deleted successfully");
    });
};

//מחיקת טיול
const deleteTrip = (req, res) => {
    const { tripId } = req.body;

    // מעדכן עמודה בוליאנית לאחר מחיקה
    const query = "UPDATE trips SET is_deleted = 1 WHERE tripId = ?";

    sql.query(query, [tripId], (err, result) => {
        if (err) {
            console.error("Error deleting trip:", err);
            return res.status(500).send("Error deleting trip");
        }
        res.status(200).send("Trip deleted successfully");
    });
};

const checkUserExistence = (req, res) => {
    const userName = req.body.username;

    // שאילתה הבודקת אם שם המשתמש קיים
    const query = "SELECT * FROM users WHERE username = ?";

    sql.query(query, [userName], (err, results) => {
        if (err) {
            console.log("error checking user existence: " + err);
            res.status(500).json({ error: "Error checking user existence" });
            return;
        }

        if (results.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
};

module.exports = { checkUser, getUserTrips, addTrip, createNewUser, getTripData, createNewExpense, deleteExpense, deleteTrip, checkUserExistence };