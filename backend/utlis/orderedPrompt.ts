export const orderedPrompt = (user_prompt: string[]) => {
  /**
   * Senior Engineer Pattern: Transform raw state into a
   * Semantically Documented Conversation String.
   */
  const formattedHistory = user_prompt
    .map((content, index) => {
      const isLast = index === user_prompt.length - 1;
      const label = isLast ? '[CURRENT TASK]' : '[PREVIOUS CONTEXT]';
      return `${label}\n${content}`;
    })
    .join('\n\n');

  console.log('Formatted History: ', formattedHistory);

  return formattedHistory;
};
