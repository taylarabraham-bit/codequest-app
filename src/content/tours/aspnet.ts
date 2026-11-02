import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'A Web API project',
    blurb: 'Where things live in an ASP.NET Core project in Visual Studio.',
    screen: 'visualstudio',
    variant: 'api',
    steps: [
      {
        prompt: 'Find the file that sets the URLs and ports the API runs on.',
        hint: 'It is in the Properties folder.',
        explain: 'Properties/launchSettings.json holds the launch profiles (http, https), their URLs and environment variables. It is only used on your machine.',
        target: 'launchsettings',
      },
      {
        prompt: 'Find the file for settings such as connection strings and log levels.',
        hint: 'A .json file at the project root.',
        explain: 'appsettings.json (plus appsettings.Development.json) is read by configuration at startup: builder.Configuration["Key"].',
        target: 'appsettings',
      },
      {
        prompt: 'Find the file where you can send test requests straight from the editor.',
        hint: 'It is named after the project and ends in .http.',
        explain: 'An .http file holds requests like GET {{TodoApi_HostAddress}}/todos/ with a “Send request” link above each one.',
        target: 'http-file',
      },
      {
        prompt: 'Choose which launch profile to run.',
        hint: 'The small arrow right next to the green ▶ https button.',
        explain: 'The dropdown lists the profiles from launchSettings.json. https listens on both an https and an http URL.',
        target: 'launch-profile',
      },
      {
        prompt: 'Which menu has “Manage NuGet Packages…”?',
        hint: 'It is about the project, not the code file.',
        explain: 'Project → Manage NuGet Packages (or right-click Dependencies) opens the package manager, e.g. to add Microsoft.EntityFrameworkCore.Sqlite.',
        target: 'menu-project',
      },
      {
        prompt: 'Start the API.',
        hint: 'The green play button.',
        explain: 'F5 builds and starts Kestrel. The console window shows the URLs it is listening on, e.g. Now listening on: https://localhost:7071.',
        target: 'start-debug',
      },
    ],
  },
  {
    title: 'Watch your API in the browser',
    blurb: 'Use the Network panel to see every request and response.',
    screen: 'devtools',
    variant: 'network',
    steps: [
      {
        prompt: 'Show only the requests your code made with fetch().',
        hint: 'One of the filter buttons above the request list.',
        explain: 'Fetch/XHR hides documents, images and scripts so only API calls are left.',
        target: 'net-filter-fetch-xhr',
      },
      {
        prompt: 'Select the call to the /todos endpoint.',
        hint: 'It is a row in the request list.',
        explain: 'Clicking a request opens its details: headers, payload, response and timing.',
        target: 'net-row-todos',
      },
      {
        prompt: 'Read the JSON the API sent back.',
        hint: 'A tab in the details pane.',
        explain: 'Response shows the raw body; Preview shows JSON as a collapsible tree.',
        target: 'net-tab-response',
      },
      {
        prompt: 'Which request failed?',
        hint: 'Look in the Status column for a number that is not 2xx.',
        explain: '404 Not Found means no file or endpoint matched the URL. Errors show in red.',
        target: 'net-status-missing',
      },
      {
        prompt: 'Make sure the browser fetches fresh files instead of cached ones.',
        hint: 'A checkbox at the top of the panel.',
        explain: 'Disable cache only works while DevTools is open. Handy when a changed file does not seem to update.',
        target: 'disable-cache',
      },
    ],
  },
];

export default tours;
