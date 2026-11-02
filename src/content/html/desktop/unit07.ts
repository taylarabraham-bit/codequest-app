import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 7 (Media).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Audio & video
    [
      {
        kind: 'write',
        prompt: 'Add a playable podcast episode and a 360-pixel trailer with a poster.',
        starter: '',
        solution:
          '<h2>Episode 4</h2>\n<audio src="episode4.mp3" controls></audio>\n<h2>Trailer</h2>\n<video src="trailer.mp4" controls width="360" poster="trailer.jpg"></video>',
        checks: [
          {
            label: 'An <audio> with src and controls, closed',
            re: '<audio(?=[^>]*\\ssrc=["\'][^"\']+["\'])(?=[^>]*\\scontrols[\\s>=])[^>]*>[\\s\\S]*?</audio>',
            flags: 'i',
          },
          {
            label: 'A <video> with src and controls, closed',
            re: '<video(?=[^>]*\\ssrc=["\'][^"\']+["\'])(?=[^>]*\\scontrols[\\s>=])[^>]*>[\\s\\S]*?</video>',
            flags: 'i',
          },
          { label: 'The video is width="360"', re: '<video[^>]*\\swidth=["\']?360["\']?[\\s>]', flags: 'i' },
          { label: 'A poster image on the video', re: '<video[^>]*\\sposter=["\'][^"\']+\\.(jpe?g|png|webp|avif|gif)["\']', flags: 'i' },
        ],
        hint: 'Both need src and controls, and both have closing tags. poster is an image file.',
        explain: 'Without controls an audio element is invisible. poster shows a still until the video starts.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the media so both can be played and the video is set up properly.',
        starter: '<h2>Birdsong</h2>\n<audio src="robin.mp3"></audio>\n<h2>Trail clip</h2>\n<video src="trail.mp4" width="400px">',
        solution:
          '<h2>Birdsong</h2>\n<audio src="robin.mp3" controls></audio>\n<h2>Trail clip</h2>\n<video src="trail.mp4" width="400" controls poster="trail.jpg"></video>',
        checks: [
          { label: 'The audio has controls', re: '<audio[^>]*\\scontrols[\\s>=]', flags: 'i' },
          { label: 'The video has controls', re: '<video[^>]*\\scontrols[\\s>=]', flags: 'i' },
          { label: 'width="400", without px', re: '<video[^>]*\\swidth=["\']?400["\']?[\\s>]', flags: 'i' },
          { label: 'Close the video with </video>', re: '<video[^>]*>[\\s\\S]*</video>', flags: 'i' },
          { label: 'Add a poster image', re: '<video[^>]*\\sposter=["\'][^"\']+\\.(jpe?g|png|webp|avif|gif)["\']', flags: 'i' },
        ],
        hint: 'controls is a boolean attribute. width is a plain number, and video needs its closing tag.',
        explain: 'The browser shows no player without controls, and width takes plain pixels, so 400px is invalid.',
        preview: {},
      },
    ],
    // L2 Playback options
    [
      {
        kind: 'write',
        prompt: 'Add a silent background video that plays and repeats by itself, even on iPhones.',
        starter: '<header>\n  <h1>Surf Camp</h1>\n\n</header>',
        solution: '<header>\n  <h1>Surf Camp</h1>\n  <video src="waves.mp4" autoplay muted loop playsinline width="480"></video>\n</header>',
        checks: [
          { label: 'A <video> with a src, closed', re: '<video[^>]*\\ssrc=["\'][^"\']+["\'][^>]*>[\\s\\S]*?</video>', flags: 'i' },
          { label: 'autoplay', re: '<video[^>]*\\sautoplay[\\s>=]', flags: 'i' },
          { label: 'muted', re: '<video[^>]*\\smuted[\\s>=]', flags: 'i' },
          { label: 'loop', re: '<video[^>]*\\sloop[\\s>=]', flags: 'i' },
          { label: 'playsinline', re: '<video[^>]*\\splaysinline[\\s>=]', flags: 'i' },
        ],
        hint: 'All four are boolean attributes: just write each word in the opening tag.',
        explain: 'Browsers only autoplay muted video, and playsinline stops iPhones jumping to fullscreen.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'The intro should play once, muted, inline; the how-to should wait for a click.',
        starter:
          '<video src="intro.mp4" autoplay loop="false" width="480"></video>\n<video src="howto.mp4" autoplay muted width="480"></video>',
        solution:
          '<video src="intro.mp4" autoplay muted playsinline width="480"></video>\n<video src="howto.mp4" controls width="480"></video>',
        checks: [
          {
            label: 'The intro autoplays, muted and inline',
            re: '<video(?=[^>]*intro\\.mp4)(?=[^>]*\\sautoplay)(?=[^>]*\\smuted)(?=[^>]*\\splaysinline)[^>]*>',
            flags: 'i',
          },
          { label: 'Remove loop: loop="false" still loops', re: '^(?![\\s\\S]*\\sloop)[\\s\\S]*<video', flags: 'i' },
          { label: 'The how-to has controls', re: '<video(?=[^>]*howto\\.mp4)(?=[^>]*\\scontrols)[^>]*>', flags: 'i' },
          { label: 'The how-to does not autoplay', re: '<video(?=[^>]*howto\\.mp4)(?![^>]*autoplay)[^>]*>', flags: 'i' },
        ],
        hint: 'A boolean attribute is on whenever it is present, whatever its value. Delete it to turn it off.',
        explain: 'loop="false" still means loop. A tutorial should start when the viewer is ready, so it gets controls instead.',
        preview: {},
      },
    ],
    // L3 Sources & fallback
    [
      {
        kind: 'write',
        prompt: 'Offer a skate clip as WebM and MP4, with fallback text.',
        starter: '',
        solution:
          '<video controls width="400">\n  <source src="skate.webm" type="video/webm">\n  <source src="skate.mp4" type="video/mp4">\n  Sorry, your browser can’t play this video.\n</video>',
        checks: [
          { label: 'No src on the <video> itself', re: '<video(?![^>]*\\ssrc=)[^>]*>', flags: 'i' },
          { label: 'A WebM <source> with type="video/webm"', re: '<source(?=[^>]*\\ssrc=["\'][^"\']+\\.webm["\'])(?=[^>]*\\stype=["\']video/webm["\'])[^>]*>', flags: 'i' },
          { label: 'An MP4 <source> with type="video/mp4"', re: '<source(?=[^>]*\\ssrc=["\'][^"\']+\\.mp4["\'])(?=[^>]*\\stype=["\']video/mp4["\'])[^>]*>', flags: 'i' },
          { label: 'Fallback text after the sources', re: '<source[^>]*>\\s*[^<\\s][^<]*</video>', flags: 'i' },
          { label: 'Controls on the video', re: '<video[^>]*\\scontrols[\\s>=]', flags: 'i' },
        ],
        hint: 'Leave src off video; each source gets src and type. Text goes last, before </video>.',
        explain: 'The browser plays the first source it supports. The text only shows if video isn’t supported at all.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the theme tune so browsers can pick OGG or MP3.',
        starter: '<audio src="theme.ogg" controls>\n  <source src="theme.mp3" type="audio/ogg">\n</audio>',
        solution:
          '<audio controls>\n  <source src="theme.ogg" type="audio/ogg">\n  <source src="theme.mp3" type="audio/mpeg">\n  Your browser cannot play audio.\n</audio>',
        checks: [
          { label: 'No src on <audio>', re: '<audio(?![^>]*\\ssrc=)[^>]*\\scontrols[^>]*>', flags: 'i' },
          { label: 'theme.ogg as a source with type="audio/ogg"', re: '<source(?=[^>]*\\ssrc=["\']theme\\.ogg["\'])(?=[^>]*\\stype=["\']audio/ogg["\'])[^>]*>', flags: 'i' },
          { label: 'theme.mp3 with type="audio/mpeg"', re: '<source(?=[^>]*\\ssrc=["\']theme\\.mp3["\'])(?=[^>]*\\stype=["\']audio/mpeg["\'])[^>]*>', flags: 'i' },
          { label: 'Fallback text before </audio>', re: '<source[^>]*>\\s*[^<\\s][^<]*</audio>', flags: 'i' },
        ],
        hint: 'Move the ogg file into its own source. The MIME type for MP3 is audio/mpeg.',
        explain: 'A src on audio overrides the sources, and a wrong type makes the browser skip a file it could have played.',
        preview: {},
      },
    ],
    // L4 Captions
    [
      {
        kind: 'write',
        prompt: 'Give a cooking video English captions that are on by default.',
        starter: '',
        solution:
          '<video src="risotto.mp4" controls width="400">\n  <track kind="captions" src="risotto-en.vtt" srclang="en" label="English" default>\n</video>',
        checks: [
          { label: 'A <video> with src and controls', re: '<video(?=[^>]*\\ssrc=)(?=[^>]*\\scontrols)[^>]*>', flags: 'i' },
          { label: 'A <track> inside it with kind="captions"', re: '<video[^>]*>\\s*<track[^>]*\\skind=["\']captions["\'][\\s\\S]*</video>', flags: 'i' },
          { label: 'The track’s src is a .vtt file', re: '<track[^>]*\\ssrc=["\'][^"\']+\\.vtt["\']', flags: 'i' },
          { label: 'srclang="en" and a label', re: '<track(?=[^>]*\\ssrclang=["\']en(-\\w+)?["\'])(?=[^>]*\\slabel=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'Switched on with default', re: '<track[^>]*\\sdefault[\\s>=/]', flags: 'i' },
          { label: 'No </track> closing tag', not: '</track>' },
        ],
        hint: 'track is empty and goes inside video: kind, src, srclang, label, default.',
        explain: 'Captions write out speech and sounds for people who can’t hear the video. default turns them on.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the English track and add French subtitles from tour-fr.vtt.',
        starter: '<video src="tour.mp4" controls>\n  <track kind="captions" src="tour-en.vtt" lang="en" label="English" default>\n</video>',
        solution:
          '<video src="tour.mp4" controls>\n  <track kind="captions" src="tour-en.vtt" srclang="en" label="English" default>\n  <track kind="subtitles" src="tour-fr.vtt" srclang="fr" label="Français">\n</video>',
        checks: [
          { label: 'English uses srclang, not lang', re: '^(?![\\s\\S]*\\slang=)[\\s\\S]*<track[^>]*\\ssrclang=["\']en["\']', flags: 'i' },
          {
            label: 'A French track with kind="subtitles"',
            re: '<track(?=[^>]*\\skind=["\']subtitles["\'])(?=[^>]*\\ssrc=["\']tour-fr\\.vtt["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'The French track has srclang="fr" and a label', re: '<track(?=[^>]*\\ssrclang=["\']fr["\'])(?=[^>]*\\slabel=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'Only one track is default', re: '^(?![\\s\\S]*\\sdefault[\\s\\S]*\\sdefault)[\\s\\S]*\\sdefault', flags: 'i' },
          { label: 'Both tracks inside the video', re: '<video[^>]*>\\s*(<track[^>]*>\\s*){2}</video>', flags: 'i' },
        ],
        hint: 'track uses srclang for its language. subtitles are the words, translated.',
        explain: 'lang is the general language attribute; a track’s language must be srclang so the menu and browser use it.',
        preview: {},
      },
    ],
    // L5 Embeds
    [
      {
        kind: 'write',
        prompt: 'Embed the festival map page, 500 by 350, allowed to go fullscreen.',
        starter: '<h2>Getting around</h2>\n',
        solution:
          '<h2>Getting around</h2>\n<iframe src="festival-map.html" title="Festival site map"\n  width="500" height="350" allow="fullscreen"></iframe>',
        checks: [
          { label: 'An <iframe> with a src', re: '<iframe[^>]*\\ssrc=["\'][^"\']+["\']', flags: 'i' },
          { label: 'A title that names it', re: '<iframe[^>]*\\stitle=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
          {
            label: 'width="500" and height="350"',
            re: '<iframe(?=[^>]*\\swidth=["\']?500["\']?[\\s>])(?=[^>]*\\sheight=["\']?350["\']?[\\s>])[^>]*>',
            flags: 'i',
          },
          { label: 'allow="fullscreen"', re: '<iframe[^>]*\\sallow=["\'][^"\']*fullscreen[^"\']*["\']', flags: 'i' },
          { label: 'Close it with </iframe>', re: '<iframe[^>]*>\\s*</iframe>', flags: 'i' },
        ],
        hint: 'iframe needs src, a title for screen readers, pixel numbers and a closing tag.',
        explain: 'Screen readers announce the title so users know what the frame holds before they enter it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the cooking-demo embed so it is accessible, valid and can go fullscreen.',
        starter: '<iframe src="https://video.example.com/embed/42" alt="Cooking demo" width="560px" height="315px">',
        solution:
          '<iframe src="https://video.example.com/embed/42" title="Cooking demo"\n  width="560" height="315" allow="fullscreen"></iframe>',
        checks: [
          { label: 'A title instead of alt', re: '<iframe(?![^>]*\\salt=)[^>]*\\stitle=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
          { label: 'Plain numbers: width="560" height="315"', re: '<iframe(?=[^>]*\\swidth=["\']?560["\']?[\\s>])(?=[^>]*\\sheight=["\']?315["\']?[\\s>])[^>]*>', flags: 'i' },
          { label: 'allow="fullscreen"', re: '<iframe[^>]*\\sallow=["\'][^"\']*fullscreen[^"\']*["\']', flags: 'i' },
          { label: 'A closing </iframe>', has: '</iframe>' },
        ],
        hint: 'iframes have no alt. Sizes are bare numbers, and the tag must close.',
        explain: 'alt only works on images; title names the frame. Without </iframe> the rest of the page is swallowed.',
        preview: {},
      },
    ],
  ],
};

export default unit;
