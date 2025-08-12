---
mode: "agent"
model: gpt-5
tools: ['codebase', 'think', 'problems', 'changes', 'searchResults', 'runTests', 'editFiles', 'search', 'runTasks', 'browser-kapture']
description: "Check if the website is error-free"
---
Use `Kapture` MCP Server to thoroughly test the [website](http://localhost:5173). If the website has errors, the [${workspaceFolder}]

( #kapture )

Test Requirements:
- run unit tests
- Check for console errors or warnings during interaction.
- Verify all interactive elements (buttons, links, forms) function as expected.
- Ensure responsive design works on various screen sizes.
