import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'Meet Visual Studio',
    blurb: 'Run, build and find errors in a C# console app.',
    screen: 'visualstudio',
    variant: 'console',
    steps: [
      {
        prompt: 'Select your project in Solution Explorer.',
        hint: 'Solution Explorer is the panel on the right. The project sits under the solution.',
        explain: 'A solution (.sln/.slnx) holds one or more projects (.csproj). Right-click the project for Add, Manage NuGet Packages and Properties.',
        target: 'project',
      },
      {
        prompt: 'Open the file your program starts in.',
        hint: 'With top-level statements, there is only one .cs file.',
        explain: 'Program.cs holds the top-level statements: the code that runs first.',
        target: 'program-cs',
      },
      {
        prompt: 'Run the app with the debugger attached.',
        hint: 'The solid green play button, labelled with your project name.',
        explain: 'Start Debugging (F5) builds and runs the app, stopping at any breakpoints.',
        target: 'start-debug',
      },
      {
        prompt: 'Run it again, but without the debugger.',
        hint: 'The hollow green play button next to it.',
        explain: 'Start Without Debugging (Ctrl+F5) starts faster and ignores breakpoints. For a console app the window waits for a key before closing.',
        target: 'start-nodebug',
      },
      {
        prompt: 'Switch from a Debug build to an optimised Release build.',
        hint: 'The first dropdown in the toolbar.',
        explain: 'Solution Configurations switches between Debug (easy to step through) and Release (optimised, what you ship).',
        target: 'config-dropdown',
      },
      {
        prompt: 'Which menu compiles the code without running it?',
        hint: 'It is named after what it does.',
        explain: 'Build → Build Solution (Ctrl+Shift+B) compiles every project and reports errors without starting anything.',
        target: 'menu-build',
      },
      {
        prompt: 'Open the compiler error at the bottom to jump to its line.',
        hint: 'The Error List tab is already open.',
        explain: 'Double-clicking an Error List row jumps to the line. CS1002 means a ; is missing.',
        target: 'error-row',
      },
    ],
  },
  {
    title: 'Debugging basics',
    blurb: 'Your app is paused at a breakpoint. Step through it line by line.',
    screen: 'visualstudio',
    variant: 'debug',
    steps: [
      {
        prompt: 'The app stopped at a red breakpoint. Click that line’s breakpoint to see where you set it.',
        hint: 'The red dot with the yellow arrow, in the grey margin left of the line numbers.',
        explain: 'Click the margin (or press F9) to set or clear a breakpoint. The yellow arrow marks the next line to run.',
        target: 'breakpoint-margin',
      },
      {
        prompt: 'See the values of the variables in scope right now.',
        hint: 'One of the tabs in the bottom panel while debugging.',
        explain: 'Locals lists every variable in the current method. total is still 0 because line 3 has not run yet.',
        target: 'tab-locals',
      },
      {
        prompt: 'Go inside the Add method on this line.',
        hint: 'The step buttons are in the toolbar. You want “into”.',
        explain: 'Step Into (F11) follows the call into Add so you can watch its code run.',
        target: 'step-into',
      },
      {
        prompt: 'Run the current line without going inside any calls it makes.',
        hint: 'The curved arrow.',
        explain: 'Step Over (F10) runs the whole line, including any method calls, and stops on the next line.',
        target: 'step-over',
      },
      {
        prompt: 'Let the app run on until the next breakpoint.',
        hint: 'The green button that replaced Start.',
        explain: 'Continue (F5) resumes normal running until another breakpoint is hit or the app ends.',
        target: 'continue',
      },
      {
        prompt: 'Stop the app and leave debugging.',
        hint: 'The red square.',
        explain: 'Stop Debugging (Shift+F5) ends the app and returns Visual Studio to editing.',
        target: 'stop',
      },
    ],
  },
];

export default tours;
