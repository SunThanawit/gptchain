import { Workflow } from '../types/workflow';
import { substituteVariables } from '../utils/variableParser';

class ChatGPTIntegration {
  private isInitialized = false;
  private workflows: Map<string, Workflow> = new Map();

  init() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.setupMessageListener();
    console.log('GPTChain content script initialized');
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'EXECUTE_WORKFLOW':
          this.executeWorkflow(message.workflowId, message.variables);
          sendResponse({ success: true });
          break;
      }
    });
  }


  async executeWorkflow(workflowId: string, variables?: Record<string, any>) {
    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'LOAD_WORKFLOWS' 
      });
      const workflows = response as Workflow[];
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        return;
      }

      await this.processWorkflowNodes(workflow, variables || {});
      
      const panel = document.querySelector('.gptchain-panel');
      if (panel) panel.remove();
      
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  }

  private async processWorkflowNodes(workflow: Workflow, variables: Record<string, any> = {}) {
    const textArea = document.querySelector('textarea[data-id="root"]') as HTMLTextAreaElement ||
                    document.querySelector('#prompt-textarea') as HTMLTextAreaElement ||
                    document.querySelector('textarea[placeholder*="Message"]') as HTMLTextAreaElement ||
                    document.querySelector('main textarea') as HTMLTextAreaElement;
    
    if (!textArea) {
      console.error('No textarea found for workflow execution');
      return;
    }

    console.log('Processing workflow nodes:', workflow.nodes.length);

    for (const node of workflow.nodes) {
      if (node.type === 'prompt' && node.data.prompt) {
        let prompt = node.data.prompt;
        
        // Substitute variables using the centralized parser
        prompt = substituteVariables(prompt, variables);

        console.log('Executing prompt:', prompt);
        
        textArea.focus();
        
        try {
          // Clear the textarea first
          textArea.value = '';
          
          // Use execCommand to insert text (works with React)
          document.execCommand('insertText', false, prompt);
          
          console.log('Text inserted using execCommand, current value:', textArea.value);
        } catch (error) {
          console.log('execCommand failed, trying clipboard method');
          
          // Fallback: use clipboard API
          navigator.clipboard.writeText(prompt).then(() => {
            textArea.focus();
            document.execCommand('paste');
          });
        }
        
        // Wait a bit for React to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Send using Enter key
        console.log('Sending message with Enter key');
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        });
        textArea.dispatchEvent(enterEvent);
        
        await this.waitForResponse();
      }
    }
  }

  private waitForResponse(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Waiting for ChatGPT response...');
      
      const checkForResponse = () => {
        // Check if ChatGPT is still generating (look for stop button or loading indicators)
        const stopButton = document.querySelector('button[aria-label*="Stop"]');
        const loadingIndicator = document.querySelector('[data-testid*="loading"]');
        const isGenerating = stopButton || loadingIndicator;
        
        if (!isGenerating) {
          // Also check if textarea is enabled (not disabled during generation)
          const textArea = document.querySelector('textarea[data-id="root"]') as HTMLTextAreaElement ||
                          document.querySelector('#prompt-textarea') as HTMLTextAreaElement ||
                          document.querySelector('textarea[placeholder*="Message"]') as HTMLTextAreaElement ||
                          document.querySelector('main textarea') as HTMLTextAreaElement;
          
          if (textArea && !textArea.disabled) {
            console.log('ChatGPT response completed, proceeding to next step');
            resolve();
            return;
          }
        }
        
        console.log('Still waiting for response...');
        setTimeout(checkForResponse, 2000);
      };
      
      // Start checking after 3 seconds
      setTimeout(checkForResponse, 3000);
    });
  }
}

const gptChain = new ChatGPTIntegration();
(window as any).gptChain = gptChain;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => gptChain.init());
} else {
  gptChain.init();
}