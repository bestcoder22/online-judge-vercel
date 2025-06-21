import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TIME_LIMIT_MS = 2000;

function runWithInput(scriptPath, input) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [scriptPath]);
    let stdout = '', stderr = '', timedOut = false;

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

export const executePython = async (filePath, inputArray = []) => {
  const results = [];
  try {
    for (const tc of inputArray) {
      // If runWithInput rejects, this will throw, go to finally, clean up, then propagate
      const out = await runWithInput(filePath, tc.data);
      results.push({ name: tc.name, output: out });
    }
    return results;
  } finally {
    // Always attempt cleanup
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error(`Cleanup error deleting file ${filePath}:`, cleanupErr);
    }
  }
};
