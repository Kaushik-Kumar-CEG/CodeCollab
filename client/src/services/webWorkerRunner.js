let currentWorker = null;

export const terminateWorker = () => {
  if (currentWorker) {
    currentWorker.terminate();
    currentWorker = null;
  }
};

export const runJavaScriptInWorker = (code, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const workerScript = `
      let logs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      const originalConsoleError = console.error;
      console.error = (...args) => {
        logs.push('[ERR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      self.onmessage = function(e) {
        try {
          eval(e.data);
          self.postMessage({ type: 'success', output: logs.join('\\n') });
        } catch (err) {
          self.postMessage({ type: 'error', output: err.toString() });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    currentWorker = worker;

    let timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ stdout: '', stderr: 'Execution Timed Out (>5s)', exitCode: 1 });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      const { type, output } = e.data;
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      if (type === 'error') {
        resolve({ stdout: '', stderr: output, exitCode: 1 });
      } else {
        resolve({ stdout: output, stderr: '', exitCode: 0 });
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ stdout: '', stderr: err.message, exitCode: 1 });
    };

    worker.postMessage(code);
  });
};
