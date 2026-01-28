import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Globe, Smartphone, Maximize2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewPanelProps {
  files: any[]
  className?: string
}

export default function PreviewPanel({ files, className }: PreviewPanelProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [key, setKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [files, key])

  const handleRefresh = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className={cn("h-full flex flex-col bg-[#09090b]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#09090b] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">App Preview</span>
          <div className="flex items-center gap-1 ml-4 bg-white/5 rounded-md p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 hover:bg-white/10",
                device === 'desktop' ? "bg-white/10 text-white" : "text-slate-400"
              )}
              onClick={() => setDevice('desktop')}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 hover:bg-white/10",
                device === 'mobile' ? "bg-white/10 text-white" : "text-slate-400"
              )}
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center overflow-hidden">
        <div 
          className={cn(
            "bg-background transition-all duration-300 shadow-2xl overflow-hidden relative",
            device === 'mobile' ? "w-[375px] h-[667px] rounded-3xl border-8 border-gray-800" : "w-full h-full rounded-md border border-white/10"
          )}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-sm text-muted-foreground">Starting development server...</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
                      .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
                      header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 1rem 0; margin-bottom: 2rem; }
                      h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
                      .card { background: #fff; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); padding: 1.5rem; margin-bottom: 1rem; }
                      .btn { display: inline-block; background: #3b82f6; color: #fff; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; }
                      .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; }
                    </style>
                  </head>
                  <body>
                    <header>
                      <div class="container">
                        <h1>🚀 React App Preview</h1>
                      </div>
                    </header>
                    <div class="container">
                      <div class="card">
                        <span class="badge">Success</span>
                        <h2>App Running Successfully</h2>
                        <p>Your application has been compiled and is running in preview mode.</p>
                        <p style="color: #64748b; font-size: 0.875rem;">This is a simulated preview of your generated code.</p>
                        <a href="#" class="btn" style="margin-top: 1rem;">Click Me</a>
                      </div>
                      <div class="card">
                        <h3>Features</h3>
                        <ul style="padding-left: 1.25rem; color: #475569;">
                          <li>Hot Reloading enabled</li>
                          <li>TypeScript support</li>
                          <li>Tailwind CSS configured</li>
                        </ul>
                      </div>
                    </div>
                  </body>
                </html>
              `}
              title="Preview"
              className="w-full h-full border-none bg-white"
            />
          )}
        </div>
      </div>
    </div>
  )
}