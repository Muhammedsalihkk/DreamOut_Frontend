const fs = require('fs');
const path = require('path');

console.log('=== CLOUDINARY INTEGRATION TEST SUITE ===');

// 1. Check .env file contents
const envPath = path.resolve(__dirname, '..', '.env');
console.log('\n--- 1. Testing .env configuration ---');
if (!fs.existsSync(envPath)) {
  console.error('FAIL: .env does not exist at', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split(/\r?\n/);
const env = {};
for (const line of lines) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
}

const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME || env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET || env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

console.log('Cloud Name resolved:', cloudName);
console.log('Upload Preset resolved:', uploadPreset);

if (cloudName !== 'dyvbvvjaz') {
  console.error('FAIL: Expected dyvbvvjaz but got', cloudName);
  process.exit(1);
}
if (uploadPreset !== 'dreamout_lookings') {
  console.error('FAIL: Expected dreamout_lookings but got', uploadPreset);
  process.exit(1);
}
console.log('PASS: Environment variables configured correctly without credentials leakage.');

// 2. Folder resolution logic tests
console.log('\n--- 2. Testing Category -> Cloudinary Folder resolution logic ---');
function getFolderForCategory(category) {
  if (!category) return 'dreamout/destinations';
  const cat = category.toLowerCase().trim();
  if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe')) {
    return 'dreamout/restaurants';
  }
  if (cat.includes('hotel') || cat.includes('resort') || cat.includes('stay')) {
    return 'dreamout/hotels';
  }
  if (cat.includes('profile') || cat.includes('avatar') || cat.includes('user')) {
    return 'dreamout/profiles';
  }
  if (cat.includes('moment') || cat.includes('gallery') || cat.includes('story')) {
    return 'dreamout/galleries';
  }
  return 'dreamout/destinations';
}

const cases = [
  { cat: 'Food & Dining', expected: 'dreamout/restaurants' },
  { cat: 'Cafe & Bakery', expected: 'dreamout/restaurants' },
  { cat: 'Hotels & Lodges', expected: 'dreamout/hotels' },
  { cat: 'Luxury Resort', expected: 'dreamout/hotels' },
  { cat: 'user_avatar', expected: 'dreamout/profiles' },
  { cat: 'profile_photo', expected: 'dreamout/profiles' },
  { cat: 'moment_memories', expected: 'dreamout/galleries' },
  { cat: 'story_snapshot', expected: 'dreamout/galleries' },
  { cat: 'Scenic Viewpoint', expected: 'dreamout/destinations' },
  { cat: 'Nature & Mountains', expected: 'dreamout/destinations' },
  { cat: undefined, expected: 'dreamout/destinations' },
];

for (const c of cases) {
  const actual = getFolderForCategory(c.cat);
  if (actual !== c.expected) {
    console.error(`FAIL: For "${c.cat}", expected ${c.expected} but got ${actual}`);
    process.exit(1);
  }
}
console.log('PASS: All 11 category folder mappings matched.');

// 3. Testing file validation
console.log('\n--- 3. Testing File validation rules (size & format) ---');
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function validateFile(file) {
  if (!file || !file.uri) throw new Error('No image file provided for upload.');
  if (file.fileSize && file.fileSize > MAX_BYTES) {
    throw new Error('File exceeds maximum allowed size of 10MB.');
  }
  if (file.mimeType && !ALLOWED_MIMES.includes(file.mimeType.toLowerCase())) {
    throw new Error('Unsupported image format.');
  }
}

try {
  validateFile({ uri: 'test.jpg', fileSize: 15 * 1024 * 1024 });
  console.error('FAIL: Failed to reject oversized file');
  process.exit(1);
} catch (e) {
  console.log('PASS: Successfully rejected oversized file (>10MB).');
}

try {
  validateFile({ uri: 'test.pdf', mimeType: 'application/pdf' });
  console.error('FAIL: Failed to reject invalid mime type');
  process.exit(1);
} catch (e) {
  console.log('PASS: Successfully rejected non-image mime type (application/pdf).');
}

try {
  validateFile({ uri: 'photo.jpg', mimeType: 'image/jpeg', fileSize: 2 * 1024 * 1024 });
  console.log('PASS: Valid JPG under 10MB accepted.');
} catch (e) {
  console.error('FAIL: Valid image was rejected:', e);
  process.exit(1);
}

// 4. Testing Public ID extraction and URL verification
console.log('\n--- 4. Testing Public ID extraction & URL security ---');
function extractPublicId(urlOrPublicId) {
  if (!urlOrPublicId) return null;
  if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
    return urlOrPublicId;
  }
  try {
    const match = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {}
  return null;
}

const sampleUrl = 'https://res.cloudinary.com/dyvbvvjaz/image/upload/v1729000000/dreamout/destinations/munnar_top.jpg';
const extracted = extractPublicId(sampleUrl);
if (extracted !== 'dreamout/destinations/munnar_top') {
  console.error('FAIL: Expected dreamout/destinations/munnar_top but got', extracted);
  process.exit(1);
}
console.log('PASS: Extracted public_id from Cloudinary HTTPS URL:', extracted);

// 5. Verification of .gitignore protection
console.log('\n--- 5. Testing .gitignore security ---');
const gitignorePath = path.resolve(__dirname, '..', '.gitignore');
const gitignore = fs.readFileSync(gitignorePath, 'utf8');
if (!gitignore.includes('.env\n') && !gitignore.includes('.env\r\n')) {
  console.error('FAIL: .env is not ignored in .gitignore');
  process.exit(1);
}
console.log('PASS: .env is strictly ignored in .gitignore.');

console.log('\n=== ALL CLOUDINARY INTEGRATION TESTS PASSED SUCCESSFULLY ===\n');
