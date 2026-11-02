import { Hit, type MockProps } from './common';

const NAV = ['Containers', 'Images', 'Volumes', 'Builds', 'Docker Hub', 'Docker Scout', 'Extensions'];

/** Docker Desktop's dashboard: the containers list, the images list, or one
 * container's details (variant `detail`). */
export function DockerDesktopMock({ variant = 'containers', terminal }: MockProps) {
  const page = variant === 'images' ? 'Images' : 'Containers';
  return (
    <div className="mk mk-docker">
      <div className="mk-docker-top">
        <span className="mk-docker-logo">🐳 docker desktop</span>
        <Hit t="search" className="mk-command-center">
          ⌕ Search
        </Hit>
        <span className="spacer" />
        <Hit t="learning-center" title="Learning center">🎓</Hit>
        <Hit t="settings" title="Settings">⚙</Hit>
        <Hit t="account" title="Sign in">◯ Sign in</Hit>
      </div>
      <div className="mk-row mk-grow">
        <div className="mk-side mk-docker-nav">
          {NAV.map((n) => (
            <Hit key={n} t={`nav-${n.toLowerCase().replace(/\s+/g, '-')}`} className={`mk-file ${n === page ? 'on' : ''}`}>
              {n}
            </Hit>
          ))}
        </div>
        <div className="mk-col mk-grow mk-docker-main">
          {variant === 'detail' ? <Detail /> : variant === 'images' ? <Images /> : <Containers />}
          {terminal && <div className="mk-panel-body mk-docker-term">{terminal}</div>}
        </div>
      </div>
      <div className="mk-status docker">
        <Hit t="engine-status">
          <span className="mk-dot on" /> Engine running
        </Hit>
        <span>RAM 2.1 GB · CPU 1.2%</span>
        <span className="spacer" />
        <Hit t="terminal-button">⌨ Terminal</Hit>
      </div>
    </div>
  );
}

function Containers() {
  const rows = [
    { name: 'web', image: 'nginx:latest', port: '8080:80', running: true },
    { name: 'db', image: 'postgres:17', port: '5432:5432', running: true },
    { name: 'old-app', image: 'shop-app:1.0', port: '', running: false },
  ];
  return (
    <>
      <h3 className="mk-h">Containers</h3>
      <div className="mk-filter">
        <span className="muted">⌕ Search</span>
        <span className="spacer" />
        <Hit t="only-running">☐ Only show running containers</Hit>
      </div>
      <table className="mk-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Port(s)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <span className={r.running ? 'mk-dot on' : 'mk-dot'} />
                <Hit t={`row-${r.name}`} className="mk-link">
                  {r.name}
                </Hit>
              </td>
              <td>
                <Hit t={`image-${r.name}`} className="mk-link">
                  {r.image}
                </Hit>
              </td>
              <td>
                {r.port && (
                  <Hit t={`port-${r.name}`} className="mk-link">
                    {r.port} ↗
                  </Hit>
                )}
              </td>
              <td>{r.running ? 'Running' : 'Exited (0)'}</td>
              <td className="mk-actions">
                {r.running ? (
                  <Hit t={`stop-${r.name}`} title="Stop">■</Hit>
                ) : (
                  <Hit t={`start-${r.name}`} title="Start">▶</Hit>
                )}
                <Hit t={`more-${r.name}`} title="Show container actions">⋮</Hit>
                <Hit t={`delete-${r.name}`} title="Delete">🗑</Hit>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Images() {
  const rows = [
    ['nginx', 'latest', '192 MB'],
    ['postgres', '17', '438 MB'],
    ['shop-app', '1.0', '156 MB'],
  ];
  return (
    <>
      <h3 className="mk-h">Images</h3>
      <div className="mk-filter">
        <Hit t="images-local" className="on">Local</Hit>
        <Hit t="images-hub">My Hub</Hit>
        <span className="spacer" />
        <Hit t="images-prune">Delete unused</Hit>
      </div>
      <table className="mk-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Tag</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, tag, size]) => (
            <tr key={n}>
              <td>
                <Hit t={`img-${n}`} className="mk-link">
                  {n}
                </Hit>
              </td>
              <td>{tag}</td>
              <td>{size}</td>
              <td className="mk-actions">
                <Hit t={`run-${n}`} title="Run">▶</Hit>
                <Hit t={`img-more-${n}`} title="Show image actions">⋮</Hit>
                <Hit t={`img-delete-${n}`} title="Delete">🗑</Hit>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Detail() {
  return (
    <>
      <div className="mk-filter">
        <Hit t="back" title="Back">←</Hit>
        <h3 className="mk-h" style={{ margin: 0 }}>
          web <span className="muted small">nginx:latest · 8080:80 ↗</span>
        </h3>
        <span className="spacer" />
        <Hit t="detail-stop" title="Stop">■</Hit>
        <Hit t="detail-restart" title="Restart">↻</Hit>
        <Hit t="detail-delete" title="Delete">🗑</Hit>
      </div>
      <div className="mk-dt-tabs sub">
        {['Logs', 'Inspect', 'Bind mounts', 'Exec', 'Files', 'Stats'].map((t) => (
          <Hit key={t} t={`tab-${t.toLowerCase().replace(' ', '')}`} className={t === 'Logs' ? 'on' : ''}>
            {t}
          </Hit>
        ))}
      </div>
      <div className="mk-console">
        <div>/docker-entrypoint.sh: Configuration complete; ready for start up</div>
        <div>172.17.0.1 - - &quot;GET / HTTP/1.1&quot; 200 615</div>
        <div>172.17.0.1 - - &quot;GET /favicon.ico HTTP/1.1&quot; 404 153</div>
      </div>
    </>
  );
}
