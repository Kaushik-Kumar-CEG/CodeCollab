import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export const executeCode = async (language, code, stdin = '') => {
  // Since the public Piston API is permanently disabled, we will evaluate locally 
  // utilizing the host machine's compilers natively for this demo!
  const tempDir = os.tmpdir();
  const fileId = `codecollab_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  let result = { stdout: '', stderr: '', code: 0 };

  try {
    if (language === 'python') {
      const filePath = path.join(tempDir, `${fileId}.py`);
      await fs.writeFile(filePath, code);
      const { stdout, stderr } = await execAsync(`python "${filePath}"`);
      result.stdout = stdout;
      result.stderr = stderr;
      await fs.unlink(filePath).catch(() => {});
    } 
    else if (language === 'cpp' || language === 'c') {
      const isCpp = language === 'cpp';
      const ext = isCpp ? 'cpp' : 'c';
      const compiler = isCpp ? 'g++' : 'gcc';
      
      const filePath = path.join(tempDir, `${fileId}.${ext}`);
      const exePath = path.join(tempDir, `${fileId}.exe`);
      
      await fs.writeFile(filePath, code);
      await execAsync(`${compiler} "${filePath}" -o "${exePath}"`); // compile
      const { stdout, stderr } = await execAsync(`"${exePath}"`); // run
      result.stdout = stdout;
      result.stderr = stderr;
      
      await fs.unlink(filePath).catch(() => {});
      await fs.unlink(exePath).catch(() => {});
    }
    else if (language === 'java') {
      // Java 11+ supports running `.java` source files directly!
      // Must be named 'Main.java' purely by convention if public class is Main,
      // but if there's no public class, any name works. We'll strip public from class to be safe.
      const safeCode = code.replace(/public\s+class/, 'class');
      const filePath = path.join(tempDir, `${fileId}.java`);
      await fs.writeFile(filePath, safeCode);
      const { stdout, stderr } = await execAsync(`java "${filePath}"`);
      result.stdout = stdout;
      result.stderr = stderr;
      await fs.unlink(filePath).catch(() => {});
    } 
    else if (language === 'javascript') {
      // Handled natively by Web Worker frontend! (This backend route is a fallback)
      result.stdout = "Javascript is executed safely by your browser!";
    }

    return { run: result };

  } catch (error) {
    // child_process throws error if exit code != 0
    return {
      run: {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || 'Execution failed',
        code: error.code || 1
      }
    };
  }
};
