import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPunchData } from '../../store/punchSlice';
import { BASE_URL_FLASK } from '../../constants/othersConstants';
import { useGetDevicesQuery } from '../../actions/zkTecoApi';

export default function useZKTecoStream() {
  const dispatch = useDispatch();

  const { data: deviceData } = useGetDevicesQuery();
  const devices = useMemo(() => deviceData?.devices || [], [deviceData]);

  const sourcesRef = useRef({}); // hold multiple EventSources
  const reconnectTimers = useRef({}); // per-device reconnect timers

  useEffect(() => {
    const cleanup = () => {
      Object.values(sourcesRef.current).forEach((s) => s.close());
      sourcesRef.current = {};
      Object.values(reconnectTimers.current).forEach((t) => clearTimeout(t));
      reconnectTimers.current = {};
    };

    if (!devices?.length) return cleanup;

    const setupAndConnect = async (device) => {
      const ipAddress = device.ip;
      const port = device.port ?? 4370;
      const key = `${ipAddress}:${port}`;

      try {
        const url = `${BASE_URL_FLASK}/live_stream?ip=${ipAddress}&port=${port}`;
        const source = new EventSource(url);
        sourcesRef.current[key] = source;

        console.log(`✅ Connected to device ${key}`);

        source.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`📥 [${key}] Stream data:`, data);
            dispatch(setPunchData({ ...data, source: key }));
          } catch (err) {
            console.error(`⚠️ [${key}] Invalid data:`, err);
          }
        };

        source.onerror = () => {
          console.error(`❌ [${key}] Connection lost — reconnecting...`);
          source.close();
          delete sourcesRef.current[key];

          reconnectTimers.current[key] = setTimeout(() => {
            setupAndConnect(device);
          }, 3000);
        };
      } catch (err) {
        console.error(`💥 [${key}] Setup error:`, err);
      }
    };

    devices.forEach((device) => {
      const ipAddress = device.ip;
      const port = device.port ?? 4370;
      const key = `${ipAddress}:${port}`;
      if (ipAddress && !sourcesRef.current[key]) setupAndConnect(device);
    });

    return cleanup;
  }, [devices, dispatch]);
}
