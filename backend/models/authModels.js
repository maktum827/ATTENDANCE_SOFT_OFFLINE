import { getPool } from '../config/db.js';
const pool = getPool();

// Function to create the 'Users' table
export const createUsersTable = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            code VARCHAR(21),
            type VARCHAR(100),
            first_name TEXT, 
            last_name TEXT, 
            email TEXT,
            password TEXT, 
            sign_url TEXT, 
            avatar_url TEXT
        )`);
    } catch (err) {
        console.error('Error creating Users table:', err);
    }
};


export const dropTable = async () => {
    await pool.query(`DROP TABLE users`, (err, res) => {
        if (err) {
            console.error('Error in drop table', err);
            return;
        }
        console.log('Table dropped successfully');
    });
};

// Function to create all tables
export const createAuthTables = async () => {
    // dropTable();
    await createUsersTable();
};