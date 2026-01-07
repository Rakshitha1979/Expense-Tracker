const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dsh.html'));
});
let expenses = [];
app.post('/add-expense', (req, res) => {
    const { date, category, description, amount } = req.body;
    if (!date || !category || !description || !amount) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    expenses.push({ date, category, description, amount });
    res.json({ message: 'Expense added', expenses });
});
app.get('/expenses', (req, res) => {
    res.json(expenses);
});
app.delete('/delete-expense/:index', (req, res) => {
    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= expenses.length) {
        return res.status(400).json({ message: 'Invalid index' });
    }
    expenses.splice(idx, 1);
    res.json({ message: 'Expense deleted', expenses });
});
app.delete('/clear-expenses', (req, res) => {
    expenses = [];
    res.json({ message: 'All expenses cleared', expenses });
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
