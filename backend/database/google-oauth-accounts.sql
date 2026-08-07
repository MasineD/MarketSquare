-- Run once against the MarketSquare database before enabling Google sign-up.
-- Google does not provide an application password or phone number.
ALTER TABLE users.profiles
    ALTER COLUMN phone DROP NOT NULL,
    ALTER COLUMN password DROP NOT NULL;

ALTER TABLE users.profiles
    ADD COLUMN IF NOT EXISTS google_subject VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_google_subject_key
    ON users.profiles (google_subject)
    WHERE google_subject IS NOT NULL;
