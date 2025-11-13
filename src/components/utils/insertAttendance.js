import { useState, useEffect, useMemo } from 'react';
import {
  useGetDevicesQuery,
  useInsertPastLogsMutation,
} from '../../actions/zkTecoApi';

export default function useInsertAttendance() {
  const { data } = useGetDevicesQuery();
  const devices = useMemo(() => data?.devices || [], [data]);

  const [insertPastLogs] = useInsertPastLogsMutation(); // ✅ destructure loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const insertAttendance = async () => {
      if (devices.length > 0) {
        try {
          setLoading(true); // ✅ start loading
          await insertPastLogs(devices).unwrap();
          console.log('New attendance data inserted');
        } catch (err) {
          console.error('Insert failed:', err);
        } finally {
          setLoading(false); // ✅ stop loading
        }
      }
    };

    insertAttendance();
    const interval = setInterval(insertAttendance, 60000); // every 60s
    return () => clearInterval(interval);
  }, [devices, insertPastLogs]);

  return { loading }; // ✅ expose loading
}
