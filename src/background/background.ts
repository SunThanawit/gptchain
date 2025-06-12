import { Workflow, WorkflowExecution } from '../types/workflow';

chrome.runtime.onInstalled.addListener(() => {
  console.log('GPTChain extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SAVE_WORKFLOW':
      saveWorkflow(message.workflow).then(sendResponse);
      return true;
    
    case 'LOAD_WORKFLOWS':
      loadWorkflows().then(sendResponse);
      return true;
    
    case 'EXECUTE_WORKFLOW':
      executeWorkflow(message.workflowId, message.variables).then(sendResponse);
      return true;
    
    case 'DELETE_WORKFLOW':
      deleteWorkflow(message.workflowId).then(sendResponse);
      return true;
  }
});

async function saveWorkflow(workflow: Workflow): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get('workflows');
    const workflows = result.workflows || {};
    workflows[workflow.id] = workflow;
    await chrome.storage.local.set({ workflows });
    return true;
  } catch (error) {
    console.error('Error saving workflow:', error);
    return false;
  }
}

async function loadWorkflows(): Promise<Workflow[]> {
  try {
    const result = await chrome.storage.local.get('workflows');
    const workflows = result.workflows || {};
    return Object.values(workflows);
  } catch (error) {
    console.error('Error loading workflows:', error);
    return [];
  }
}

async function deleteWorkflow(workflowId: string): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get('workflows');
    const workflows = result.workflows || {};
    delete workflows[workflowId];
    await chrome.storage.local.set({ workflows });
    return true;
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return false;
  }
}

async function executeWorkflow(workflowId: string, variables: Record<string, any>): Promise<WorkflowExecution> {
  const execution: WorkflowExecution = {
    id: Date.now().toString(),
    workflowId,
    status: 'pending',
    results: {},
    startedAt: new Date()
  };

  try {
    const tabs = await chrome.tabs.query({ url: ['https://chat.openai.com/*', 'https://chatgpt.com/*'] });
    if (tabs.length === 0) {
      throw new Error('No ChatGPT tab found');
    }

    execution.status = 'running';
    
    await chrome.tabs.sendMessage(tabs[0].id!, {
      type: 'EXECUTE_WORKFLOW',
      workflowId,
      variables,
      executionId: execution.id
    });

    execution.status = 'completed';
    execution.completedAt = new Date();
    
  } catch (error) {
    execution.status = 'failed';
    execution.error = error instanceof Error ? error.message : 'Unknown error';
    execution.completedAt = new Date();
  }

  return execution;
}