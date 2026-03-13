export function makeToolUseResponse(diagramType: string, mermaid: string, explanation: string): object {
  return {
    stopReason: 'tool_use',
    output: {
      message: {
        role: 'assistant',
        content: [
          {
            toolUse: {
              toolUseId: 'tu-001',
              name: 'create_diagram',
              input: {
                diagram_type: diagramType,
                mermaid_definition: mermaid,
                explanation
              }
            }
          }
        ]
      }
    }
  };
}

export function makeTextResponse(text: string): object {
  return {
    stopReason: 'end_turn',
    output: {
      message: {
        role: 'assistant',
        content: [{ text }]
      }
    }
  };
}
