import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });

const TIME_LIMIT_MS = 2000;

/**
 * Run a spawned process with stdin, timeout, and capture stdout/stderr.
 */
function runWithInput(cmd, args, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stdout = '', stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, TIME_LIMIT_MS);

    proc.stdout.on('data', d => stdout += d);
    proc.stderr.on('data', d => stderr += d);
    proc.on('error', e => {
      clearTimeout(timer);
      reject({ step: 'run', errorType: 'Runtime Error', error: e.message });
    });
    proc.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        return reject({ step: 'run', errorType: 'Time Limit Exceeded', error: `>${TIME_LIMIT_MS}ms` });
      }
      if (signal) {
        return reject({ step: 'run', errorType: 'Runtime Error', error: `killed by ${signal}` });
      }
      if (code !== 0) {
        return reject({ step: 'run', errorType: 'Runtime Error', error: stderr || `code ${code}` });
      }
      resolve(stdout.trim());
    });

    if (input) proc.stdin.write(input.toString());
    proc.stdin.end();
  });
}

/**
 * Clean up .class files for a given base name in a directory.
 */
function cleanupClassFiles(dir, base) {
  try {
    for (const f of fs.readdirSync(dir)) {
      if (
        f === `${base}.class` ||
        (f.startsWith(`${base}$`) && f.endsWith('.class'))
      ) {
        fs.unlinkSync(path.join(dir, f));
      }
    }
  } catch (_) {
    // ignore
  }
}

/**
 * Executes a Java source file, even if not named after the public class.
 * Follows the same TLE/runtime behavior as executeCpp: any run error aborts.
 *
 * @param {string} filePath - Path to your uploaded .java
 * @param {Array<{name:string, data:string}>} inputArray - test cases
 * @returns {Promise<Array<{name:string, output:string}>>}
 */
export const executeJava = async (filePath, inputArray = []) => {
  const classDir = path.dirname(filePath);
  const src = fs.readFileSync(filePath, 'utf-8');

  // 1) Detect the public class name, or fall back to file base
  const match = src.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
  const className = match ? match[1] : path.basename(filePath, '.java');
  const tempJava = path.join(classDir, className + '.java');

  // Write a temp file named exactly to the public class
  fs.writeFileSync(tempJava, src, 'utf-8');

  try {
    // 2) Compile
    await exec(`javac "${tempJava}"`);

    // 3) Run each test; any runtime/TLE will reject immediately
    const results = [];
    for (const tc of inputArray) {
      const out = await runWithInput('java', ['-cp', classDir, className], tc.data);
      results.push({ name: tc.name, output: out });
    }

    // Delete the original .java before returning
    try { fs.unlinkSync(filePath); } catch (_) {}
    return results;

  } catch (err) {
    // If compile error, err.step === 'compile', otherwise 'run'
    const payload = err.step === 'compile'
      ? { step: 'compile', errorType: 'Compilation Error', error: err.stderr || err.error || err.message }
      : err;

    // Delete the original .java before rejecting
    try { fs.unlinkSync(filePath); } catch (_) {}
    return Promise.reject(payload);

  } finally {
    // Always clean up .class files and the temp .java
    cleanupClassFiles(classDir, className);
    try { fs.unlinkSync(tempJava); } catch (_) {}
  }
};
