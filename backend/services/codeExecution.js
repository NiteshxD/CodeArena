const express = require('express');
const axios = require('axios');
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
      console.error('Judge0 failed, falling back to Piston...', error.response?.data || error.message);
    }
  }

  // 2. Piston API (Free Cloud Execution Alternative)
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
    console.error('Piston API blocked or failed.', error.response?.data || error.message);
    return res.status(500).json({
      error: "All remote cloud APIs failed to execute securely. Please try again later or provide a Judge0 Key.",
      execution_source: "Failed Remote Compilation"
    });
  }
});

module.exports = router;
