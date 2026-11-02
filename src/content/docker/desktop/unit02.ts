import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 2 (Running containers).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const RUN = 'docker\\s+(?:container\\s+)?run\\b';
/** -d, also inside grouped flags like -dp or -itd. */
const D = '\\s(?:-[a-zA-Z]*d[a-zA-Z]*|--detach)(?!\\S)';
const IT = '\\s(?:-[a-zA-Z]*(?:it|ti)[a-zA-Z]*)(?!\\S)';
const name = (n: string) => `\\s--name[\\s=]+${n}(?!\\S)`;
const image = (i: string) => `\\s${i}(?::[\\w.-]+)?(?!\\S)`;
const PS = 'docker\\s+(?:ps|container\\s+(?:ls|ps|list))\\b';
const ALL = '\\s(?:-a|--all)\\b';
const LOGS = 'docker\\s+(?:container\\s+)?logs\\b';

const unit: DesktopUnit = {
  lessons: [
    // L1 Detached & named
    [
      {
        kind: 'write',
        prompt: 'Start a background redis container called cache, then list running containers.',
        starter: '',
        solution: 'docker run -d --name cache redis\ndocker ps',
        checks: [
          { label: 'Run redis in the background with -d', re: cmd(RUN, D, image('redis')) },
          { label: 'Name it cache with --name', re: cmd(RUN, name('cache')) },
          { label: 'List running containers with docker ps', re: cmd(PS) },
        ],
        hint: 'Flags go between run and the image name. docker ps lists what’s running.',
        explain: '-d hands your terminal back right away, and the name cache is easier to use later than the long ID.',
        output:
          '0c7e1f3a9b2d4e6f8a1c3e5b7d9f1a2c4e6b8d0f2a4c6e8b1d3f5a7c9e1b3d5f\nCONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS      NAMES\n0c7e1f3a9b2d   redis     "docker-entrypoint.s…"   2 seconds ago   Up 1 second    6379/tcp   cache',
      },
      {
        kind: 'write',
        prompt: 'Run a bookshop’s web server and cache in the background, named, then list them.',
        starter: '# bookshop: an httpd web server and a redis cache\n',
        solution: '# bookshop: an httpd web server and a redis cache\ndocker run -d --name shop-web httpd\ndocker run -d --name shop-cache redis\ndocker ps',
        checks: [
          { label: 'Run httpd in the background', re: cmd(RUN, D, image('httpd')) },
          { label: 'Give httpd a name', re: cmd(RUN, image('httpd'), '\\s--name[\\s=]+\\w') },
          { label: 'Run redis in the background', re: cmd(RUN, D, image('redis')) },
          { label: 'Give redis a name', re: cmd(RUN, image('redis'), '\\s--name[\\s=]+\\w') },
          { label: 'List them with docker ps at the end', re: `${RUN}[^\\n]*\\n[\\s\\S]*${PS}` },
        ],
        hint: 'One docker run -d --name … line per container, then docker ps.',
        explain: 'Each container gets its own name, so later commands like docker stop shop-web can target it.',
        output:
          'CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS      NAMES\n5d2a8c1e7f3b   redis     "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   6379/tcp   shop-cache\n9b4e0f6a2c8d   httpd     "httpd-foreground"       4 seconds ago   Up 3 seconds   80/tcp     shop-web',
      },
    ],
    // L2 Publishing ports
    [
      {
        kind: 'write',
        prompt: 'Run httpd in the background as docs on host port 8081, then show its ports.',
        starter: '',
        solution: 'docker run -d --name docs -p 8081:80 httpd\ndocker port docs',
        checks: [
          { label: 'Run httpd in the background named docs', re: cmd(RUN, D, name('docs'), image('httpd')) },
          { label: 'Publish host port 8081 to container port 80', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+8081:80(?!\\S)') },
          { label: 'Show the mappings with docker port docs', re: cmd('docker\\s+(?:container\\s+)?port\\s+docs\\b') },
        ],
        hint: '-p takes host:container. httpd listens on port 80 inside.',
        explain: 'The host port comes first, so localhost:8081 on your machine reaches port 80 in the container.',
        output: '80/tcp -> 0.0.0.0:8081\n80/tcp -> [::]:8081',
      },
      {
        kind: 'write',
        prompt: 'Fix the ports: Grafana on host 3000, the nginx site on host 8082.',
        starter: 'docker run -d --name dash -p 3000 grafana/grafana\ndocker run -d --name site -p 80:8082 nginx\n',
        solution: 'docker run -d --name dash -p 3000:3000 grafana/grafana\ndocker run -d --name site -p 8082:80 nginx\ndocker port site',
        checks: [
          { label: 'Grafana: host 3000 to container 3000', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+3000:3000(?!\\S)', image('grafana/grafana')) },
          { label: 'nginx: host 8082 to container 80', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+8082:80(?!\\S)', image('nginx')) },
          { label: 'Host port first, not 80:8082', not: '80:8082' },
          { label: 'Check the site with docker port', re: cmd('docker\\s+(?:container\\s+)?port\\s+site\\b') },
        ],
        hint: 'Grafana listens on 3000 and nginx on 80 inside their containers. Host side goes first.',
        explain: '-p 3000 alone picks a random host port, and 80:8082 points at a port nginx never opens.',
        output: '80/tcp -> 0.0.0.0:8082\n80/tcp -> [::]:8082',
      },
    ],
    // L3 Stop, start, remove
    [
      {
        kind: 'write',
        prompt: 'Stop blog, list all containers, start it again, then delete it while running.',
        starter: '',
        solution: 'docker stop blog\ndocker ps -a\ndocker start blog\ndocker rm -f blog',
        checks: [
          { label: 'Stop blog', re: cmd('docker\\s+(?:container\\s+)?stop\\s+blog\\b') },
          { label: 'List all containers, stopped too', re: cmd(PS, ALL) },
          { label: 'Start blog again after stopping it', re: 'stop\\s+blog\\b[\\s\\S]*docker\\s+(?:container\\s+)?start\\s+blog\\b' },
          { label: 'Force-remove the running blog', re: cmd('docker\\s+(?:container\\s+)?rm\\b', '\\s(?:-f|--force)\\b', '\\sblog\\b') },
        ],
        hint: 'docker ps alone hides stopped containers. rm needs -f while a container runs.',
        explain: 'stop and start keep the same container; rm -f stops and deletes it in one step.',
        output: 'blog\nCONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS                     PORTS     NAMES\n7a3c9e1b5d2f   nginx     "/docker-entrypoint.…"   10 minutes ago   Exited (0) 2 seconds ago             blog\nblog\nblog',
      },
      {
        kind: 'write',
        prompt: 'Replace the old api container with a fresh one that deletes itself once stopped.',
        starter: '# api is running an old build of the shop-api image on port 5000\n',
        solution:
          '# api is running an old build of the shop-api image on port 5000\ndocker rm -f api\ndocker run -d --rm --name api -p 5000:8080 shop-api\ndocker ps',
        checks: [
          {
            label: 'Remove the old api first (rm -f, or stop then rm)',
            re: '(?:rm\\s+(?:-f|--force)\\s+api|rm\\s+api\\s+(?:-f|--force)|stop\\s+api\\b[\\s\\S]*\\brm\\s+api)\\b[\\s\\S]*docker\\s+(?:container\\s+)?run\\b',
          },
          { label: 'Run shop-api in the background named api', re: cmd(RUN, D, name('api'), image('shop-api')) },
          { label: 'Add --rm so it deletes itself on stop', re: cmd(RUN, '\\s--rm\\b') },
          { label: 'Publish port 5000', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+5000:\\d+(?!\\S)') },
        ],
        hint: 'A name can only be used once, so the old container has to go before the new run.',
        explain: 'Removing first frees the name api, and --rm means the next docker stop also cleans the container up.',
        output: 'api\n3e8b1d5f7a9c2e4b6d8f0a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b\nCONTAINER ID   IMAGE      COMMAND           CREATED         STATUS         PORTS                                         NAMES\n3e8b1d5f7a9c   shop-api   "dotnet Api.dll"  2 seconds ago   Up 1 second    0.0.0.0:5000->8080/tcp, [::]:5000->8080/tcp   api',
      },
    ],
    // L4 Shells & exec
    [
      {
        kind: 'write',
        prompt: 'Open bash in a throwaway ubuntu:24.04 container, read the OS name, then leave.',
        starter: '',
        solution: 'docker run -it --rm ubuntu:24.04 bash\ncat /etc/os-release\nexit',
        checks: [
          { label: 'Run ubuntu:24.04 interactively with -it', re: cmd(RUN, IT, '\\subuntu:24\\.04\\s+(?:bash|sh)\\b') },
          { label: 'Use --rm so it is deleted afterwards', re: cmd(RUN, '\\s--rm\\b') },
          { label: 'Print /etc/os-release inside', re: '\\n\\s*cat\\s+/etc/os-release\\b' },
          { label: 'Leave with exit', re: '\\n\\s*exit\\s*$' },
        ],
        hint: 'The command after the image (bash) replaces its default. -i keeps input open, -t adds a terminal.',
        explain: 'Lines after docker run are typed into the container’s shell; exit ends bash, and --rm deletes the container.',
        output: 'root@4b2e8d1f6a3c:/# cat /etc/os-release\nPRETTY_NAME="Ubuntu 24.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nroot@4b2e8d1f6a3c:/# exit',
      },
      {
        kind: 'write',
        prompt: 'Run nginx in the background, open a shell in it and list its site folder.',
        starter: '',
        solution: 'docker run -d --name site -p 8080:80 nginx\ndocker exec -it site sh\nls /usr/share/nginx/html\nexit',
        checks: [
          { label: 'Run nginx in the background with a name', re: cmd(RUN, D, '\\s--name[\\s=]+\\w', image('nginx')) },
          {
            label: 'docker exec -it a shell in that same container',
            re: `--name[\\s=]+([\\w.-]+)[\\s\\S]*docker\\s+(?:container\\s+)?exec\\b(?=[^\\n]*${IT})[^\\n]*\\s\\1\\s+(?:sh|bash)\\b`,
          },
          { label: 'List /usr/share/nginx/html', re: '\\n\\s*ls\\b[^\\n]*\\s/usr/share/nginx/html/?\\s*(?:\\n|$)' },
          { label: 'Leave with exit', re: '\\n\\s*exit\\s*$' },
        ],
        hint: 'docker exec -it <name> sh opens a shell in a container that is already running.',
        explain: 'exec runs an extra process in a running container; leaving that shell doesn’t stop nginx.',
        output: '# ls /usr/share/nginx/html\n50x.html  index.html\n# exit',
      },
    ],
    // L5 Reading logs
    [
      {
        kind: 'write',
        prompt: 'Run nginx in the background, then show its last 5 log lines with timestamps.',
        starter: '',
        solution: 'docker run -d --name web -p 8080:80 nginx\ndocker logs --tail 5 -t web',
        checks: [
          { label: 'Run nginx in the background with a name', re: cmd(RUN, D, '\\s--name[\\s=]+\\w', image('nginx')) },
          { label: 'Only the last 5 lines with --tail 5', re: cmd(LOGS, '\\s(?:--tail|-n)[\\s=]+5(?!\\S)') },
          { label: 'Add timestamps with -t', re: cmd(LOGS, '\\s(?:-t|--timestamps)(?!\\S)') },
          { label: 'Read the logs of that same container', re: '--name[\\s=]+([\\w.-]+)[\\s\\S]*docker\\s+(?:container\\s+)?logs\\b[^\\n]*\\s\\1\\s*(?:\\n|$)' },
        ],
        hint: 'docker logs takes its options first, then the container name.',
        explain: '--tail limits the output to the newest lines, and -t prefixes each one with when it was written.',
        output:
          '2026-10-30T09:14:03.512Z /docker-entrypoint.sh: Configuration complete; ready for start up\n2026-10-30T09:14:03.540Z 2026/10/30 09:14:03 [notice] 1#1: nginx/1.29.2\n2026-10-30T09:14:03.540Z 2026/10/30 09:14:03 [notice] 1#1: OS: Linux 6.6.87.2-microsoft-standard-WSL2\n2026-10-30T09:14:03.541Z 2026/10/30 09:14:03 [notice] 1#1: start worker processes\n2026-10-30T09:14:03.541Z 2026/10/30 09:14:03 [notice] 1#1: start worker process 29',
      },
      {
        kind: 'write',
        prompt: 'The api keeps crashing: check its status, read recent logs, then follow it live.',
        starter: '',
        solution: 'docker ps -a\ndocker logs --since 10m api\ndocker logs -f --tail 20 api',
        checks: [
          { label: 'Check its status with docker ps -a', re: cmd(PS, ALL) },
          { label: 'Logs from the last 10 minutes with --since 10m', re: cmd(LOGS, '\\s--since[\\s=]+10m(?!\\S)', '\\sapi\\b') },
          { label: 'Follow new lines with -f', re: cmd(LOGS, '\\s(?:-f|--follow)(?!\\S)', '\\sapi\\b') },
          { label: 'Start following from the last 20 lines', re: cmd(LOGS, '\\s(?:-f|--follow)(?!\\S)', '\\s(?:--tail|-n)[\\s=]+20(?!\\S)') },
        ],
        hint: 'A crashed container is stopped, so plain docker ps won’t show it. Ctrl+C ends -f.',
        explain: 'ps -a shows the exit code, --since narrows the history, and -f with --tail streams new lines without flooding you.',
        output:
          'CONTAINER ID   IMAGE      COMMAND            CREATED          STATUS                     PORTS     NAMES\n2f9d4b6e8a1c   shop-api   "dotnet Api.dll"   12 minutes ago   Exited (139) 1 minute ago            api\nfail: Microsoft.Extensions.Hosting.Internal.Host[11]\n      Hosting failed to start',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L5.5': {
      kind: 'order',
      prompt: 'Run web, visit it, read that visit’s log line, clean up.',
      lines: [
        'docker run -d --name web -p 8080:80 nginx',
        'curl.exe http://localhost:8080',
        'docker logs --tail 1 web',
        'docker rm -f web',
      ],
      hint: 'The log line exists only after the visit.',
      explain: 'Each request nginx serves becomes one access line, so --tail 1 shows your visit. In Windows PowerShell type curl.exe, since plain curl is Invoke-WebRequest.',
      output: '172.17.0.1 - - [12/Oct/2026:09:15:22 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0" "-"',
    },
  },
};

export default unit;
