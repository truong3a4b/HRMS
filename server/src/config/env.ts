import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  BREVO_SENDER_EMAIL:
    process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL_ADDRESS || "",
  BREVO_SENDER_NAME:
    process.env.BREVO_SENDER_NAME || process.env.ADMIN_EMAIL_NAME || "HRMS",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_CV_FOLDER: process.env.CLOUDINARY_CV_FOLDER || "hrms/cvs",
  MQTT_URL: process.env.MQTT_URL || "",
  MQTT_CLIENT_ID: process.env.MQTT_CLIENT_ID || "hrms-server",
  MQTT_USERNAME: process.env.MQTT_USERNAME || "",
  MQTT_PASSWORD: process.env.MQTT_PASSWORD || "",
  MQTT_KEEP_ALIVE_SECONDS: Number(process.env.MQTT_KEEP_ALIVE_SECONDS || 60),
  ATTENDANCE_HEARTBEAT_TIMEOUT_SECONDS: Number(
    process.env.ATTENDANCE_HEARTBEAT_TIMEOUT_SECONDS || 180,
  ),
  ATTENDANCE_TOPIC_PREFIX:
    process.env.ATTENDANCE_TOPIC_PREFIX || "hrms/attendance/devices",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  RECRUITMENT_INTERVIEW_RESPONSE_TIMEOUT_HOURS: Number(
    process.env.RECRUITMENT_INTERVIEW_RESPONSE_TIMEOUT_HOURS || 48,
  ),
  RECRUITMENT_OFFER_RESPONSE_TIMEOUT_HOURS: Number(
    process.env.RECRUITMENT_OFFER_RESPONSE_TIMEOUT_HOURS || 48,
  ),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "123456",
  WEB_ORIGIN: process.env.WEB_ORIGIN || "http://127.0.0.1:5173",
};
