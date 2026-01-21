import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Code, 
  Smartphone, 
  Server, 
  Database, 
  Brain, 
  Gamepad2,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Palette,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  language: string
  files: Array<{
    name: string
    content: string
    language: string
  }>
  color: string
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'web-react',
    name: 'React Web App',
    description: 'Modern React application with TypeScript and Tailwind CSS',
    icon: <Code className="w-6 h-6" />,
    language: 'TypeScript',
    color: 'from-blue-500 to-cyan-500',
    files: [
      {
        name: 'App.tsx',
        content: `import React from 'react'\nimport './App.css'\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Welcome to React</h1>\n        <p>Get started by editing this file!</p>\n      </header>\n    </div>\n  )\n}\n\nexport default App`,
        language: 'typescript'
      },
      {
        name: 'App.css',
        content: `.App {\n  text-align: center;\n  padding: 2rem;\n}\n\n.App-header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  padding: 2rem;\n  border-radius: 8px;\n  color: white;\n}`,
        language: 'css'
      },
      {
        name: 'index.tsx',
        content: `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\n\nconst root = ReactDOM.createRoot(\n  document.getElementById('root') as HTMLElement\n)\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n)`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 'mobile-flutter',
    name: 'Flutter Mobile App',
    description: 'Cross-platform mobile app with Flutter and Dart',
    icon: <Smartphone className="w-6 h-6" />,
    language: 'Dart',
    color: 'from-cyan-500 to-blue-500',
    files: [
      {
        name: 'main.dart',
        content: `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(MyApp());\n}\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'Flutter Demo',\n      theme: ThemeData(\n        primarySwatch: Colors.blue,\n      ),\n      home: MyHomePage(),\n    );\n  }\n}\n\nclass MyHomePage extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: Text('Flutter App'),\n      ),\n      body: Center(\n        child: Text('Welcome to Flutter!'),\n      ),\n    );\n  }\n}`,
        language: 'dart'
      },
      {
        name: 'pubspec.yaml',
        content: `name: flutter_app\ndescription: A new Flutter project\n\nversion: 1.0.0+1\n\nenvironment:\n  sdk: \">=2.17.0 <4.0.0\"\n  flutter: \">=3.0.0\"\n\ndependencies:\n  flutter:\n    sdk: flutter\n\ndev_dependencies:\n  flutter_test:\n    sdk: flutter\n  flutter_lints: ^2.0.0`,
        language: 'yaml'
      }
    ]
  },
  {
    id: 'backend-node',
    name: 'Node.js Backend',
    description: 'Express.js API with TypeScript and MongoDB',
    icon: <Server className="w-6 h-6" />,
    language: 'TypeScript',
    color: 'from-green-500 to-emerald-500',
    files: [
      {
        name: 'server.ts',
        content: `import express from 'express'\nimport cors from 'cors'\nimport helmet from 'helmet'\n\nconst app = express()\nconst PORT = process.env.PORT || 3000\n\napp.use(helmet())\napp.use(cors())\napp.use(express.json())\n\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'OK', timestamp: new Date().toISOString() })\n})\n\napp.get('/api/users', (req, res) => {\n  res.json([\n    { id: 1, name: 'John Doe', email: 'john@example.com' },\n    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }\n  ])\n})\n\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`)\n})`,
        language: 'typescript'
      },
      {
        name: 'package.json',
        content: `{\n  \"name\": \"nodejs-backend\",\n  \"version\": \"1.0.0\",\n  \"description\": \"Node.js backend API\",\n  \"main\": \"dist/server.js\",\n  \"scripts\": {\n    \"dev\": \"ts-node-dev server.ts\",\n    \"build\": \"tsc\",\n    \"start\": \"node dist/server.js\"\n  },\n  \"dependencies\": {\n    \"express\": \"^4.18.0\",\n    \"cors\": \"^2.8.5\",\n    \"helmet\": \"^7.0.0\"\n  },\n  \"devDependencies\": {\n    \"@types/express\": \"^4.17.0\",\n    \"@types/cors\": \"^2.8.0\",\n    \"typescript\": \"^5.0.0\",\n    \"ts-node-dev\": \"^2.0.0\"\n  }\n}`,
        language: 'json'
      }
    ]
  },
  {
    id: 'data-python',
    name: 'Python Data Science',
    description: 'Data analysis with Pandas, NumPy, and visualization',
    icon: <Database className="w-6 h-6" />,
    language: 'Python',
    color: 'from-yellow-500 to-orange-500',
    files: [
      {
        name: 'analysis.py',
        content: `import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Generate sample data\nnp.random.seed(42)\ndates = pd.date_range('2024-01-01', periods=100)\ndata = {\n    'date': dates,\n    'sales': np.random.randint(100, 1000, 100),\n    'temperature': np.random.randint(0, 35, 100),\n    'customers': np.random.randint(50, 200, 100)\n}\n\ndf = pd.DataFrame(data)\n\n# Basic analysis\nprint(\"Dataset Overview:\")\nprint(df.head())\nprint(f\"\\nShape: {df.shape}\")\nprint(f\"\\nData types:\\n{df.dtypes}\")\n\n# Statistical summary\nprint(\"\\nStatistical Summary:\")\nprint(df.describe())`,
        language: 'python'
      },
      {
        name: 'requirements.txt',
        content: `pandas>=1.5.0\nnumpy>=1.24.0\nmatplotlib>=3.6.0\nseaborn>=0.12.0\njupyter>=1.0.0`,
        language: 'text'
      }
    ]
  },
  {
    id: 'ai-ml',
    name: 'AI/ML Project',
    description: 'Machine learning with TensorFlow and scikit-learn',
    icon: <Brain className="w-6 h-6" />,
    language: 'Python',
    color: 'from-purple-500 to-pink-500',
    files: [
      {
        name: 'model.py',
        content: `import numpy as np\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, classification_report\nimport tensorflow as tf\nfrom tensorflow import keras\n\n# Generate sample dataset\nfrom sklearn.datasets import make_classification\nX, y = make_classification(n_samples=1000, n_features=20, n_classes=2, random_state=42)\n\n# Split the data\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# Scale the features\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)\n\n# Train Random Forest model\nrf_model = RandomForestClassifier(n_estimators=100, random_state=42)\nrf_model.fit(X_train_scaled, y_train)\n\n# Make predictions\ny_pred = rf_model.predict(X_test_scaled)\n\n# Evaluate the model\naccuracy = accuracy_score(y_test, y_pred)\nprint(f\"Random Forest Accuracy: {accuracy:.4f}\")\n\n# Neural Network with TensorFlow\nmodel = keras.Sequential([\n    keras.layers.Dense(64, activation='relu', input_shape=(X_train_scaled.shape[1],)),\n    keras.layers.Dropout(0.3),\n    keras.layers.Dense(32, activation='relu'),\n    keras.layers.Dropout(0.3),\n    keras.layers.Dense(1, activation='sigmoid')\n])\n\nmodel.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])\n\n# Train the model\nhistory = model.fit(X_train_scaled, y_train, \n                     epochs=50, \n                     batch_size=32, \n                     validation_split=0.2, \n                     verbose=0)\n\nprint(\"Model training completed!\")`,
        language: 'python'
      },
      {
        name: 'requirements.txt',
        content: `scikit-learn>=1.3.0\ntensorflow>=2.12.0\npandas>=1.5.0\nnumpy>=1.24.0\nmatplotlib>=3.6.0`,
        language: 'text'
      }
    ]
  },
  {
    id: 'game-unity',
    name: 'Unity Game',
    description: '2D/3D game development with Unity and C#',
    icon: <Gamepad2 className="w-6 h-6" />,
    language: 'C#',
    color: 'from-red-500 to-pink-500',
    files: [
      {
        name: 'PlayerController.cs',
        content: `using UnityEngine;\n\npublic class PlayerController : MonoBehaviour\n{\n    [Header(\"Movement Settings\")]\n    public float moveSpeed = 5f;\n    public float jumpForce = 10f;\n    public LayerMask groundLayer;\n    \n    private Rigidbody2D rb;\n    private bool isGrounded;\n    private float horizontalInput;\n    \n    void Start()\n    {\n        rb = GetComponent<Rigidbody2D>();\n    }\n    \n    void Update()\n    {\n        horizontalInput = Input.GetAxisRaw(\"Horizontal\");\n        \n        if (Input.GetButtonDown(\"Jump\") && isGrounded)\n        {\n            Jump();\n        }\n    }\n    \n    void FixedUpdate()\n    {\n        Move();\n        CheckGrounded();\n    }\n    \n    void Move()\n    {\n        rb.velocity = new Vector2(horizontalInput * moveSpeed, rb.velocity.y);\n    }\n    \n    void Jump()\n    {\n        rb.velocity = new Vector2(rb.velocity.x, jumpForce);\n    }\n    \n    void CheckGrounded()\n    {\n        isGrounded = Physics2D.Raycast(transform.position, Vector2.down, 0.1f, groundLayer);\n    }\n}`,
        language: 'csharp'
      },
      {
        name: 'GameManager.cs',
        content: `using UnityEngine;\nusing UnityEngine.SceneManagement;\n\npublic class GameManager : MonoBehaviour\n{\n    public static GameManager Instance;\n    \n    [Header(\"Game Settings\")]\n    public int score = 0;\n    public int lives = 3;\n    public bool gameOver = false;\n    \n    void Awake()\n    {\n        if (Instance == null)\n        {\n            Instance = this;\n            DontDestroyOnLoad(gameObject);\n        }\n        else\n        {\n            Destroy(gameObject);\n        }\n    }\n    \n    public void AddScore(int points)\n    {\n        score += points;\n        Debug.Log(\"Score: \" + score);\n    }\n    \n    public void LoseLife()\n    {\n        lives--;\n        \n        if (lives <= 0)\n        {\n            GameOver();\n        }\n    }\n    \n    void GameOver()\n    {\n        gameOver = true;\n        Debug.Log(\"Game Over! Final Score: \" + score);\n        // Restart game after delay\n        Invoke(\"RestartGame\", 2f);\n    }\n    \n    void RestartGame()\n    {\n        score = 0;\n        lives = 3;\n        gameOver = false;\n        SceneManager.LoadScene(SceneManager.GetActiveScene().name);\n    }\n}`,
        language: 'csharp'
      }
    ]
  }
]

const featuredTemplates = [
  {
    id: 'web-react-pro',
    name: 'React Pro Starter',
    description: 'Professional React app with routing, state management, and testing',
    icon: <Star className="w-5 h-5" />,
    language: 'TypeScript',
    color: 'from-blue-600 to-purple-600',
    featured: true
  },
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full Stack',
    description: 'Complete full-stack application with authentication and database',
    icon: <Zap className="w-5 h-5" />,
    language: 'TypeScript',
    color: 'from-gray-600 to-black',
    featured: true
  },
  {
    id: 'vue-modern',
    name: 'Modern Vue App',
    description: 'Vue 3 application with Composition API and Pinia',
    icon: <Palette className="w-5 h-5" />,
    language: 'JavaScript',
    color: 'from-green-600 to-teal-600',
    featured: true
  },
  {
    id: 'api-restful',
    name: 'RESTful API',
    description: 'Complete REST API with authentication and documentation',
    icon: <Globe className="w-5 h-5" />,
    language: 'Node.js',
    color: 'from-yellow-600 to-orange-600',
    featured: true
  }
]

export default function CreateProject() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = projectTemplates.find(t => t.id === templateId)
    if (template && !projectName) {
      setProjectName(`${template.name} Project`)
    }
  }

  const handleCreateProject = async () => {
    if (!selectedTemplate || !projectName.trim()) {
      toast.error('Please select a template and enter a project name')
      return
    }

    setIsCreating(true)

    try {
      let projectData
      
      if (selectedTemplate === 'custom') {
        if (!customDescription.trim()) {
          toast.error('Please describe what you want to create')
          setIsCreating(false)
          return
        }
        
        // Generate custom project based on description
        projectData = {
          id: Date.now().toString(),
          name: projectName,
          template: 'custom',
          description: customDescription,
          files: [
            {
              name: 'main.py',
              content: `# ${projectName}\n# Generated based on your description: ${customDescription}\n\ndef main():\n    print("Hello, World!")\n    # Add your code here based on: ${customDescription}\n\nif __name__ == "__main__":\n    main()`,
              language: 'python'
            },
            {
              name: 'README.md',
              content: `# ${projectName}\n\n## Description\n${customDescription}\n\n## Getting Started\nThis project was generated based on your description. You can now start coding!`,
              language: 'markdown'
            }
          ]
        }
      } else {
        const template = projectTemplates.find(t => t.id === selectedTemplate)
        if (!template) {
          toast.error('Template not found')
          setIsCreating(false)
          return
        }

        projectData = {
          id: Date.now().toString(),
          name: projectName,
          template: selectedTemplate,
          description: template.description,
          files: template.files
        }
      }

      // Save project to localStorage
      localStorage.setItem('currentProject', JSON.stringify(projectData))
      
      toast.success(`Project "${projectName}" created successfully!`)
      
      // Navigate to the IDE with the new project
      navigate('/ide', { state: { project: projectData } })
      
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">CodePath AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                My Projects
              </Button>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Create Your Next Project
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose from our curated templates or let AI generate a custom project based on your description. 
            Start coding in seconds with everything set up for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Templates */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Templates */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-400" />
                Featured Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`bg-gradient-to-br ${template.color} border-0 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-white/20 rounded-lg">
                          {template.icon}
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {template.language}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/80 text-sm">
                        {template.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Templates */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">All Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-600 ${
                      selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-slate-700/50' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg text-blue-400">
                          {template.icon}
                        </div>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {template.language}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3 text-white">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-300 text-sm">
                        {template.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                  Create Project
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configure your new project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Project Name</label>
                  <Input
                    placeholder="Enter project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>

                {selectedTemplate === 'custom' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">What do you want to create?</label>
                    <Textarea
                      placeholder="Describe your project in detail. For example: 'A weather app that shows current weather and 5-day forecast with beautiful animations'"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[120px]"
                    />
                    <p className="text-xs text-slate-400">
                      Our AI will generate a complete project structure based on your description.
                    </p>
                  </div>
                )}

                {selectedTemplate && selectedTemplate !== 'custom' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300">Template Preview</h4>
                    <div className="bg-slate-900 rounded-lg p-3 text-xs">
                      <p className="text-slate-400 mb-2">Files that will be created:</p>
                      {projectTemplates.find(t => t.id === selectedTemplate)?.files.map((file, index) => (
                        <div key={index} className="flex items-center text-slate-300 mb-1">
                          <Code className="w-3 h-3 mr-2 text-blue-400" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateProject}
                  disabled={!selectedTemplate || !projectName.trim() || isCreating || (selectedTemplate === 'custom' && !customDescription.trim())}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Project...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Create Project
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Custom AI Creation */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Custom Creation</CardTitle>
                <CardDescription className="text-slate-300">
                  Let our AI generate a project based on your description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => handleTemplateSelect('custom')}
                  className={`w-full border-2 ${
                    selectedTemplate === 'custom' 
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Create with AI
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Templates Available</span>
                  <span className="text-white font-medium">{projectTemplates.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Languages Supported</span>
                  <span className="text-white font-medium">6</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Projects Created</span>
                  <span className="text-white font-medium">∞</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}