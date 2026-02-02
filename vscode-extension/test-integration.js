import axios from 'axios';

async function testVscodeIntegration() {
  console.log('Testing VSCode extension integration with backend...\n');

  // Configuration
  const BACKEND_URL = 'http://localhost:3000';
  const API_KEY = 'cp_dev_key_YWRtaW5AdGVzdC5jb20='; // This should match the default key from our service

  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`API Key: ${API_KEY}\n`);

  // Test 1: Check capabilities endpoint
  console.log('Test 1: Checking VSCode extension capabilities...');
  try {
    const capabilitiesResponse = await axios.get(`${BACKEND_URL}/ai/vscode/capabilities`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Capabilities response received:');
    console.log(`  Actions: ${capabilitiesResponse.data.actions.join(', ')}`);
    console.log(`  Supported languages: ${capabilitiesResponse.data.supportedLanguages.slice(0, 5).join(', ')}...\n`);
  } catch (error) {
    console.error('✗ Failed to get capabilities:', error.response?.data || error.message);
  }

  // Test 2: Test explain code functionality
  console.log('Test 2: Testing code explanation...');
  try {
    const explainResponse = await axios.post(`${BACKEND_URL}/ai/vscode/process`, {
      action: 'explain',
      code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
      language: 'javascript',
      message: 'Explain this fibonacci function',
      context: {
        fileName: 'math-utils.js',
        filePath: '/project/src/math-utils.js'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Code explanation response received:');
    console.log(`  Success: ${explainResponse.data.success}`);
    console.log(`  Model used: ${explainResponse.data.modelUsed || 'unknown'}`);
    console.log(`  Execution time: ${explainResponse.data.executionTime}ms\n`);
  } catch (error) {
    console.error('✗ Failed to explain code:', error.response?.data || error.message);
  }

  // Test 3: Test code generation
  console.log('Test 3: Testing code generation...');
  try {
    const generateResponse = await axios.post(`${BACKEND_URL}/ai/vscode/process`, {
      action: 'generate',
      message: 'Create a JavaScript function that sums two numbers',
      language: 'javascript',
      context: {
        fileName: 'math-utils.js',
        filePath: '/project/src/math-utils.js'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Code generation response received:');
    console.log(`  Success: ${generateResponse.data.success}`);
    console.log(`  Model used: ${generateResponse.data.modelUsed || 'unknown'}`);
    console.log(`  Execution time: ${generateResponse.data.executionTime}ms\n`);
  } catch (error) {
    console.error('✗ Failed to generate code:', error.response?.data || error.message);
  }

  // Test 4: Test code analysis
  console.log('Test 4: Testing code analysis...');
  try {
    const analyzeResponse = await axios.post(`${BACKEND_URL}/ai/vscode/process`, {
      action: 'analyze',
      code: 'app.get("/user/:id", (req, res) => {\n  db.query("SELECT * FROM users WHERE id = " + req.params.id)\n})',
      language: 'javascript',
      message: 'Analyze this code for security issues',
      context: {
        fileName: 'server.js',
        filePath: '/project/src/server.js'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Code analysis response received:');
    console.log(`  Success: ${analyzeResponse.data.success}`);
    console.log(`  Model used: ${analyzeResponse.data.modelUsed || 'unknown'}`);
    console.log(`  Execution time: ${analyzeResponse.data.executionTime}ms\n`);
  } catch (error) {
    console.error('✗ Failed to analyze code:', error.response?.data || error.message);
  }

  console.log('Integration testing completed!');
}

// Run the test
testVscodeIntegration().catch(console.error);