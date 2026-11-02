import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 11 (Debugging & best practices).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source for a Go template field such as {{.State.Status}}, spaces allowed inside the braces. */
const tpl = (field: string) => `\\{\\{\\s*${field.replace(/\./g, '\\.')}\\s*\\}\\}`;

const unit: DesktopUnit = {
  lessons: [
    // L1 Inspect & format
    [
      {
        kind: 'write',
        prompt: 'Inspect the pantry container: print its status, its image and its mounts as JSON.',
        starter: '',
        solution:
          "docker inspect -f '{{.State.Status}}' pantry\ndocker inspect -f '{{.Config.Image}}' pantry\ndocker inspect -f '{{json .Mounts}}' pantry",
        checks: [
          { label: 'Use docker inspect with -f (or --format)', re: 'docker\\s+(container\\s+)?inspect\\s+(-f|--format)[\\s=]' },
          { label: 'The status from {{.State.Status}}', re: tpl('.State.Status') },
          { label: 'The image from {{.Config.Image}}', re: tpl('.Config.Image') },
          { label: 'The mounts as JSON with {{json .Mounts}}', re: '\\{\\{\\s*json\\s+\\.Mounts\\s*\\}\\}' },
          { label: 'Each command names the pantry container', re: '(inspect[^\\n]*\\spantry\\b[\\s\\S]*){3}' },
        ],
        hint: "Wrap each template in single quotes: -f '{{.Some.Field}}', then the container name.",
        explain: 'Field paths follow the JSON that plain docker inspect prints. Adding json in front prints a nested part as JSON instead of Go’s map syntax.',
        output:
          'running\nacme/pantry:2.1\n[{"Type":"volume","Name":"pantry-data","Source":"/var/lib/docker/volumes/pantry-data/_data","Destination":"/data","Driver":"local","Mode":"z","RW":true,"Propagation":""}]',
      },
      {
        kind: 'write',
        prompt: 'Fix both commands: name plus status for api and db, then api’s env as JSON.',
        starter: "docker inspect -f '{{.state.status}}' api db\ndocker inspect -f '{{.Config.Env}}' api",
        solution: "docker inspect -f '{{.Name}} {{.State.Status}}' api db\ndocker inspect -f '{{json .Config.Env}}' api",
        checks: [
          { label: 'Field names are case-sensitive: no .state.status', not: '.state.status' },
          { label: 'Print {{.Name}} and {{.State.Status}} in one template', re: `'[^'\\n]*${tpl('.Name')}[^'\\n]*${tpl('.State.Status')}[^'\\n]*'|'[^'\\n]*${tpl('.State.Status')}[^'\\n]*${tpl('.Name')}[^'\\n]*'` },
          { label: 'Inspect both api and db in that command', re: 'State\\.Status[^\\n]*\\s(api\\s+db|db\\s+api)\\s*$', flags: 'm' },
          { label: 'Print the env with {{json .Config.Env}}', re: '\\{\\{\\s*json\\s+\\.Config\\.Env\\s*\\}\\}' },
        ],
        hint: 'Copy the capitals from docker inspect’s JSON: State, Status, Config. Put json before a field to print it as JSON.',
        explain: 'Templates match the JSON keys exactly, so .state fails with “map has no entry”. One template runs once per container you name.',
        output: '/api running\n/db running\n["ASPNETCORE_HTTP_PORTS=8080","DOTNET_RUNNING_IN_CONTAINER=true","APP_UID=1654"]',
      },
    ],
    // L2 Exit codes
    [
      {
        kind: 'write',
        prompt: 'The importer container died. List it, then print its exit code and OOM flag.',
        starter: '',
        solution: "docker ps -a --filter name=importer\ndocker inspect -f '{{.State.ExitCode}} {{.State.OOMKilled}}' importer",
        checks: [
          { label: 'List stopped containers too with docker ps -a', re: 'docker\\s+(ps|container\\s+ls)\\s+[^\\n]*(-a|--all)\\b' },
          { label: 'Print {{.State.ExitCode}}', re: tpl('.State.ExitCode') },
          { label: 'Print {{.State.OOMKilled}}', re: tpl('.State.OOMKilled') },
          { label: 'Inspect the importer container', re: 'inspect[^\\n]*\\simporter\\s*$', flags: 'm' },
        ],
        hint: 'Plain docker ps hides stopped containers. The fields live under .State.',
        explain: '137 is 128 + 9, a SIGKILL. OOMKilled true says the kernel sent it because the container ran out of memory.',
        output:
          'CONTAINER ID   IMAGE               COMMAND                  CREATED          STATUS                       PORTS     NAMES\n4f2a9c81d3e7   acme/importer:1.4   "dotnet Importer.dll"    12 minutes ago   Exited (137) 2 minutes ago             importer\n137 true',
      },
      {
        kind: 'write',
        prompt: 'Run two named Alpine containers, one exiting 0 and one exiting 3, then compare codes.',
        starter: '',
        solution:
          'docker run --name pass alpine true\ndocker run --name fail alpine sh -c "exit 3"\ndocker inspect -f \'{{.Name}} {{.State.ExitCode}}\' pass fail',
        checks: [
          { label: 'Two docker run commands, each with --name', re: '(docker\\s+(container\\s+)?run\\s[^\\n]*--name[\\s=]+[\\w.-]+[^\\n]*\\balpine\\b[\\s\\S]*){2}' },
          { label: 'One container runs sh -c "exit 3"', re: 'sh\\s+-c\\s+["\']exit\\s+3["\']' },
          { label: 'Leave out --rm so the containers stay to inspect', not: '--rm' },
          { label: 'Inspect both with {{.State.ExitCode}}', re: `inspect[^\\n]*${tpl('.State.ExitCode')}[^\\n]*\\s[\\w.-]+\\s+[\\w.-]+\\s*$`, flags: 'm' },
        ],
        hint: 'true always exits 0. exit is a shell builtin, so run it through sh -c "...".',
        explain: 'The exit code is whatever the main process returns. docker run also passes it on, so $LASTEXITCODE in PowerShell would show 3 too.',
        output: '/pass 0\n/fail 3',
      },
    ],
    // L3 Stats & limits
    [
      {
        kind: 'write',
        prompt: 'Run acme/thumbs:2.0 capped at 256 MB and one CPU, then snapshot its usage.',
        starter: '',
        solution: 'docker run -d --name thumbs --memory 256m --cpus 1 acme/thumbs:2.0\ndocker stats --no-stream thumbs',
        checks: [
          { label: 'Run acme/thumbs:2.0 in the background with -d', re: 'docker\\s+(container\\s+)?run\\s[^\\n]*(-d|--detach)\\b[^\\n]*acme/thumbs:2\\.0' },
          { label: 'Cap memory at 256m', re: '(--memory|-m)[\\s=]+256m\\b' },
          { label: 'Allow one CPU with --cpus', re: '--cpus[\\s=]+["\']?1(\\.0)?\\b(?!\\.)' },
          { label: 'Take one snapshot with docker stats --no-stream', re: 'docker\\s+(container\\s+)?stats\\s[^\\n]*--no-stream' },
        ],
        hint: 'Limits are flags on docker run, before the image. stats needs one flag to stop redrawing.',
        explain: '--memory sets a hard cap, so stats shows 256MiB as the LIMIT. --cpus 1 allows at most one core’s worth of CPU time.',
        output:
          '8c1f4e2b9d7a6c3e5f0b1a2d4c6e8f9a0b3c5d7e9f1a2b4c6d8e0f1a3b5c7d9e\nCONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT   MEM %     NET I/O       BLOCK I/O   PIDS\n8c1f4e2b9d7a   thumbs    2.31%     41.7MiB / 256MiB    16.29%    1.1kB / 0B    0B / 0B     7',
      },
      {
        kind: 'write',
        prompt: 'Recreate worker with 768m of memory and half a CPU, then check both limits.',
        starter: 'docker run -d --name worker acme/worker:1.0\n',
        solution:
          "docker rm -f worker\ndocker run -d --name worker --memory 768m --cpus 0.5 acme/worker:1.0\ndocker inspect -f '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}' worker",
        checks: [
          { label: 'Remove the old worker first with docker rm -f', re: 'docker\\s+(container\\s+)?rm\\s+(-f|--force)\\s+worker\\b[\\s\\S]*docker\\s+(container\\s+)?run' },
          { label: 'Run it again with --memory 768m', re: 'run\\s[^\\n]*(--memory|-m)[\\s=]+768m\\b' },
          { label: 'And --cpus 0.5', re: 'run\\s[^\\n]*--cpus[\\s=]+["\']?0?\\.5\\b' },
          { label: 'Print {{.HostConfig.Memory}}', re: tpl('.HostConfig.Memory') },
          { label: 'Print {{.HostConfig.NanoCpus}}', re: tpl('.HostConfig.NanoCpus') },
        ],
        hint: 'The name worker must be free before you reuse it. Limits live under .HostConfig.',
        explain: '768m is 768 × 1024 × 1024 bytes. --cpus is stored as NanoCpus, billionths of a CPU, so 0.5 becomes 500000000.',
        output:
          'worker\n2b7e9d4c1a3f5e8b0c6d2a9f7e1b4c3d5a8f0e2b6c9d1a4f7e3b5c8d0a2f6e9b\n805306368 500000000',
      },
    ],
    // L4 Restart policies
    [
      {
        kind: 'write',
        prompt: 'Run acme/queue:2.4 so it retries up to 3 times on failure, then check restarts.',
        starter: '',
        solution: "docker run -d --name queue --restart on-failure:3 acme/queue:2.4\ndocker inspect -f '{{.RestartCount}}' queue",
        checks: [
          { label: 'Run acme/queue:2.4 detached and named', re: 'run\\s[^\\n]*(-d|--detach)\\b[^\\n]*acme/queue:2\\.4|run\\s[^\\n]*--name[^\\n]*(-d|--detach)\\b[^\\n]*acme/queue:2\\.4' },
          { label: 'Set --restart on-failure:3', re: '--restart[\\s=]+on-failure:3\\b' },
          { label: 'Give it a --name', re: 'run\\s[^\\n]*--name[\\s=]+[\\w.-]+' },
          { label: 'Print {{.RestartCount}}', re: tpl('.RestartCount') },
        ],
        hint: 'The retry limit goes after a colon in the policy. The counter is a top-level field.',
        explain: 'on-failure only restarts after a non-zero exit, and :3 gives up after three tries. RestartCount says how many it used.',
        output: '5e0a8c3d7f1b9e2a4c6d8f0b1e3a5c7d9f2b4e6a8c0d1f3b5e7a9c2d4f6b8e0a\n0',
      },
      {
        kind: 'write',
        prompt: 'Give each service a restart policy: bot retries 5 times, db always, migrate never.',
        starter:
          'services:\n  bot:\n    image: acme/bot:1.0\n  db:\n    image: postgres:18\n  migrate:\n    image: acme/bot:1.0\n    command: ["dotnet", "Bot.dll", "--migrate"]\n',
        solution:
          'services:\n  bot:\n    image: acme/bot:1.0\n    restart: on-failure:5\n  db:\n    image: postgres:18\n    restart: unless-stopped\n  migrate:\n    image: acme/bot:1.0\n    command: ["dotnet", "Bot.dll", "--migrate"]\n    restart: "no"',
        checks: [
          { label: 'bot: restart: on-failure:5', re: '^([ \\t]+)bot:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+restart:[ \\t]*["\']?on-failure:5\\b', flags: 'm' },
          { label: 'db: restart: unless-stopped (or always)', re: '^([ \\t]+)db:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+restart:[ \\t]*["\']?(unless-stopped|always)\\b', flags: 'm' },
          { label: 'migrate: restart: "no", quoted', re: '^([ \\t]+)migrate:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+restart:[ \\t]*(["\'])no\\2', flags: 'm' },
        ],
        hint: 'restart: goes inside each service. YAML reads a bare no as false, so put quotes around it.',
        explain: 'Compose takes the same policies as --restart. "no" needs quotes because YAML would otherwise turn it into the boolean false.',
      },
    ],
    // L5 Cleaning up
    [
      {
        kind: 'write',
        prompt: 'Check disk use, then clear stopped containers and dangling images only.',
        starter: '',
        solution: 'docker system df\ndocker container prune -f\ndocker image prune -f\ndocker system df',
        checks: [
          { label: 'See the totals with docker system df', has: 'docker system df' },
          { label: 'Clear stopped containers with docker container prune', re: 'docker\\s+container\\s+prune\\b' },
          { label: 'Clear dangling images with docker image prune', re: 'docker\\s+image\\s+prune\\b' },
          { label: 'No -a: keep tagged images', re: '^(?![\\s\\S]*image\\s+prune[^\\n]*\\s(-a\\w*|-\\w+a|--all)\\b)' },
          { label: 'Don’t use system prune, which also clears networks and cache', re: '^(?![\\s\\S]*system\\s+prune)' },
        ],
        hint: 'Each kind has its own prune: docker <kind> prune. -f skips the y/N question.',
        explain: 'Pruning one kind at a time leaves networks and build cache alone. Without -a, image prune only takes untagged leftovers.',
        output:
          'TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          11        3         3.92GB    2.71GB (69%)\nContainers      7         3         61.4MB    58.9MB (95%)\nLocal Volumes   4         2         880MB     212MB (24%)\nBuild Cache     74        0         2.2GB     2.2GB\nDeleted Containers:\n9b2f6c1e4a7d3f8b0e5c2a9d6f1b4e7c3a8d5f2b9e6c1a4d7f0b3e8c5a2d9f6b\n\nTotal reclaimed space: 58.9MB\nDeleted Images:\ndeleted: sha256:7e1c4a9f2d6b3e8c0a5f1d7b4e9c2a6f3d8b0e5c1a7f4d9b2e6c3a8f0d5b1e7c\n\nTotal reclaimed space: 412.6MB\nTYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          10        3         3.51GB    2.3GB (65%)\nContainers      3         3         2.5MB     0B (0%)\nLocal Volumes   4         2         880MB     212MB (24%)\nBuild Cache     74        0         2.2GB     2.2GB',
      },
      {
        kind: 'write',
        prompt: 'Free space on a CI runner: old unused images, then all build cache, no prompts.',
        starter: '',
        solution: 'docker image prune -a -f --filter "until=168h"\ndocker builder prune -a -f\ndocker system df',
        checks: [
          { label: 'Prune every unused image with image prune -a', re: 'docker\\s+image\\s+prune\\s[^\\n]*(-a\\w*|-\\w+a|--all)\\b' },
          { label: 'Only images older than a week: --filter until=168h', re: '--filter[\\s=]+["\']?until=168h' },
          { label: 'Clear all build cache with builder prune -a', re: 'docker\\s+(builder|buildx)\\s+prune\\s[^\\n]*(-a\\w*|-\\w+a|--all)\\b' },
          { label: 'Skip both prompts with -f', re: '(prune[^\\n]*\\s(-f|-\\w+f|-f\\w+|--force)\\b[\\s\\S]*){2}' },
        ],
        hint: 'Plain image prune only takes dangling images. until= takes a duration in hours, like 24h.',
        explain: 'until=168h keeps anything built this week, so recent layers stay warm. builder prune -a drops all cache, not just the dangling part.',
      },
    ],
  ],
};

export default unit;
