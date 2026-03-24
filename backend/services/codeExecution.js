const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const { code, language } = req.body;
  
  // Strict mappings to Piston-supported versions
  const languageMap = {
    'javascript': { language: 'javascript', version: '18.15.0' },
    'python': { language: 'python', version: '3.10.0' },
    'cpp': { language: 'c++', version: '10.2.0' },
    'java': { language: 'java', version: '15.0.2' },
  };
  
  const selectedLanguage = languageMap[language] || languageMap['javascript'];

  try {
    const pistonRes = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: selectedLanguage.language,
      version: selectedLanguage.version,
      files: [{ content: code }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeCollab-Editor-Public/1.0'
      }
    });
    
    // Extract precise output requested: stdout OR stderr natively
    const runOutput = pistonRes.data.run.output || pistonRes.data.run.stderr || '';

    return res.status(200).json({
      output: runOutput,
      source: "piston"
    });
    
  } catch (error) {
    console.error('Piston API failed.', error.response?.data || error.message);
    // Explicit format mapping for Piston-error fallback as requested
    return res.status(200).json({
      output: "Error executing code",
      source: "piston-error"
    });
  }
});

module.exports = router;
