import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 6 (Networking).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const RUN = 'docker\\s+(?:container\\s+)?run\\b';
const D = '\\s(?:-[a-zA-Z]*d[a-zA-Z]*|--detach)(?!\\S)';
const image = (i: string) => `\\s${i}(?::[\\w.-]+)?(?!\\S)`;
const name = (n: string) => `\\s--name[\\s=]+${n}(?!\\S)`;
const net = (n: string) => `\\s(?:--network|--net)[\\s=]+${n}(?!\\S)`;
const NET_LS = 'docker\\s+network\\s+(?:ls|list)\\b';

const NET_LS_OUT =
  'NETWORK ID     NAME      DRIVER    SCOPE\n5a6c1d2e3f4b   bridge    bridge    local\n8b7e9f0a1c2d   host      host      local\nc3d4e5f6a7b8   none      null      local';

const unit: DesktopUnit = {
  lessons: [
    // L1 Network basics
    [
      {
        kind: 'write',
        prompt: 'List the networks, then show default-bridge containers can’t find each other by name.',
        starter: '',
        solution: 'docker network ls\ndocker run -d --name menu httpd\ndocker run --rm alpine ping -c 1 menu',
        checks: [
          { label: 'List networks with docker network ls', re: cmd(NET_LS) },
          { label: 'Run a named container in the background', re: cmd(RUN, D, '\\s--name[\\s=]+\\w') },
          {
            label: 'From a second container, ping the first by name',
            re: `--name[\\s=]+([\\w.-]+)[\\s\\S]*${RUN}[^\\n]*\\sping\\b[^\\n]*\\s\\1\\s*(?:\\n|$)`,
          },
          { label: 'Use --rm on the pinging container', re: cmd(RUN, '\\s--rm\\b', '\\sping\\b') },
        ],
        hint: 'No --network means both join the default bridge. ping -c 1 sends one packet.',
        explain: 'The default bridge has no name lookup, so the ping fails with bad address; containers there only reach each other by IP.',
        output: `${NET_LS_OUT}\n9d2f4b6a8c1e3f5a7b9d0c2e4f6a8b1d3c5e7f9a0b2c4d6e8f1a3b5c7d9e0f2a\nping: bad address 'menu'`,
      },
      {
        kind: 'write',
        prompt: 'Find a default-bridge container’s IP address, then ping it by IP.',
        starter: 'docker run -d --name menu httpd\n',
        solution:
          'docker run -d --name menu httpd\ndocker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" menu\ndocker run --rm busybox ping -c 1 172.17.0.2',
        checks: [
          { label: 'docker inspect menu for its IPAddress', re: cmd('docker\\s+(?:container\\s+)?inspect\\b', 'IPAddress', '\\smenu\\b') },
          { label: 'Ping an IPv4 address from a throwaway container', re: cmd(RUN, '\\s--rm\\b', '\\sping\\b[^\\n]*\\s\\d{1,3}(?:\\.\\d{1,3}){3}(?!\\S)') },
          { label: 'Inspect before you ping', re: 'inspect\\b[\\s\\S]*\\sping\\b' },
        ],
        hint: 'The address lives under .NetworkSettings.Networks in docker inspect’s JSON; -f picks it out.',
        explain: 'On the default bridge an IP is the only way between containers, and it can change after a restart: that’s why your own networks are better.',
        output:
          '172.17.0.2\nPING 172.17.0.2 (172.17.0.2): 56 data bytes\n64 bytes from 172.17.0.2: seq=0 ttl=64 time=0.112 ms\n\n--- 172.17.0.2 ping statistics ---\n1 packets transmitted, 1 packets received, 0% packet loss',
      },
    ],
    // L2 Your own network
    [
      {
        kind: 'write',
        prompt: 'Create a games network and run a redis and an nginx container on it.',
        starter: '',
        solution: 'docker network create games\ndocker run -d --name scores --network games redis\ndocker run -d --name lobby --network games nginx',
        checks: [
          { label: 'Create a network called games', re: cmd('docker\\s+network\\s+create\\b', '\\sgames(?!\\S)') },
          { label: 'Run redis on games', re: cmd(RUN, net('games'), image('redis')) },
          { label: 'Run nginx on games', re: cmd(RUN, net('games'), image('nginx')) },
          { label: 'Create the network before the runs', re: `network\\s+create\\b[\\s\\S]*${RUN}` },
        ],
        hint: 'docker run --network games puts a container on that network.',
        explain: 'Both containers are now on games instead of the default bridge, cut off from containers that aren’t.',
        output: '4e1f7a2b9c3d5e6f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f\n3b5d7f9a1c2e\n6c8e0a2b4d1f',
      },
      {
        kind: 'write',
        prompt: 'Put api on a shop bridge network, cut the vault off from every network, then list networks.',
        starter: '',
        solution:
          'docker network create --driver bridge shop\ndocker run -d --name api --network shop shop-api\ndocker run -d --name vault --network none redis\ndocker network ls',
        checks: [
          { label: 'Create shop with --driver bridge', re: cmd('docker\\s+network\\s+create\\b', '\\s(?:--driver|-d)[\\s=]+bridge(?!\\S)', '\\sshop(?!\\S)') },
          { label: 'Run api on shop', re: cmd(RUN, name('api'), net('shop')) },
          { label: 'Run vault with --network none', re: cmd(RUN, name('vault'), net('none')) },
          { label: 'List networks at the end', re: `${RUN}[^\\n]*\\n[\\s\\S]*${NET_LS}` },
        ],
        hint: 'bridge is the default driver; --driver just says it out loud. none is a built-in network.',
        explain: 'api can talk to anything on shop, while vault has only a loopback interface and no way in or out.',
        output: `${NET_LS_OUT}\n7f2a9c4e1b3d   shop      bridge    local`,
      },
    ],
    // L3 Names as hostnames
    [
      {
        kind: 'write',
        prompt: 'On a new network, run traefik/whoami as api and curl it by name from another container.',
        starter: '',
        solution:
          'docker network create shop\ndocker run -d --name api --network shop traefik/whoami\ndocker run --rm --network shop curlimages/curl -s http://api',
        checks: [
          { label: 'Create a network', re: cmd('docker\\s+network\\s+create\\s+[\\w.-]+') },
          { label: 'Run whoami named api on it', re: cmd(RUN, name('api'), '\\s(?:--network|--net)[\\s=]+\\w', image('traefik/whoami')) },
          {
            label: 'curl http://api from a container on the same network',
            re: `network\\s+create\\s+(?:[^\\n]*\\s)?([\\w.-]+)\\s*\\n[\\s\\S]*${RUN}(?=[^\\n]*\\s(?:--network|--net)[\\s=]+\\1(?!\\S))[^\\n]*http://api(?::80)?/?(?!\\S)`,
          },
        ],
        hint: 'curlimages/curl’s entrypoint is curl, so its arguments come right after the image.',
        explain: 'Docker’s DNS on your own network turns the name api into the container’s IP; whoami listens on port 80.',
        output: 'Hostname: 1c3e5a7b9d2f\nIP: 127.0.0.1\nIP: 172.18.0.2\nRemoteAddr: 172.18.0.3:51870\nGET / HTTP/1.1\nHost: api',
      },
      {
        kind: 'write',
        prompt: 'Fix the health check URL, and give orders the extra name backend.',
        starter:
          'docker network create shop\ndocker run -d --name orders --network shop -p 5001:8080 orders-api\ndocker run --rm --network shop curlimages/curl -s http://localhost:5001/health\n',
        solution:
          'docker network create shop\ndocker run -d --name orders --network shop --network-alias backend -p 5001:8080 orders-api\ndocker run --rm --network shop curlimages/curl -s http://orders:8080/health\ndocker run --rm --network shop curlimages/curl -s http://backend:8080/health',
        checks: [
          { label: 'Call http://orders:8080/health', re: cmd(RUN, net('shop'), 'http://orders:8080/health(?!\\S)') },
          { label: 'Add --network-alias backend to orders', re: cmd(RUN, name('orders'), '\\s--network-alias[\\s=]+backend(?!\\S)') },
          { label: 'Call it again as http://backend:8080/health', re: cmd(RUN, net('shop'), 'http://backend:8080/health(?!\\S)') },
          { label: 'No localhost: that means the curl container itself', not: 'localhost' },
        ],
        hint: 'Inside the network, use the container name and the port the app listens on, not the published one.',
        explain: '-p 5001 is for your machine only; containers talk to orders:8080 directly, and the alias works as a second hostname.',
        output: 'Healthy\nHealthy',
      },
    ],
    // L4 Connect & inspect
    [
      {
        kind: 'write',
        prompt: 'Add the running reports container to billing, inspect billing, then detach reports.',
        starter: '',
        solution: 'docker network connect billing reports\ndocker network inspect billing\ndocker network disconnect billing reports',
        checks: [
          { label: 'Connect reports to billing (network first)', re: cmd('docker\\s+network\\s+connect\\b[^\\n]*\\sbilling\\s+reports(?!\\S)') },
          { label: 'Inspect billing', re: cmd('docker\\s+network\\s+inspect\\b', '\\sbilling(?!\\S)') },
          { label: 'Disconnect reports from billing at the end', re: 'network\\s+connect\\b[\\s\\S]*docker\\s+network\\s+disconnect\\b[^\\n]*\\sbilling\\s+reports(?!\\S)' },
        ],
        hint: 'Both commands take the network first, then the container.',
        explain: 'connect adds a second network to a running container; inspect lists it under Containers until you disconnect it.',
        output:
          '[\n    {\n        "Name": "billing",\n        "Driver": "bridge",\n        "Containers": {\n            "2b4d…": {\n                "Name": "reports",\n                "IPv4Address": "172.19.0.3/16"\n            }\n        }\n    }\n]',
      },
      {
        kind: 'write',
        prompt: 'This rm fails. Check who is attached, detach both, then delete the lab network.',
        starter:
          'docker network rm lab\n# Error response from daemon: error while removing network: network lab has active endpoints (name:"db" …)\n# db and worker are still attached to lab\n',
        solution:
          '# db and worker are still attached to lab\ndocker network inspect lab\ndocker network disconnect lab db\ndocker network disconnect lab worker\ndocker network rm lab',
        checks: [
          { label: 'Inspect lab to see its containers', re: cmd('docker\\s+network\\s+inspect\\b', '\\slab(?!\\S)') },
          { label: 'Disconnect db from lab', re: cmd('docker\\s+network\\s+disconnect\\b[^\\n]*\\slab\\s+db(?!\\S)') },
          { label: 'Disconnect worker from lab', re: cmd('docker\\s+network\\s+disconnect\\b[^\\n]*\\slab\\s+worker(?!\\S)') },
          {
            label: 'Remove lab only after both are detached',
            re: '^(?![\\s\\S]*docker\\s+network\\s+(?:rm|remove)\\b[^\\n]*\\slab\\b[\\s\\S]*network\\s+disconnect\\b)[\\s\\S]*disconnect\\b[\\s\\S]*docker\\s+network\\s+(?:rm|remove)\\s+lab(?!\\S)',
          },
        ],
        hint: 'docker network rm refuses while any container, even a stopped one, is still attached.',
        explain: 'Once no endpoints remain, docker network rm can delete lab; db and worker keep any other networks they had.',
        output: '[ … "Containers": { … "Name": "db" … "Name": "worker" … } … ]\nlab',
      },
    ],
    // L5 Reaching the host
    [
      {
        kind: 'write',
        prompt: 'Run an admin panel only your machine can reach on 9000, plus a public site on 8080.',
        starter: '',
        solution:
          'docker run -d --name admin -p 127.0.0.1:9000:80 nginx\ndocker run -d --name site -p 8080:80 nginx\ndocker port admin',
        checks: [
          { label: 'admin: -p 127.0.0.1:9000:80', re: cmd(RUN, name('admin'), '\\s(?:-p|--publish)[\\s=]+127\\.0\\.0\\.1:9000:80(?!\\S)') },
          { label: 'A second site published on every address at 8080', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+(?:0\\.0\\.0\\.0:)?8080:80(?!\\S)') },
          { label: 'Check admin with docker port', re: cmd('docker\\s+(?:container\\s+)?port\\s+admin\\b') },
        ],
        hint: 'Put an address in front of the host port: address:host:container.',
        explain: 'Binding to 127.0.0.1 means only your own machine can open the admin panel; plain 8080:80 listens on every address.',
        output: '80/tcp -> 127.0.0.1:9000',
      },
      {
        kind: 'write',
        prompt: 'Call your machine’s API on port 5000 from a container, then run an agent on the host network.',
        starter: '',
        solution:
          'docker run --rm --add-host=host.docker.internal:host-gateway curlimages/curl -s http://host.docker.internal:5000/health\ndocker run -d --name agent --network host prom/node-exporter',
        checks: [
          { label: 'curl http://host.docker.internal:5000', re: cmd(RUN, 'http://host\\.docker\\.internal:5000\\b') },
          { label: 'Add host-gateway so it works on Linux too', re: cmd(RUN, '\\s--add-host[\\s=]+host\\.docker\\.internal[:=]host-gateway(?!\\S)') },
          { label: 'Run the agent with --network host', re: cmd(RUN, D, net('host')) },
          {
            label: 'No -p with host networking',
            re: '^(?![\\s\\S]*--network[\\s=]+host\\b[^\\n]*\\s(?:-p|--publish)\\s)(?![\\s\\S]*\\s(?:-p|--publish)\\s[^\\n]*--network[\\s=]+host\\b)',
          },
        ],
        hint: 'host.docker.internal is your machine as seen from a container. Host networking shares your ports directly.',
        explain: 'Docker Desktop defines host.docker.internal for you; --add-host makes Linux Docker Engine do the same.',
        output: 'Healthy',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    5: {
      body: 'A plain -p 8080:80 listens on every address your machine has, so other devices can connect too; -p 127.0.0.1:8080:80 keeps it to your machine. --network host shares your machine’s network, so no -p is needed (Docker Desktop: turn on host networking under Settings → Resources → Network). From a container, host.docker.internal reaches your machine (Linux Docker Engine needs --add-host=host.docker.internal:host-gateway). A backtick ` at the end of a line continues a PowerShell command.',
      code: 'docker run -d -p 127.0.0.1:8080:80 nginx\ndocker run -d --network host nginx\ndocker run --rm --add-host=host.docker.internal:host-gateway `\n  curlimages/curl -s http://host.docker.internal:5000/health',
    },
  },
  overrides: {
    'L5.5': {
      kind: 'fill',
      prompt: 'Linux engine: type the value that maps to your machine.',
      code: 'docker run --rm --add-host=host.docker.internal:___ `\n  curlimages/curl -s http://host.docker.internal:5000/health',
      blanks: [{ answer: ['host-gateway'] }],
      hint: 'A special word: the host’s gateway.',
      explain: 'Docker swaps host-gateway for the host’s IP on the bridge, so the app must listen on more than 127.0.0.1.',
      output: 'Healthy',
    },
  },
};

export default unit;
