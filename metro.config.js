const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ปิดการใช้ Package Exports ของ Web เพื่อบังคับให้ Metro ดึงโมดูลสำหรับ Mobile Native
config.resolver.unstable_enablePackageExports = false;

module.exports = config;