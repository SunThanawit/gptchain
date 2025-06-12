# GPTChain - ChatGPT Workflow Automation

A browser extension that automates ChatGPT workflows through visual prompt sequencing, similar to the original GPTChain tool.

## Features

- **Visual Workflow Builder**: Create step-by-step prompt sequences with an intuitive interface
- **One-Click Execution**: Run entire workflows directly in ChatGPT with a single click
- **Custom Variables**: Support for dynamic variables in prompts (coming soon)
- **Workflow Storage**: Save and manage multiple workflows locally
- **ChatGPT Integration**: Seamlessly integrates with chat.openai.com and chatgpt.com
- **No API Costs**: Runs directly in your browser without external APIs

## Installation

### Development Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

### Using the Extension

1. **Create a Workflow**:
   - Click the GPTChain extension icon in your browser
   - Click "Create New Workflow"
   - Add a name and description
   - Add prompt steps by clicking "+ Add Prompt"
   - Save your workflow

2. **Execute a Workflow**:
   - Go to ChatGPT (chat.openai.com or chatgpt.com)
   - Look for the "🔗 GPTChain" button near the chat input
   - Click it to open the workflow panel
   - Select and execute your saved workflows

## Project Structure

```
src/
├── background/          # Extension background script
├── content/            # ChatGPT page integration
├── popup/              # Extension popup UI
│   ├── components/     # React components
│   ├── App.tsx        # Main popup app
│   └── index.tsx      # Entry point
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## Technology Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Webpack
- **Extension API**: Chrome Extensions Manifest V3
- **Storage**: Chrome Storage API
- **Integration**: Content scripts for ChatGPT page interaction

## Development

### Building
```bash
npm run build        # Production build
npm run dev         # Development build with watch mode
npm run clean       # Clean dist folder
```

### Key Features Implemented

1. **Workflow Management**: Create, edit, delete, and execute workflows
2. **ChatGPT Integration**: Automatically sends prompts and waits for responses
3. **Visual Editor**: Step-by-step workflow creation interface
4. **Local Storage**: All workflows saved locally using Chrome Storage API
5. **Responsive UI**: Clean, modern interface following modern design patterns

## Planned Features

- [ ] Variable system for dynamic prompts
- [ ] Advanced flow control (conditions, loops)
- [ ] Workflow templates
- [ ] Export/import workflows
- [ ] Advanced scheduling options
- [ ] Analytics and usage tracking

## License

This project is for educational purposes. The original GPTChain is a commercial product by TheVeller.

## Contributing

This is a demonstration project showcasing how to build browser extensions for ChatGPT automation.