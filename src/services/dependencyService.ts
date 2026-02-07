// Dependency Service - Detect, resolve, and manage npm dependencies for generated code

export interface Dependency {
  name: string;
  version: string;
  status: 'pending' | 'resolving' | 'installed' | 'error';
  cdnUrl?: string;
  error?: string;
}

export interface DependencyResult {
  dependencies: Dependency[];
  importMap: Record<string, string>;
  ready: boolean;
}

// Common built-in/browser modules that don't need CDN resolution
const BUILTIN_MODULES = new Set([
  'fs', 'path', 'os', 'crypto', 'util', 'http', 'https', 'url',
  'stream', 'events', 'buffer', 'querystring', 'child_process',
  'net', 'tls', 'dns', 'assert', 'timers', 'zlib',
]);

// Common relative import patterns to skip
const RELATIVE_PATTERN = /^\.\.?[/\\]/;
const SCOPED_PATTERN = /^@[^/]+\/[^/]+/;

/**
 * Extract npm package imports from code files
 */
export function detectDependencies(
  files: { path: string; content: string; language: string }[]
): string[] {
  const packages = new Set<string>();

  for (const file of files) {
    const content = file.content;

    // Match ES module imports: import X from 'package'
    const esmImportRegex = /import\s+(?:[\w{}\s*,]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = esmImportRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!RELATIVE_PATTERN.test(importPath) && !importPath.startsWith('/')) {
        const pkgName = extractPackageName(importPath);
        if (pkgName && !BUILTIN_MODULES.has(pkgName)) {
          packages.add(pkgName);
        }
      }
    }

    // Match require statements: const X = require('package')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!RELATIVE_PATTERN.test(importPath) && !importPath.startsWith('/')) {
        const pkgName = extractPackageName(importPath);
        if (pkgName && !BUILTIN_MODULES.has(pkgName)) {
          packages.add(pkgName);
        }
      }
    }

    // Match dynamic imports: import('package')
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!RELATIVE_PATTERN.test(importPath) && !importPath.startsWith('/')) {
        const pkgName = extractPackageName(importPath);
        if (pkgName && !BUILTIN_MODULES.has(pkgName)) {
          packages.add(pkgName);
        }
      }
    }
  }

  return Array.from(packages);
}

/**
 * Extract the base package name from an import path
 * e.g., 'react-dom/client' → 'react-dom'
 *        '@mui/material/Button' → '@mui/material'
 */
function extractPackageName(importPath: string): string {
  if (SCOPED_PATTERN.test(importPath)) {
    const parts = importPath.split('/');
    return `${parts[0]}/${parts[1]}`;
  }
  return importPath.split('/')[0];
}

/**
 * Resolve dependencies via esm.sh CDN
 */
export async function resolveDependencies(
  packageNames: string[],
  onProgress?: (dep: Dependency) => void
): Promise<DependencyResult> {
  const dependencies: Dependency[] = [];
  const importMap: Record<string, string> = {};

  for (const name of packageNames) {
    const dep: Dependency = {
      name,
      version: 'latest',
      status: 'resolving',
    };
    onProgress?.(dep);

    try {
      // Use esm.sh to resolve the package
      const cdnUrl = `https://esm.sh/${name}?bundle`;

      // Verify package exists by doing a HEAD request
      const response = await fetch(cdnUrl, { method: 'HEAD' });

      if (response.ok) {
        dep.status = 'installed';
        dep.cdnUrl = cdnUrl;
        dep.version = extractVersionFromHeaders(response) || 'latest';
        importMap[name] = cdnUrl;
      } else {
        dep.status = 'error';
        dep.error = `Package "${name}" not found on npm`;
      }
    } catch (error) {
      dep.status = 'error';
      dep.error = `Failed to resolve: ${(error as Error).message}`;
    }

    dependencies.push(dep);
    onProgress?.(dep);
  }

  return {
    dependencies,
    importMap,
    ready: dependencies.every((d) => d.status === 'installed'),
  };
}

function extractVersionFromHeaders(response: Response): string | null {
  // esm.sh returns the resolved version in x-esm-id header
  const esmId = response.headers.get('x-esm-id');
  if (esmId) {
    const versionMatch = esmId.match(/@(\d+\.\d+\.\d+)/);
    if (versionMatch) return versionMatch[1];
  }
  return null;
}

/**
 * Generate a complete import map for the preview iframe
 */
export function generateImportMapScript(importMap: Record<string, string>): string {
  // Add common sub-path mappings
  const fullMap: Record<string, string> = {};

  for (const [pkg, url] of Object.entries(importMap)) {
    fullMap[pkg] = url;
    // Add sub-path wildcard for common patterns
    fullMap[`${pkg}/`] = url.replace('?bundle', '/') + '?bundle&path=/';
  }

  return `<script type="importmap">
${JSON.stringify({ imports: fullMap }, null, 2)}
</script>`;
}

/**
 * Generate preview HTML that runs React/JSX code with dependencies
 */
export function generatePreviewHTML(
  files: { path: string; content: string; language: string }[],
  importMap: Record<string, string>
): string {
  // Find the main entry file
  const entryFile =
    files.find((f) => f.path.match(/^(index|main|app)\.(tsx?|jsx?)$/i)) ||
    files.find((f) => f.language === 'typescript' || f.language === 'javascript') ||
    files[0];

  // Find CSS files
  const cssFiles = files.filter(
    (f) => f.path.endsWith('.css') || f.language === 'css'
  );

  // Find HTML file
  const htmlFile = files.find(
    (f) => f.path.endsWith('.html') || f.language === 'html'
  );

  // If there's a standalone HTML file, use it directly
  if (htmlFile && files.length === 1) {
    return htmlFile.content;
  }

  const isReact =
    importMap['react'] || entryFile?.content.includes('import React');
  const hasJSX =
    entryFile?.path.endsWith('.tsx') ||
    entryFile?.path.endsWith('.jsx') ||
    entryFile?.content.includes('</') ||
    entryFile?.content.includes('/>');

  // Build import map with esm.sh
  const importMapEntries: Record<string, string> = { ...importMap };

  // Ensure react/react-dom are available if JSX is detected
  if (isReact || hasJSX) {
    if (!importMapEntries['react']) {
      importMapEntries['react'] = 'https://esm.sh/react@18?bundle';
    }
    if (!importMapEntries['react-dom']) {
      importMapEntries['react-dom'] = 'https://esm.sh/react-dom@18?bundle';
    }
    if (!importMapEntries['react-dom/client']) {
      importMapEntries['react-dom/client'] =
        'https://esm.sh/react-dom@18/client?bundle';
    }
  }

  // Build inline modules for local files
  const localModules = files
    .filter((f) => f !== entryFile && !f.path.endsWith('.css') && !f.path.endsWith('.html'))
    .map((f) => {
      const moduleName = './' + f.path.replace(/\.(tsx?|jsx?)$/, '');
      importMapEntries[moduleName] = `data:text/javascript,${encodeURIComponent(f.content)}`;
      return '';
    })
    .join('');

  // Collect CSS
  const cssContent = cssFiles.map((f) => f.content).join('\n');

  // Transform entry file code for browser execution
  let entryCode = entryFile?.content || '';

  // Remove TypeScript type annotations for simple cases (basic transform)
  entryCode = stripTypeAnnotations(entryCode);

  // Strip import of css files
  entryCode = entryCode.replace(/import\s+['"][^'"]*\.css['"]\s*;?\n?/g, '');

  const importMapScript = `<script type="importmap">
${JSON.stringify({ imports: importMapEntries }, null, 2)}
</script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    ${cssContent}
  </style>
  ${hasJSX ? `<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>` : ''}
  ${importMapScript}
</head>
<body>
  <div id="root"></div>
  ${
    hasJSX
      ? `<script type="text/babel" data-type="module" data-presets="react,typescript">
${entryCode}

// Auto-mount if there's an App or default export
try {
  const ReactDOM = await import('react-dom/client');
  const root = document.getElementById('root');
  if (root && typeof App !== 'undefined') {
    ReactDOM.createRoot(root).render(React.createElement(App));
  }
} catch(e) {
  console.error('Mount error:', e);
  document.getElementById('root').innerHTML = '<pre style="color:red;padding:20px;">' + e.message + '</pre>';
}
<\/script>`
      : `<script type="module">
${entryCode}
<\/script>`
  }
  ${localModules}
</body>
</html>`;
}

/**
 * Basic TypeScript type stripping for browser execution
 */
function stripTypeAnnotations(code: string): string {
  // Remove type imports: import type { X } from 'y'
  code = code.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\n?/g, '');

  // Remove interface/type declarations
  code = code.replace(/^(?:export\s+)?(?:interface|type)\s+\w+[\s\S]*?(?=\n(?:import|export|const|let|var|function|class|\/\/|\/\*|\n))/gm, '');

  // Remove type annotations from function params: (x: string) → (x)
  // This is a simplified transform - won't handle all cases
  code = code.replace(/:\s*(?:string|number|boolean|any|void|null|undefined|never|unknown|object|React\.\w+(?:<[^>]*>)?|\w+(?:\[\])?(?:<[^>]*>)?)\s*(?=[,)=])/g, '');

  // Remove return type annotations
  code = code.replace(/\)\s*:\s*(?:string|number|boolean|any|void|null|undefined|never|unknown|object|React\.\w+(?:<[^>]*>)?|JSX\.Element|\w+(?:\[\])?(?:<[^>]*>)?)\s*(?=[{])/g, ') ');

  // Remove generic type params from function calls: useState<string>() → useState()
  code = code.replace(/(\w+)<[^>]+>/g, (match, name) => {
    // Keep JSX tags intact
    if (match.includes('/') || /^[A-Z]/.test(name)) return match;
    return name;
  });

  // Remove 'as Type' casts
  code = code.replace(/\s+as\s+\w+(?:<[^>]*>)?/g, '');

  return code;
}

/**
 * Detect if generated code has a package.json and extract dependencies
 */
export function extractDepsFromPackageJson(
  files: { path: string; content: string }[]
): string[] {
  const pkgFile = files.find(
    (f) => f.path === 'package.json' || f.path.endsWith('/package.json')
  );
  if (!pkgFile) return [];

  try {
    const pkg = JSON.parse(pkgFile.content);
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    return [...deps, ...devDeps];
  } catch {
    return [];
  }
}
