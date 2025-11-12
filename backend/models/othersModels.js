import { getPool } from '../config/db.js';
const pool = getPool();

export const createSettingsTable = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
            code TEXT PRIMARY KEY,
            notice BOOLEAN DEFAULT TRUE,
            result BOOLEAN DEFAULT TRUE,
            officiants BOOLEAN DEFAULT TRUE,
            online_admission BOOLEAN DEFAULT TRUE
        )
    `);

    // Define the columns to alter dynamically
    const newColumns = [
      {
        name: 'receipt_sms',
        type: 'TEXT',
      },
      {
        name: 'admission_sms',
        type: 'TEXT',
      },
      {
        name: 'attendance_sms',
        type: 'TEXT',
      },
      {
        name: 'notice_text',
        type: 'TEXT',
      },
      {
        name: 'result_system',
        type: "TEXT DEFAULT 'parcentageSystem'",
      },
      {
        name: 'grades',
        type: `JSONB DEFAULT '[
                    {"grade": "A+", "from": "80", "to": "100", "status": "Pass"},
                    {"grade": "A", "from": "70", "to": "79", "status": "Pass"},
                    {"grade": "A-", "from": "60", "to": "69", "status": "Pass"},
                    {"grade": "B", "from": "50", "to": "59", "status": "Pass"},
                    {"grade": "C", "from": "40", "to": "49", "status": "Pass"},
                    {"grade": "D", "from": "33", "to": "39", "status": "Pass"},
                    {"grade": "F", "from": "0", "to": "32", "status": "Fail"}
                ]'::JSONB`,
      },
      {
        name: 'draft_messages',
        type: 'TEXT[]',
      },
    ];

    // await pool.query(`ALTER TABLE settings DROP COLUMN donation_sms`)

    // Dynamically alter the table
    for (const column of newColumns) {
      await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'settings'
                    AND column_name = '${column.name}'
                ) THEN
                    ALTER TABLE settings ADD COLUMN ${column.name} ${column.type};
                END IF;
            END
            $$;
        `);
    }
  } catch (err) {
    console.error('Error creating settings table:', err);
  }
};

// Function to create the 'Devices' table
export const createDevicesTable = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS devices (
        code TEXT,
        device_name TEXT,
        device_user TEXT,
        ip_address TEXT,
        port TEXT
        )`);
  } catch (err) {
    console.error('Error creating devices table:', err);
  }
};

export const createZkLogsTable = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS zklogs (
        code TEXT,
        type TEXT,
        name TEXT,
        time TEXT
        )`);
  } catch (err) {
    console.error('Error creating devices table:', err);
  }
};

export const dropTable = async () => {
  try {
    await pool.query(`DROP TABLE articles`, (err, res) => {
      if (err) {
        console.error('Error in drop table', err);
        return;
      }
      console.log('Table dropped successfully');
    });
  } catch (err) {
    console.error('Error creating Users table:', err);
  }
};

// Function to create all tables
export const createOthersTables = async () => {
  // await dropTable();
  await createSettingsTable();
  await createDevicesTable();
  await createZkLogsTable();
};
