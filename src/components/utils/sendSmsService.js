import axios from 'axios';

/**
 * SENDSMS - Frontend utility to send SMS via backend
 *
 * @param {Object} options
 * @param {'teachers'|'students'|'class'|'lateSms'|'single'} options.receiver
 * @param {string} options.code - School/academy code
 * @param {string} [options.mobile] - Mobile number if receiver is single
 * @param {string} options.message - SMS message content
 *
 * @returns {Promise<Object>} - { success: boolean, message: string, data?: any }
 */

export default async function SENDSMS({
  apiKey,
  mobile = '',
  senderNumber = '',
  userMessages,
}) {
  return;
  try {
    const response = await axios.post(
      'http://bulksmsbd.net/api/smsapimany',
      {
        api_key: apiKey,
        senderid: senderNumber,
        messages: [
          {
            to: mobile,
            message: userMessages,
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    console.log(response);

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to send SMS',
    };
  } catch (error) {
    console.error('SENDSMS error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Network or server error',
    };
  }
}
