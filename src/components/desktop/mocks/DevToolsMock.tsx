import { Hit, type MockProps } from './common';

const PANELS = ['Elements', 'Console', 'Sources', 'Network', 'Performance', 'Memory', 'Application', 'Lighthouse'];

/** A browser with DevTools docked on the right. Variants open the Elements,
 * Console, Network or Application panel. */
export function DevToolsMock({ variant = 'elements', terminal }: MockProps) {
  return (
    <div className="mk mk-browser">
      <div className="mk-browser-bar">
        <span className="muted">← →</span>
        <Hit t="reload" title="Reload">⟳</Hit>
        <Hit t="address-bar" className="mk-address">localhost:5173/counter</Hit>
        <Hit t="browser-menu" title="Customize and control">⋮</Hit>
      </div>
      <div className="mk-row mk-grow">
        <div className="mk-page">
          <Hit as="div" t="page-heading" className="mk-page-h1">
            Counter
          </Hit>
          <p>Current count: 0</p>
          <Hit t="page-button" className="mk-page-btn">
            Click me
          </Hit>
        </div>
        <div className="mk-devtools">
          <div className="mk-dt-tabs">
            <Hit t="inspect-tool" title="Select an element in the page to inspect it (Ctrl+Shift+C)">⬚↖</Hit>
            <Hit t="device-toolbar" title="Toggle device toolbar (Ctrl+Shift+M)">▯▭</Hit>
            {PANELS.map((p) => (
              <Hit key={p} t={`panel-${p.toLowerCase()}`} className={p.toLowerCase() === variant ? 'on' : ''}>
                {p}
              </Hit>
            ))}
            <span className="spacer" />
            <Hit t="devtools-settings" title="Settings">⚙</Hit>
            <Hit t="devtools-close" title="Close">✕</Hit>
          </div>
          {variant === 'elements' && <Elements />}
          {variant === 'console' && <ConsolePanel terminal={terminal} />}
          {variant === 'network' && <Network />}
          {variant === 'application' && <Application />}
        </div>
      </div>
    </div>
  );
}

function Elements() {
  return (
    <div className="mk-col mk-grow">
      <div className="mk-dom">
        <div>&lt;!DOCTYPE html&gt;</div>
        <div>&lt;html lang=&quot;en&quot;&gt;</div>
        <div className="d1">▸ &lt;head&gt;…&lt;/head&gt;</div>
        <Hit as="div" t="dom-body" className="d1">
          ▾ &lt;body&gt;
        </Hit>
        <Hit as="div" t="dom-h1" className="d2">
          &lt;h1 class=&quot;title&quot;&gt;Counter&lt;/h1&gt;
        </Hit>
        <div className="d2">&lt;p&gt;Current count: 0&lt;/p&gt;</div>
        <Hit as="div" t="dom-button" className="d2">
          &lt;button class=&quot;btn&quot;&gt;Click me&lt;/button&gt;
        </Hit>
        <div className="d1">&lt;/body&gt;</div>
      </div>
      <div className="mk-dt-tabs sub">
        <Hit t="styles-tab" className="on">Styles</Hit>
        <Hit t="computed-tab">Computed</Hit>
        <Hit t="layout-tab">Layout</Hit>
        <Hit t="listeners-tab">Event Listeners</Hit>
      </div>
      <div className="mk-styles">
        <div className="mk-filter">
          <span className="muted">Filter</span>
          <span className="spacer" />
          <Hit t="hov-toggle" title="Toggle element state">:hov</Hit>
          <Hit t="cls-toggle" title="Element classes">.cls</Hit>
          <Hit t="new-style-rule" title="New Style Rule">+</Hit>
        </div>
        <Hit as="div" t="style-rule" className="mk-rule">
          <span className="t-tag">.title</span> {'{'}
          <div className="d1">
            <span className="t-prop">color</span>: <span className="mk-swatch" /> #3fb950;
          </div>
          <div className="d1">
            <span className="t-prop">margin</span>: 0 0 8px;
          </div>
          {'}'}
        </Hit>
        <div className="mk-rule muted">
          h1 {'{'} <s>margin: 0.67em 0;</s> {'}'} <span className="small">user agent stylesheet</span>
        </div>
        <Hit as="div" t="box-model" className="mk-box" title="Box model">
          <span>margin</span>
          <div>
            <span>border</span>
            <div>
              <span>padding</span>
              <div>420 × 37</div>
            </div>
          </div>
        </Hit>
      </div>
    </div>
  );
}

function ConsolePanel({ terminal }: { terminal?: MockProps['terminal'] }) {
  return (
    <div className="mk-col mk-grow">
      <div className="mk-filter">
        <Hit t="console-clear" title="Clear console (Ctrl+L)">⊘</Hit>
        <span className="muted">top ▾</span>
        <span className="muted mk-grow">Filter</span>
        <Hit t="console-levels">Default levels ▾</Hit>
      </div>
      <div className="mk-console">
        <div className="mk-log">Navigated to http://localhost:5173/counter</div>
        <Hit as="div" t="console-warning" className="mk-log warn">
          ⚠ Image is missing an alt attribute
        </Hit>
        <Hit as="div" t="console-error" className="mk-log err">
          ⊗ Uncaught (in promise) Error: Could not load /api/count (404)
        </Hit>
        {terminal}
      </div>
    </div>
  );
}

function Network() {
  const rows = [
    ['counter', '200', 'document', '2.1 kB'],
    ['styles.css', '200', 'stylesheet', '1.4 kB'],
    ['todos', '200', 'fetch', '312 B'],
    ['missing.png', '404', 'png', '0 B'],
  ];
  return (
    <div className="mk-col mk-grow">
      <div className="mk-filter">
        <Hit t="net-record" title="Stop recording network log">●</Hit>
        <Hit t="net-clear" title="Clear network log">⊘</Hit>
        <Hit t="preserve-log">☐ Preserve log</Hit>
        <Hit t="disable-cache">☐ Disable cache</Hit>
        <Hit t="throttling">No throttling ▾</Hit>
      </div>
      <div className="mk-filter">
        <span className="muted">Filter</span>
        {['All', 'Fetch/XHR', 'Doc', 'CSS', 'JS', 'Img', 'WS'].map((f) => (
          <Hit key={f} t={`net-filter-${f.toLowerCase().replace('/', '-')}`} className={f === 'All' ? 'on' : ''}>
            {f}
          </Hit>
        ))}
      </div>
      <table className="mk-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Type</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, st, ty, sz]) => (
            <tr key={n}>
              <td>
                <Hit t={`net-row-${n.split('.')[0]}`}>{n}</Hit>
              </td>
              <td>
                <Hit t={`net-status-${n.split('.')[0]}`} className={st === '404' ? 'err' : ''}>
                  {st}
                </Hit>
              </td>
              <td>{ty}</td>
              <td>{sz}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mk-dt-tabs sub">
        <span className="muted">todos ✕</span>
        <Hit t="net-tab-headers" className="on">Headers</Hit>
        <Hit t="net-tab-payload">Payload</Hit>
        <Hit t="net-tab-preview">Preview</Hit>
        <Hit t="net-tab-response">Response</Hit>
        <Hit t="net-tab-timing">Timing</Hit>
      </div>
      <div className="mk-console">
        <div>Request URL: https://localhost:7071/todos</div>
        <div>Request Method: GET</div>
        <div>Status Code: 200 OK</div>
      </div>
    </div>
  );
}

function Application() {
  return (
    <div className="mk-row mk-grow">
      <div className="mk-side">
        <div className="mk-side-title">Storage</div>
        <Hit t="app-localstorage" className="mk-file">▾ Local storage</Hit>
        <div className="mk-file d1 muted">http://localhost:5173</div>
        <Hit t="app-sessionstorage" className="mk-file">▸ Session storage</Hit>
        <Hit t="app-indexeddb" className="mk-file">▸ IndexedDB</Hit>
        <Hit t="app-cookies" className="mk-file">▸ Cookies</Hit>
        <div className="mk-side-title">Background services</div>
        <Hit t="app-serviceworkers" className="mk-file">Service workers</Hit>
        <Hit t="app-manifest" className="mk-file">Manifest</Hit>
      </div>
      <table className="mk-table mk-grow">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Hit t="storage-row">theme</Hit>
            </td>
            <td>dark</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
