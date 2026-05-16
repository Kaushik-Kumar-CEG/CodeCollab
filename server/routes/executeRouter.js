import express from 'express';
import { executeCode } from '../services/pistonService.js';

const router = express.Router();

router.post('/execute', async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing language or code payload' });
    }

    const { run } = await executeCode(language, code, stdin);
    
    // run.stdout, run.stderr, run.code (exit code)
    res.status(200).json({
      stdout: run.stdout,
      stderr: run.stderr,
      exitCode: run.code
    });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

export default router;
