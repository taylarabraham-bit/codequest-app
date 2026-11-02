import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 4 (Tables).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Rows & cells
    [
      {
        kind: 'write',
        prompt: 'Make a table of three snacks and their prices.',
        starter: '',
        solution:
          '<table>\n  <tr><td>Popcorn</td><td>$3</td></tr>\n  <tr><td>Nachos</td><td>$5</td></tr>\n  <tr><td>Soda</td><td>$2</td></tr>\n</table>',
        checks: [
          { label: 'A <table> wraps the rows', re: '^\\s*<table>[\\s\\S]*</table>\\s*$', flags: 'i' },
          {
            label: 'Three <tr> rows',
            re: '(<tr>[\\s\\S]*?</tr>[\\s\\S]*){3}',
            flags: 'i',
          },
          {
            label: 'Each row has two <td> cells',
            re: '^(?![\\s\\S]*<tr>(?!\\s*<td>[^<]*</td>\\s*<td>[^<]*</td>\\s*</tr>))[\\s\\S]*<td>',
            flags: 'i',
          },
        ],
        hint: 'table holds tr rows; each tr holds td cells: name first, then price.',
        explain: 'Rows run across and cells sit side by side, so every row needs the same number of td to keep the columns straight.',
        preview: { css: 'td{border:1px solid #ccc;padding:4px 8px}' },
      },
      {
        kind: 'write',
        prompt: 'Fix the workout table so every row has three cells, then add Thursday.',
        starter:
          '<table>\n  <tr><td>Mon</td><td>Swim</td><td>30 min</td></tr>\n  <tr><td>Tue</td><td>Run</td></tr>\n  <tr><td>Wed</td><td>Bike</td><td>45 min</td>\n</table>',
        solution:
          '<table>\n  <tr><td>Mon</td><td>Swim</td><td>30 min</td></tr>\n  <tr><td>Tue</td><td>Run</td><td>20 min</td></tr>\n  <tr><td>Wed</td><td>Bike</td><td>45 min</td></tr>\n  <tr><td>Thu</td><td>Yoga</td><td>40 min</td></tr>\n</table>',
        checks: [
          {
            label: 'Tuesday gets a third cell',
            re: '<tr>\\s*<td>\\s*Tue\\s*</td>\\s*<td>[^<]*</td>\\s*<td>[^<]*\\S[^<]*</td>\\s*</tr>',
            flags: 'i',
          },
          { label: 'Close Wednesday’s row with </tr>', re: '<td>\\s*45 min\\s*</td>\\s*</tr>', flags: 'i' },
          {
            label: 'A Thursday row with three cells',
            re: '<tr>\\s*<td>\\s*Thu[a-z]*\\s*</td>\\s*<td>[^<]*\\S[^<]*</td>\\s*<td>[^<]*\\S[^<]*</td>\\s*</tr>',
            flags: 'i',
          },
          { label: 'Every row inside the table', re: '</tr>\\s*</table>\\s*$', flags: 'i' },
        ],
        hint: 'Count the td in each row: Mon has three, so every row needs three.',
        explain: 'A short row leaves a hole in the grid, and a missing </tr> lets the browser guess where the row ends.',
        preview: { css: 'td{border:1px solid #ccc;padding:4px 8px}' },
      },
    ],
    // L2 Header cells
    [
      {
        kind: 'write',
        prompt: 'Make a plant watering table with column headers and two plants.',
        starter: '',
        solution:
          '<table>\n  <tr><th scope="col">Plant</th><th scope="col">Water every</th></tr>\n  <tr><td>Fern</td><td>3 days</td></tr>\n  <tr><td>Cactus</td><td>3 weeks</td></tr>\n</table>',
        checks: [
          {
            label: 'A first row of two <th scope="col"> headers',
            re: '<table>\\s*<tr>(\\s*<th\\s+scope=["\']col["\']>[^<]*\\S[^<]*</th>){2}\\s*</tr>',
            flags: 'i',
          },
          { label: 'At least two data rows of <td> cells', re: '(<tr>\\s*<td>[\\s\\S]*?</tr>[\\s\\S]*){2}', flags: 'i' },
          { label: 'Close the table', re: '</table>\\s*$', flags: 'i' },
        ],
        hint: 'Header cells use th instead of td. scope="col" says they head columns.',
        explain: 'th labels the cells below it; scope tells screen readers which cells it labels.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}' },
      },
      {
        kind: 'write',
        prompt: 'Swap the bold tricks for real header cells, for columns and rows.',
        starter:
          '<table>\n  <tr><td><b>Pet</b></td><td><b>Age</b></td></tr>\n  <tr><td><b>Rex</b></td><td>4</td></tr>\n  <tr><td><b>Milo</b></td><td>2</td></tr>\n</table>',
        solution:
          '<table>\n  <tr><th scope="col">Pet</th><th scope="col">Age</th></tr>\n  <tr><th scope="row">Rex</th><td>4</td></tr>\n  <tr><th scope="row">Milo</th><td>2</td></tr>\n</table>',
        checks: [
          { label: 'Pet and Age are <th scope="col">', re: '<th\\s+scope=["\']col["\']>\\s*Pet\\s*</th>\\s*<th\\s+scope=["\']col["\']>\\s*Age\\s*</th>', flags: 'i' },
          { label: 'Rex is a <th scope="row">', re: '<th\\s+scope=["\']row["\']>\\s*Rex\\s*</th>\\s*<td>\\s*4\\s*</td>', flags: 'i' },
          { label: 'Milo is a <th scope="row">', re: '<th\\s+scope=["\']row["\']>\\s*Milo\\s*</th>\\s*<td>\\s*2\\s*</td>', flags: 'i' },
          { label: 'No <b> tags left', not: '<b>' },
        ],
        hint: 'Header row: scope="col". The first cell of each data row: scope="row".',
        explain: 'Bold only looks like a header. th really is one, so a screen reader can say “Rex, Age 4”.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}' },
      },
    ],
    // L3 Table captions
    [
      {
        kind: 'write',
        prompt: 'Make a captioned ferry timetable with a header row and one sailing.',
        starter: '',
        solution:
          '<table>\n  <caption>Ferry times</caption>\n  <tr><th scope="col">Port</th><th scope="col">Departs</th></tr>\n  <tr><td>Oban</td><td>07:30</td></tr>\n</table>',
        checks: [
          { label: 'A <caption> first inside the table', re: '<table>\\s*<caption>\\s*\\S[\\s\\S]*?</caption>', flags: 'i' },
          { label: 'A header row of <th scope="col">', re: '</caption>\\s*<tr>\\s*<th\\s+scope=["\']col["\']>', flags: 'i' },
          { label: 'A data row of <td> cells', re: '<tr>\\s*<td>[\\s\\S]*?</td>\\s*</tr>', flags: 'i' },
        ],
        hint: 'caption goes straight after <table>, before any rows.',
        explain: 'The caption is the table’s visible title, and screen readers announce it when they reach the table.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}caption{font-weight:bold}' },
      },
      {
        kind: 'write',
        prompt: 'Move the caption to the right place and add a second film.',
        starter:
          '<table>\n  <tr><th scope="col">Film</th><th scope="col">Time</th></tr>\n  <tr><td>Up</td><td>18:00</td></tr>\n  <caption>Cinema tonight</caption>\n</table>',
        solution:
          '<table>\n  <caption>Cinema tonight</caption>\n  <tr><th scope="col">Film</th><th scope="col">Time</th></tr>\n  <tr><td>Up</td><td>18:00</td></tr>\n  <tr><td>Coco</td><td>20:30</td></tr>\n</table>',
        checks: [
          { label: 'The caption comes first', re: '<table>\\s*<caption>\\s*Cinema tonight\\s*</caption>', flags: 'i' },
          { label: 'Only one caption', re: '^(?![\\s\\S]*<caption[\\s\\S]*<caption)[\\s\\S]*<caption', flags: 'i' },
          {
            label: 'A second film row with two cells',
            re: '(<tr>\\s*<td>[^<]*\\S[^<]*</td>\\s*<td>[^<]*\\S[^<]*</td>\\s*</tr>[\\s\\S]*){2}',
            flags: 'i',
          },
        ],
        hint: 'Cut the caption line and paste it right after <table>.',
        explain: 'caption must be the table’s first child; anywhere else it is invalid HTML.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}caption{font-weight:bold}' },
      },
    ],
    // L4 Head, body & foot
    [
      {
        kind: 'write',
        prompt: 'Make a trip budget table with a header, two costs and a total.',
        starter: '',
        solution:
          '<table>\n  <thead><tr><th scope="col">Item</th><th scope="col">Cost</th></tr></thead>\n  <tbody>\n    <tr><td>Train</td><td>60</td></tr>\n    <tr><td>Hostel</td><td>90</td></tr>\n  </tbody>\n  <tfoot><tr><th scope="row">Total</th><td>150</td></tr></tfoot>\n</table>',
        checks: [
          { label: 'A <thead> with <th> headers', re: '<thead>\\s*<tr>\\s*<th[\\s\\S]*?</tr>\\s*</thead>', flags: 'i' },
          { label: 'A <tbody> with two data rows', re: '<tbody>(\\s*<tr>[\\s\\S]*?</tr>){2,}\\s*</tbody>', flags: 'i' },
          { label: 'A <tfoot> with the total', re: '<tfoot>\\s*<tr>[\\s\\S]*?Total[\\s\\S]*?</tr>\\s*</tfoot>', flags: 'i' },
          { label: 'In order: thead, tbody, tfoot', re: '</thead>\\s*<tbody>[\\s\\S]*</tbody>\\s*<tfoot>', flags: 'i' },
        ],
        hint: 'Each group wraps whole tr rows: header rows, data rows, then the total row.',
        explain: 'thead, tbody and tfoot tell browsers and screen readers which rows are headings, data and summary.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}tfoot{font-weight:bold}' },
      },
      {
        kind: 'write',
        prompt: 'Group the bake-sale rows into thead, tbody and tfoot.',
        starter:
          '<table>\n  <caption>Bake sale</caption>\n  <tr><th scope="col">Cake</th><th scope="col">Sold</th></tr>\n  <tr><td>Brownie</td><td>14</td></tr>\n  <tr><td>Flapjack</td><td>9</td></tr>\n  <tr><th scope="row">Total</th><td>23</td></tr>\n</table>',
        solution:
          '<table>\n  <caption>Bake sale</caption>\n  <thead>\n    <tr><th scope="col">Cake</th><th scope="col">Sold</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Brownie</td><td>14</td></tr>\n    <tr><td>Flapjack</td><td>9</td></tr>\n  </tbody>\n  <tfoot>\n    <tr><th scope="row">Total</th><td>23</td></tr>\n  </tfoot>\n</table>',
        checks: [
          { label: 'The caption stays first, before <thead>', re: '<table>\\s*<caption>[\\s\\S]*?</caption>\\s*<thead>', flags: 'i' },
          { label: 'The header row in <thead>', re: '<thead>\\s*<tr>\\s*<th[^>]*>\\s*Cake[\\s\\S]*?</tr>\\s*</thead>', flags: 'i' },
          {
            label: 'Brownie and Flapjack in <tbody>',
            re: '<tbody>\\s*<tr>\\s*<td>\\s*Brownie[\\s\\S]*?</tr>\\s*<tr>\\s*<td>\\s*Flapjack[\\s\\S]*?</tr>\\s*</tbody>',
            flags: 'i',
          },
          { label: 'The total row in <tfoot>', re: '<tfoot>\\s*<tr>\\s*<th[^>]*>\\s*Total[\\s\\S]*?</tr>\\s*</tfoot>\\s*</table>', flags: 'i' },
        ],
        hint: 'Wrap rows, not cells: <thead> around the first tr, <tbody> around the data, <tfoot> around Total.',
        explain: 'Grouping keeps the caption first, then the row groups in order; printed tables can repeat thead on every page.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}tfoot{font-weight:bold}' },
      },
    ],
    // L5 Spanning cells
    [
      {
        kind: 'write',
        prompt: 'Make a weekend table whose top cell spans both day columns.',
        starter: '',
        solution:
          '<table>\n  <tr><th colspan="2">Weekend</th></tr>\n  <tr><th scope="col">Sat</th><th scope="col">Sun</th></tr>\n  <tr><td>Market</td><td>Picnic</td></tr>\n</table>',
        checks: [
          { label: 'A first row with one cell and colspan="2"', re: '<table>\\s*<tr>\\s*<t[hd][^>]*\\scolspan=["\']?2["\']?[^>]*>[^<]*\\S[^<]*</t[hd]>\\s*</tr>', flags: 'i' },
          { label: 'A row of two day headers', re: '<tr>\\s*<th[^>]*>[^<]*</th>\\s*<th[^>]*>[^<]*</th>\\s*</tr>', flags: 'i' },
          { label: 'A row of two <td> plans', re: '<tr>\\s*<td>[^<]*\\S[^<]*</td>\\s*<td>[^<]*\\S[^<]*</td>\\s*</tr>', flags: 'i' },
        ],
        hint: 'The spanning row has just one cell: colspan="2" makes it as wide as two.',
        explain: 'colspan stretches a cell across columns, so that row needs one cell fewer.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}' },
      },
      {
        kind: 'write',
        prompt: 'Merge the two Yoga cells into one tall cell.',
        starter:
          '<table>\n  <tr><th scope="col">Time</th><th scope="col">Room 1</th></tr>\n  <tr><td>9:00</td><td>Yoga</td></tr>\n  <tr><td>10:00</td><td>Yoga</td></tr>\n  <tr><td>11:00</td><td>Pilates</td></tr>\n</table>',
        solution:
          '<table>\n  <tr><th scope="col">Time</th><th scope="col">Room 1</th></tr>\n  <tr><td>9:00</td><td rowspan="2">Yoga</td></tr>\n  <tr><td>10:00</td></tr>\n  <tr><td>11:00</td><td>Pilates</td></tr>\n</table>',
        checks: [
          { label: 'The 9:00 Yoga cell has rowspan="2"', re: '9:00\\s*</td>\\s*<td[^>]*\\srowspan=["\']?2["\']?[^>]*>\\s*Yoga', flags: 'i' },
          { label: 'Only one Yoga cell', re: '^(?![\\s\\S]*Yoga[\\s\\S]*Yoga)[\\s\\S]*Yoga', flags: 'i' },
          { label: 'The 10:00 row keeps just its time', re: '<tr>\\s*<td>\\s*10:00\\s*</td>\\s*</tr>', flags: 'i' },
          { label: 'Pilates stays at 11:00', re: '11:00\\s*</td>\\s*<td>\\s*Pilates\\s*</td>', flags: 'i' },
        ],
        hint: 'Put rowspan="2" on the first Yoga cell, then delete the one it now covers.',
        explain: 'rowspan pushes a cell down into the next row, so that row must drop a cell or it gets too long.',
        preview: { css: 'th,td{border:1px solid #ccc;padding:4px 8px}' },
      },
    ],
  ],
};

export default unit;
