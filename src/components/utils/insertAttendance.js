import { useState, useEffect, useMemo } from 'react';
import {
  useGetDevicesQuery,
  useGetSmsServiceQuery,
  useInsertPastLogsMutation,
} from '../../actions/zkTecoApi';
import SENDSMS from './sendSmsService';
import getSmsBalance from './getSmsBalance';

export default function useInsertAttendance() {
  const { data } = useGetDevicesQuery();
  const { data: smsServiceData } = useGetSmsServiceQuery();
  const devices = useMemo(() => data?.devices || [], [data]);

  const [insertPastLogs] = useInsertPastLogsMutation(); // ✅ destructure loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const insertAttendance = async () => {
      if (devices.length > 0) {
        try {
          setLoading(true); // ✅ start loading
          const insertedData = await insertPastLogs(devices).unwrap();
          console.log(insertedData);

          const apiKey = smsServiceData?.sms_service?.config;
          const result = await getSmsBalance(apiKey);

          if (result?.smsBalance > 1) {
            // sending messages
            // const handleSend = async () => {
            //   await SENDSMS({
            //     apiKey: smsServiceData?.sms_service?.config,
            //     senderNumber: smsServiceData?.sms_service?.sender_id,
            //     mobile: '01746841988',
            //     userMessages: 'This is the test message',
            //   });
            // };
            // handleSend();
          }

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
