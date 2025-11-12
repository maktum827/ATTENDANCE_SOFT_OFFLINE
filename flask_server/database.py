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

    # name TEXT,
    #     father_name TEXT,
    #     address TEXT,
    #     class_designation TEXT,
    #     group_name TEXT,
    #     start_time TEXT,
    #     end_time TEXT,
    #     grace_period TEXT,
    #     condition TEXT,
    #     shift TEXT,
    #     photo_url TEXT,
    #     department TEXT,
    #     residence TEXT,

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

    # cur.execute("DROP TABLE attendance_logs")
    # rows = cur.fetchall()
    # for i in rows:
    #     print(i)

    con.commit()
    con.close()
