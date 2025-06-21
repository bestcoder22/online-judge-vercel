import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const TIME_LIMIT_MS = 2000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executes a JavaScript file at filePath for multiple test inputs.
 * - For each test case, runs the code in a fresh VM context with:
 *    * a custom console.log that accumulates into sandbox.consoleOutput
 *    * a prompt() function that returns lines from the test input
 * - Enforces a TIME_LIMIT_MS via vm.Script.runInContext timeout option.
 * - Collects results: on success, { name, output }, on error, { name, error: { step, errorType, error } }
 * - Always deletes the file at filePath before returning or throwing.
 *
 * @param {string} filePath - path to the JS file to execute. Will be deleted after execution.
 * @param {Array<{name: string, data: string}>} inputArray - array of test cases.
 * @returns {Promise<Array<{name: string, output?: string, error?: any}>>}
 * @throws If reading the file fails: throws { step: 'read', errorType: 'Read Error', error: <message> }
 *         Other unexpected errors in setup also thrown similarly, after cleanup.
 */
export const executeJs = async (filePath, inputArray = []) => {
  // Helper to delete the JS file before exit
  const cleanupFile = () => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error(`Failed to delete JS file ${filePath}:`, e);
    }
  };

  let code;
  // 1. Read the code
  try {
    code = await fs.promises.readFile(filePath, 'utf-8');
  } catch (readErr) {
    // Cleanup then throw
    cleanupFile();
    throw { step: 'read', errorType: 'Read Error', error: readErr.message };
  }

  const results = [];
  // 2. For each test, run in VM
  try {
    for (const tc of inputArray) {
      // Prepare a fresh sandbox for each test
      const sandbox = {
        consoleOutput: '',
        console: {
          log: (...args) => {
            // accumulate logs with newline
            sandbox.consoleOutput += args.map(String).join(' ') + '\n';
          }
        },
        inputLines: Array.isArray(tc.data)
          ? tc.data.map(String)  // if data already an array of lines
          : tc.data.trim().split('\n'),  // string: split into lines
        inputIndex: 0,
        prompt: () => {
          // Return next line or empty string if out of lines
          if (sandbox.inputIndex < sandbox.inputLines.length) {
            return sandbox.inputLines[sandbox.inputIndex++];
          }
          return '';
        },
        // If code uses other globals (e.g., Math), they are available implicitly.
      };

      const context = vm.createContext(sandbox);

      let script;
      try {
        script = new vm.Script(code, { filename: filePath });
      } catch (compileErr) {
        // Syntax error or similar while creating script
        // Record as a runtime-like error for this test, but continue other tests
        results.push({
          name: tc.name,
          error: {
            step: 'compile', // here compile means parsing/vm compilation
            errorType: 'Syntax Error',
            error: compileErr.message
          }
        });
        continue; // move to next test
      }

      // Run the script with timeout
      try {
        // runInContext is synchronous; it will throw if timeout or runtime error
        script.runInContext(context, { timeout: TIME_LIMIT_MS });
        // On success, collect trimmed consoleOutput
        results.push({
          name: tc.name,
          output: sandbox.consoleOutput.trim()
        });
      } catch (err) {
        // err may be a TimeoutError or other Error
        if (err && err.message && err.message.includes('Script execution timed out')) {
          results.push({
            name: tc.name,
            error: {
              step: 'run',
              errorType: 'Time Limit Exceeded',
              error: `>${TIME_LIMIT_MS}ms`
            }
          });
        } else {
          // Other runtime error
          results.push({
            name: tc.name,
            error: {
              step: 'run',
              errorType: 'Runtime Error',
              error: err.message
            }
          });
        }
      }
    }
    return results;
  } finally {
    // 3. Cleanup JS file no matter what
    cleanupFile();
  }
};
