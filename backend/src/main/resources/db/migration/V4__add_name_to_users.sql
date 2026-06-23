ALTER TABLE users
    ADD COLUMN full_name VARCHAR(255);

UPDATE users
SET full_name='Unknown'
WHERE full_name IS NULL;

ALTER TABLE users
    MODIFY full_name VARCHAR(255) NOT NULL;