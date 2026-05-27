/**
 * Environment Variable Validator
 * Validates required environment variables at startup to fail fast
 */

const requiredEnvVars = [
  { name: 'MONGO_URI', description: 'MongoDB connection string' },
  { name: 'ADMIN_PHONE_NUMBER', description: 'Admin phone number for notifications' },
  { name: 'GEMINI_API_KEY', description: 'Google Gemini API key for AI features' },
];

const optionalEnvVars = [
  { name: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary cloud name (for video uploads)' },
  { name: 'CLOUDINARY_API_KEY', description: 'Cloudinary API key' },
  { name: 'CLOUDINARY_API_SECRET', description: 'Cloudinary API secret' },
  { name: 'IMGBB_API_KEY', description: 'ImgBB API key (for image uploads)' },
  { name: 'SESSION_SECRET', description: 'Session secret key' },
  { name: 'NODE_ENV', description: 'Node environment (development/production)' },
  { name: 'OTP_TESTING', description: 'Enable OTP console logging and skip Twilio (true/false)' },
];

/**
 * Validates environment variables and logs status
 * @returns {boolean} true if all required variables are present, false otherwise
 */
function validateEnvVariables() {
  console.log('\n\x1b[36m%s\x1b[0m', '🔍 Validating environment variables...\n');
  
  let allValid = true;
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar.name]) {
      missing.push(envVar);
      allValid = false;
    }
  }

  // Check optional variables (warnings only)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar.name]) {
      warnings.push(envVar);
    }
  }

  // Report missing required variables
  if (missing.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables:');
    missing.forEach(v => {
      console.error('\x1b[31m%s\x1b[0m', `   • ${v.name}: ${v.description}`);
    });
    console.log('');
  }

  // Report optional warnings
  if (warnings.length > 0) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Missing optional environment variables (some features may not work):');
    warnings.forEach(v => {
      console.warn('\x1b[33m%s\x1b[0m', `   • ${v.name}: ${v.description}`);
    });
    console.log('');
  }

  if (allValid) {
    console.log('\x1b[32m%s\x1b[0m', '✓ All required environment variables are set\n');
  } else {
    console.error('\x1b[31m%s\x1b[0m', '✗ Server cannot start without required environment variables');
    console.error('\x1b[31m%s\x1b[0m', '  Please create a .env file with the required variables\n');
  }

  return allValid;
}

/**
 * Exits process if required environment variables are missing
 */
function requireEnvVariables() {
  if (!validateEnvVariables()) {
    process.exit(1);
  }
}

module.exports = {
  validateEnvVariables,
  requireEnvVariables
};
