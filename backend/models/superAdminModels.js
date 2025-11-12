import { getPool } from '../config/db.js';
const pool = getPool();

// Function to create the 'academies' table within a schema
export const createAcademiesTable = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS academies (
            code TEXT PRIMARY KEY,
            name TEXT,
            address TEXT,
            english_name TEXT,
            english_address TEXT,
            academy_type TEXT, -- islamic school, college or university
            number_of_students INT DEFAULT 0,
            mobile VARCHAR(30),
            email TEXT UNIQUE,
            last_logged_date TIMESTAMP WITH TIME ZONE,
            country TEXT,
            logo_url TEXT,
            calligraphy_url TEXT,
            academy_photo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`);

        // Define the columns to alter dynamically
        const newColumns = [
            {
                name: 'payment',
                type: 'DECIMAL(10, 2) DEFAULT 0.00'
            },
            {
                name: 'sms_balance',
                type: 'DECIMAL(10, 2) DEFAULT 0.00'
            },
            {
                name: 'activated_at',
                type: 'TEXT'
            },
            {
                name: 'activation_key',
                type: 'TEXT'
            }
        ];

        // await pool.query(`ALTER TABLE academies DROP COLUMN news`)

        // Dynamically alter the table
        for (const column of newColumns) {
            await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'academies'
                    AND column_name = '${column.name}'
                ) THEN
                    ALTER TABLE academies ADD COLUMN ${column.name} ${column.type};
                END IF;
            END
            $$;
        `);
        }

    } catch (err) {
        console.error('Error creating Academic table:', err);
    }
}

export const dropTable = () => {
    pool.query(`DROP TABLE settings`, (err, res) => {
        if (err) {
            console.error('Error in drop table', err);
            return;
        }
        console.log('Table dropped successfully');
    });
};

export const createSuperAdminsTables = async () => {
    try {
        // await dropTable();
        await createAcademiesTable();
    } catch (err) {
        console.error(`Error in creating schema and tables`, err);
    }
};
