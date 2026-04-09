export const runJavaScriptInWorker = (code, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    // Generate a worker string that wraps the code in an IIFE and intercepts console logs
    const workerScript = `
      let logs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Map as error logs but append to same array or send via different message
        logs.push('[ERR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      self.onmessage = function(e) {
        try {
          // Eval the code explicitly
          eval(e.data);
          self.postMessage({ type: 'success', output: logs.join('\\n') });
        } catch (err) {
          self.postMessage({ type: 'error', output: err.toString() });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    let timer = setTimeout(() => {
      worker.terminate();
      resolve({ stdout: '', stderr: 'Execution Timed Out (>5s)', exitCode: 1 });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      const { type, output } = e.data;
      worker.terminate();
      if (type === 'error') {
         resolve({ stdout: '', stderr: output, exitCode: 1 });
      } else {
         resolve({ stdout: output, stderr: '', exitCode: 0 });
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ stdout: '', stderr: err.message, exitCode: 1 });
    };

    // Send code to worker
    worker.postMessage(code);
  });
};
