import { Context } from "hono"
import { promptRequest } from "../../../package/type"
import { ProjectService } from "./project.service";
import { workflow } from "../../ai/graph";

export async function createPrompt (c:Context) {
    const requestPayload = await c.req.json<promptRequest>()

    // use to verify user
    const user = await c.get("user")
        
     // TODO: Validate the payload—is this a "GENESIS" (New) or "EVOLUTION" (Existing) request?
     const mode = requestPayload.mode

    //  framework and projectId variable for both
    let projectId = ""
    let frameWork = ""
    let prompts = []


    // 2. CONTEXT AGGREGATION (The Performance Layer)
    if (mode == "GENESIS") {
        // TODO: Create a new entry in the Project table.
        const newProject = await ProjectService.createProject(requestPayload, user.id)
        
        // console log for debug
        console.log("initializing new/genesis project", newProject)

        // set the variable 
        projectId = newProject.id
        frameWork = newProject.frameWork
        prompts = newProject.prompts.slice(0,5)
    } else {
        // TODO: Fetch the last 5 relevant prompts from the database for short-term memory.      
        const projectContext = await ProjectService.getProjectContext(requestPayload.projectId, user.id)

        // console log the project context'
        console.log({projectContext})

        // set the variable
        projectId = projectContext.id
        frameWork = projectContext.frameWork
        prompts = projectContext.prompts.slice(0,5)


        // first five prompts
        // const fivePrompts = projectContext.prompts.slice(0,5)

        // TODO: Retrieve "ProjectMemory" (The summarized state of the whole app).
        // const projectMemory = await ProjectService.getProjectMemory(requestPayload, user.id)
        // TODO: If the user provided an 'activeFile', pull that specific content from storage.

        // TODO: Capture any 'errorLogs' provided to prioritize a "Fix" agent over a "Feature" agent.
    }

    // 3. MULTI-AGENT DISPATCH (The "Brain" Layer)
    const result = await workflow.invoke({
        project_id: projectId,
        framework: frameWork,
        user_prompt: prompts,
        files: [],
        plan: [],
        terminal_output: "",
        is_verified: false
    })

    // 4. STREAMING & EXECUTION
    // TODO: Open a stream (Server-Sent Events) back to the user for real-time UI updates.
    // TODO: The 'Coder Agent' generates code blocks.
    // TODO: The 'File System Tool' writes those blocks into the virtual file system.

    // 5. POST-GENERATION & CLEANUP (The Efficiency Layer)
    // TODO: Run a 'Linter Agent' to check the new code for syntax errors.
    // TODO: Save the User's Prompt and the AI's Generation to the DB (Prisma).
    // TODO: Update 'ProjectMemory' by summarizing what was just built (to keep future context windows small).
    // TODO: Clear temporary cache/logs to keep the system lean.

    // 6. PERSISTENCE (Save the result)
    // TODO: Save the code changes to your database or file system

    // 7. RESPONSE
    // TODO: Return the final 'ProjectStatus' and the list of modified files.
    return c.json({
        status: "success",
        projectId,
        plan: result.plan,
        filesModified: result.files.map(f => f.path)
    });
}