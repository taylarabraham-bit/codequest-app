import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'A Blazor Web App',
    blurb: 'Find your way around the Blazor Web App template.',
    screen: 'visualstudio',
    variant: 'blazor',
    steps: [
      {
        prompt: 'Open the folder of routable pages (components with @page).',
        hint: 'Inside the Components folder.',
        explain: 'Components/Pages holds pages like Home.razor and Counter.razor. Their @page directive sets the URL.',
        target: 'folder-pages',
      },
      {
        prompt: 'Open the Counter page.',
        hint: 'It is in the Pages folder.',
        explain: 'Counter.razor mixes markup with an @code block. @rendermode InteractiveServer makes its button work.',
        target: 'file-counter',
      },
      {
        prompt: 'Find the folder holding MainLayout and NavMenu.',
        hint: 'Also inside Components.',
        explain: 'Components/Layout holds MainLayout.razor, the frame around every page, and NavMenu.razor.',
        target: 'folder-layout',
      },
      {
        prompt: 'Where do static files like CSS and images go?',
        hint: 'The folder with a globe-ish name.',
        explain: 'wwwroot is served as-is at the site root: wwwroot/app.css is /app.css.',
        target: 'wwwroot',
      },
      {
        prompt: 'Find the file that lists @using lines shared by every component.',
        hint: 'It starts with an underscore.',
        explain: '_Imports.razor applies its @using directives to every .razor file in its folder and below.',
        target: 'imports-razor',
      },
      {
        prompt: 'Apply a code change to the running app without restarting it.',
        hint: 'The flame in the toolbar.',
        explain: 'Hot Reload (Alt+F10) patches the running app. Some edits, like changing a method signature, still need a restart.',
        target: 'hot-reload',
      },
    ],
  },
  {
    title: 'Blazor in the browser console',
    blurb: 'When a Blazor page misbehaves, the console usually says why.',
    screen: 'devtools',
    variant: 'console',
    steps: [
      {
        prompt: 'Open the panel that shows errors and log messages.',
        hint: 'Second panel tab at the top of DevTools.',
        explain: 'The Console shows errors, warnings and Console.WriteLine output from WebAssembly components.',
        target: 'panel-console',
      },
      {
        prompt: 'Click the error to see what went wrong.',
        hint: 'It is red.',
        explain: 'Unhandled errors show in red with a stack trace. A 404 here means the URL your code called does not exist.',
        target: 'console-error',
      },
      {
        prompt: 'Show only errors, or also verbose messages.',
        hint: 'A dropdown on the right of the console toolbar.',
        explain: 'The log levels dropdown filters by Verbose, Info, Warnings and Errors.',
        target: 'console-levels',
      },
      {
        prompt: 'The console also runs JavaScript. Type document.title and press Enter.',
        hint: 'Click in the console, after the > prompt.',
        explain: 'The console evaluates JavaScript against the page. It is handy for checking what a JS interop call would return.',
        command: ['document.title'],
        output: "'Counter'",
      },
      {
        prompt: 'Clear the console.',
        hint: 'The circle with a line through it, top left.',
        explain: 'Clear console (Ctrl+L) wipes old messages so new ones are easy to spot.',
        target: 'console-clear',
      },
    ],
  },
];

export default tours;
