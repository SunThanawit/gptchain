import { Workflow } from '../types/workflow';
import { substituteVariables } from '../utils/variableParser';

class ChatGPTIntegration {
  private isInitialized = false;
  private workflows: Map<string, Workflow> = new Map();

  init() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.setupMessageListener();
    this.addGPTChainButton();
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

  private addGPTChainButton() {
    // Try to find textarea immediately
    this.tryAddButton();
    
    // Set up observer with throttling
    let timeout: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.tryAddButton();
      }, 1000);
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  private tryAddButton() {
    try {
      if (document.querySelector('.gptchain-button')) return;
      
      const textArea = document.querySelector('textarea[data-id="root"]') as HTMLTextAreaElement ||
                      document.querySelector('#prompt-textarea') as HTMLTextAreaElement ||
                      document.querySelector('textarea[placeholder*="Message"]') as HTMLTextAreaElement ||
                      document.querySelector('main textarea') as HTMLTextAreaElement;
      
      if (textArea) {
        console.log('Found textarea, adding GPTChain button');
        this.createWorkflowButton(textArea);
      }
    } catch (error) {
      console.error('Error in tryAddButton:', error);
    }
  }

  private createWorkflowButton(textArea: HTMLTextAreaElement) {
    try {
      const button = document.createElement('button');
      button.className = 'gptchain-button';
      button.innerHTML = '🔗 GPTChain';
      button.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #10a37f;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        cursor: pointer;
        z-index: 9999;
      `;

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openWorkflowPanel();
      });

      document.body.appendChild(button);
      console.log('GPTChain button added to page');
    } catch (error) {
      console.error('Error creating workflow button:', error);
    }
  }

  private openWorkflowPanel() {
    const existingPanel = document.querySelector('.gptchain-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }

    const panel = document.createElement('div');
    panel.className = 'gptchain-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 400px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      overflow-y: auto;
    `;

    panel.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0; color: #333;">GPTChain Workflows</h3>
        <button id="close-panel" style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
      </div>
      <div id="workflow-list" style="padding: 16px;">
        <p style="color: #666; margin: 0;">No workflows found. Create one in the extension popup.</p>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('#close-panel')?.addEventListener('click', () => {
      panel.remove();
    });

    this.loadWorkflowList();
  }

  private async loadWorkflowList() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'LOAD_WORKFLOWS' });
      const workflows = response as Workflow[];
      
      const listContainer = document.querySelector('#workflow-list');
      if (!listContainer) return;

      if (workflows.length === 0) {
        listContainer.innerHTML = '<p style="color: #666; margin: 0;">No workflows found. Create one in the extension popup.</p>';
        return;
      }

      listContainer.innerHTML = workflows.map(workflow => `
        <div style="border: 1px solid #eee; border-radius: 4px; padding: 12px; margin-bottom: 8px;">
          <h4 style="margin: 0 0 4px 0; color: #333;">${workflow.name}</h4>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${workflow.description}</p>
          <button data-workflow-id="${workflow.id}" class="execute-workflow-btn"
                  style="background: #10a37f; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;">
            Execute
          </button>
        </div>
      `).join('');

      // Add event listeners to execute buttons
      listContainer.querySelectorAll('.execute-workflow-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const workflowId = (e.target as HTMLElement).getAttribute('data-workflow-id');
          if (workflowId) {
            this.executeWorkflow(workflowId);
          }
        });
      });
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
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