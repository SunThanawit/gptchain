import { WorkflowVariable } from '../types/workflow';

export function extractVariablesFromPrompt(prompt: string): string[] {
  const variableRegex = /\{([^}]+)\}/g;
  const matches = [];
  let match;
  
  while ((match = variableRegex.exec(prompt)) !== null) {
    matches.push(match[1]);
  }
  
  return [...new Set(matches)];
}

export function substituteVariables(prompt: string, variables: Record<string, string>): string {
  let result = prompt;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

export function validatePromptVariables(prompt: string, availableVariables: WorkflowVariable[]): {
  isValid: boolean;
  missingVariables: string[];
  unusedVariables: string[];
} {
  const promptVariables = extractVariablesFromPrompt(prompt);
  const availableVariableNames = availableVariables.map(v => v.name);
  
  const missingVariables = promptVariables.filter(v => !availableVariableNames.includes(v));
  const unusedVariables = availableVariableNames.filter(v => !promptVariables.includes(v));
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    unusedVariables
  };
}