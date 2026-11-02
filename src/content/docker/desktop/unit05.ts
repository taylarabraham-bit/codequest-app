import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 5 (Volumes & data).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const RUN = 'docker\\s+(?:container\\s+)?run\\b';
const D = '\\s(?:-[a-zA-Z]*d[a-zA-Z]*|--detach)(?!\\S)';
const image = (i: string) => `\\s${i}(?::[\\w.-]+)?(?!\\S)`;
/** -v or --volume followed by its value. */
const V = '\\s(?:-v|--volume)[\\s=]+';
/** A host path for a bind mount: ./x, /x, C:\x, or ${PWD}/x from PowerShell. A quote that closes
 * right after ${PWD} ("${PWD}"/x) splits the argument in PowerShell, so it doesn't count. */
const HOST = '(?:\\.{1,2}[\\\\/]|/|[A-Za-z]:[\\\\/]|"?\\$\\{?(?:PWD|pwd)\\}?[\\\\/])';
const VOL_LS = 'docker\\s+volume\\s+(?:ls|list)\\b';

const unit: DesktopUnit = {
  lessons: [
    // L1 Creating volumes
    [
      {
        kind: 'write',
        prompt: 'Create volumes for a game’s saves and its high scores, then list them.',
        starter: '',
        solution: 'docker volume create game-saves\ndocker volume create game-scores\ndocker volume ls',
        checks: [
          { label: 'Create two volumes', re: '(?:docker\\s+volume\\s+create\\s+[\\w.-]+[\\s\\S]*){2}' },
          { label: 'List them with docker volume ls afterwards', re: `volume\\s+create\\b[\\s\\S]*${VOL_LS}` },
        ],
        hint: 'docker volume create takes the new volume’s name.',
        explain: 'Volumes live outside any container, so they exist before a container uses them and after it is gone.',
        output: 'game-saves\ngame-scores\nDRIVER    VOLUME NAME\nlocal     game-saves\nlocal     game-scores',
      },
      {
        kind: 'write',
        prompt: 'Show a file dies with its container, then make a volume to keep it in.',
        starter: '',
        solution: 'docker run --name box alpine touch /todo.txt\ndocker rm box\ndocker volume create todo-data\ndocker volume ls',
        checks: [
          { label: 'Run a named alpine container that writes a file', re: cmd(RUN, '\\s--name[\\s=]+\\w', image('alpine'), '\\s(?:touch|echo|sh)\\b') },
          { label: 'Remove that same container with docker rm', re: '--name[\\s=]+([\\w.-]+)[\\s\\S]*docker\\s+(?:container\\s+)?rm\\b[^\\n]*\\s\\1(?!\\S)' },
          { label: 'Create a volume', re: 'docker\\s+volume\\s+create\\s+[\\w.-]+' },
          { label: 'List volumes', re: VOL_LS },
        ],
        hint: 'A command after the image name, like touch /todo.txt, replaces its default.',
        explain: 'The file lived in the container’s writable layer, so docker rm deleted it; a volume would have kept it.',
        output: 'box\ntodo-data\nDRIVER    VOLUME NAME\nlocal     todo-data',
      },
    ],
    // L2 Mounting volumes
    [
      {
        kind: 'write',
        prompt: 'Run redis with a volume at /data, replace the container, and reuse the volume.',
        starter: '',
        solution:
          'docker run -d --name cache -v cache-data:/data redis\ndocker rm -f cache\ndocker run -d --name cache -v cache-data:/data redis',
        checks: [
          { label: 'Run redis in the background with a named volume at /data', re: cmd(RUN, D, `${V}[\\w.-]+:/data(?!\\S)`, image('redis')) },
          { label: 'Remove the container', re: 'docker\\s+(?:container\\s+)?rm\\b' },
          {
            label: 'Run a new redis on the same volume after that',
            re: `${V}([\\w.-]+):/data(?!\\S)[\\s\\S]*docker\\s+(?:container\\s+)?rm\\b[\\s\\S]*${RUN}[^\\n]*${V}\\1:/data(?!\\S)`,
          },
        ],
        hint: '-v takes volume-name:/path. Use the same volume name both times.',
        explain: 'Redis saved its data in the volume, not the container, so the new container picks up where the old one stopped.',
        output: 'a4c8e2f6b0d1\ncache\n5e9b3d7f1a2c',
      },
      {
        kind: 'write',
        prompt: 'Share a volume: one alpine container writes a note, another reads it.',
        starter: '',
        solution:
          'docker run --rm -v notes:/notes alpine sh -c "echo buy milk > /notes/todo.txt"\ndocker run --rm -v notes:/notes alpine cat /notes/todo.txt',
        checks: [
          { label: 'Write a file into a mounted volume', re: cmd(RUN, `${V}[\\w.-]+:/\\S+`, image('alpine'), '\\becho\\b[^\\n]*>') },
          { label: 'Read it back with cat from a second container', re: `${V}([\\w.-]+):/\\S+[^\\n]*\\becho\\b[\\s\\S]*${V}\\1:/\\S+[^\\n]*\\scat\\s` },
          { label: 'Use --rm on both runs', re: '(?:docker\\s+(?:container\\s+)?run\\b[^\\n]*\\s--rm\\b[\\s\\S]*){2}' },
        ],
        hint: 'sh -c "echo … > file" runs the redirect inside the container. Mount the same volume name in both runs.',
        explain: 'The second container is brand new, but it sees the note because both mounted the same volume.',
        output: 'buy milk',
      },
    ],
    // L3 Bind mounts
    [
      {
        kind: 'write',
        prompt: 'Serve your ./site folder with nginx on port 8080, then list what nginx sees.',
        starter: '',
        solution:
          'docker run -d --name preview -p 8080:80 -v ./site:/usr/share/nginx/html nginx\ndocker exec preview ls /usr/share/nginx/html',
        checks: [
          { label: 'Bind-mount ./site at /usr/share/nginx/html', re: cmd(RUN, `${V}${HOST}[^:\\s]*site/?:/usr/share/nginx/html/?(?![^\\s:])`) },
          { label: 'Publish host port 8080 to port 80', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+8080:80(?!\\S)', image('nginx')) },
          { label: 'List the folder with docker exec … ls', re: cmd('docker\\s+(?:container\\s+)?exec\\b', '\\sls\\b', '/usr/share/nginx/html') },
        ],
        hint: 'Start the host path with ./ so Docker knows it’s a folder, not a volume name.',
        explain: 'nginx now serves your own files; edit index.html on your machine and a refresh shows the change.',
        output: 'about.html\nindex.html\nstyle.css',
      },
      {
        kind: 'write',
        prompt: 'Fix the mount so nginx reads your ./config folder, then reload nginx.',
        starter: 'docker run -d --name proxy -p 8080:80 -v config:/etc/nginx/conf.d nginx\n',
        solution: 'docker run -d --name proxy -p 8080:80 -v ./config:/etc/nginx/conf.d nginx\ndocker exec proxy nginx -s reload',
        checks: [
          { label: 'Bind-mount ./config at /etc/nginx/conf.d', re: cmd(RUN, `${V}${HOST}[^:\\s]*config/?:/etc/nginx/conf\\.d/?(?![^\\s:])`) },
          { label: 'Not a named volume called config', not: '-v config:' },
          { label: 'Reload with docker exec proxy nginx -s reload', re: cmd('docker\\s+(?:container\\s+)?exec\\s+proxy\\s+nginx\\s+-s\\s+reload\\b') },
        ],
        hint: 'A plain name like config means a volume. A path starts with ./, / or C:\\.',
        explain: 'Without ./ Docker made an empty volume called config; the bind mount shows your files, and reload makes nginx reread them.',
        output: '2026/10/30 10:02:11 [notice] 21#21: signal process started',
      },
    ],
    // L4 --mount & read-only
    [
      {
        kind: 'write',
        prompt: 'Rewrite these two -v runs with --mount.',
        starter: '# docker run -d -v api-logs:/logs api\n# docker run -d -v ./settings:/etc/api:ro api\n',
        solution:
          '# docker run -d -v api-logs:/logs api\n# docker run -d -v ./settings:/etc/api:ro api\ndocker run -d --mount type=volume,src=api-logs,dst=/logs api\ndocker run -d --mount type=bind,src=./settings,dst=/etc/api,readonly api',
        checks: [
          {
            label: 'type=volume, src=api-logs, dst=/logs',
            re: cmd(RUN, '\\s--mount[\\s=]+(?=\\S*type=volume)(?=\\S*(?:src|source)=api-logs(?:,|\\s|$))(?=\\S*(?:dst|destination|target)=/logs(?:,|\\s|$))'),
          },
          {
            label: 'type=bind, src=./settings, dst=/etc/api',
            re: cmd(RUN, '\\s--mount[\\s=]+(?=\\S*type=bind)(?=\\S*(?:src|source)=\\S*settings(?:,|\\s|$))(?=\\S*(?:dst|destination|target)=/etc/api(?:,|\\s|$))'),
          },
          { label: 'Make the bind mount readonly', re: cmd(RUN, '\\s--mount[\\s=]+(?=\\S*type=bind)\\S*,(?:readonly|ro)(?:=true|=1)?(?:,|\\s|$)') },
          { label: 'No -v left', re: '^(?![\\s\\S]*\\ndocker[^\\n]*\\s(?:-v|--volume)\\s)' },
        ],
        hint: '--mount takes comma-separated key=value pairs with no spaces; readonly needs no value.',
        explain: '--mount says each part by name, so it’s clearer than -v, and it refuses to invent a missing host folder.',
        output: '6b1d9f3a5c7e\n8e2a4c6b0d1f',
      },
      {
        kind: 'write',
        prompt: 'Serve ./public read-only from nginx, then show that writing there fails.',
        starter: '',
        solution:
          'docker run -d --name blog -p 8080:80 -v ./public:/usr/share/nginx/html:ro nginx\ndocker exec blog touch /usr/share/nginx/html/test.txt',
        checks: [
          {
            label: 'Mount ./public at /usr/share/nginx/html',
            re: cmd(RUN, `(?:${V}${HOST}[^:\\s]*public/?:/usr/share/nginx/html|--mount[\\s=]+(?=\\S*(?:src|source)=\\S*public)\\S*(?:dst|destination|target)=/usr/share/nginx/html)`),
          },
          {
            label: 'Make it read-only (:ro or readonly)',
            re: cmd(RUN, `(?:${V}\\S+:/usr/share/nginx/html/?:ro(?!\\S)|--mount[\\s=]+\\S*,(?:readonly|ro)(?:=true|=1)?(?:,|\\s|$))`),
          },
          { label: 'Publish a port for the site', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+\\d+:80(?!\\S)') },
          { label: 'Try to write into the folder with docker exec', re: cmd('docker\\s+(?:container\\s+)?exec\\b', '\\s(?:touch|echo|sh|rm|mkdir)\\b', '/usr/share/nginx/html') },
        ],
        hint: 'Add :ro at the end of the -v value, or readonly inside --mount.',
        explain: 'The container can serve the files but can’t change them, so a bug or attacker in nginx can’t rewrite your site.',
        output: "touch: cannot touch '/usr/share/nginx/html/test.txt': Read-only file system",
      },
    ],
    // L5 Volume housekeeping
    [
      {
        kind: 'write',
        prompt: 'Inspect the old-logs volume, delete it, then prune unused anonymous volumes.',
        starter: '',
        solution: 'docker volume inspect old-logs\ndocker volume rm old-logs\ndocker volume prune',
        checks: [
          { label: 'Inspect old-logs', re: cmd('docker\\s+volume\\s+inspect\\s+old-logs\\b') },
          { label: 'Delete old-logs with docker volume rm', re: cmd('docker\\s+volume\\s+(?:rm|remove)\\b', '\\sold-logs\\b') },
          { label: 'Prune unused anonymous volumes', re: cmd('docker\\s+volume\\s+prune\\b') },
          { label: 'Inspect before you delete', re: 'volume\\s+inspect\\b[\\s\\S]*volume\\s+(?:rm|remove)\\b' },
        ],
        hint: 'All three are docker volume subcommands. prune asks you to confirm.',
        explain: 'inspect shows the Mountpoint on disk; plain prune only removes anonymous volumes no container uses.',
        output:
          '[\n    {\n        "CreatedAt": "2026-09-14T08:12:40Z",\n        "Driver": "local",\n        "Mountpoint": "/var/lib/docker/volumes/old-logs/_data",\n        "Name": "old-logs",\n        "Scope": "local"\n    }\n]\nold-logs\nWARNING! This will remove anonymous local volumes not used by at least one container.\nAre you sure you want to continue? [y/N] y\nTotal reclaimed space: 0B',
      },
      {
        kind: 'write',
        prompt: 'This rm fails. Remove the stopped worker first, and clean up cache with its volumes.',
        starter:
          'docker volume rm queue-data\n# Error response from daemon: remove queue-data: volume is in use - [3f2a9c1b7d4e…]\n# worker (stopped) uses queue-data; cache (stopped) has anonymous volumes\n',
        solution:
          '# worker (stopped) uses queue-data; cache (stopped) has anonymous volumes\ndocker ps -a --filter volume=queue-data\ndocker rm worker\ndocker volume rm queue-data\ndocker rm -v cache',
        checks: [
          { label: 'Remove the worker container', re: cmd('docker\\s+(?:container\\s+)?rm\\b', '\\sworker\\b') },
          {
            label: 'Then docker volume rm queue-data',
            re: 'docker\\s+(?:container\\s+)?rm\\b[^\\n]*\\sworker\\b[\\s\\S]*docker\\s+volume\\s+(?:rm|remove)\\b[^\\n]*\\squeue-data\\b',
          },
          { label: 'No volume rm before the worker is gone', re: '^(?![\\s\\S]*docker\\s+volume\\s+(?:rm|remove)\\b[^\\n]*\\squeue-data\\b[\\s\\S]*docker\\s+(?:container\\s+)?rm\\b[^\\n]*\\sworker\\b)' },
          { label: 'Remove cache with its anonymous volumes (-v)', re: cmd('docker\\s+(?:container\\s+)?rm\\b', '\\s(?:-v|--volumes)(?!\\S)', '\\scache\\b') },
        ],
        hint: 'A volume can’t be removed while any container uses it, even a stopped one.',
        explain: 'Once worker is gone, nothing holds queue-data; rm -v deletes cache together with its unnamed volumes.',
        output: 'worker\nqueue-data\ncache',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    3: {
      body: 'A bind mount puts a folder from your machine into the container. Start the host path with ./ or a full path like C:\\, or use ${PWD}/site in PowerShell; a plain name like site means a named volume. Docker Desktop shares your Windows folders with its Linux VM, so edits on either side show up on the other right away.',
      code: 'docker run -d -p 8080:80 -v ./site:/usr/share/nginx/html nginx\ndocker run -d -p 8081:80 -v ${PWD}/site:/usr/share/nginx/html nginx',
    },
  },
  overrides: {
    'L3.7': {
      kind: 'fill',
      prompt: 'Type what Get-ChildItem prints on your machine.',
      code: 'docker run --rm -v ./out:/out alpine touch /out/report.txt\nGet-ChildItem out -Name\n# prints ___',
      blanks: [{ answer: ['report.txt'] }],
      hint: 'A bind mount works in both directions.',
      explain: 'The container wrote straight into your out folder, which -v created because it didn’t exist yet.',
      output: 'report.txt',
    },
    'L4.6': {
      kind: 'order',
      prompt: 'Make conf with app.ini, mount it read-only, read it inside.',
      lines: [
        'mkdir conf',
        'Set-Content conf/app.ini \'debug=true\'',
        'docker run -d --name web --mount type=bind,src=./conf,dst=/etc/app,readonly nginx',
        'docker exec web cat /etc/app/app.ini',
      ],
      hint: '--mount fails if the host folder doesn’t exist yet.',
      explain: 'Unlike -v, --mount won’t create ./conf for you, so it must exist before docker run. Set-Content writes plain text; in Windows PowerShell 5.1, > writes UTF-16.',
      output: 'debug=true',
    },
    'L3.1': {
      kind: 'build',
      prompt: 'Serve your site folder with nginx on port 8080.',
      answer: ['docker', 'run', '-d', '-p', '8080:80', '-v', '${PWD}/site:/usr/share/nginx/html', 'nginx'],
      alt: [
        ['docker', 'run', '-d', '-v', '${PWD}/site:/usr/share/nginx/html', '-p', '8080:80', 'nginx'],
        ['docker', 'run', '-p', '8080:80', '-d', '-v', '${PWD}/site:/usr/share/nginx/html', 'nginx'],
        ['docker', 'run', '-p', '8080:80', '-v', '${PWD}/site:/usr/share/nginx/html', '-d', 'nginx'],
        ['docker', 'run', '-v', '${PWD}/site:/usr/share/nginx/html', '-d', '-p', '8080:80', 'nginx'],
        ['docker', 'run', '-v', '${PWD}/site:/usr/share/nginx/html', '-p', '8080:80', '-d', 'nginx'],
      ],
      distractors: ['site:/usr/share/nginx/html', '80:8080'],
      hint: 'Host path first, then the folder nginx serves.',
      explain: 'nginx serves /usr/share/nginx/html, which now shows your own site folder. ${PWD} is PowerShell’s current folder, like C:\\Users\\ana\\shop.',
      output: '06fb7e54d85bdb60f22e75df9807b55270911b718b2c51e44c4e9bcec2b62d56',
    },
    'L3.2': {
      kind: 'fill',
      prompt: 'Type the PowerShell variable that holds the current folder.',
      code: 'docker run --rm -v ${___}/notes:/notes alpine ls /notes',
      blanks: [{ answer: ['PWD', 'pwd'] }],
      hint: 'Print working directory.',
      explain: 'In PowerShell, ${PWD} becomes your current folder’s full path, like C:\\Users\\ana\\todo. The braces keep the name apart from the text after it.',
      output: 'todo.txt',
    },
    'L3.4': {
      kind: 'order',
      prompt: 'Make site, start web, then edit the page live.',
      lines: [
        'mkdir site',
        'docker run -d --name web -p 8080:80 -v ./site:/usr/share/nginx/html nginx',
        "Set-Content site/index.html '<h1>Sale!</h1>'",
        'curl.exe http://localhost:8080',
      ],
      hint: 'The folder comes first; the edit happens while web runs.',
      explain: 'web reads your folder directly, so the new page is served without a restart or rebuild. Set-Content writes plain text (echo > in Windows PowerShell writes UTF-16), and curl.exe is the real curl.',
      output: '<h1>Sale!</h1>',
    },
    'boss.10': {
      kind: 'type',
      prompt: 'Mount ./site as nginx’s html folder, read-only.',
      template: 'docker run -d -p 8080:80 ___ nginx',
      accept: [
        '-v ./site:/usr/share/nginx/html:ro',
        '--volume ./site:/usr/share/nginx/html:ro',
        '-v .\\site:/usr/share/nginx/html:ro',
        '-v ${PWD}/site:/usr/share/nginx/html:ro',
        '-v ${PWD}\\site:/usr/share/nginx/html:ro',
        '-v "${PWD}/site:/usr/share/nginx/html:ro"',
        '-v $PWD/site:/usr/share/nginx/html:ro',
        '-v "$PWD/site:/usr/share/nginx/html:ro"',
        '--mount type=bind,src=./site,dst=/usr/share/nginx/html,readonly',
        '--mount type=bind,src=./site,dst=/usr/share/nginx/html,ro',
        '--mount type=bind,source=./site,target=/usr/share/nginx/html,readonly',
        '--mount type=bind,source=./site,target=/usr/share/nginx/html,ro',
      ],
      hint: 'Host path with ./, nginx’s folder, then the read-only option.',
      explain: 'nginx serves your folder but can’t change it. Without ./ you’d get a named volume called site.',
      output: '91a5786bd14911f0842edc51a06f24dada92322bd6205e78c178681a95348937',
    },
  },
};

export default unit;
