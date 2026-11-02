import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'Meet VS Code',
    blurb: 'The editor most web developers write HTML in.',
    screen: 'vscode',
    steps: [
      {
        prompt: 'Show the files in your project.',
        hint: 'Look at the column of icons on the far left. The top one looks like two pages.',
        explain: 'The Explorer (Ctrl+Shift+E) lists every file and folder in the folder you opened with File → Open Folder.',
        target: 'act-explorer',
      },
      {
        prompt: 'Open index.html.',
        hint: 'It is in the Explorer list, under MY-SITE.',
        explain: 'Clicking a file opens it in a tab. Single-click opens a "preview" tab (italic title) that gets replaced; double-click keeps it open.',
        target: 'file-index',
      },
      {
        prompt: 'Make a new file for your styles.',
        hint: 'Hover the EXPLORER header: small icons appear next to it.',
        explain: 'New File adds a file in the selected folder. Type its name, e.g. styles.css; the extension tells VS Code which language it is.',
        target: 'new-file',
      },
      {
        prompt: 'Which menu opens a terminal inside VS Code?',
        hint: 'It is named after the thing you want.',
        explain: 'Terminal → New Terminal (Ctrl+`) opens PowerShell inside VS Code, already in your project folder.',
        target: 'menu-terminal',
      },
      {
        prompt: 'Where are errors and warnings in your files listed?',
        hint: 'It is one of the tabs in the bottom panel.',
        explain: 'PROBLEMS (Ctrl+Shift+M) lists errors and warnings from VS Code and your extensions. Click one to jump to the line.',
        target: 'panel-problems',
      },
      {
        prompt: 'Open the place where you install extensions such as Live Server.',
        hint: 'Far-left icon bar again: four squares.',
        explain: 'Extensions (Ctrl+Shift+X) is where you search for and install add-ons like Live Server, Prettier or the C# Dev Kit.',
        target: 'act-extensions',
      },
      {
        prompt: 'Preview your page in a browser that reloads every time you save.',
        hint: 'Live Server adds a button to the blue status bar at the bottom.',
        explain: 'Go Live (from the Live Server extension) serves the folder at http://127.0.0.1:5500 and refreshes the browser on every save.',
        target: 'status-golive',
      },
    ],
  },
  {
    title: 'Inspect a page with DevTools',
    blurb: 'See the HTML the browser actually built. Press F12 in any browser.',
    screen: 'devtools',
    variant: 'elements',
    steps: [
      {
        prompt: 'Pick something on the page to find its HTML.',
        hint: 'It is the first icon in the DevTools toolbar: a square with an arrow.',
        explain: 'The element picker (Ctrl+Shift+C) highlights elements as you hover the page; click one to select it in the Elements panel.',
        target: 'inspect-tool',
      },
      {
        prompt: 'Select the page heading in the DOM tree.',
        hint: 'Look inside <body> for the h1.',
        explain: 'The Elements panel shows the live DOM, which can differ from your source if the browser fixed mistakes or scripts changed it.',
        target: 'dom-h1',
      },
      {
        prompt: 'Find the CSS rule that colours the heading.',
        hint: 'The Styles pane, below the DOM tree, lists the rules that apply.',
        explain: 'Styles shows every rule matching the selected element, most specific first. Crossed-out declarations are overridden.',
        target: 'style-rule',
      },
      {
        prompt: 'See the final value of every property, after the cascade.',
        hint: 'It is a tab next to Styles.',
        explain: 'Computed shows the value that actually won for each property, and you can expand one to see which rule set it.',
        target: 'computed-tab',
      },
      {
        prompt: 'Check how the page looks on a phone.',
        hint: 'Second icon in the toolbar: a phone next to a tablet.',
        explain: 'Device toolbar (Ctrl+Shift+M) resizes the viewport to phone and tablet sizes and simulates touch.',
        target: 'device-toolbar',
      },
      {
        prompt: 'Run an automatic check of accessibility, SEO and performance.',
        hint: 'It is one of the panel tabs at the top of DevTools.',
        explain: 'Lighthouse audits the page and scores Performance, Accessibility, Best Practices and SEO, with a list of fixes.',
        target: 'panel-lighthouse',
      },
    ],
  },
];

export default tours;
