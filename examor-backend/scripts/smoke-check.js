const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC_ROOT = path.join(__dirname, '..', 'src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = walk(SRC_ROOT);
const failures = [];

for (const file of files) {
  try {
    const source = fs.readFileSync(file, 'utf8');
    new vm.Script(source, { filename: file });
  } catch (error) {
    failures.push({
      file,
      stderr: error && error.stack ? error.stack : String(error),
    });
  }
}

if (failures.length) {
  console.error('Smoke check failed for these backend files:\n');
  for (const failure of failures) {
    console.error(`${failure.file}\n${failure.stderr}\n`);
  }
  process.exit(1);
}

console.log(`Smoke check passed for ${files.length} backend files.`);
