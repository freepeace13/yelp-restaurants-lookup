import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, 'server', '.env');
const examplePath = path.join(root, 'server', '.env.example');

if (fs.existsSync(envPath)) {
  console.log('server/.env already exists; not overwriting.');
} else {
  fs.copyFileSync(examplePath, envPath);
  console.log('Created server/.env from server/.env.example');
  console.log('Edit server/.env and set YELP_API_KEY (and PORT if needed).');
}
