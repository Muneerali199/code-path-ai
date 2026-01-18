import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorTabsProps {
  openPaths: string[];
  activePath: string;
  onActivate: (path: string) => void;
  onClose: (path: string) => void;
}

export default function EditorTabs({ openPaths, activePath, onActivate, onClose }: EditorTabsProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-panel-header border-b border-border overflow-x-auto">
      {openPaths.map((path) => {
        const isActive = path === activePath;
        return (
          <div
            key={path}
            className={
              'flex items-center gap-2 px-3 py-1 rounded cursor-pointer select-none ' +
              (isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60')
            }
            onClick={() => onActivate(path)}
            role="button"
            tabIndex={0}
          >
            <span className="text-xs whitespace-nowrap">{path}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
