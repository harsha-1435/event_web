const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample event data
const events = [
    { id: 1, name: "Augumented and virtual Reality expo", organization: "Tech World", time: "2024-11-05 10:00 AM" },
    { id: 2, name: "AI Summit", organization: "AI Leaders", time: "2024-11-10 11:00 AM" },
    { id: 3, name: "Startup Meetup", organization: "InnovateX", time: "2024-12-01 09:00 AM" }
];

// Connect to SQLite datnabase (or create if it doesn't exist)
const db = new sqlite3.Database('./events.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database.');
        // Create the 'registration' table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS registration (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                event_name TEXT NOT NULL
            )`
        );
    }
});

// Endpoint to get event list
app.get('/events', (req, res) => {
    res.json(events);
});

// Endpoint to handle event registration
app.post('/register', (req, res) => {
    const { name, email, events: event_names } = req.body;

    // Validate input
    if (!name || !email || !event_names || event_names.length === 0) {
        return res.status(400).send('Missing required fields: name, email, or events');
    }

    // Insert registration into the database for each event using a transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare(
            `INSERT INTO registration (name, email, event_name) VALUES (?, ?, ?);`
        );

        let errors = false;
event_names.forEach(event_name => {
    stmt.run([name, email, event_name], (err) => {
        if (err) {
            console.error('Error inserting data:', err);
            errors = true;
            db.run('ROLLBACK'); // Rollback immediately on error
            return res.status(500).send('Error inserting data');
        }
    });
});


stmt.finalize((err) => {
    if (err || errors) {
        console.error('Error finalizing statement or inserting data:', err);
        res.status(500).send('Error finalizing registration, or there were issues during data insertion');
        db.run('ROLLBACK'); // Rollback if there's an error
        return;
    }

    db.run('COMMIT'); // Commit the transaction if no errors
    res.status(200).send('Registration successful');
});

    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});