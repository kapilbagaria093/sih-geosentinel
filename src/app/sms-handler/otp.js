import "dotenv/config";
import axios from "axios";

export async function sendOtp(mobile, otp) {
    const options = {
        method: "POST",
        url: "https://www.fast2sms.com/dev/bulkV2",
        headers: {
            accept: "application/json",
            Authorization: process.env.SMS_API_KEY,
            "content-type": "application/json",
        },
        data: {
            route: "q",
            message: `Your GeoSentinel verification code is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.

आपका GeoSentinel सत्यापन कोड ${otp} है। यह 10 मिनट के लिए मान्य है। कृपया इसे किसी के साथ साझा न करें।`,
            numbers: mobile,
            sms_details: "1",
        },
    };

    const otpdetails = axios
        .request(options)
        .then((res) => console.log(res.data))
        .catch((err) => console.error(err));

    return otpdetails;
}