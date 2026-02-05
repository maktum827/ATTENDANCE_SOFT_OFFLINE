import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import {
  useGetDevicesQuery,
  useGetSmsServiceQuery,
  useInsertPastLogsMutation,
} from '../../actions/zkTecoApi';
import SENDSMS from './sendSmsService';
import getSmsBalance from './getSmsBalance';

export default function useInsertAttendance() {
  const { t } = useTranslation();
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

          const apiKey = smsServiceData?.sms_service?.config;
          const result = await getSmsBalance(apiKey);

          insertedData?.results.forEach((device) => {
            if (Array.isArray(device.sms_infos)) {
              device.sms_infos.forEach((sms) => {
                if (result?.smsBalance > 1) {
                  console.log(sms);
                  SENDSMS({
                    apiKey: smsServiceData?.sms_service?.config,
                    senderNumber: smsServiceData?.sms_service?.sender_id,
                    mobile: sms?.contact,
                    userMessages: [
                      {
                        to: sms?.contact || '',
                        message: `${sms.message}\n${sms?.name || ''}\n${t('idNo')}: ${sms.user_id}\n${t('class')}: ${sms.class_name}`,
                      },
                    ],
                  });
                }
              });
            } else {
              console.log('  No SMS info available');
            }
          });

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
