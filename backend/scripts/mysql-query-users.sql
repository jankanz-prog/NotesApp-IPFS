-- View all users
SELECT id, email, username, createdAt FROM User;

-- View a specific user by email
-- SELECT * FROM User WHERE email = 'your-email@example.com';

-- View a specific user by username
-- SELECT * FROM User WHERE username = 'your-username';

-- Delete a user by email (WARNING: This will also delete all their notes, folders, and transactions)
-- DELETE FROM User WHERE email = 'your-email@example.com';

-- Delete a user by username (WARNING: This will also delete all their notes, folders, and transactions)
-- DELETE FROM User WHERE username = 'your-username';

-- Delete all users (WARNING: Use with caution!)
-- DELETE FROM User;

