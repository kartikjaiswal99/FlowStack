import { createContext } from 'react';

// This context will provide the onUpdateNodeData function to any node that needs it.
export const WorkflowContext = createContext({
  onUpdateNodeData: () => {},
});