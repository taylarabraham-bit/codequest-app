import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 7 (Docker Compose).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A line inside service `name`'s block (indented deeper than the name) that matches `body`. Use with flag m. */
const svc = (name: string, body: string) =>
  `^( +)${name}:[ \\t]*\\n(?:\\1[ \\t]+[^\\n]*\\n|[ \\t]*\\n)*?\\1[ \\t]+${body}`;
/** A key under a top-level section such as volumes:. Use with flag m. */
const top = (section: string, key: string) => `^${section}:[ \\t]*\\n(?:[ \\t]+[^\\n]*\\n|[ \\t]*\\n)*?[ \\t]+${key}:`;
/** A `- "host:container"` list item, quotes optional. */
const port = (p: string) => `-[ \\t]*["']?${p}["']?[ \\t]*$`;
/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const DC = 'docker\\s+compose\\s+';
const NO_TABS = { label: 'Indent with spaces, never tabs', re: '^[^\\t]*$' };

const unit: DesktopUnit = {
  lessons: [
    // L1 compose.yaml
    [
      {
        kind: 'write',
        prompt: 'Describe a monitoring app: a grafana service and a prometheus service.',
        starter: '',
        solution: 'services:\n  grafana:\n    image: grafana/grafana\n  prometheus:\n    image: prom/prometheus',
        checks: [
          { label: 'Start with services:', re: '^services:[ \\t]*$', flags: 'm' },
          { label: 'A service that runs grafana/grafana', re: svc('[\\w.-]+', 'image:[ \\t]*["\']?grafana/grafana(?::[\\w.-]+)?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'A service that runs prom/prometheus', re: svc('[\\w.-]+', 'image:[ \\t]*["\']?prom/prometheus(?::[\\w.-]+)?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'No version: line', not: 'version:' },
          NO_TABS,
        ],
        hint: 'Each service name sits one level under services:, and its image: one level deeper.',
        explain: 'Compose reads the indentation to see that each image belongs to its service; the version: key is obsolete.',
        output:
          '[+] Running 3/3\n ✔ Network monitor_default         Created\n ✔ Container monitor-prometheus-1  Started\n ✔ Container monitor-grafana-1     Started',
      },
      {
        kind: 'write',
        prompt: 'Fix this compose.yaml: drop the version line and repair the indentation.',
        starter: 'version: "3.8"\nservices:\nweb:\n  image: nginx:alpine\n  queue:\n  image: rabbitmq:4-management\n',
        solution: 'services:\n  web:\n    image: nginx:alpine\n  queue:\n    image: rabbitmq:4-management',
        checks: [
          { label: 'Remove the version: line', not: 'version:' },
          { label: 'web is indented under services:', re: '^services:[ \\t]*\\n(?:[ \\t]+[^\\n]*\\n|[ \\t]*\\n)*? +web:', flags: 'm' },
          { label: 'web’s image is indented under web', re: svc('web', 'image:[ \\t]*nginx:alpine[ \\t]*$'), flags: 'm' },
          { label: 'queue’s image is indented under queue', re: svc('queue', 'image:[ \\t]*rabbitmq:4-management[ \\t]*$'), flags: 'm' },
          NO_TABS,
        ],
        hint: 'Two spaces for each service name, four for its image.',
        explain: 'At the same depth, queue and its image were siblings, so queue had no image at all.',
        output: '[+] Running 3/3\n ✔ Network app_default    Created\n ✔ Container app-queue-1  Started\n ✔ Container app-web-1    Started',
      },
    ],
    // L2 Up & down
    [
      {
        kind: 'write',
        prompt: 'Start the stack in the background, list it, open a shell in web, then tear down.',
        starter: '',
        solution: 'docker compose up -d\ndocker compose ps\ndocker compose exec web sh\nexit\ndocker compose down',
        checks: [
          { label: 'Start everything in the background', re: cmd(`${DC}up\\b`, '\\s(?:-d|--detach)(?!\\S)') },
          { label: 'List the services with ps', re: cmd(`${DC}ps\\b`) },
          { label: 'Open a shell in the web service with exec', re: cmd(`${DC}exec\\b[^\\n]*\\sweb\\s+(?:sh|bash)\\b`) },
          { label: 'Finish with docker compose down', re: `${DC}down\\b[^\\n]*\\s*$` },
          { label: 'Use docker compose, not docker-compose', not: 'docker-compose' },
        ],
        hint: 'These all take service names from compose.yaml, not container names.',
        explain: 'up -d starts every service, exec reaches into one, and down removes the containers and the network Compose made.',
        output:
          '[+] Running 3/3\n ✔ Network shop_default    Created\n ✔ Container shop-db-1     Started\n ✔ Container shop-web-1    Started\nNAME         IMAGE          SERVICE   STATUS         PORTS\nshop-db-1    mongo:8        db        Up 2 seconds   27017/tcp\nshop-web-1   nginx:alpine   web       Up 2 seconds   80/tcp',
      },
      {
        kind: 'write',
        prompt: 'The worker keeps failing: check status, read its last 50 lines, restart it, follow it.',
        starter: 'docker compose up -d\n',
        solution: 'docker compose up -d\ndocker compose ps -a\ndocker compose logs --tail 50 worker\ndocker compose restart worker\ndocker compose logs -f worker',
        checks: [
          { label: 'Check the status with ps', re: cmd(`${DC}ps\\b`) },
          { label: 'The worker’s last 50 log lines', re: cmd(`${DC}logs\\b`, '\\s(?:--tail|-n)[\\s=]+50(?!\\S)', '\\sworker(?!\\S)') },
          { label: 'Restart only the worker', re: cmd(`${DC}restart\\b`, '\\sworker(?!\\S)') },
          { label: 'Then follow its logs with -f', re: `restart\\b[\\s\\S]*${DC}logs\\b(?=[^\\n]*\\s(?:-f|--follow)(?!\\S))[^\\n]*\\sworker(?!\\S)` },
        ],
        hint: 'Name the service at the end of each command, or Compose acts on all of them.',
        explain: 'logs and restart scoped to one service let you debug the worker without touching the rest of the app.',
        output: 'shop-worker-1  | Connecting to queue:5672…\nshop-worker-1  | Connected. Waiting for jobs.',
      },
    ],
    // L3 Build & ports
    [
      {
        kind: 'write',
        prompt: 'Build site from ./frontend on 3000:3000 and api from ./backend on 5000:8080.',
        starter: '',
        solution:
          'services:\n  site:\n    build: ./frontend\n    ports:\n      - "3000:3000"\n  api:\n    build: ./backend\n    ports:\n      - "5000:8080"',
        checks: [
          { label: 'site builds from ./frontend', re: svc('site', 'build:[ \\t]*["\']?(?:\\./)?frontend/?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'site publishes "3000:3000"', re: svc('site', 'ports:[ \\t]*\\n(?:[ \\t]*-[^\\n]*\\n)*?[ \\t]+' + port('3000:3000')), flags: 'm' },
          { label: 'api builds from ./backend', re: svc('api', 'build:[ \\t]*["\']?(?:\\./)?backend/?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'api publishes "5000:8080"', re: svc('api', 'ports:[ \\t]*\\n(?:[ \\t]*-[^\\n]*\\n)*?[ \\t]+' + port('5000:8080')), flags: 'm' },
        ],
        hint: 'build: takes the folder with the Dockerfile. ports: is a list, one - "host:container" per line.',
        explain: 'Compose builds each image from its folder, then publishes the ports just like docker run -p.',
        output:
          '[+] Building 2/2\n ✔ site  Built\n ✔ api   Built\n[+] Running 3/3\n ✔ Network app_default   Created\n ✔ Container app-api-1   Started\n ✔ Container app-site-1  Started',
      },
      {
        kind: 'write',
        prompt: 'Fix shop: build it from ./shop, host port 5000 to its 8080, and add a redis cache.',
        starter: 'services:\n  shop:\n    image: ./shop\n    ports: 8080:5000\n',
        solution: 'services:\n  shop:\n    build: ./shop\n    ports:\n      - "5000:8080"\n  cache:\n    image: redis:8',
        checks: [
          { label: 'shop uses build: ./shop', re: svc('shop', 'build:[ \\t]*["\']?(?:\\./)?shop/?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'image: is for registry images, not folders', not: 'image: ./shop' },
          { label: 'ports as a list with "5000:8080"', re: svc('shop', 'ports:[ \\t]*\\n(?:[ \\t]*-[^\\n]*\\n)*?[ \\t]+' + port('5000:8080')), flags: 'm' },
          { label: 'Host port first, not 8080:5000', not: '8080:5000' },
          { label: 'A second service running redis', re: svc('(?!shop:)[\\w.-]+', 'image:[ \\t]*["\']?redis(?::[\\w.-]+)?["\']?[ \\t]*$'), flags: 'm' },
        ],
        hint: 'The app listens on 8080 inside, so that number goes on the right.',
        explain: 'build: points at a folder with a Dockerfile; ports: is a list of host:container strings, host first.',
        output:
          '[+] Building 1/1\n ✔ shop  Built\n[+] Running 3/3\n ✔ Network shop_default    Created\n ✔ Container shop-cache-1  Started\n ✔ Container shop-shop-1   Started',
      },
    ],
    // L4 Volumes & services
    [
      {
        kind: 'write',
        prompt: 'Keep a leaderboard’s redis data in a named volume at /data, and declare it.',
        starter: '',
        solution:
          'services:\n  board:\n    build: .\n    ports:\n      - "8080:8080"\n  scores:\n    image: redis:8\n    volumes:\n      - scores-data:/data\nvolumes:\n  scores-data:',
        checks: [
          { label: 'A redis service', re: svc('[\\w.-]+', 'image:[ \\t]*["\']?redis(?::[\\w.-]+)?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'Mount a named volume at /data', re: '^[ \\t]+-[ \\t]*["\']?[a-zA-Z][\\w.-]*:/data["\']?[ \\t]*$', flags: 'm' },
          {
            label: 'Declare that volume under a top-level volumes:',
            re: '^[ \\t]+-[ \\t]*["\']?([a-zA-Z][\\w.-]*):/data["\']?[ \\t]*\\n[\\s\\S]*^volumes:[ \\t]*\\n(?:[ \\t]+[^\\n]*\\n|[ \\t]*\\n)*?[ \\t]+\\1:',
            flags: 'm',
          },
        ],
        hint: 'Under the service: volumes: - name:/data. At the bottom, with no indent: volumes: then the name with a colon.',
        explain: 'The top-level entry creates the volume, so the scores survive docker compose down (but not down -v).',
        output: '[+] Running 4/4\n ✔ Network board_default      Created\n ✔ Volume board_scores-data   Created\n ✔ Container board-scores-1   Started\n ✔ Container board-board-1    Started',
      },
      {
        kind: 'write',
        prompt: 'Compose rejects this file. Declare its volume, and add a mongo db with its own.',
        starter:
          'services:\n  wiki:\n    image: nginx:alpine\n    volumes:\n      - ./pages:/usr/share/nginx/html:ro\n  search:\n    image: redis:8\n    volumes:\n      - search-data:/data\n',
        solution:
          'services:\n  wiki:\n    image: nginx:alpine\n    volumes:\n      - ./pages:/usr/share/nginx/html:ro\n  search:\n    image: redis:8\n    volumes:\n      - search-data:/data\n  db:\n    image: mongo:8\n    volumes:\n      - wiki-db:/data/db\nvolumes:\n  search-data:\n  wiki-db:',
        checks: [
          { label: 'Declare search-data under top-level volumes:', re: top('volumes', 'search-data'), flags: 'm' },
          { label: 'A service running mongo', re: svc('[\\w.-]+', 'image:[ \\t]*["\']?mongo(?::[\\w.-]+)?["\']?[ \\t]*$'), flags: 'm' },
          {
            label: 'mongo keeps /data/db in a declared named volume',
            re: '^[ \\t]+-[ \\t]*["\']?([a-zA-Z][\\w.-]*):/data/db["\']?[ \\t]*\\n[\\s\\S]*^volumes:[ \\t]*\\n(?:[ \\t]+[^\\n]*\\n|[ \\t]*\\n)*?[ \\t]+\\1:',
            flags: 'm',
          },
          { label: 'Keep the ./pages bind mount', has: '- ./pages:/usr/share/nginx/html:ro' },
        ],
        hint: 'Bind mounts (./pages) need no declaring; every named volume does.',
        explain: 'Compose stops with “refers to undefined volume” until each named volume is listed at the top level.',
        output:
          '[+] Running 6/6\n ✔ Network wiki_default       Created\n ✔ Volume wiki_search-data    Created\n ✔ Volume wiki_wiki-db        Created\n ✔ Container wiki-search-1    Started\n ✔ Container wiki-db-1        Started\n ✔ Container wiki-wiki-1      Started',
      },
    ],
    // L5 Startup order
    [
      {
        kind: 'write',
        prompt: 'Make web start after api, and api start after cache.',
        starter: '',
        solution:
          'services:\n  web:\n    image: nginx:alpine\n    depends_on:\n      - api\n  api:\n    build: ./api\n    depends_on:\n      - cache\n  cache:\n    image: redis:8',
        checks: [
          { label: 'web depends_on api', re: svc('web', 'depends_on:[ \\t]*\\n(?:[ \\t]*-[^\\n]*\\n)*?[ \\t]+-[ \\t]*api[ \\t]*$'), flags: 'm' },
          { label: 'api depends_on cache', re: svc('api', 'depends_on:[ \\t]*\\n(?:[ \\t]*-[^\\n]*\\n)*?[ \\t]+-[ \\t]*cache[ \\t]*$'), flags: 'm' },
          { label: 'A cache service running redis', re: svc('cache', 'image:[ \\t]*["\']?redis(?::[\\w.-]+)?["\']?[ \\t]*$'), flags: 'm' },
          { label: 'api has an image or a build', re: svc('api', '(?:image|build):[ \\t]*\\S'), flags: 'm' },
        ],
        hint: 'depends_on: is a list of service names under the service that has to wait.',
        explain: 'Compose starts cache, then api, then web; the short form only orders startup, it doesn’t wait for ready.',
        output:
          '[+] Running 4/4\n ✔ Network app_default    Created\n ✔ Container app-cache-1  Started\n ✔ Container app-api-1    Started\n ✔ Container app-web-1    Started',
      },
      {
        kind: 'write',
        prompt: 'Make orders wait until RabbitMQ is healthy, checked with rabbitmq-diagnostics ping.',
        starter: 'services:\n  orders:\n    build: .\n    depends_on:\n      - queue\n  queue:\n    image: rabbitmq:4-management\n',
        solution:
          'services:\n  orders:\n    build: .\n    depends_on:\n      queue:\n        condition: service_healthy\n  queue:\n    image: rabbitmq:4-management\n    healthcheck:\n      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]\n      interval: 10s\n      retries: 5',
        checks: [
          { label: 'Long form: queue: with condition: service_healthy', re: svc('orders', 'depends_on:[ \\t]*\\n[ \\t]+queue:[ \\t]*\\n[ \\t]+condition:[ \\t]*service_healthy\\b'), flags: 'm' },
          {
            label: 'queue has a healthcheck test running rabbitmq-diagnostics ping',
            re: svc('queue', 'healthcheck:[ \\t]*\\n(?:[^\\n]*\\n)*?[ \\t]+test:[^\\n]*rabbitmq-diagnostics[^\\n]*\\bping\\b'),
            flags: 'm',
          },
          { label: 'Set an interval', re: '^[ \\t]+interval:[ \\t]*\\d+(?:ms|s|m)[ \\t]*$', flags: 'm' },
          { label: 'Set retries', re: '^[ \\t]+retries:[ \\t]*\\d+[ \\t]*$', flags: 'm' },
          { label: 'Replace the short - queue form', not: '- queue' },
        ],
        hint: 'test can be a list like ["CMD", "program", "arg"]. The condition goes under queue: inside depends_on.',
        explain: 'Now orders only starts once queue’s healthcheck passes, not just when its container has started.',
        output:
          '[+] Running 3/3\n ✔ Network shop_default     Created\n ✔ Container shop-queue-1   Healthy\n ✔ Container shop-orders-1  Started',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L3.5': {
      kind: 'order',
      prompt: 'Rebuild and start, check the ports, then call the API.',
      lines: ['docker compose up -d --build', 'docker compose ps', 'curl.exe http://localhost:5000/pets'],
      hint: 'You can only call what’s running.',
      explain: 'ps shows 0.0.0.0:5000->8080/tcp for api, so the host reaches it on port 5000. In Windows PowerShell, curl.exe is the real curl; plain curl is Invoke-WebRequest.',
      output: '[{"id":1,"name":"Rex"},{"id":2,"name":"Miso"}]',
    },
    'L3.7': {
      kind: 'build',
      prompt: 'api has ports "5000:8080". Call it from your machine.',
      answer: ['curl.exe', 'http://localhost', ':5000'],
      distractors: [':8080', 'http://api'],
      hint: 'From the host, use the host side of the mapping.',
      explain: 'Your machine only sees published ports, so it’s localhost:5000. The name api only works between containers.',
      output: 'Pets API is up',
    },
  },
};

export default unit;
