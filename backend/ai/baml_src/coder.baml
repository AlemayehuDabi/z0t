enum ToolType {
    ReadFile
    WriteFile
    RunCommand
    ApplyDiff
}

// tool to call
class ToolCall {
    tool ToolType
    argument string
}

// This represents one "Step" of the coder
class CoderResponse {
  thought string @description("The reasoning behind the next action")
  action ToolCall? @description("The tool to call, or null if finished")
}

function  GetNextStep(history: string, task: string) -> CoderResponse {
    client "openai/groq"
  prompt #"
    {{ _.role("system") }}
    You are an expert web developer. You have access to a sandbox via tools.
    
    Task: {{ task }}
    
    Current Progress:
    {{ history }}

    Output your reasoning and the next tool call.
  "#
}