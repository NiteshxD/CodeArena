const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/', async (req, res) => {
  const { source_code, language_id } = req.body;
  const languageMap = {
    63: { language: 'javascript', version: '18.15.0' },
    71: { language: 'python', version: '3.10.0' },
    54: { language: 'c++', version: '10.2.0' }
  };
  const selectedLanguage = languageMap[language_id] || languageMap[63];

  // 1. Judge0 (Production/Deployed Default if Key provided)
  if (process.env.JUDGE0_API_KEY) {
    try {
      const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', 
        { source_code, language_id: language_id || 63 },
        {
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
          params: { base64_encoded: 'false', fields: '*' }
        }
      );
      
      const token = response.data.token;
      let result = null;
      let attempts = 0;
      
      while (!result && attempts < 10) {
        const statusRes = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
          params: { base64_encoded: 'false', fields: '*' }
        });
        
        if (statusRes.data.status.id === 1 || statusRes.data.status.id === 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else {
          result = statusRes.data;
        }
      }
      return res.status(200).json(result ? { ...result, execution_source: "Judge0 API" } : { error: "Timeout", execution_source: "Judge0 API" });
    } catch (error) {
      console.error('Judge0 failed, falling back...');
    }
  }

  // 2. Piston API (Free Deployment Alternative with spoofed User-Agent)
  try {
    const pistonRes = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: selectedLanguage.language,
      version: selectedLanguage.version,
      files: [{ content: source_code }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeCollab-Editor-Public/1.0'
      }
    });
    
    return res.status(200).json({
      stdout: pistonRes.data.run.stdout,
      stderr: pistonRes.data.run.stderr,
      compile_output: pistonRes.data.compile?.stderr || null,
      error: null,
      execution_source: "Piston API"
    });
  } catch (error) {
    console.error('Piston API blocked or failed. Checking local execution fallback...');
  }

  // 3. Local OS Execution (Final Fallback for Local Development)
  const jobId = uuidv4();
  if (language_id === 63 || language_id === 'javascript') {
    const filePath = path.join(__dirname, `${jobId}.js`);
    try {
      fs.writeFileSync(filePath, source_code);
      exec(`node "${filePath}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (error && error.killed) {
           return res.status(200).json({ stdout: null, stderr: "Execution timed out (5s limit)", error: null, execution_source: "Local Node.js OS Sandbox" });
        }
        return res.status(200).json({ stdout, stderr: stderr || null, compile_output: null, error: error ? error.message : null, execution_source: "Local Node.js OS Sandbox" });
      });
    } catch (err) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(500).json({ error: "Local Server JS execution failed." });
    }
  } else if (language_id === 71 || language_id === 'python') {
    const filePath = path.join(__dirname, `${jobId}.py`);
    try {
      fs.writeFileSync(filePath, source_code);
      exec(`python "${filePath}"`, { timeout: 5000 }, (error, stdout, stderr) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (error && error.killed) {
           return res.status(200).json({ stdout: null, stderr: "Execution timed out (5s limit)", error: null, execution_source: "Local Python OS Sandbox" });
        }
        return res.status(200).json({ stdout, stderr: stderr || null, compile_output: null, error: null, execution_source: "Local Python OS Sandbox" });
      });
    } catch (err) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(500).json({ error: "Local Server Python execution failed." });
    }
  } else {
    return res.status(500).json({
      error: "All remote APIs failed, and local compilation is not supported for this language."
    });
  }
});

module.exports = router;
