// utils/executeCpp.js
import fs from 'fs';
import path from 'path';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '..', 'outputs');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const TIME_LIMIT_MS = 2000;


function runWithInput(exePath, input) {
  return new Promise((resolve, reject) => {
    const runProcess = spawn(exePath);

    let stdoutData = '';
    let stderrData = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      runProcess.kill('SIGKILL'); // force‐kill if over time
    }, TIME_LIMIT_MS);

    runProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    runProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    runProcess.on('error', (err) => {
      clearTimeout(timer);
      // Could not even spawn the process
      return reject({
        step: 'run',
        errorType: 'Runtime Error',
        error: err.message,
      });
    });



    runProcess.on('close', (code,signal) => {
      clearTimeout(timer);
      if (timedOut) {
        // Process was killed by our timeout—report TLE
        return reject({
          step: 'run',
          errorType: 'Time Limit Exceeded',
          error: `Terminated after ${TIME_LIMIT_MS}ms`,
        });
      }

      if (signal) {
        if (signal === 'SIGKILL' || signal === 'SIGSEGV' || signal === 'SIGABRT') {
          return reject({
            step: 'run',
            errorType: 'Memory Limit Exceeded',
            error: `Process killed with signal ${signal}`,
          });
        }
      }

      if (code !== 0) {
        return reject({
          step: 'run',
          errorType: 'Runtime Error',
          error: stderrData || `Exited with code ${code}`,
        });
      }

      return resolve(stdoutData.trim());
    });

    if (input) {
      const inputStr = typeof input === 'string' ? input : input.toString();
      runProcess.stdin.write(inputStr);
    }
    runProcess.stdin.end();
  });
}

export const executeCpp = async (filePath, inputArray = []) => {
  const jobId = path.basename(filePath, path.extname(filePath));
  const exeName = `${jobId}.exe`;
  const exePath = path.join(outputPath, exeName);

  const cleanup_files = () => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(exePath)) {
      fs.unlinkSync(exePath);
    }
  };

  return new Promise((resolve, reject) => {
    const compileCmd = `g++ "${filePath}" -o "${exePath}"`;

    exec(compileCmd, async (compileErr, compileStdout, compileStderr) => {
      if (compileErr || compileStderr) {
        cleanup_files();
        return reject({
          step: 'compile',
          errorType: 'Compilation Error',
          error: compileErr?.message || compileStderr,
        });
      }

      try {
        const results = [];

        for (const testCase of inputArray) {
          const output = await runWithInput(exePath, testCase.data);
          results.push({ name: testCase.name, output });
        }
        cleanup_files();
        return resolve(results);
      } catch (err) {
        cleanup_files();
        return reject(err);
      }
    });
  });
};
