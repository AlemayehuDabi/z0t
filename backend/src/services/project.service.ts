import prisma from '../../libs/prisma';
import {
  GenesisRequest,
  FrameworkType,
  EvolutionRequest,
} from '../../../package/type';

export const ProjectService = {
  /**
   * GENESIS: Creates a brand new project and initializes its memory.
   */
  async createProject(data: GenesisRequest, userId: string) {
    // 1. Create the project
    return await prisma.project.create({
      data: {
        name: data.projectSetup.name,
        userId: userId,
        frameWork: data.projectSetup.framework as FrameworkType, // Matches your Prisma Enum
        projectStatus: 'ACTIVE',
        styling: data.projectSetup.styling,
        memories: {
          create: {
            key: 'stack_summary',
            value: `Framework: ${data.projectSetup.framework}. Instructions: Follow standard ${data.projectSetup.framework} patterns.`,
          },
        },
        prompts: {
          create: {
            role: 'USER',
            content: data.prompt,
            order: 0,
          },
        },
      },

      include: {
        memories: true, // Return the memory with the project
        prompts: true,
      },
    });
  },

  /**
   * EVOLUTION: Fetches all context needed for the AI to understand an existing project.
   * Logic: Get the project + last 5 prompts + key memory entries.
   */
  async getProjectContext(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        // Efficiency: We only need the last few prompts for conversational context
        prompts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        // Memory acts as the "Long Term" storage to avoid sending 1000s of code lines
        memories: true,
      },
    });

    if (!project) throw new Error('Project not found');

    // Security check: Ensure the user owns this project (Multi-tenant safety)
    if (project.userId !== userId) {
      throw new Error('Unauthorized access to project');
    }

    return project;
  },

  /**
   * TRACEABILITY: Saves the user's prompt and the AI's generation.
   * Linking these allows the user to see exactly what prompt caused what code change.
   */
  async saveInteraction(params: {
    projectId: string;
    userContent: string;
    aiOutput: string;
    modelName: string;
    type: 'CODE' | 'ARCHITECTURE' | 'FIX';
  }) {
    // 1. Save the User Prompt
    return await prisma.prompt.create({
      data: {
        projectId: params.projectId,
        role: 'USER',
        content: params.userContent,
        order: 0, // You can calculate incrementing order here

        generations: {
          // optimized
          create: {
            projectId: params.projectId,
            type: params.type,
            output: params.aiOutput,
            modelUsed: params.modelName,
          },
        },
      },
      include: {
        generations: true, // return w/ prompt
      },
    });
  },

  // addprompt
  async addPrompt(
    projectId: string,
    content: string,
    role: 'USER' | 'SYSTEM' | 'AGENT',
  ) {
    const lastPrompt = await prisma.prompt.findFirst({
      where: {
        projectId,
      },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastPrompt ? lastPrompt.order + 1 : 0;

    return await prisma.prompt.create({
      data: {
        projectId,
        content,
        order: nextOrder,
        role,
      },
    });
  },

  //   get project memory
  async getProjectMemory(body: EvolutionRequest, userId: string) {
    const projectMemory = await prisma.projectMemory.findFirst({
      where: {
        projectId: body.projectId,
      },
    });

    if (!projectMemory) throw new Error('Project not found');

    if (body.userId !== userId)
      throw new Error('Unauthorized access to project');

    return projectMemory;
  },

  /**
   * PERFORMANCE: Updates the "Project Memory".
   * This is called after an agent finishes a task to summarize what it did.
   */
  async updateMemory(projectId: string, key: string, newValue: string) {
    return await prisma.projectMemory.upsert({
      where: {
        // Note: You might need a composite unique key in Prisma for this to work
        // e.g., @@unique([projectId, key])
        id: `${projectId}_${key}`,
      },
      update: { value: newValue },
      create: {
        projectId,
        key,
        value: newValue,
      },
    });
  },

  /**
   * ARCHIVE/DELETE: Soft delete logic
   */
  async archiveProject(projectId: string, userId: string) {
    return await prisma.project.updateMany({
      where: { id: projectId, userId: userId },
      data: { projectStatus: 'ARCHIVED' },
    });
  },
};
