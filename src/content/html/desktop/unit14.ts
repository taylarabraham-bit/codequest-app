import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 14 (Internationalization).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Language tags
    [
      {
        kind: 'write',
        prompt: 'Write a British English page for a Lisbon tour, marking one Portuguese word.',
        starter: '',
        solution:
          '<!DOCTYPE html>\n<html lang="en-GB">\n  <head>\n    <meta charset="utf-8">\n    <title>Lisbon Walks</title>\n  </head>\n  <body>\n    <p>Locals say <i lang="pt">obrigado</i> to thank you.</p>\n  </body>\n</html>',
        checks: [
          { label: 'Start with <!DOCTYPE html>', re: '^\\s*<!doctype html>', flags: 'i' },
          { label: '<html lang="en-GB">', re: '<html[^>]*\\slang="en-GB"', flags: 'i' },
          { label: 'A <title> in the head', re: '<head>[\\s\\S]*<title>[^<]*\\S[^<]*</title>[\\s\\S]*</head>', flags: 'i' },
          { label: 'A Portuguese word marked with lang="pt"', re: '<(\\w+)[^>]*\\slang="pt(-[a-z]{2})?"[^>]*>[^<]*\\S[^<]*</\\1>', flags: 'i' },
        ],
        hint: 'The page language goes on <html>. Wrap the foreign word in an element like <i> with its own lang.',
        explain: 'lang on html sets the default; lang on an inline element switches language just for that phrase, so screen readers pronounce it right.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'The page is English. Mark each dish name with its own language.',
        starter: '<ul>\n  <li>Croque monsieur (French)</li>\n  <li>Spätzle (German)</li>\n  <li>餃子 (gyoza, Japanese)</li>\n</ul>',
        solution:
          '<ul>\n  <li><span lang="fr">Croque monsieur</span> (French)</li>\n  <li><span lang="de">Spätzle</span> (German)</li>\n  <li><span lang="ja">餃子</span> (gyoza, Japanese)</li>\n</ul>',
        checks: [
          { label: 'Croque monsieur in lang="fr"', re: '\\slang="fr(-[a-z]{2})?"[^>]*>\\s*Croque monsieur', flags: 'i' },
          { label: 'Spätzle in lang="de"', re: '\\slang="de(-[a-z]{2})?"[^>]*>\\s*Spätzle', flags: 'i' },
          { label: '餃子 in lang="ja"', re: '\\slang="ja(-[a-z]{2})?"[^>]*>\\s*餃子', flags: 'i' },
        ],
        hint: 'Wrap just the dish name in a <span> with lang: fr, de or ja.',
        explain: 'Marking only the dish name keeps the English notes in English. For 餃子 it also helps the browser pick a Japanese font.',
        preview: {},
      },
    ],
    // L2 Text direction
    [
      {
        kind: 'write',
        prompt: 'Add an Arabic greeting that runs right to left, and a note box for any language.',
        starter: '<h1>Welcome</h1>\n',
        solution:
          '<h1>Welcome</h1>\n<p lang="ar" dir="rtl">أهلاً وسهلاً</p>\n<label for="note">Leave a note in any language</label>\n<textarea id="note" name="note" dir="auto"></textarea>',
        checks: [
          { label: 'An element with lang="ar" and dir="rtl"', re: '<\\w+(?=[^>]*\\slang="ar(-[a-z]{2})?")(?=[^>]*\\sdir="rtl")[^>]*>', flags: 'i' },
          { label: 'Arabic text inside it', re: '\\sdir="rtl"[^>]*>[^<]*[\\u0600-\\u06FF]', flags: 'i' },
          { label: 'A textarea or input with dir="auto"', re: '<(textarea|input)[^>]*\\sdir="auto"', flags: 'i' },
        ],
        hint: 'Put lang and dir together on the greeting. dir="auto" lets the box follow whatever is typed.',
        explain: 'dir="rtl" aligns the Arabic to the right and orders it correctly. dir="auto" guesses from the first strong letter typed.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Make this Hebrew recipe page run right to left from the top down.',
        starter:
          '<html>\n  <head>\n    <meta charset="utf-8">\n    <title>מתכונים</title>\n  </head>\n  <body>\n    <h1>מתכונים</h1>\n    <ol>\n      <li>שקשוקה</li>\n      <li>חומוס</li>\n    </ol>\n    <p>תגובות:</p>\n    <textarea name="comment"></textarea>\n  </body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="he" dir="rtl">\n  <head>\n    <meta charset="utf-8">\n    <title>מתכונים</title>\n  </head>\n  <body>\n    <h1>מתכונים</h1>\n    <ol>\n      <li>שקשוקה</li>\n      <li>חומוס</li>\n    </ol>\n    <p>תגובות:</p>\n    <textarea name="comment" dir="auto"></textarea>\n  </body>\n</html>',
        checks: [
          { label: 'Add the doctype', re: '^\\s*<!doctype html>', flags: 'i' },
          { label: '<html> gets lang="he" and dir="rtl"', re: '<html(?=[^>]*\\slang="he(-[a-z]{2})?")(?=[^>]*\\sdir="rtl")', flags: 'i' },
          { label: 'The comment box uses dir="auto"', re: '<textarea[^>]*\\sdir="auto"', flags: 'i' },
        ],
        hint: 'Set lang and dir once on <html>; every element inherits them. Comments may be in any language.',
        explain: 'dir on html flips the whole page: text, list numbers and layout. Visitors might comment in English, so the box follows its own text.',
        preview: {},
      },
    ],
    // L3 Isolating with bdi & bdo
    [
      {
        kind: 'write',
        prompt: 'List three leaderboard players safely; one name is in Arabic or Hebrew.',
        starter: '',
        solution: '<ol>\n  <li><bdi>Sam</bdi>: 120 points</li>\n  <li><bdi>نور</bdi>: 95 points</li>\n  <li><bdi>דניאל</bdi>: 80 points</li>\n</ol>',
        checks: [
          { label: 'Three <li>s, each starting with a <bdi> name', re: '(<li>\\s*<bdi>[^<]+</bdi>[\\s\\S]*?</li>[\\s\\S]*?){3}', flags: 'i' },
          { label: 'A score after each name, outside the bdi', re: '(</bdi>[^<]*\\d[^<]*</li>[\\s\\S]*?){3}', flags: 'i' },
          { label: 'At least one Arabic or Hebrew name', re: '<bdi>[^<]*[\\u0590-\\u06FF]', flags: 'i' },
        ],
        hint: 'Only the name goes in <bdi>; the colon and points stay outside.',
        explain: 'bdi isolates a name whose direction you can’t predict, so an Arabic name can’t pull the score next to it out of order.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Isolate the reviewer’s name, and force the mirror word to run right to left.',
        starter: '<p>Reviewed by إيمان 5 stars</p>\n<p>Mirror test: <span>stressed</span></p>',
        solution: '<p>Reviewed by <bdi>إيمان</bdi> 5 stars</p>\n<p>Mirror test: <bdo dir="rtl">stressed</bdo></p>',
        checks: [
          { label: 'The name in a <bdi>', re: '<bdi>\\s*إيمان\\s*</bdi>', flags: 'i' },
          { label: 'stressed in <bdo dir="rtl">', re: '<bdo[^>]*\\sdir="rtl"[^>]*>\\s*stressed\\s*</bdo>', flags: 'i' },
          { label: 'Replace the span', not: '<span>stressed' },
        ],
        hint: 'bdi isolates; bdo overrides and needs a dir.',
        explain: 'Without bdi the 5 sticks to the Arabic name and the line scrambles. bdo dir="rtl" prints stressed backwards: desserts.',
        preview: {},
      },
    ],
    // L4 Translation & alternates
    [
      {
        kind: 'write',
        prompt: 'Write the head for a hut-booking site in English and German, with a default.',
        starter: '',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Alpine Huts</title>\n  <link rel="alternate" hreflang="en" href="https://huts.example/en/">\n  <link rel="alternate" hreflang="de" href="https://huts.example/de/">\n  <link rel="alternate" hreflang="x-default" href="https://huts.example/">\n</head>',
        checks: [
          { label: '<meta charset="utf-8">', re: '<meta[^>]*\\scharset="?utf-8', flags: 'i' },
          {
            label: 'An alternate link with hreflang="en"',
            re: '<link(?=[^>]*\\srel="alternate")(?=[^>]*\\shreflang="en(-[a-z]{2})?")(?=[^>]*\\shref="[^"]+")',
            flags: 'i',
          },
          {
            label: 'An alternate link with hreflang="de"',
            re: '<link(?=[^>]*\\srel="alternate")(?=[^>]*\\shreflang="de(-[a-z]{2})?")(?=[^>]*\\shref="[^"]+")',
            flags: 'i',
          },
          {
            label: 'One with hreflang="x-default"',
            re: '<link(?=[^>]*\\srel="alternate")(?=[^>]*\\shreflang="x-default")(?=[^>]*\\shref="[^"]+")',
            flags: 'i',
          },
        ],
        hint: 'One <link rel="alternate" hreflang="…" href="…"> per version, all inside head.',
        explain: 'Search engines use these links to send each visitor to their language, and x-default to everyone else.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Stop translation tools changing the username, brand and command in this post.',
        starter: '<p>Posted by <span>night_owl42</span></p>\n<p>Try <b>SnapCrate</b> to back up photos.</p>\n<p>Run <code>snap sync --all</code> every week.</p>',
        solution:
          '<p>Posted by <span translate="no">night_owl42</span></p>\n<p>Try <b translate="no">SnapCrate</b> to back up photos.</p>\n<p>Run <code translate="no">snap sync --all</code> every week.</p>',
        checks: [
          { label: 'translate="no" on the username', re: '\\stranslate="no"[^>]*>\\s*night_owl42', flags: 'i' },
          { label: 'translate="no" on SnapCrate', re: '\\stranslate="no"[^>]*>\\s*SnapCrate', flags: 'i' },
          { label: 'translate="no" on the command', re: '\\stranslate="no"[^>]*>\\s*snap sync', flags: 'i' },
          { label: 'The rest of each sentence stays translatable', re: '<p>\\s*Posted by', flags: 'i' },
        ],
        hint: 'Add translate="no" to the span, the b and the code, not to whole paragraphs.',
        explain: 'Translators would happily turn a brand or a command into other words. translate="no" fences off just those bits.',
        preview: {},
      },
    ],
    // L5 Ruby, quotes & formats
    [
      {
        kind: 'write',
        prompt: 'Show the reading かんじ above 漢字, with bracket fallbacks.',
        starter: '<p>Word of the day:</p>\n',
        solution: '<p>Word of the day:</p>\n<p>\n  <ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>\n</p>',
        checks: [
          { label: 'A <ruby> around 漢字', re: '<ruby>\\s*漢字[\\s\\S]*?</ruby>', flags: 'i' },
          { label: 'The reading in <rt>', re: '<rt>\\s*かんじ\\s*</rt>', flags: 'i' },
          { label: '<rp> brackets before and after the rt', re: '<rp>\\s*[(（]\\s*</rp>\\s*<rt>[\\s\\S]*?</rt>\\s*<rp>\\s*[)）]\\s*</rp>', flags: 'i' },
        ],
        hint: 'Base text first, then <rp>(</rp><rt>reading</rt><rp>)</rp>, all inside ruby.',
        explain: 'Browsers with ruby show the rt small above and hide the rp; old ones show 漢字(かんじ) instead.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Mark this German review: its language, a real quote, and machine values.',
        starter: '<article>\n  <p>"Der beste Kaffee der Stadt!"</p>\n  <p>Preis: 4,50 €</p>\n  <p>Am 14.03.2026</p>\n</article>',
        solution:
          '<article lang="de">\n  <p><q>Der beste Kaffee der Stadt!</q></p>\n  <p>Preis: <data value="4.50">4,50 €</data></p>\n  <p>Am <time datetime="2026-03-14">14.03.2026</time></p>\n</article>',
        checks: [
          { label: 'lang="de" on the article', re: '<article[^>]*\\slang="de(-[a-z]{2})?"', flags: 'i' },
          { label: 'The quote in <q>, without typed quote marks', re: '<q>\\s*Der beste Kaffee der Stadt!\\s*</q>', flags: 'i' },
          { label: 'The price in <data value="4.50">', re: '<data[^>]*\\svalue="4\\.50?"[^>]*>\\s*4,50', flags: 'i' },
          { label: 'The date in <time datetime="2026-03-14">', re: '<time[^>]*\\sdatetime="2026-03-14"[^>]*>\\s*14\\.03\\.2026', flags: 'i' },
        ],
        hint: 'q adds quote marks itself, in the German style. Keep the local text and put the plain value in value or datetime.',
        explain: 'With lang="de" the browser draws German quotes „…“. People read 4,50 € and 14.03.2026; machines read 4.50 and 2026-03-14.',
        preview: {},
      },
    ],
  ],
};

export default unit;
