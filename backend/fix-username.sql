-- Fix Google OAuth username
-- Replace 'waynepabillon667@gmail.com' with the actual email if different
-- Replace 'Wayne Pabillon' with the desired username

UPDATE User 
SET username = 'Wayne Pabillon'
WHERE email = 'waynepabillon667@gmail.com' 
  AND provider = 'google';

-- Verify the change
SELECT id, email, username, provider, profilePicture 
FROM User 
WHERE email = 'waynepabillon667@gmail.com';
