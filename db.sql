-- Create Database
CREATE DATABASE expense_tracker;

-- Use Database
USE expense_tracker;

-- Create Table
CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    expense_date DATE,
    category VARCHAR(50),
    description VARCHAR(100),
    amount DECIMAL(10,2),
    payment_mode VARCHAR(20)
);

-- Insert Records
INSERT INTO expenses (expense_date, category, description, amount, payment_mode) VALUES
('2025-12-10', 'Food', 'Lunch', 120.00, 'Cash'),
('2025-12-11', 'Transport', 'Bus Pass', 350.00, 'UPI'),
('2025-12-12', 'Shopping', 'Clothes', 1500.00, 'Card'),
('2025-12-13', 'Education', 'Books', 600.00, 'UPI'),
('2025-12-14', 'Entertainment', 'Movie', 300.00, 'Cash');

-- Display All Expenses (Execution Proof)
SELECT * FROM expenses;

-- Total Expense
SELECT SUM(amount) AS total_expense FROM expenses;

-- Expense Category Wise
SELECT category, SUM(amount) AS category_total
FROM expenses
GROUP BY category;