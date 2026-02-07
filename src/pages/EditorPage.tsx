import { useParams } from 'react-router-dom';
import EnhancedIDELayout from '@/components/layout/EnhancedIDELayout';

/**
 * EditorPage serves as the route handler for the IDE.
 * - /editor → creates or loads a new project
 * - /editor/:projectId → loads a specific project by ID
 */
export default function EditorPage() {
  const { projectId } = useParams<{ projectId?: string }>();

  return <EnhancedIDELayout projectId={projectId} />;
}
