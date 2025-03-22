require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const SHEET_ID = process.env.SHEET_ID;

// Set up Google Sheets authentication
const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

app.post('/search', async (req, res) => {
    const userId = req.body.id;
    console.log("Received ID:", userId);

    try {
        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A:J', // Adjust range based on your Sheet
        });

        const rows = response.data.values;
        const match = rows.find(row => row[0] === userId);

        if (match) {
            res.json({
                ID: match[0],
                LongTermBalance: match[1],
                StartDate: match[2],
                EndDate: match[3],
                Guarantor: match[4],
                ShortTermBalance: match[5],
                ShortStartDate: match[6],
                ShortEndDate: match[7],
                ShortGuarantor: match[8],
                CutOffDate: match[9],
            });
        } else {
            res.status(404).json({ message: 'ID not found' });
        }
    } catch (error) {
        console.error("Error connecting to Google Sheets:", error);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
