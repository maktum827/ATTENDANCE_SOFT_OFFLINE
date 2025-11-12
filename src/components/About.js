// React and Hooks
import React from 'react';

// Material UI Components
import { Box, Typography } from '@mui/material';
import MetaData from './utils/metaData';

export default function ABOUT() {
  return (
    <Box
      className="globalShapeDesign"
      sx={{ display: 'flex', justifyContent: 'center' }}
    >
      <MetaData title="ABOUT" />
      <Box sx={{ width: '100%', maxWidth: 500, marginTop: 8 }}>
        <Typography variant="body1" align="left" gutterBottom>
          * তানজিম হাজিরা সফটওয়্যারটি শুধুমাত্র ‘তানজিম একাডেমি’ সফটওয়্যার এর
          সাথে ব্যবহারযোগ্য।
        </Typography>
        <Typography variant="body1" align="left" gutterBottom>
          * সফটওয়্যরটি ব্যাবহার করার জন্য জেট কে টেকো (ZKTeco) ব্র্যান্ডের একটি
          হাজিরা মেশিন কিনে নিতে হবে।
        </Typography>
        <br />
        <Typography variant="body1" align="left" gutterBottom>
          যে মডেলগুলোর হাজিরা মেশিন সফটওয়্যর সাপোর্ট করে তার লিস্ট নিম্নে দেওয়া
          হলো।
        </Typography>
        <Box sx={{ overflowX: 'auto', mt: 2 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Device Name
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Firmware Version
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Platform
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: '1',
                  name: 'K40/K50/K60/K90',
                  firmware: 'Ver 6.60 May 25 2018',
                  platform: 'JZ4725_TFT',
                },
                {
                  id: '2',
                  name: 'U580',
                  firmware: 'Ver 6.21 Nov 19 2008',
                  platform: 'ZEM500',
                },
                {
                  id: '3',
                  name: 'T4-C',
                  firmware: 'Ver 6.60 Apr 9 2010',
                  platform: 'ZEM510_TFT',
                },
                {
                  id: '4',
                  name: 'T4-C',
                  firmware: 'Ver 6.60 Dec 1 2010',
                  platform: 'ZEM510_TFT',
                },
                {
                  id: '5',
                  name: 'iClock260',
                  firmware: 'Ver 6.60 Mar 18 2011',
                  platform: 'ZEM600_TFT',
                },
                {
                  id: '6',
                  name: 'iFace402/ID',
                  firmware: 'Ver 6.60 Oct 29 2012',
                  platform: 'ZEM800_TFT',
                },
                {
                  id: '7',
                  name: 'MA300',
                  firmware: 'Ver 6.60 Mar 18 2013',
                  platform: 'ZEM560',
                },
                {
                  id: '8',
                  name: 'iFace800/ID',
                  firmware: 'Ver 6.60 Dec 27 2014',
                  platform: 'ZEM600_TFT',
                },
                {
                  id: '9',
                  name: 'K20',
                  firmware: 'Ver 6.60 Jun 9 2017',
                  platform: 'JZ4725_TFT',
                },
                {
                  id: '10',
                  name: 'VF680',
                  firmware: 'Ver 6.60 Aug 23 2014',
                  platform: 'ZEM600_TFT',
                },
                {
                  id: '11',
                  name: 'RSP10k1',
                  firmware: 'Ver 6.70 Feb 16 2017',
                  platform: 'ZLM30_TFT',
                },
                {
                  id: '12',
                  name: 'K14',
                  firmware: 'Ver 6.60 Jun 16 2015',
                  platform: 'JZ4725_TFT',
                },
                {
                  id: '13',
                  name: 'iFace702',
                  firmware: 'Ver 6.60 Jan 13 2016',
                  platform: 'ZMM220_TFT',
                },
                {
                  id: '14',
                  name: 'F18/ID',
                  firmware: 'Ver 6.60 Apr 26 2016',
                  platform: 'ZMM210_TFT',
                },
                // {
                //   name: 'iClock260',
                //   firmware: 'Ver 6.60 Jun 16 2015',
                //   platform: 'JZ4725_TFT',
                // },
                // {
                //   name: 'iClock3000/ID',
                //   firmware: 'Ver 6.60 Jun 5 2015',
                //   platform: 'ZMM200_TFT',
                // },
                // {
                //   name: 'iClock880-H/ID',
                //   firmware: 'Ver 6.70 Jul 12 2013',
                //   platform: 'ZEM600_TFT',
                // },
              ].map((device) => (
                <tr key={device.id}>
                  <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                    {device.name || '-'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                    {device.firmware}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                    {device.platform}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}
