import { StateGraph, Annotation, START } from "@langchain/langgraph";
import { architectNode } from "./agents/architect.agent";
import { coderNode } from "./agents/coder.agent";
import { terminalNode } from "./agents/terminal.agent";
import { reviewerNode } from "./agents/reviewer.agent";
import { routeAfterReview } from "./agents/routeAfterReview.agent";


// 1. Define structured types for the state
export interface ArchitectPlan {
  intent: "GENESIS" | "EVOLUTION" | "FIX" | "REFACTOR";
  summary: string;
  packages: string[];
  steps: {
    step: number;
    action: "CREATE" | "MODIFY" | "DELETE" | "COMMAND";
    path: string;
    description: string;
  }[];
  architectural_notes: string;
}

export interface FileChange {
  path: string;
  content: string;
}

// 2. Define the Root Annotation
export const GraphAnnotation = Annotation.Root({
  project_id: Annotation<string>,
  framework: Annotation<string>,
  user_prompt: Annotation<Array<string>>,
  
  // The Architect's output
  plan: Annotation<ArchitectPlan>, 
  
  // The current working set of files (The "Codebase")
  files: Annotation<FileChange[]>({
    reducer: (left, right) => {
        // This reducer merges file changes. 
        // If a file path exists, update it. If not, add it.
        const fileMap = new Map(left.map(f => [f.path, f.content]));
        right.forEach(f => fileMap.set(f.path, f.content));
        return Array.from(fileMap, ([path, content]) => ({ path, content }));
    },
    default: () => []
  }),

  terminal_output: Annotation<string>,
  
  iteration_count: Annotation<number>({
    reducer: (left, right) => (left ?? 0) + right, // Auto-increments when returned  
    default: () => 0
  }),
  
  is_verified: Annotation<boolean>,
  review_feedback: Annotation<string>, // To tell the coder what to fix
});

// 2. Derive the interface from the Annotation (optional, if you need the type elsewhere)
export type GraphState = typeof GraphAnnotation.State;

// 3. Initialize the graph using the Annotation object (a value)
export const workflow = new StateGraph(GraphAnnotation)

// graph node
.addNode("architectNode", architectNode)
.addNode("coderNode", coderNode)
.addNode("terminalNode", terminalNode)
.addNode("reviewerNode", reviewerNode)

// edges
.addEdge(START, "architectNode")
.addEdge("architectNode", "coderNode")
.addEdge("coderNode", "terminalNode")
.addEdge("terminalNode", "reviewerNode")

// conditional edge
.addConditionalEdges("reviewerNode", routeAfterReview, {
  "retry": "architectNode",
  "end": "__end__"
})

.compile()