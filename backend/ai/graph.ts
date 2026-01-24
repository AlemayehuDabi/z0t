import { StateGraph, Annotation, START } from "@langchain/langgraph";
import { architectNode } from "./agents/architect.agent";
import { coderNode } from "./agents/coder.agent";
import { terminalNode } from "./agents/terminal.agent";
import { reviewerNode } from "./agents/reviewer.agent";
import { routeAfterReview } from "./agents/routeAfterReview.agent";

// 1. Define your state (The "Memory" of your graph)
const GraphAnnotation = Annotation.Root({
    project_id: Annotation<string>,
    framework: Annotation<string>,
    user_prompt: Annotation<string>,
    plan: Annotation<string[]>, 
    files: Annotation<Array<{path: string, content: string}>>,
    terminal_output: Annotation<string>,
    iteration_count: Annotation<number>({
      reducer: (left, right) => (left ?? 0) + right, // Auto-increments when returned
      default: () => 0
    }),
    is_verified: Annotation<boolean>,
});

// 2. Derive the interface from the Annotation (optional, if you need the type elsewhere)
export type GraphState = typeof GraphAnnotation.State;

// 3. Initialize the graph using the Annotation object (a value)
const graph = new StateGraph(GraphAnnotation);

// graph node
graph.addNode("architectNode", architectNode)
.addNode("coderNode", coderNode)
.addNode("terminalNode", terminalNode)
.addNode("reviewerNode", reviewerNode)
.addNode("routeAfterReview", routeAfterReview)

// edges
.addEdge(START, "architectNode")
.addEdge("architectNode", "coderNode")
.addEdge("coderNode", "terminalNode")
.addEdge("terminalNode", "reviewerNode")

// conditional edge
.addConditionalEdges("reviewerNode", "routeAfterReview")

.compile()