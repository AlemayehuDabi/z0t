// 1. Frameworks supported by the system
export type FrameworkType = 'REACT' | 'SVELTE' | 'VUE' | 'SOLID' | 'ASTRO';

// 2. The Mode: Genesis (New) vs Evolution (Existing)
export type InteractionMode = 'GENESIS' | 'EVOLUTION';

// 3. The type of tailwind
export type StylingType = 'TAILWIND' | 'SHADCN' | 'MODULECSS';

// 3. User Preferences (The "How")
export interface AgentOptions {
  model: 'GROQ' | 'ANTHROPIC'; // Allows fallback to Anthropic if Groq fails
  interactive: boolean; // Should the agent ask questions before acting?
}

// 4. Base Interface for all Prompts
export interface BasePromptRequest {
  prompt: string; // The user's actual text instruction
  userId: string;
  options: AgentOptions;
}

// 5. Schema for Journey A: NEW PROJECT (The Genesis)
export interface GenesisRequest extends BasePromptRequest {
  mode: 'GENESIS';
  projectSetup: {
    name: string;
    framework: FrameworkType;
    styling: StylingType;
    template?: 'BLANK' | 'LANDING_PAGE' | 'DASHBOARD';
    // capabilities: string[]; // e.g., ["AUTH", "DATABASE", "STRIPE"]  since it is only ui
  };
}

// 6. Schema for Journey B: EXISTING PROJECT (The Evolution)
export interface EvolutionRequest extends BasePromptRequest {
  mode: 'EVOLUTION';
  projectId: string;
  context: {
    activeFileId?: string; // The file currently open in the editor
    visibleFiles: string[]; // List of files the user has open in tabs
    lastErrorLogs?: string; // Any errors from the terminal/browser console
    gitDiff?: string; // What has changed since the last AI update?
    readOnlyFiles?: string[]; // Files the AI can see but NOT change
  };
  attachments?: {
    type: 'IMAGE' | 'PDF' | 'LOG'; // For "Make it look like this screenshot"
    data: string; // Base64 or URI
  }[];
}

// 7. The Final Union Type
export type userPromptRequest = GenesisRequest | EvolutionRequest;
