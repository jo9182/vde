const Semver = require('semver');
const Fs = require('fs');
const ChildProcess = require('child_process');

// Check last commit message
let gitStdout = ChildProcess.execSync(`git log -1 --pretty=%B`);
let commitText = gitStdout.toString('utf-8').trim();
let packageJSON = JSON.parse(Fs.readFileSync('package.json', 'utf-8'));
let outVersion = packageJSON.version;

// Increase version
if (commitText.match(/^fix|^patch|^update/i)) outVersion = Semver.inc(outVersion, 'patch');
else if (commitText.match(/^minor/i)) outVersion = Semver.inc(outVersion, 'minor');
else if (commitText.match(/^major/i)) outVersion = Semver.inc(outVersion, 'major');

// Out new version
console.log(outVersion);

// Save version back
Fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 4));