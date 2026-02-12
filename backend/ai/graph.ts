import {
  StateGraph,
  Annotation,
  START,
  messagesStateReducer,
} from '@langchain/langgraph';
import { architectNode } from './agents/architect.agent';
import { coderNode } from './agents/coder.agent';
import { terminalNode } from './agents/terminal.agent';
import { reviewerNode } from './agents/reviewer.agent';
import { routeAfterReview } from './agents/routeAfterReview.agent';

import {
  FrameworkType,
  InteractionMode,
  StylingType,
} from '../../package/type';
import { BaseMessage } from '@langchain/core/messages';

// 1. Define structured types for the state
export interface ArchitectPlan {
  id: string;
  intent: InteractionMode;
  framework: FrameworkType;
  styling: StylingType;
  packages: string[];

  steps: {
    id: string;
    title: string;
    description: string;

    files_affected: string[];

    action: 'CREATE' | 'MODIFY' | 'DELETE' | 'COMMAND';
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  }[];

  context_summary: string;
  dependencies: Record<string, string>; // name -> version
}

// 2.review
export interface ReviewType {
  score: number;
  is_verified: boolean;

  verdict: 'APPROVED' | 'REJECTED';

  feedback: string[]; // Human-readable, brutal but precise
  suggested_fixes?: string[]; // Atomic, actionable fixes

  retry_from?: 'architect' | 'coder' | 'terminal';

  confidence: number; // How confident the reviewer is in the verdict (0–1)
}

// 3. file node
export interface FileNode {
  path: string;
  content: string;
  isBinary: boolean;
  lastUpdated: number; // Timestamp for HMR (Hot Module Replacement) optimization
}

// 4. terminal type
export interface TerminalType {
  commands: {
    cmd: string;
    reason: string;
    blocking: boolean;
  }[];
  summary: string;
  confidence: number;
}

// 5. termial result type
export interface TerminalResultType {
  logs: string[];
  last_command?: string;
  exit_code?: string;
}

// status of the agent
export type AgentStatus =
  | 'IDLE'
  | 'THINKING'
  | 'PLANNING'
  | 'CODING'
  | 'INSTALLING'
  | 'REVIEWING'
  | 'FIXING'
  | 'COMPLETED'
  | 'ERROR';

// 2. Define the Root Annotation
export const GraphAnnotation = Annotation.Root({
  // meta-data and identities
  project_id: Annotation<string>,
  userId: Annotation<string>,
  framework: Annotation<FrameworkType>,
  styling: Annotation<StylingType>, // styling framework
  mode: Annotation<InteractionMode>,
  user_prompt: Annotation<Array<string>>,

  status: Annotation<AgentStatus>({
    reducer: (perv, curr) => curr,
    default: () => 'IDLE',
  }),

  // --- Input & History ---
  // Using messagesStateReducer allows LangGraph to handle chat history automatically
  message: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  // The Architect's output
  plan: Annotation<ArchitectPlan>({
    reducer: (perv, curr) => ({ ...perv, ...curr }),
  }),

  // The current working set of files (The "Codebase")
  files: Annotation<Record<string, FileNode>>({
    reducer: (perv, curr) => ({ ...perv, ...curr }),
    default: () => ({}),
  }),

  terminal: Annotation<TerminalType>({
    reducer: (_, curr) => curr, // always replace, never merge
    default: () => ({
      commands: [],
      summary: '',
      confidence: 1.0,
    }),
  }),

  // terminal code
  terminal_result: Annotation<TerminalResultType>({
    reducer: (perv, curr) => ({
      ...perv,
      ...curr,
      logs: [...perv.logs, ...curr.logs].slice(-50),
    }),
    default: () => ({ logs: [] }),
  }),

  // --- Quality Control (The Final Judge) ---
  review: Annotation<ReviewType>({
    reducer: (prev, curr) => ({
      ...prev,
      ...curr,
    }),

    default: () => ({
      score: 0,
      is_verified: false,
      verdict: 'REJECTED',
      feedback: [''],
      confidence: 1.0,
    }),
  }),

  //  --- Performance Counters ---
  iteration_count: Annotation<number>({
    reducer: (perv, curr) => (perv ?? 0) + curr, // Auto-increments when returned
    default: () => 0,
  }),
});

// 2. Derive the interface from the Annotation (optional, if you need the type elsewhere)
export type GraphState = typeof GraphAnnotation.State;

// 3. Initialize the graph using the Annotation object (a value)
export const workflow = new StateGraph(GraphAnnotation)

  // graph node
  .addNode('architectNode', architectNode)
  .addNode('coderNode', coderNode)
  .addNode('terminalNode', terminalNode)
  .addNode('reviewerNode', reviewerNode)

  // edges
  .addEdge(START, 'architectNode')
  .addEdge('architectNode', 'coderNode')
  .addEdge('coderNode', 'terminalNode')
  .addEdge('terminalNode', 'reviewerNode')

  // conditional edge
  .addConditionalEdges('reviewerNode', routeAfterReview, {
    retry_architect: 'architectNode',
    retry_coder: 'coderNode',
    retry_terminal: 'terminalNode',
    end: '__end__',
  })

  .compile();
