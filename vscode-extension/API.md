# CodePath Backend API for VSCode Extension

This document describes the API endpoints used by the CodePath VSCode Extension to communicate with the backend service.

## Base URL

All API endpoints are prefixed with `/ai/vscode/`.

## Authentication

All requests must include an API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

## Endpoints

### POST /ai/vscode/process

Processes a VSCode extension request and returns AI-generated results.

#### Request Body

```json
{
  "code": "string (optional)",
  "message": "string (optional)",
  "language": "string (optional)",
  "action": "explain|generate|debug|analyze|refactor|create",
  "context": {
    "fileName": "string (optional)",
    "filePath": "string (optional)",
    "projectContext": "string (optional)",
    "selectionRange": {
      "startLine": "number",
      "endLine": "number"
    },
    "editorContext": {
      "precedingLines": "string (optional)",
      "followingLines": "string (optional)"
    }
  },
  "userId": "string (optional)",
  "sessionId": "string (optional)"
}
```

#### Example Request

```json
{
  "action": "explain",
  "code": "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}",
  "language": "javascript",
  "message": "Explain this fibonacci function",
  "context": {
    "fileName": "math-utils.js",
    "filePath": "/project/src/math-utils.js"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {},
  "error": "string (if success is false)",
  "modelUsed": "string",
  "executionTime": "number (ms)"
}
```

### GET /ai/vscode/capabilities

Returns information about the capabilities of the VSCode extension.

#### Response

```json
{
  "actions": ["explain", "generate", "debug", "analyze", "refactor", "create"],
  "supportedLanguages": ["javascript", "typescript", "..."],
  "features": ["Code explanation", "Code generation", "..."]
}
```

## Action Types

- `explain`: Explain selected code
- `generate`: Generate code based on description
- `debug`: Debug code based on error messages
- `analyze`: Analyze code for security, performance, etc.
- `refactor`: Refactor selected code
- `create`: Create new code elements

## Model Routing

The backend intelligently routes requests to appropriate AI models based on:

- Request complexity
- Action type
- Code size
- Request content

Simple tasks (like basic explanations) are routed to cost-effective models, while complex tasks (like security analysis) are routed to more capable models.

## Error Handling

Common error responses:

- `401 Unauthorized`: Invalid or missing API key
- `400 Bad Request`: Malformed request or missing required fields
- `500 Internal Server Error`: Backend processing error

## Rate Limiting

The backend may implement rate limiting to prevent abuse. Clients should handle rate limit responses gracefully.