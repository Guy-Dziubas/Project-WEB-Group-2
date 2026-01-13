const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const CRUD_functions = require("./CRUD_functions.js")

const app = express();// אתחול אוביקט השרת
const port = 3000;//לאיזה פורט השרת מאזין

app.use(bodyParser.json()); //ניתוח מידע מקבצי ג'ייסון
app.use(bodyParser.urlencoded({ extended: true })); //ניתוח מידע שמגיע מפורמים 

// הגדרת תיקיית הקבצים הסטטיים (כדי שהשרת יכיר את ה-CSS והתמונות)
// מכיוון ש-App.js נמצא בתוך MyApp, אנחנו הולכים צעד אחד אחורה לתיקייה הראשית
app.use(express.static(path.join(__dirname, "..")));

// מה להראות כשנכנסים ל-localhost:3000
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "LoginPage.html"));
});

app.post("/login", CRUD_functions.checkUser);

app.get("/get-user-trips", CRUD_functions.getUserTrips);

app.post("/add-trip", CRUD_functions.addTrip);

app.get("/get-trip-data", CRUD_functions.getTripData);

app.post("/add-expense", CRUD_functions.createNewExpense);

app.post("/delete-expense", CRUD_functions.deleteExpense);

app.post("/delete-trip", CRUD_functions.deleteTrip);

app.post("/signup", CRUD_functions.createNewUser);

app.post("/check-username-existence", CRUD_functions.checkUserExistence);

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});