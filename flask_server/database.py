import os, sqlite3

db_dir = os.path.join(os.getenv("APPDATA"), "tanzim-academy-attendance")
os.makedirs(db_dir, exist_ok=True)

def create_db():
    db_path = os.path.join(db_dir, "local_db_offline.db")

    con = sqlite3.connect(database=db_path)
    cur = con.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS sms_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        shift TEXT,
        receivers TEXT,               -- JSON string of receiver info or list
        sms_count INTEGER DEFAULT 0,  -- Number of SMS messages sent
        balance_deducted REAL DEFAULT 0.0,  -- Float for deducted balance
        status TEXT DEFAULT 'pending',     -- e.g., 'success', 'failed', 'pending'
        created_at DATETIME DEFAULT (datetime('now'))
    )
    """)

    # cur.execute("""SELECT * FROM sms_logs""")
    # rows = cur.fetchall()
    # for row in rows:
    #     print(row)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS attendance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        user_id INTEGER,
        user_type TEXT,
        name TEXT,
        department TEXT,
        class_name TEXT,
        group_name TEXT,
        designation TEXT,
        residence TEXT,
        dob TEXT,
        gender TEXT,
        guardian TEXT,
        contact TEXT,
        start_time TEXT,
        end_time TEXT,
        grace_period TEXT,
        condition TEXT,
        shift_name TEXT,
        email TEXT,
        address TEXT,
        emergency_contact TEXT,
        photo_path TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )
    """)

    cur.execute("""
      CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,  -- unique ID for each department
          name TEXT NOT NULL UNIQUE,             -- department name, must be unique
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- auto timestamp
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- update manually or with trigger
      );
    """)

    cur.execute("""
      CREATE TABLE IF NOT EXISTS groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,  -- unique ID for each department
          name TEXT NOT NULL UNIQUE,             -- department name, must be unique
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- auto timestamp
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- update manually or with trigger
      );
    """)

    cur.execute("""
      CREATE TABLE IF NOT EXISTS classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,  -- unique ID for each class
          name TEXT,
          code_number INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- auto timestamp
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- update manually or with trigger
      );
    """)

    cur.execute("""
      CREATE TABLE IF NOT EXISTS designations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,  -- unique ID for each class
          code_number INT,
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- auto timestamp
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- update manually or with trigger
      );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_type TEXT,
        user_id INT NOT NULL,
        name TEXT NOT NULL,
        dob TEXT,                         -- stored as ISO string (YYYY-MM-DD)
        gender TEXT,
        department TEXT,
        designation TEXT,
        class_name TEXT,
        group_name TEXT,
        residence TEXT,
        guardian TEXT,
        contact TEXT,
        email TEXT,
        address TEXT,
        admission_date TEXT,              -- store as string or ISO date
        emergency_contact TEXT,
        status BOOLEAN DEFAULT 1,
        photo_path TEXT,                  -- only the relative/local path (e.g. uploads/students/abc.jpg)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS time_rules (
            id INTEGER PRIMARY KEY,
            condition TEXT,
            shift_name TEXT,
            users TEXT,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            grace_period INTEGER DEFAULT 0,
            auto_sms INTEGER DEFAULT 0,
            message TEXT,
            status INTEGER DEFAULT 1,
            absent_sms INTEGER DEFAULT 0,
            absent_message TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        user TEXT,
        ip TEXT,
        port INT
        );
    """)


    cur.execute("""
        CREATE TABLE IF NOT EXISTS academy (
        id INTEGER,
        name TEXT,
        address TEXT,
        english_name TEXT,
        english_address TEXT,
        contact TEXT,
        email TEXT,
        website TEXT,
        facebook_page TEXT,
        established_year TEXT,
        institute_code TEXT,
        logo_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- auto timestamp
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- update manually or with trigger
        );
    """)


    cur.execute("""
      CREATE TABLE IF NOT EXISTS activation (
          id INTEGER PRIMARY KEY AUTOINCREMENT,        -- unique ID for each activation record
          hardware_id TEXT NOT NULL UNIQUE,            -- unique machine ID (from getHardwareId)
          license_key TEXT NOT NULL,                   -- license key issued to this machine
          activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- activation date/time
          last_run TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- last app run timestamp (for tamper detection)
          expiry_date TIMESTAMP,                       -- optional expiry date for license
          status TEXT DEFAULT 'inactive',              -- status: 'inactive', 'active', 'expired'
          extra_info TEXT                              -- optional: JSON or notes
      );
      """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS integrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,         -- unique ID for each integration
        service_name TEXT NOT NULL,                   -- name of the service (Slack, WhatsApp, etc.)
        sender_id TEXT,
        status TEXT NOT NULL DEFAULT 'disconnected',  -- 'connected' or 'disconnected'
        config TEXT,                                  -- optional JSON string or notes
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # cur.execute("DROP TABLE integrations")
    # rows = cur.fetchall()
    # for i in rows:
    #     print(i)

    con.commit()
    con.close()
