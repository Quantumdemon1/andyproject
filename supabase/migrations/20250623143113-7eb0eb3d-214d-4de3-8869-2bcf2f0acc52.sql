
-- Fix the admin test account role in the database
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@example.com'
);

-- Ensure the user test account has the correct role
UPDATE user_profiles 
SET role = 'user' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'user@example.com'
);
