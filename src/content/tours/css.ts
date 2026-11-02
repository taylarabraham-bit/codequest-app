import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'Debug CSS in DevTools',
    blurb: 'Try CSS changes live in the browser before you write them down.',
    screen: 'devtools',
    variant: 'elements',
    steps: [
      {
        prompt: 'Select the button in the DOM tree.',
        hint: 'It is inside <body>, after the paragraph.',
        explain: 'Selecting an element in Elements loads its rules into the Styles pane below.',
        target: 'dom-button',
      },
      {
        prompt: 'Force the button into its :hover state so you can style it.',
        hint: 'Look at the small text buttons in the Styles filter bar.',
        explain: ':hov lets you tick :hover, :focus, :active and more, so a state stays on while you edit its rules.',
        target: 'hov-toggle',
      },
      {
        prompt: 'Add or remove classes on the element without touching your HTML.',
        hint: 'Next to :hov.',
        explain: '.cls shows the element classes as checkboxes and lets you add new ones to test.',
        target: 'cls-toggle',
      },
      {
        prompt: 'Start a brand-new rule for the selected element.',
        hint: 'The plus sign in the Styles filter bar.',
        explain: 'New Style Rule creates a rule with a selector for the element. Changes here are temporary, so copy them into your CSS file.',
        target: 'new-style-rule',
      },
      {
        prompt: 'See the element’s margin, border and padding as a diagram.',
        hint: 'The nested boxes at the bottom of the Styles pane.',
        explain: 'The box model diagram shows content size, padding, border and margin. Double-click a number to edit it.',
        target: 'box-model',
      },
      {
        prompt: 'Turn on the grid and flexbox overlays.',
        hint: 'It is a tab next to Styles and Computed.',
        explain: 'Layout lists every grid and flex container on the page with checkboxes to draw their lines, gaps and track sizes.',
        target: 'layout-tab',
      },
    ],
  },
  {
    title: 'CSS in VS Code',
    blurb: 'Find your way around a stylesheet project.',
    screen: 'vscode',
    steps: [
      {
        prompt: 'Switch to your stylesheet.',
        hint: 'Both open files are tabs above the editor.',
        explain: 'Ctrl+Tab also flips between open tabs.',
        target: 'tab-styles',
      },
      {
        prompt: 'Find every place a class name is used across the project.',
        hint: 'A magnifying glass on the far-left bar.',
        explain: 'Search (Ctrl+Shift+F) searches all files, so you can check a class is used before you delete its rule.',
        target: 'act-search',
      },
      {
        prompt: 'Open the box that finds files and runs commands like “Format Document”.',
        hint: 'It is in the middle of the title bar.',
        explain: 'The Command Center opens Quick Open (Ctrl+P). Type > (or press Ctrl+Shift+P) to run any command, e.g. Format Document.',
        target: 'command-center',
      },
      {
        prompt: 'Switch the file between 2-space and 4-space indentation.',
        hint: 'Look in the status bar at the bottom.',
        explain: 'Clicking Spaces: 2 lets you change indentation and convert the file.',
        target: 'status-indent',
      },
      {
        prompt: 'Jump to the list of CSS errors, like a missing semicolon.',
        hint: 'The error and warning counts are in the status bar.',
        explain: 'The ⊗ 0 ⚠ 0 counter opens the Problems panel. VS Code checks CSS syntax as you type.',
        target: 'status-problems',
      },
    ],
  },
];

export default tours;
