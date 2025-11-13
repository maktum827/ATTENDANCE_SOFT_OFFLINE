# import sys
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from flask import Flask, request, jsonify, Response, stream_with_context
from zk import ZK, const
from datetime import datetime, timedelta
import threading, os, json
from threading import Thread, Lock
# Ensure UTF-8 encoding
from flask_cors import CORS
import os, sqlite3, re, math, time, logging, subprocess
from database import create_db
db_dir = os.getenv("APPDATA")
from waitress import serve
from queue import Queue, Empty
from pathlib import Path
app = Flask(__name__)

# Enable CORS
CORS(app)

create_db()

timestamp = int(time.time())

# log_file = os.path.join(os.getenv("APPDATA"), "zk_server.log")
# logging.basicConfig(
#     filename=log_file,
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s"
# )

# --- Upload folder setup ---
UPLOAD_FOLDER_PHOTO = os.path.join(Path.home(), "AppData", "Roaming", "Tanzim", "uploads")
os.makedirs(UPLOAD_FOLDER_PHOTO, exist_ok=True)

# ============================================================
# GLOBAL STATE
# ============================================================
device_threads = {}  # {(ip, port): Thread}
device_queues = {}   # {(ip, port): Queue}
device_status = {}   # {(ip, port): {"status": str, "last_seen": float}}
stop_flags = {}  # (ip, port) -> bool
active_connections = {}  # {(ip, port): conn}
lock = Lock()

# RECONNECT_DELAY = 10  # seconds to wait before reconnecting

# if os.name == "nt":
#     old_popen = subprocess.Popen

#     def hidden_popen(*args, **kwargs):
#         kwargs.setdefault("creationflags", 0)
#         kwargs["creationflags"] |= subprocess.CREATE_NO_WINDOW
#         return old_popen(*args, **kwargs)

#     subprocess.Popen = hidden_popen

@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "ok"}, 200

@app.route('/api/zkteco/connect_device', methods=['POST'])
def connect_device():
    """
    Connect to one or multiple ZKTeco devices.
    Request JSON: [{ip_address, port, device_name, ...}, ...]
    """
    devices = request.get_json(force=True)
    if not isinstance(devices, list):
        return jsonify({'error': 'Expected a list of devices'}), 400

    results = []

    for device in devices:
        ip = device.get('ip')
        port = int(device.get('port', 4370))
        name = device.get('name', 'Unknown')

        if not ip:
            results.append({
                'device_name': name,
                'status': 'failed',
                'message': 'Missing IP address'
            })
            continue

        try:
            zk = ZK(ip, port=port, timeout=5)
            conn = zk.connect()
            conn.disable_device()
            conn.enable_device()
            conn.disconnect()

            results.append({
                'device_name': name,
                'ip': ip,
                'port': port,
                'status': 'success',
                'message': f'Connected to {name} successfully'
            })
        except Exception as e:
            results.append({
                'device_name': name,
                'ip': ip,
                'port': port,
                'status': 'failed',
                'message': str(e)
            })

    return jsonify({
        'total_devices': len(devices),
        'results': results
    }), 200

# Route to add a user with fingerprint enrollment
@app.route('/api/zkteco/add_zk_user', methods=['POST'])
def add_zk_user():
    try:
        data = request.get_json(force=True)
        if not data or len(data) < 2:
            return jsonify({'error': 'Invalid request format. Expected device and user data.'}), 400

        newDevices = data['data'][0]
        userData = data['data'][1]

        if not userData:
            return jsonify({'error': 'User data is missing.'}), 400
        # ============================================================
        # 🧹 Step 1 — Stop any running streams
        # ============================================================
        with lock:
            for key, conn in list(active_connections.items()):
                ip, port, c = key
                try:
                    logging.info(f"🛑 Closing active connection to {ip}:{port} ({c}) before adding user.")
                    try:
                        conn.disconnect()
                    except Exception:
                        pass
                    active_connections.pop(key, None)
                    stop_flags[key] = True
                    if key in device_threads:
                        t = device_threads.pop(key)
                        if t.is_alive():
                            logging.info(f"Stopping device thread for {key}")
                except Exception as e:
                    logging.info(f"⚠️ Error closing {key}: {e}")
        # ============================================================

        # For deleting previously registered users
        if userData.get('isUpdate'):
            for device in newDevices:
                try:
                    delete_user_from_device(device, userData)
                except Exception:
                    pass

        connectedDevices = []
        failedDevices = []

        for device in newDevices:
            ip_address = device.get('ip')
            port = device.get('port')
            userType = userData.get('userType')

            if not ip_address or not port:
                failedDevices.append({'ip': ip_address, 'port': port, 'error': 'Missing IP or Port'})
                continue

            zk = ZK(ip_address, port=int(port), timeout=5)
            try:
                conn_device = zk.connect()
                conn_device.disable_device()

                card_number = userData.get('card') if userData.get('card') != '' else '0'
                users = conn_device.get_users()
                uid = get_next_uid(users)

                info = f'{uid}:{ip_address}:{port}'
                connectedDevices.append(info)

                conn_device.set_user(
                    uid=uid,
                    name=f'{userType} - {userData["idNo"]}',
                    privilege=const.USER_ADMIN if userData['privilege'] == 'admin' else const.USER_DEFAULT,
                    password=str(userData['pin']),
                    user_id=str(uid),
                    card=card_number
                )

                if userData['finger'] == 'finger':
                    zk.enroll_user(uid=uid, temp_id=0, user_id=str(uid))

                conn_device.enable_device()
                conn_device.disconnect()

            except Exception as e:
                failedDevices.append({'ip': ip_address, 'port': port, 'error': str(e)})
                continue

        return jsonify(connectedDevices), 200

    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except ValueError as e:
        return jsonify({'error': f'Invalid data: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


def delete_user_from_device(device, userData):
    uid = userData.get('uid')
    ip_address = device.get('ip_address')
    port = device.get('port')

    zk = ZK(ip_address, port=int(port), timeout=5)
    conn_device = zk.connect()
    if conn_device:
        try:
            conn_device.disable_device()
            conn_device.delete_user(uid=int(uid))
            conn_device.enable_device()
            conn_device.disconnect()
        except:
            pass

def get_next_uid(existing_uids):
    """Find the next available UID for a new user based on the maximum existing UID."""
    # Extract UIDs from the existing_uids
    uid_values = {user.uid for user in existing_uids}

    # If there are no existing UIDs, start from 1
    if not uid_values:
        return 1

    # Find the maximum UID
    max_uid = max(uid_values)

    # Return the next UID by incrementing the maximum UID
    return max_uid + 1

@app.route('/api/zkteco/delete_zk_user', methods=['POST'])
def delete_zk_user():
    data = request.json or {}
    try:
        user_id = int(data.get('id', 0))
        ip = data.get('ip')
        port = data.get('port') or 4370
        uid = data.get('uid') or 0

        # Safe conversion
        try:
            port = int(port)
        except (TypeError, ValueError):
            port = 4370

        try:
            uid = int(uid)
        except (TypeError, ValueError):
            uid = 0

        # --- Delete photo and DB record ---
        db_path = f"{db_dir}/tanzim-academy-attendance/local_db_offline.db"
        with sqlite3.connect(db_path) as con_db:
            con_db.row_factory = sqlite3.Row
            cur = con_db.cursor()

            cur.execute("SELECT photo_path FROM users WHERE id = ?", (user_id,))
            old = cur.fetchone()
            old_photo = old["photo_path"] if old else None

            if old_photo:
                old_path = os.path.join(UPLOAD_FOLDER_PHOTO, old_photo)
                if os.path.exists(old_path):
                    os.remove(old_path)

            cur.execute("DELETE FROM users WHERE id=?", (user_id,))
            con_db.commit()

        # --- Delete from device only if IP is provided ---
        if ip:
            zk = ZK(ip, port=port, timeout=5)
            try:
                conn_device = zk.connect()
                if conn_device:
                    conn_device.disable_device()
                    if uid > 0:
                        conn_device.delete_user(uid=uid)
                    conn_device.enable_device()
                    conn_device.disconnect()
            except Exception as e:
                print("Device deletion error:", e)

        return jsonify({"success": True, "message": "User deleted successfully"}), 200

    except Exception as e:
        print("Error deleting user:", e)
        return jsonify({"error": str(e)}), 500

# Route to fetch all users
@app.route('/api/zkteco/get_zk_users', methods=['POST'])
def get_zk_users():
    devices = request.json
    users_list = []
    if devices:
        for device in devices:
            try:
                zk = ZK(device['ip'], port=int(device['port']), timeout=5)
                conn_device = zk.connect()
                if conn_device:
                    conn_device.disable_device()
                    users = conn_device.get_users()

                    for user in users:
                        privilege = 'User'
                        if user.privilege == const.USER_ADMIN:
                            privilege = 'Admin'

                        # ✅ Check if any fingerprint is enrolled
                        # has_fingerprint = False
                        # for finger_id in range(10):  # 0–9 fingers
                        #     template = conn_device.get_user_template(user.uid, finger_id)
                        #     if template:
                        #         has_fingerprint = True
                        #         break

                        users_list.append({
                            'uid': user.uid,
                            'name': user.name,
                            'card': getattr(user, 'card', None),
                            'pin': user.password,
                            'privilege': privilege,
                            'ip': device['ip'],
                            'port': device['port'],
                            'user_id': user.user_id,
                            # 'fingerprint': has_fingerprint  # ✅ added field
                        })
            except Exception as e:
                # print(e)
                pass
        return jsonify(users_list), 200
    else:
        return jsonify(users_list), 200

@app.route('/api/zkteco/get_user_logs', methods=['POST'])
def get_logs():
    devices = request.json
    logs = []
    failedDevices = []
    if devices !=[]:
        for device in devices:
            ip_address = device.get('ip_address')
            port = device.get('port')

            if not ip_address or not port:
                failedDevices.append({'ip': ip_address, 'port': port, 'error': 'Missing IP or Port'})
                continue  # Skip to the next device

            zk = ZK(ip_address, port=int(port), timeout=10)

            try:
                conn_device = zk.connect()
                if not conn_device:
                    failedDevices.append({'ip': ip_address, 'port': port, 'error': 'Connection failed'})
                    continue  # Skip to the next device

                conn_device.disable_device()

                attendance_logs = conn_device.get_attendance()
                users = conn_device.get_users()

                for log in attendance_logs:
                    user = next((u for u in users if u.user_id == log.user_id), None)
                    if user is not None:
                        logs.append({
                            'name': user.name,
                            'user_id': log.user_id,
                            'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                            'device_ip': ip_address
                        })

                conn_device.enable_device()
                # conn_device.clear_attendance()
                conn_device.disconnect()
            except Exception as e:
                failedDevices.append({'ip': ip_address, 'port': port, 'error': str(e)})
                continue  # Skip to the next device
        # return jsonify({'logs': logs, 'failed': failedDevices}), 200
        return jsonify(logs), 200

    return jsonify({'error': 'No devices provided'}), 400

@app.route('/api/zkteco/get_attendance', methods=['GET'])
def get_attendance():
    try:
        # Connect to the SQLite database
        con = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con.cursor()

        cur.execute("""SELECT * FROM attendance_logs ORDER BY datetime(created_at) DESC""")
        rows = cur.fetchall()

        # Convert rows to list of dicts
        attendance_list = [dict(row) for row in rows]

        con.close()

        return jsonify({"attendances": attendance_list}), 200

    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/get_today_attendance', methods=['GET'])
def get_today_attendance():
    try:
        # Connect to the SQLite database
        con = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con.cursor()

        # Fetch only today's records (ignores time)
        cur.execute("""
            SELECT * FROM attendance_logs
            WHERE date(created_at) = date('now')
            ORDER BY datetime(created_at) DESC
        """)

        rows = cur.fetchall()

        # Convert rows to list of dicts
        attendance_list = [dict(row) for row in rows]

        con.close()

        return jsonify({"attendances": attendance_list}), 200

    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/device_capacity', methods=['POST'])
def get_device_capacity():
    try:
        device = request.json
        zk = ZK(device['ip'], port=int(device['port']), timeout=5)
        conn = zk.connect()
        if conn:
            conn.disable_device()
            conn.read_sizes()

            users = conn.get_users()
            cards_used = len([u for u in users if u.card and u.card != 0])

            # Extract and return only serializable info
            capacity_info = {
                "ip": device['ip'],
                "users_capacity": conn.users_cap,
                "users_used": len(conn.get_users()),
                "cards_capacity": conn.users_cap,  # assumed
                "cards_used": cards_used,
                "fingers_capacity": conn.fingers_cap,
                "fingers_used": len(conn.get_templates()),
                "records_capacity": conn.records,  # often fixed, or you can parse from conn if possible
                "records_used": len(conn.get_attendance()),
                # "faces_capacity": getattr(conn, 'faces_cap', 0),
                # "faces_used": 0  # If your device supports it and pyzk exposes it
            }
            conn.enable_device()
            conn.disconnect()
            return jsonify(capacity_info), 200
        else:
            return jsonify({"error": "Failed to connect to device"}), 500
    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/free_data', methods=['POST'])
def free_device_data():
    try:
        device = request.json
        zk = ZK(device['ip'], port=int(device['port']), timeout=5)
        conn = zk.connect()
        if conn:
            conn.disable_device()
            conn.free_data()
            conn.enable_device()
            conn.disconnect()
            return jsonify('success'), 200
        else:
            return jsonify({"error": "Failed to connect to device"}), 500
    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/close_device', methods=['POST'])
def close_device():
    try:
        device = request.json
        zk = ZK(device['ip'], port=int(device['port']), timeout=5)
        conn = zk.connect()
        if conn:
            conn.disable_device()
            conn.poweroff()  # Shutdown device
            conn.disconnect()
            return jsonify('success'), 200
        else:
            return jsonify({"error": "Failed to connect to device"}), 500
    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/format_device', methods=['POST'])
def format_device():
    try:
        device = request.json
        zk = ZK(device['ip'], port=int(device['port']), timeout=5)
        conn = zk.connect()
        if conn:
            conn.disable_device()
            users = conn.get_users()
            deleted = []
            for user in users:
                conn.delete_user(uid=user.uid)
                deleted.append(user.uid)
            conn.disconnect()
            return jsonify('success'), 200
        else:
            return jsonify({"error": "Failed to connect to device"}), 500
    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_attendance/<id>', methods=['DELETE'])
def deleteAttendance(id):
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        cur.execute('DELETE FROM attendance_logs WHERE id = ?', (id,))
        con_db.commit()  # Commit the changes

        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        con_db.close()

@app.route('/api/zkteco/insert_past_logs', methods=['POST'])
def insert_past_logs():
    """
    Process past attendance logs for multiple ZKTeco devices.
    Each device is handled independently.
    """
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()
        cur.execute("SELECT * FROM users")
        rows = cur.fetchall()
        # Convert sqlite3.Row objects to dicts
        allusers = [dict(row) for row in rows]

        cur.execute("SELECT * FROM time_rules")
        rule_rows = cur.fetchall()
        rules = []
        for row in rule_rows:
            rule = dict(row)
            # Safely decode JSON field
            try:
                rule["users"] = json.loads(rule["users"]) if rule["users"] else []
            except (json.JSONDecodeError, TypeError):
                rule["users"] = []
            rules.append(rule)

        data = request.get_json()

        # print(data)
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid device data format'}), 400

        results = []
        total_devices = len(data)

        for device in data:
            ip_address = device.get('ip')
            port = int(device.get('port', 4370))
            device_name = device.get('name', ip_address)

            if not ip_address:
                results.append({
                    'ip': None,
                    'device_name': device_name,
                    'status': 'failed',
                    'message': 'Missing IP address'
                })
                continue

            try:
                zk = ZK(ip_address, port=port, timeout=10)
                conn_device = zk.connect()
                conn_device.disable_device()
                logging.info(f"[{ip_address}] Connected to device")

                attendance_logs = conn_device.get_attendance()
                users = conn_device.get_users()

                if not attendance_logs:
                    results.append({
                        'ip': ip_address,
                        'device_name': device_name,
                        'status': 'success',
                        'message': 'No past logs found'
                    })
                    conn_device.enable_device()
                    conn_device.disconnect()
                    continue

                sms_infos = []
                for log in attendance_logs:
                    user = next((u for u in users if u.user_id == log.user_id), None)
                    if not user:
                        continue

                    try:
                        log_user = user.name.split(' - ')
                        id_no = int(log_user[1])
                        user_data = (next((s for s in allusers if s.get('user_id') == id_no), None))
                    except Exception as e:
                        logging.warning(f"[{ip_address}] User parse failed: {e}")
                        continue

                    if not user_data:
                        continue

                    att_time = log.timestamp.time()
                    def is_time_in_range(rule, att_time):
                        try:
                            start_time = datetime.strptime(rule['start_time'], "%H:%M:%S").time()
                            end_time = datetime.strptime(rule['end_time'], "%H:%M:%S").time()
                            grace = int(rule.get('grace_period') or 0)
                            end_datetime = datetime.combine(datetime.today(), end_time) + timedelta(minutes=grace)
                            end_time_with_grace = end_datetime.time()

                            if start_time <= end_time_with_grace:
                                return start_time <= att_time <= end_time_with_grace
                            else:
                                return att_time >= start_time or att_time <= end_time_with_grace
                        except Exception as e:
                            logging.warning(f"[{ip_address}] Rule time error: {e}")
                            return False


                    if log_user[0] == 'Student':
                        user_key = 'class_name'
                    else:
                        user_key = 'designation'

                    user_value = user_data.get(user_key)

                    matched_rule = next(
                        (
                            rule for rule in rules
                            if user_value in rule.get('users', []) and
                              rule.get('start_time') and rule.get('end_time') and
                              is_time_in_range(rule, att_time)
                        ),
                        None
                    )

                    if not matched_rule:
                        continue

                    id_no = user_data["user_id"]

                    cur.execute("""
                        SELECT * FROM attendance_logs
                        WHERE user_id = ? AND condition = ? AND shift_name = ? AND DATE(created_at) = DATE('now')
                    """, (id_no, matched_rule["condition"], matched_rule["shift_name"]))

                    if cur.fetchone():
                        continue

                    cur.execute("""
                        INSERT INTO attendance_logs (
                            timestamp,
                            user_id,
                            user_type,
                            name,
                            department,
                            class_name,
                            group_name,
                            designation,
                            residence,
                            dob,
                            gender,
                            guardian,
                            contact,
                            start_time,
                            end_time,
                            grace_period,
                            condition,
                            shift_name,
                            email,
                            address,
                            emergency_contact,
                            photo_path
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
                    """, (
                        log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                        id_no,
                        log_user[0],
                        user_data["name"],
                        user_data["department"],
                        user_data["class_name"],
                        user_data["group_name"],
                        user_data["designation"],
                        user_data["residence"],
                        user_data["dob"],
                        user_data["gender"],
                        user_data["guardian"],
                        user_data["contact"],
                        matched_rule["start_time"],
                        matched_rule["end_time"],
                        matched_rule["grace_period"],
                        matched_rule["condition"],
                        matched_rule["shift_name"],
                        user_data["email"],
                        user_data["address"],
                        user_data["emergency_contact"],
                        user_data["photo_path"]
                    ))

                    con_db.commit()
                    conn_device.enable_device()
                    conn_device.clear_attendance()
                    conn_device.disconnect()

                    if matched_rule.get('auto_sms') == True:
                        sms_infos.append({
                            "name": f"{user.name} - True",
                            "message": matched_rule.get('message', '')
                        })

                results.append({
                    'ip': ip_address,
                    'port': port,
                    'device_name': device_name,
                    'status': 'success',
                    'message': 'Past logs processed successfully',
                    'sms_infos': sms_infos
                })

            except Exception as e:
                print(e)
                logging.error(f"[{ip_address}] Device processing failed: {e}")
                results.append({
                    'ip': ip_address,
                    'port': port,
                    'device_name': device_name,
                    'status': 'failed',
                    'message': str(e)
                })
                continue
        con_db.close()
        return jsonify({
            'total_devices': total_devices,
            'results': results
        }), 200

    except Exception as e:
        logging.error(f"insert_past_logs() error: {e}")
        return jsonify({'error': str(e)}), 500

# Auto absend message sending
def get_grace_end_time(rule):
    today = datetime.now().strftime("%Y-%m-%d")
    start = datetime.strptime(f"{today}T{rule['end_time']}", "%Y-%m-%dT%H:%M:%S")

    # Ensure grace_period is a valid integer, even if it's None or empty
    grace_raw = rule.get('grace_period', 0)
    try:
        grace_minutes = int(grace_raw) if grace_raw is not None else 0
    except (ValueError, TypeError):
        grace_minutes = 0

    return start + timedelta(minutes=grace_minutes)

def get_absent_users(rule, attendances):
    con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
    con_db.row_factory = sqlite3.Row
    cur = con_db.cursor()
    cur.execute("SELECT * FROM users")
    rows = cur.fetchall()
    # Convert sqlite3.Row objects to dicts
    allusers = [dict(row) for row in rows]
    con_db.close()

    attended_ids = set(
        f"{a['class_designation']}_{a['id_no']}"
        for a in attendances
        if a['condition'] == rule['condition']
        and a['shift'] == rule['shift_name']
        and a['class_designation'] in rule['users']
    )

    return [
        s for s in allusers
        if s['admitted_class'] in rule['users']
        and f"{s['admitted_class']}_{s['user_id']}" not in attended_ids
    ]

def schedule_sms(rule):
    grace_end = get_grace_end_time(rule)
    now = datetime.now()
    delay = (grace_end - now).total_seconds()

    if delay <= 0:
        return  # Grace time already passed

    # connecting with database
    con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
    con_db.row_factory = sqlite3.Row  # This should return rows as dictionaries
    cur = con_db.cursor()

    # Check if SMS was already sent today for this rule
    # Serialize users list to consistent JSON
    receivers_json = json.dumps(sorted(rule.get('users', [])), ensure_ascii=False)

    # Check if SMS already sent today for same same users
    cur.execute("""
        SELECT 1 FROM sms_logs
        WHERE receivers = ? AND DATE(created_at) = DATE('now')
        AND status = 'success'
        LIMIT 1
    """, (receivers_json,))
    already_sent = cur.fetchone()

    if already_sent:
        logging.info(f"📭 SMS already sent today for rule with same users, skipping...")
        return

    def task():
        if rule['not_active']:
            # today = datetime.now().strftime('%Y-%m-%d')  # just date portion of created_at
            cur.execute("""
                SELECT * FROM attendance_logs WHERE DATE(created_at) = DATE('now')
            """)

            rows = cur.fetchall()
            absentees = get_absent_users(rule, [dict(row) for row in rows])

    threading.Timer(delay, task).start()

@app.route('/api/zkteco/send_shift_messages', methods=['POST'])
def send_sms_shift_wise():
    data = request.json
    rule = data.get('rule')

    if not rule:
        return jsonify({"error": "Missing rule"}), 400

    try:
        # Connect to DB
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        # Check if SMS already sent today for same rule and users
        receivers_json = json.dumps(sorted(rule.get('users', [])), ensure_ascii=False)

        cur.execute("""
            SELECT 1 FROM sms_logs
            WHERE receivers = ? AND DATE(created_at) = DATE('now') AND status = 'success'
            LIMIT 1
        """, (receivers_json,))

        if cur.fetchone():
            return jsonify({"message": "SMS already sent today"}), 200

        if rule.get('not_active'):
            cur.execute("SELECT * FROM attendance_logs WHERE DATE(created_at) = DATE('now')")
            rows = cur.fetchall()
            absentees = get_absent_users(rule, [dict(row) for row in rows])
            totalCount = calculate_sms_count(rule.get('message_not_active')) * len(absentees)

            for student in absentees:
                student["mobile"] = student.get("father_mobile", "")

            payload = {
                "receiver": "lateSms",
                "message": rule.get("message_not_active", ""),
                "messageCount": totalCount,
                "secretKey": "z05eRm1eg7p6MaIuWFJB",
                "lateAttendData": absentees
            }

            try:
                cur.execute("""
                    INSERT INTO sms_logs (shift, receivers, sms_count, balance_deducted, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    rule.get('shift_name', ''),
                    receivers_json,
                    totalCount,
                    round((totalCount * 40) / 100, 2),
                    'success',
                ))
                con_db.commit()
                con_db.close()
                return jsonify({'sms_logs': payload}), 200
            except Exception as e:
                logging.info(f"❌ SMS Request failed: {e}")
                return jsonify({'error': 'Request failed'}), 500
        else:
            return jsonify({"message": "Rule is not active, no SMS needed"}), 200

    except Exception as e:
        logging.info(f"❌ Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500

def contains_non_language_letter(text):
    return bool(re.search(r'[^A-Za-z0-9\s]', text))

def calculate_sms_count(full_sms):
    batch_size = 60 if contains_non_language_letter(full_sms) else 150
    message_count = math.ceil(len(full_sms) / batch_size) or 1
    return message_count

@app.route('/api/zkteco/late_messages', methods=['GET'])
def get_success_late_messages():
    try:
        # Connect to the SQLite database
        con = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con.cursor()

        cur.execute("""SELECT * FROM sms_logs WHERE status = ? ORDER BY datetime(created_at) DESC""", ('success',))
        rows = cur.fetchall()

        # Convert rows to list of dicts
        sms_logs = [dict(row) for row in rows]

        con.close()

        return jsonify({"sms_logs": sms_logs}), 200

    except Exception as e:
        logging.info(f"⚠️ Error {e}")
        return jsonify({"error": str(e)}), 500

# ============================================================
# DEVICE CAPTURE WORKER (runs in background per device)
# ============================================================
def device_capture_worker(ip, port):
    key = (ip, port)
    stop_flags[key] = False  # initialize
    logging.info(f"[{ip}] Worker started")
    while not stop_flags.get(key, False):
        try:
            for data in live_capture_single_device(ip, port):
                if stop_flags.get(key, False):
                    logging.info(f"[{ip}] Worker stopping...")
                    return
                try:
                    device_queues[key].put(f"data: {json.dumps(data)}\n\n")
                    device_status[key]["status"] = "connected"
                    device_status[key]["last_seen"] = time.time()
                except Exception as e:
                    logging.error(f"[{ip}] Failed to queue data: {e}")
                    break
        except Exception as e:
            logging.error(f"[{ip}] Worker error: {e}")

# ============================================================
# START STREAM PER DEVICE
# ============================================================
def start_device_stream(ip, port):
    key = (ip, port)
    with lock:
        if key not in device_threads:
            device_queues[key] = Queue()
            device_status[key] = {"status": "starting", "last_seen": None}
            thread = Thread(target=device_capture_worker, args=(ip, port), daemon=True)
            thread.start()
            device_threads[key] = thread
            logging.info(f"[{ip}] Stream thread started")
        else:
            logging.info(f"[{ip}] Stream thread started")

# ============================================================
# DEVICE CAPTURE CORE FUNCTION
# ============================================================
def live_capture_single_device(ip, port, timeout=10):
    zk = ZK(ip, port=port, timeout=timeout)
    conn = None
    try:
        conn = zk.connect()
        active_connections[(ip, port)] = conn # ✅ track active connection
        conn.disable_device()
        logging.info(f"Connected to {ip}:{port} — live capture started")

        while True:
            attendance = next(conn.live_capture())
            if attendance is None:
                logging.debug(f"[{ip}] No data, retrying...")
                continue

            # map user ID to name
            users = conn.get_users()
            user_map = {user.user_id: user.name for user in users}
            user_name = user_map.get(attendance.user_id, "Unknown")

            yield {
                "device": f"{ip}:{port}",
                "user": user_name,
                "user_id": attendance.user_id,
                "timestamp": getattr(attendance, "timestamp", None).isoformat() if getattr(attendance, "timestamp", None) else None,
            }

    except Exception as e:
        logging.error(f"[{ip}] Capture error: {e}")
        raise e
    finally:
        try:
            if conn:
                conn.enable_device()
                conn.disconnect()
                logging.info(f"Disconnected from {ip}:{port}")
        except Exception:
            pass

# ============================================================
# FLASK ENDPOINT — STREAM DATA
# ============================================================
@app.route("/live_stream", methods=["GET"])
def live_stream():
    ip = request.args.get("ip")
    port = int(request.args.get("port", 4370))

    if not ip:
        return "Missing 'ip' parameter", 400

    start_device_stream(ip, port)
    key = (ip, port)
    queue = device_queues[key]

    def event_stream():
        # Notify connection
        yield f"data: {json.dumps({'status': 'connected', 'device': f'{ip}:{port}'})}\n\n"

        while True:
            try:
                data = queue.get(timeout=30)
                yield data
            except Empty:
                # Keep connection alive
                yield ": keep-alive\n\n"

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")

# ============================================================
# ADMIN ENDPOINT — CHECK ACTIVE DEVICES
# ============================================================
@app.route("/active_devices", methods=["GET"])
def active_devices():
    with lock:
        devices = [
            {
                "ip": ip,
                "port": port,
                "status": info["status"],
                "last_seen": info["last_seen"],
            }
            for (ip, port), info in device_status.items()
        ]
    return {"devices": devices, "count": len(devices)}

# ================ HANDLING LOCAL APIS ============
@app.route('/api/zkteco/add_department', methods=['POST'])
def add_department():
    try:
        data = request.get_json(force=True)
        department = data.get('department')

        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("""INSERT INTO departments (name) VALUES (?)""", (
            department,
        ))
        con_db.commit()
        con_db.close()
        return jsonify({"message": "Department added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/zkteco/get_departments', methods=['GET'])
def get_departments():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("SELECT * FROM departments")
        rows = cur.fetchall()

        # Convert sqlite3.Row objects to dicts
        departments = [dict(row) for row in rows]

        con_db.close()
        return jsonify({"departments": departments}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_department/<id>', methods=['DELETE'])
def delete_department(id):
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute('DELETE FROM departments WHERE id = ?', (id,))
        con_db.commit()

        con_db.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/zkteco/add_class', methods=['POST'])
def add_class():
    try:
        data = request.get_json(force=True)
        class_name = data.get('class_name')
        code_number = data.get('code_number')

        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("""INSERT INTO classes (name, code_number) VALUES (?, ?)""", (class_name, code_number))
        con_db.commit()
        con_db.close()
        return jsonify({"message": "New class added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/zkteco/get_classes', methods=['GET'])
def get_classes():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("SELECT * FROM classes ORDER BY code_number")
        rows = cur.fetchall()

        # Convert sqlite3.Row objects to dicts
        classes = [dict(row) for row in rows]

        con_db.close()
        return jsonify({"classes": classes}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_class/<id>', methods=['DELETE'])
def delete_class(id):
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute('DELETE FROM classes WHERE id = ?', (id,))
        con_db.commit()

        con_db.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/add_group', methods=['POST'])
def add_group():
    try:
        data = request.get_json(force=True)
        group = data.get('group')

        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("""INSERT INTO groups (name) VALUES (?)""", (
            group,
        ))
        con_db.commit()
        con_db.close()
        return jsonify({"message": "group added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/get_groups', methods=['GET'])
def get_groups():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("SELECT * FROM groups")
        rows = cur.fetchall()

        # Convert sqlite3.Row objects to dicts
        groups = [dict(row) for row in rows]

        con_db.close()
        return jsonify({"groups": groups}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_group/<id>', methods=['DELETE'])
def delete_group(id):
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute('DELETE FROM groups WHERE id = ?', (id,))
        con_db.commit()

        con_db.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/add_designation', methods=['POST'])
def add_designation():
    try:
        data = request.get_json(force=True)
        designation = data.get('designation')
        code_number = data.get('code_number')

        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("""INSERT INTO designations (name, code_number) VALUES (?, ?)""", (
            designation,
            code_number
        ))
        con_db.commit()
        con_db.close()
        return jsonify({"message": "Designation added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/zkteco/get_designations', methods=['GET'])
def get_designations():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("SELECT * FROM designations ORDER BY code_number")
        rows = cur.fetchall()

        # Convert sqlite3.Row objects to dicts
        designations = [dict(row) for row in rows]

        con_db.close()
        return jsonify({"designations": designations}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_designation/<id>', methods=['DELETE'])
def delete_designation(id):
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute('DELETE FROM designations WHERE id = ?', (id,))
        con_db.commit()

        con_db.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/add_user', methods=['POST'])
def add_user():
    try:
        # --- 1️⃣ Get form data ---
        id = request.form.get('id')  # This is DB id (for update)
        user_type = request.form.get('user_type')
        user_id = request.form.get('user_id')
        name = request.form.get('name')
        dob = request.form.get('dob')
        gender = request.form.get('gender')
        department = request.form.get('department')
        designation = request.form.get('designation')
        class_name = request.form.get('class_name')
        group_name = request.form.get('group_name')
        residence = request.form.get('residence')
        guardian = request.form.get('guardian')
        contact = request.form.get('contact')
        email = request.form.get('email')
        address = request.form.get('address')
        admission_date = request.form.get('admission_date')
        emergency_contact = request.form.get('emergency_contact')
        status = request.form.get('status')
        photo = request.files.get('photo')

        # --- 2️⃣ Connect to DB ---
        db_path = os.path.join(db_dir, "tanzim-academy-attendance/local_db_offline.db")
        con_db = sqlite3.connect(db_path)
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        # --- 3️⃣ If `id` provided → UPDATE ---
        if id:
            # Fetch old photo
            cur.execute("SELECT photo_path FROM users WHERE id = ?", (id,))
            old = cur.fetchone()
            old_photo = old["photo_path"] if old else None

            # Handle new photo
            if photo:
                filename = f"{timestamp}_{photo.filename}"
                file_path = os.path.join(UPLOAD_FOLDER_PHOTO, filename)
                photo.save(file_path)
                photo_path = filename

                # Delete old photo if exists
                if old_photo:
                    old_path = os.path.join(UPLOAD_FOLDER_PHOTO, old_photo)
                    if os.path.exists(old_path):
                        os.remove(old_path)
            else:
                photo_path = old_photo  # keep old one if no new photo uploaded

            # Update query
            cur.execute("""
                UPDATE users SET
                    user_id=?, name=?, dob=?, gender=?, department=?, class_name=?, group_name=?,
                    residence=?, guardian=?, contact=?, email=?, address=?, admission_date=?,
                    emergency_contact=?, photo_path=?, status=?, designation=?, user_type=?
                WHERE id=?
            """, (
                user_id, name, dob, gender, department, class_name, group_name,
                residence, guardian, contact, email, address, admission_date,
                emergency_contact, photo_path, status, designation, user_type, id
            ))

            con_db.commit()
            con_db.close()
            return jsonify({"message": "User updated successfully!"}), 200

        # --- 4️⃣ Else → INSERT NEW ---
        else:
            photo_path = None
            if photo:
                filename = f"{timestamp}_{photo.filename}"
                file_path = os.path.join(UPLOAD_FOLDER_PHOTO, filename)
                photo.save(file_path)
                photo_path = filename

            cur.execute("""
                INSERT INTO users (
                    user_id, name, dob, gender, department, class_name, group_name, residence,
                    guardian, contact, email, address, admission_date, emergency_contact,
                    photo_path, status, designation, user_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, name, dob, gender, department, class_name, group_name, residence,
                guardian, contact, email, address, admission_date, emergency_contact,
                photo_path, status, designation, user_type
            ))

            con_db.commit()
            con_db.close()
            return jsonify({"message": "User added successfully!"}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/get_users', methods=['GET'])
def get_users():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        cur.execute("SELECT * FROM users")
        rows = cur.fetchall()

        # Convert sqlite3.Row objects to dicts
        users = [dict(row) for row in rows]

        con_db.close()
        return jsonify({"users": users}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/add_time_rules', methods=['POST'])
def add_time_rules():
    try:
        data = request.get_json(force=True)

        # Extract values safely
        id = data.get('id')
        condition = data.get('condition')
        shift_name = data.get('shift_name')
        users = data.get('users')              # list → convert to JSON before storing
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        grace_period = int(data.get('gracePeriod') or 0)
        auto_sms = 1 if data.get('autoSms') else 0
        auto_message = data.get('message')
        absent_sms = 1 if data.get('notActive') else 0
        absent_message = data.get('mmessageNotActive')

        # Connect to database
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        cur = con_db.cursor()

        # --- If record exists, update ---
        cur.execute("SELECT id FROM time_rules WHERE id = ?", (id,))
        existing = cur.fetchone()

        if existing:
            cur.execute("""
                UPDATE time_rules
                SET condition=?, shift_name=?, users=?, start_time=?, end_time=?,
                    grace_period=?, auto_sms=?, message=?, status=?, absent_sms=?, absent_message=?
                WHERE id=?
            """, (
                condition, shift_name, json.dumps(users), start_time, end_time,
                grace_period, auto_sms, auto_message, 1, absent_sms, absent_message, id
            ))
        else:
            # --- Otherwise insert new rule ---
            cur.execute("""
                INSERT INTO time_rules (
                    id, condition, shift_name, users, start_time, end_time,
                    grace_period, auto_sms, message, status, absent_sms, absent_message
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                id, condition, shift_name, json.dumps(users), start_time, end_time,
                grace_period, auto_sms, auto_message, 1, absent_sms, absent_message
            ))

        con_db.commit()
        con_db.close()

        return jsonify({"success": True, "message": "Time rule saved successfully."}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/zkteco/get_time_rules', methods=['GET'])
def get_time_rules():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        cur.execute("SELECT * FROM time_rules")
        rows = cur.fetchall()

        rules = []
        for row in rows:
            rule = dict(row)
            # Safely decode JSON field
            try:
                rule["users"] = json.loads(rule["users"]) if rule["users"] else []
            except (json.JSONDecodeError, TypeError):
                rule["users"] = []
            rules.append(rule)

        con_db.close()
        return jsonify({"rules": rules}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_time_rule/<id>', methods=['DELETE'])
def delete_time_rule(id):
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute('DELETE FROM time_rules WHERE id = ?', (id,))
        con_db.commit()

        con_db.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/add_device', methods=['POST'])
def add_device():
    try:
        data = request.get_json(force=True)
        id = data.get('id')
        name = data.get('name')
        user = data.get('user')
        ip = data.get('ip')
        port = data.get('port')

        print(data)

        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # This allows us to access rows as dict-like objects
        cur = con_db.cursor()

        # --- If record exists, update ---
        cur.execute("SELECT id FROM devices WHERE id = ?", (id,))
        existing = cur.fetchone()

        if existing:
            cur.execute("""
                UPDATE devices
                SET name=?, user=?, ip=?, port=? WHERE id=?
            """, (
                name, user, ip, port, id
            ))
        else:
            cur.execute("""INSERT INTO devices (name, user, ip, port) VALUES (?, ?, ?, ?)""", (
              name,
              user,
              ip,
              port
            ))
        con_db.commit()
        con_db.close()
        return jsonify({"message": "Device added successfully!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route('/api/zkteco/get_devices', methods=['GET'])
def get_devices():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute("SELECT * FROM devices")
        rows = cur.fetchall()

        # Convert sqlite3.Row objects to dicts
        devices = [dict(row) for row in rows]

        con_db.close()
        return jsonify({"devices": devices}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/delete_device/<id>', methods=['DELETE'])
def delete_device(id):
    print(id)
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row  # Access rows as dict-like objects
        cur = con_db.cursor()

        cur.execute('DELETE FROM devices WHERE id = ?', (id,))
        con_db.commit()

        con_db.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/add_academy', methods=['POST'])
def add_academy():
    try:
        # --- 1️⃣ Get form data ---
        id = request.form.get('id')  # This is DB id (for update)
        name = request.form.get('name')
        address = request.form.get('address')
        english_name = request.form.get('english_name')
        english_address = request.form.get('english_address')
        contact = request.form.get('contact')
        email = request.form.get('email')
        website = request.form.get('website')
        facebook_page = request.form.get('facebook_page')
        established_year = request.form.get('established_year')
        institute_code = request.form.get('institute_code')
        logo = request.files.get('logo_path')

        # --- 2️⃣ Connect to DB ---
        db_path = os.path.join(db_dir, "tanzim-academy-attendance/local_db_offline.db")
        con_db = sqlite3.connect(db_path)
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        # --- 3️⃣ If `id` provided → UPDATE ---
        if id:
            # Fetch old logo
            cur.execute("SELECT logo_path FROM academy WHERE id = ?", (id,))
            old = cur.fetchone()
            old_logo = old["logo_path"] if old else None

            # Handle new logo
            if logo:
                filename = f"{timestamp}_{logo.filename}"
                file_path = os.path.join(UPLOAD_FOLDER_PHOTO, filename)
                logo.save(file_path)
                logo_path = filename

                # Delete old logo if exists
                if old_logo:
                    old_path = os.path.join(UPLOAD_FOLDER_PHOTO, old_logo)
                    if os.path.exists(old_path):
                        os.remove(old_path)
            else:
                logo_path = old_logo  # keep old one if no new photo uploaded

            # Update query
            cur.execute("""
                UPDATE academy SET
                    name=?, address=?, english_name=?, english_address=?, contact=?, email=?,
                    website=?, facebook_page=?, established_year=?, institute_code=?, logo_path=?
                WHERE id=?
            """, (
                name, address, english_name, english_address, contact, email, website, facebook_page, established_year, institute_code, logo_path, id
            ))

            con_db.commit()
            con_db.close()
            return jsonify({"message": "Academy updated successfully!"}), 200

        # --- 4️⃣ Else → INSERT NEW ---
        else:
            logo_path = None
            if logo:
                filename = f"{timestamp}_{logo.filename}"
                file_path = os.path.join(UPLOAD_FOLDER_PHOTO, filename)
                logo.save(file_path)
                logo_path = filename

            cur.execute("""
                INSERT INTO academy (
                    id,
                    name,
                    address,
                    english_name,
                    english_address,
                    contact,
                    email,
                    website,
                    facebook_page,
                    established_year,
                    institute_code,
                    logo_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                timestamp,
                name,
                address,
                english_name,
                english_address,
                contact,
                email,
                website,
                facebook_page,
                established_year,
                institute_code,
                logo_path
            ))
            con_db.commit()
            con_db.close()
            return jsonify({"message": "User added successfully!"}), 200
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/zkteco/get_academy', methods=['GET'])
def get_academy():
    try:
        con_db = sqlite3.connect(f"{db_dir}/tanzim-academy-attendance/local_db_offline.db")
        con_db.row_factory = sqlite3.Row
        cur = con_db.cursor()

        cur.execute("SELECT * FROM academy")
        academy = cur.fetchone()  # single record

        if academy:
            academy_dict = dict(academy)
        else:
            academy_dict = None

        con_db.close()
        return jsonify({"academy": academy_dict}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# pyinstaller --onefile --noconsole zk_server.py

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=4009, debug=False)

# zk_server.py
# if __name__ == "__main__":
#     import sys
#     is_frozen = getattr(sys, "frozen", False)  # True when running as .exe

#     if is_frozen:
#         from waitress import serve
#         logging.getLogger('waitress').setLevel(logging.ERROR)  # suppress waitress logs
#         serve(app, host="0.0.0.0", port=4010)
#     else:
#         app.run(host="0.0.0.0", port=4010, debug=False, use_reloader=False)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=4011, debug=True)
