import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 1 (Components & Razor).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first component
    [
      {
        kind: 'write',
        prompt: 'Make a Banner component and show it under the shop heading.',
        starter: '@* Banner.razor *@\n\n\n@* Home.razor *@\n<h1>Garden Shop</h1>\n',
        solution: '@* Banner.razor *@\n<div class="banner">Free delivery this week</div>\n\n@* Home.razor *@\n<h1>Garden Shop</h1>\n<Banner />',
        checks: [
          { label: 'Banner.razor holds an element with text', re: 'Banner\\.razor\\s*\\*@\\s*<(\\w+)[^>]*>[^<]*\\S[^<]*</\\1>' },
          { label: 'Home shows it with <Banner />', re: 'Home\\.razor[\\s\\S]*<Banner\\s*/>' },
        ],
        hint: 'Write plain HTML under Banner.razor. In Home, use the file name as a tag.',
        explain: 'The file name is the component name, so <Banner /> drops the banner’s markup right where the tag is.',
        output: 'Garden Shop\nFree delivery this week',
      },
      {
        kind: 'write',
        prompt: 'Move the repeated tip into a PackTip component and use it twice.',
        starter:
          '@* Home.razor *@\n<h1>Trail Guide</h1>\n<p class="tip">Pack water and a map.</p>\n<h2>Day 2</h2>\n<p class="tip">Pack water and a map.</p>\n\n@* PackTip.razor *@\n',
        solution:
          '@* Home.razor *@\n<h1>Trail Guide</h1>\n<PackTip />\n<h2>Day 2</h2>\n<PackTip />\n\n@* PackTip.razor *@\n<p class="tip">Pack water and a map.</p>',
        checks: [
          { label: 'PackTip.razor holds the tip paragraph', re: 'PackTip\\.razor\\s*\\*@\\s*<p[^>]*>\\s*Pack water and a map\\.\\s*</p>' },
          { label: 'Home uses <PackTip /> twice', re: 'Home\\.razor[\\s\\S]*<PackTip\\s*/>[\\s\\S]*<PackTip\\s*/>[\\s\\S]*PackTip\\.razor' },
          { label: 'The tip text is written only once', re: '^(?![\\s\\S]*Pack water[\\s\\S]*Pack water)[\\s\\S]*Pack water' },
        ],
        hint: 'Cut one <p> into PackTip.razor, then replace both copies in Home with the tag.',
        explain: 'A component is written once and reused anywhere, so changing the tip now means editing one file.',
        output: 'Trail Guide\nPack water and a map.\nDay 2\nPack water and a map.',
      },
    ],
    // L2 Razor expressions
    [
      {
        kind: 'write',
        prompt: 'Show a product line: its name, quantity and total price from @code fields.',
        starter: '',
        solution:
          '<p>@item x @qty = @(price * qty) euros</p>\n@code {\n    string item = "Notebook";\n    int price = 3, qty = 4;\n}',
        checks: [
          { label: 'An @code block with a string field', re: '@code\\s*\\{[\\s\\S]*string\\s+\\w+\\s*=\\s*"[^"]*"' },
          { label: 'Number fields for price and quantity', re: 'int\\s+\\w+\\s*=\\s*\\d+[\\s\\S]*\\w+\\s*=\\s*\\d+' },
          { label: 'Render a field with @name', re: '<p>[^<]*@(?!\\()\\w+' },
          { label: 'Multiply inside @( )', re: '@\\(\\s*\\w+\\s*\\*\\s*\\w+\\s*\\)' },
        ],
        hint: 'Fields go in @code { }. Use @field for a value and @(a * b) for maths.',
        explain: '@name renders one value; maths needs @( ) so Razor knows where the expression ends.',
        output: 'Notebook x 4 = 12 euros',
      },
      {
        kind: 'write',
        prompt: 'Fix the score so it shows 80, and hide the note from the page.',
        starter:
          '<h2>@player</h2>\n<p class="@level">Score: @points * 2</p>\n<!-- bonus round doubles the points -->\n@code {\n    string player = "Mia", level = "gold";\n    int points = 40;\n}',
        solution:
          '<h2>@player</h2>\n<p class="@level">Score: @(points * 2)</p>\n@* bonus round doubles the points *@\n@code {\n    string player = "Mia", level = "gold";\n    int points = 40;\n}',
        checks: [
          { label: 'Wrap the maths in @( )', re: '@\\(\\s*(points\\s*\\*\\s*2|2\\s*\\*\\s*points)\\s*\\)' },
          { label: 'No more @points * 2', not: '@points * 2' },
          { label: 'Turn the note into a Razor comment', re: '@\\*[\\s\\S]*?\\*@' },
          { label: 'No HTML comment left', not: '<!--' },
        ],
        hint: '@points stops at the space. A Razor comment is @* … *@.',
        explain: 'Without @( ), Razor renders 40 and then the text “ * 2”. An HTML comment is sent to the browser; a Razor comment never leaves the server.',
        output: 'Mia\nScore: 80',
      },
    ],
    // L3 @if and @foreach
    [
      {
        kind: 'write',
        prompt: 'Show Charged above 80, Low battery below 20, otherwise OK.',
        starter: '@code {\n    int battery = 15;\n}',
        solution:
          '@if (battery > 80)\n{\n    <p>Charged</p>\n}\nelse if (battery < 20)\n{\n    <p>Low battery</p>\n}\nelse\n{\n    <p>OK</p>\n}\n@code {\n    int battery = 15;\n}',
        checks: [
          { label: 'Start with @if on battery', re: '@if\\s*\\([^)]*battery[^)]*\\)' },
          { label: 'Then else if for the low case', re: 'else\\s+if\\s*\\([^)]*battery[^)]*\\)' },
          { label: 'Finish with else', re: 'else\\s*\\{\\s*<' },
          { label: 'No @ before else', not: '@else' },
        ],
        hint: 'Only the first @if needs the @. Each branch holds its own <p>.',
        explain: 'Razor picks the first branch that is true; else if and else carry on the same @if, so they take no @.',
        output: 'Low battery',
      },
      {
        kind: 'write',
        prompt: 'For each score, show Pass at 50 or more, otherwise Retry.',
        starter: '@code {\n    int[] scores = [92, 48, 75];\n}',
        solution:
          '@foreach (var s in scores)\n{\n    if (s >= 50)\n    {\n        <p>@s: Pass</p>\n    }\n    else\n    {\n        <p>@s: Retry</p>\n    }\n}\n@code {\n    int[] scores = [92, 48, 75];\n}',
        checks: [
          { label: 'Loop with @foreach over scores', re: '@foreach\\s*\\(\\s*(var|int)\\s+\\w+\\s+in\\s+scores\\s*\\)' },
          { label: 'An if inside the loop', re: '@foreach[\\s\\S]*\\{[\\s\\S]*\\bif\\s*\\([^)]*>=?\\s*\\d+' },
          { label: 'Show the score and Pass', re: '@\\w+[^<\\n]*Pass' },
          { label: 'Show Retry in the else', re: 'else\\s*\\{[\\s\\S]*Retry' },
        ],
        hint: 'Inside the @foreach braces you are already in code, so if needs no @.',
        explain: '@foreach repeats its body once per score, and the if inside picks which <p> to render each time.',
        output: '92: Pass\n48: Retry\n75: Pass',
      },
    ],
    // L4 Code-behind & imports
    [
      {
        kind: 'write',
        prompt: 'Move the @code block into Components/Badge.razor.cs. The project is MyShop.',
        starter:
          '@* Components/Badge.razor *@\n<span class="badge">@label</span>\n@code {\n    string label = "New";\n}\n\n// Components/Badge.razor.cs\n',
        solution:
          '@* Components/Badge.razor *@\n<span class="badge">@label</span>\n\n// Components/Badge.razor.cs\nnamespace MyShop.Components;\n\npublic partial class Badge\n{\n    string label = "New";\n}',
        checks: [
          { label: 'No @code block left in Badge.razor', not: '@code' },
          { label: 'namespace MyShop.Components', re: 'namespace\\s+MyShop\\.Components\\s*[;{]' },
          { label: 'public partial class Badge', re: 'public\\s+partial\\s+class\\s+Badge\\b' },
          { label: 'The label field lives in the class', re: 'class\\s+Badge[\\s\\S]*string\\s+label\\s*=' },
        ],
        hint: 'The class name matches the file, the namespace is project + folders, and it must be partial.',
        explain: 'The .razor file and the .razor.cs file compile into one class, so the markup still sees the label field.',
        output: 'New',
      },
      {
        kind: 'write',
        prompt: 'Move the @using into _Imports.razor and make the code-behind compile.',
        starter:
          '@* Components/Pages/Orders.razor *@\n@using MyShop.Models\n<p>Order @order.Id</p>\n\n// Components/Pages/Orders.razor.cs\nnamespace MyShop.Components.Pages;\n\npublic partial class Orders\n{\n    Order order = new() { Id = 7 };\n}\n\n@* Components/_Imports.razor *@\n',
        solution:
          '@* Components/Pages/Orders.razor *@\n<p>Order @order.Id</p>\n\n// Components/Pages/Orders.razor.cs\nusing MyShop.Models;\n\nnamespace MyShop.Components.Pages;\n\npublic partial class Orders\n{\n    Order order = new() { Id = 7 };\n}\n\n@* Components/_Imports.razor *@\n@using MyShop.Models',
        checks: [
          { label: '_Imports.razor has @using MyShop.Models', re: '_Imports\\.razor\\s*\\*@\\s*(@using[^\\n]*\\n\\s*)*@using\\s+MyShop\\.Models' },
          { label: 'Orders.razor drops its own @using', re: 'Orders\\.razor\\s*\\*@\\s*<p>' },
          { label: 'The .cs file has using MyShop.Models;', re: '^\\s*using\\s+MyShop\\.Models\\s*;', flags: 'm' },
        ],
        hint: '_Imports.razor covers .razor files only. A .cs file needs a normal C# using line.',
        explain: 'One @using in _Imports.razor reaches every component in that folder and below, but C# files never read it.',
        output: 'Order 7',
      },
    ],
    // L5 Scoped CSS
    [
      {
        kind: 'write',
        prompt: 'In Ticket.razor.css, make the title bold and the price red.',
        starter:
          '@* Ticket.razor *@\n<div class="ticket">\n    <h3>Concert</h3>\n    <span class="price">45 euros</span>\n</div>\n\n/* Ticket.razor.css */\n',
        solution:
          '@* Ticket.razor *@\n<div class="ticket">\n    <h3>Concert</h3>\n    <span class="price">45 euros</span>\n</div>\n\n/* Ticket.razor.css */\nh3 { font-weight: bold; }\n.price { color: red; }',
        checks: [
          { label: 'A rule for h3 with font-weight', re: 'Ticket\\.razor\\.css[\\s\\S]*(^|[\\s}.])h3\\s*\\{[^}]*font-weight\\s*:\\s*(bold|[6-9]00)', flags: 'm' },
          { label: 'A .price rule with a red color', re: '\\.price\\s*\\{[^}]*color\\s*:\\s*(red|#f00\\b|#ff0000|rgb\\(\\s*255\\s*,\\s*0\\s*,\\s*0\\s*\\))', flags: 'i' },
        ],
        hint: 'Write normal CSS under the comment: one rule per selector.',
        explain: 'Blazor rewrites these selectors with Ticket’s own attribute, so they can’t leak onto other h3s in the app.',
      },
      {
        kind: 'write',
        prompt: 'Round the photos inside the Photo child, and load the scoped bundle.',
        starter:
          '@* Gallery.razor *@\n<div class="gallery">\n    <Photo Src="cat.jpg" />\n</div>\n\n/* Gallery.razor.css */\n.gallery img { border-radius: 8px; }\n\n@* App.razor, in <head>. The project is PhotoApp. *@\n',
        solution:
          '@* Gallery.razor *@\n<div class="gallery">\n    <Photo Src="cat.jpg" />\n</div>\n\n/* Gallery.razor.css */\n.gallery ::deep img { border-radius: 8px; }\n\n@* App.razor, in <head>. The project is PhotoApp. *@\n<link rel="stylesheet" href="@Assets["PhotoApp.styles.css"]" />',
        checks: [
          { label: 'Reach into children with ::deep', re: '\\.gallery\\s+::deep\\s+img\\s*\\{[^}]*border-radius' },
          { label: 'No plain .gallery img rule left', not: '.gallery img' },
          { label: 'A <link> to PhotoApp.styles.css', re: '<link[^>]*href="(@Assets\\[\\s*"PhotoApp\\.styles\\.css"\\s*\\]|PhotoApp\\.styles\\.css)"' },
          { label: 'The link is a stylesheet', re: '<link[^>]*rel="stylesheet"' },
        ],
        hint: 'The img is rendered by Photo, not Gallery. Put ::deep between the parent selector and img.',
        explain: 'Scoped rules only match Gallery’s own elements; ::deep lets them reach child components. The bundle file carries every component’s scoped CSS.',
      },
    ],
  ],
};

export default unit;
