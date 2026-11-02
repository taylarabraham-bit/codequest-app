import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 18 (Image internals).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source for a Go template like {{json .RootFS.Layers}} inside quotes, spaces allowed. */
const tpl = (body: string) => `["']\\{\\{\\s*${body}\\s*\\}\\}["']`;

const unit: DesktopUnit = {
  lessons: [
    // L1 The union filesystem
    [
      {
        kind: 'write',
        prompt: 'Write a Dockerfile for a static site on nginx:alpine that adds exactly two layers.',
        starter: '',
        solution: 'FROM nginx:alpine\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\nCOPY site/ /usr/share/nginx/html/\nEXPOSE 80',
        checks: [
          { label: 'FROM nginx:alpine', re: '^\\s*FROM\\s+nginx:alpine\\b', flags: 'm' },
          { label: 'At least two layer-making lines (RUN, COPY or ADD)', re: '(^\\s*(RUN|COPY|ADD)\\s[\\s\\S]*){2}', flags: 'm' },
          { label: 'No more than two', re: '^(?![\\s\\S]*((^|\\n)\\s*(RUN|COPY|ADD)\\s[\\s\\S]*){3})' },
          { label: 'The site ends up in /usr/share/nginx/html', re: '^\\s*(COPY|ADD)\\s+[^\\n]*\\s/usr/share/nginx/html/?\\s*$', flags: 'm' },
        ],
        hint: 'Only RUN, COPY and ADD save files. EXPOSE, CMD and ENV just change the config.',
        explain: 'Your two layers sit on top of nginx:alpine’s own, and a container adds one thin writable layer above them all.',
      },
      {
        kind: 'write',
        prompt: 'In a running Alpine container, change, delete and add a file, then list the changes.',
        starter: '',
        solution:
          'docker run -d --name scratch alpine sleep 3600\ndocker exec scratch sh -c "echo hi >> /etc/motd && rm /etc/issue && touch /tmp/note"\ndocker diff scratch',
        checks: [
          { label: 'Keep a detached alpine container running', re: 'docker\\s+(container\\s+)?run\\s+(?=[^\\n]*(-d|--detach)\\b)(?=[^\\n]*--name[\\s=]+[\\w.-]+)[^\\n]*\\balpine(:\\S+)?\\s+sleep\\s+\\S+' },
          { label: 'Use docker exec to make the changes', re: 'docker\\s+(container\\s+)?exec\\s+[\\w.-]+\\s+sh\\s+-c\\s' },
          { label: 'Change, delete (rm) and add (touch or >) a file', re: '^(?=[\\s\\S]*\\brm\\s+\\S)(?=[\\s\\S]*(\\btouch\\s|>>?\\s*\\S))[\\s\\S]*' },
          { label: 'List them with docker diff', re: 'docker\\s+(container\\s+)?diff\\s+[\\w.-]+' },
        ],
        hint: 'sleep keeps the container alive. docker diff marks lines A (added), C (changed) and D (deleted).',
        explain: 'Changing /etc/motd copied it up into the writable layer first. The delete is only a marker there: the file still sits in the image layer.',
        output: 'd8c3f1a7e5b2c9d4a6f0e8b1c3d5a7f9e2b4c6d8a0f1e3b5c7d9a2f4e6b8c0d1\nC /etc\nD /etc/issue\nC /etc/motd\nC /tmp\nA /tmp/note',
      },
    ],
    // L2 history & inspect
    [
      {
        kind: 'write',
        prompt: 'Show every full build step of api:1.0, then its layer list as JSON.',
        starter: '',
        solution: "docker history --no-trunc api:1.0\ndocker image inspect --format '{{json .RootFS.Layers}}' api:1.0",
        checks: [
          { label: 'docker history --no-trunc api:1.0', re: 'docker\\s+(image\\s+)?history\\s+(?=[^\\n]*--no-trunc\\b)[^\\n]*\\bapi:1\\.0\\b' },
          { label: 'docker image inspect on api:1.0', re: 'docker\\s+(image\\s+)?inspect\\s+[^\\n]*\\bapi:1\\.0\\b' },
          { label: "Format '{{json .RootFS.Layers}}'", re: `(-f|--format)[\\s=]+${tpl('json\\s+\\.RootFS\\.Layers')}` },
        ],
        hint: 'history cuts long commands unless told not to. Layers live under RootFS.',
        explain: 'history lists steps newest first, including 0B config steps. RootFS.Layers lists only real layers, base first.',
        output:
          'IMAGE          CREATED       CREATED BY                                                        SIZE      COMMENT\nsha256:4e1b…   2 hours ago   ENTRYPOINT ["dotnet" "Api.dll"]                                   0B        buildkit.dockerfile.v0\n<missing>      2 hours ago   COPY /app/publish . # buildkit                                    5.12MB    buildkit.dockerfile.v0\n<missing>      2 hours ago   WORKDIR /app                                                      0B        buildkit.dockerfile.v0\n…\n["sha256:1f7a…","sha256:5c2e…","sha256:9b4d…","sha256:e81c…"]',
      },
      {
        kind: 'write',
        prompt: 'List api:1.0’s steps as size plus command only, then count its real layers.',
        starter: '',
        solution:
          'docker history --no-trunc --format "{{.Size}}\\t{{.CreatedBy}}" api:1.0\ndocker image inspect --format \'{{len .RootFS.Layers}}\' api:1.0',
        checks: [
          { label: 'docker history with a --format template', re: 'docker\\s+(image\\s+)?history\\s+[^\\n]*--format[\\s=]+["\']' },
          { label: 'Show {{.Size}} and {{.CreatedBy}}', re: 'history[^\\n]*\\{\\{\\s*\\.Size\\s*\\}\\}[^\\n]*\\{\\{\\s*\\.CreatedBy\\s*\\}\\}' },
          { label: "Count layers with '{{len .RootFS.Layers}}'", re: `inspect\\s[^\\n]*${tpl('len\\s+\\.RootFS\\.Layers')}` },
          { label: 'Both commands are for api:1.0', re: '(\\bapi:1\\.0\\b[\\s\\S]*){2}' },
        ],
        hint: 'Templates can call functions: len counts the items in a list.',
        explain: 'The 0B rows are config-only steps like WORKDIR or ENV. They show in history but add nothing to RootFS.Layers.',
        output: '0B\tENTRYPOINT ["dotnet" "Api.dll"]\n5.12MB\tCOPY /app/publish . # buildkit\n0B\tWORKDIR /app\n…\n4',
      },
    ],
    // L3 Digests, manifests & indexes
    [
      {
        kind: 'write',
        prompt: 'See which platforms redis:8 serves, then print its raw index JSON.',
        starter: '',
        solution: 'docker buildx imagetools inspect redis:8\ndocker buildx imagetools inspect --raw redis:8',
        checks: [
          { label: 'docker buildx imagetools inspect redis:8', re: 'docker\\s+buildx\\s+imagetools\\s+inspect\\s+redis:8\\s*$', flags: 'm' },
          { label: 'Then again with --raw', re: 'docker\\s+buildx\\s+imagetools\\s+inspect\\s+(--raw\\s+redis:8|redis:8\\s+--raw)\\b' },
        ],
        hint: 'imagetools reads straight from the registry, no pull needed. One flag prints the JSON as stored.',
        explain: 'The tag points at an image index; each entry is a per-platform manifest with its own digest.',
        output:
          'Name:      docker.io/library/redis:8\nMediaType: application/vnd.oci.image.index.v1+json\nDigest:    sha256:7f3a…\n\nManifests:\n  Name:      docker.io/library/redis:8@sha256:b2c9…\n  MediaType: application/vnd.oci.image.manifest.v1+json\n  Platform:  linux/amd64\n  …\n  Platform:  linux/arm64/v8\n  …\n{\n  "schemaVersion": 2,\n  "mediaType": "application/vnd.oci.image.index.v1+json",\n  "manifests": [ … ]\n}',
      },
      {
        kind: 'write',
        prompt: 'Join the -amd64 and -arm64 tags of ghcr.io/ana/quiz:2.0 into one tag, then check it.',
        starter: '',
        solution:
          'docker buildx imagetools create -t ghcr.io/ana/quiz:2.0 ghcr.io/ana/quiz:2.0-amd64 ghcr.io/ana/quiz:2.0-arm64\ndocker buildx imagetools inspect ghcr.io/ana/quiz:2.0',
        checks: [
          { label: 'docker buildx imagetools create', re: 'docker\\s+buildx\\s+imagetools\\s+create\\s' },
          { label: 'The new tag with -t ghcr.io/ana/quiz:2.0', re: 'create\\s[^\\n]*(-t|--tag)[\\s=]+ghcr\\.io/ana/quiz:2\\.0(\\s|$)' },
          { label: 'Both sources: :2.0-amd64 and :2.0-arm64', re: 'create\\s(?=[^\\n]*ghcr\\.io/ana/quiz:2\\.0-amd64\\b)(?=[^\\n]*ghcr\\.io/ana/quiz:2\\.0-arm64\\b)' },
          { label: 'Inspect the result with imagetools inspect', re: 'imagetools\\s+inspect\\s+ghcr\\.io/ana/quiz:2\\.0\\s*$', flags: 'm' },
        ],
        hint: 'create takes the new tag first, then each existing image to list in the index.',
        explain: 'Only a small index is written; it points at the two manifests already in the registry, so nothing is rebuilt or re-uploaded.',
      },
    ],
    // L4 Why images stay big
    [
      {
        kind: 'write',
        prompt: 'Rewrite these three RUN lines so the apt cache never ships in a layer.',
        starter:
          'FROM debian:bookworm-slim\nRUN apt-get update\nRUN apt-get install -y curl ca-certificates\nRUN rm -rf /var/lib/apt/lists/*\n',
        solution:
          'FROM debian:bookworm-slim\nRUN apt-get update \\\n    && apt-get install -y --no-install-recommends curl ca-certificates \\\n    && rm -rf /var/lib/apt/lists/*',
        checks: [
          { label: 'One RUN does update, install and rm with &&', re: 'RUN\\s+apt-get\\s+update\\s*(\\\\\\s*)?&&\\s*(\\\\\\s*)?apt-get\\s+install\\s[^&]*&&\\s*(\\\\\\s*)?rm\\s+-rf\\s+/var/lib/apt/lists/\\*?' },
          { label: 'Only one RUN left', re: '^(?![\\s\\S]*(^|\\n)\\s*RUN\\s[\\s\\S]*\\n\\s*RUN\\s)' },
          { label: 'Skip extras with --no-install-recommends', re: 'apt-get\\s+install\\s[^\\n]*--no-install-recommends' },
          { label: 'Still installs curl and ca-certificates', re: 'install\\s(?=[^&]*\\bcurl\\b)(?=[^&]*\\bca-certificates\\b)' },
        ],
        hint: 'A file deleted in a later layer still ships in the earlier one. Chain with && and break lines with \\.',
        explain: 'The package lists are created and removed inside one layer, so they never get saved. Fewer recommends means fewer bytes and CVEs.',
      },
      {
        kind: 'write',
        prompt: 'Make this Vite site image tiny: build in node, ship only dist on nginx:alpine.',
        starter:
          'FROM node:22\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nRUN npm install -g serve\nCMD ["serve", "-s", "dist"]\n',
        solution:
          'FROM node:22 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html',
        checks: [
          { label: 'Name the node stage: FROM node:22 AS build', re: '^\\s*FROM\\s+node:\\S+\\s+AS\\s+(\\w+)', flags: 'im' },
          { label: 'A final FROM nginx:alpine', re: '^\\s*FROM\\s+nginx:alpine\\b(?![\\s\\S]*^\\s*FROM\\s)', flags: 'm' },
          { label: 'COPY --from the build stage’s /app/dist into /usr/share/nginx/html', re: 'COPY\\s+--from=\\w+\\s+/app/dist/?\\s+/usr/share/nginx/html/?' },
          { label: 'No serve or CMD carried over: nginx has its own', re: '^(?![\\s\\S]*\\bserve\\b)' },
        ],
        hint: 'Only the last stage becomes the image. Pull just the build output across with COPY --from.',
        explain: 'node_modules, the source and Node itself stay behind in the build stage; the shipped image is nginx plus a few static files.',
      },
    ],
    // L5 save, load, export, import
    [
      {
        kind: 'write',
        prompt: 'Carry api:1.0 and web:1.0 to an offline machine in one tar, then load them there.',
        starter: '',
        solution: '# on your machine\ndocker save -o bundle.tar api:1.0 web:1.0\n# on the offline machine\ndocker load -i bundle.tar',
        checks: [
          { label: 'docker save -o into a .tar', re: 'docker\\s+(image\\s+)?save\\s+(-o|--output)[\\s=]+[\\w./-]+\\.tar\\b' },
          { label: 'Save both api:1.0 and web:1.0 in one command', re: 'save\\s(?=[^\\n]*\\bapi:1\\.0\\b)(?=[^\\n]*\\bweb:1\\.0\\b)' },
          { label: 'docker load -i the same file', re: 'docker\\s+(image\\s+)?load\\s+(-i|--input)[\\s=]+[\\w./-]+\\.tar\\b' },
          { label: 'No export or import: those lose the layers', re: '^(?![\\s\\S]*docker\\s+(container\\s+)?(export|import)\\b)' },
        ],
        hint: 'save writes images (with tags and layers); load reads them back. -o and -i name the file.',
        explain: 'One tar can hold several images, and shared base layers are stored once. load restores the tags too.',
        output: 'Loaded image: api:1.0\nLoaded image: web:1.0',
      },
      {
        kind: 'write',
        prompt: 'Snapshot the web container’s files as image web:snap that still starts nginx.',
        starter: '',
        solution:
          'docker export -o web.tar web\ndocker import --change \'CMD ["nginx", "-g", "daemon off;"]\' web.tar web:snap\ndocker history web:snap',
        checks: [
          { label: 'docker export -o web.tar web', re: 'docker\\s+(container\\s+)?export\\s+(-o|--output)[\\s=]+[\\w./-]+\\.tar\\s+web\\b' },
          { label: 'docker import it as web:snap', re: 'docker\\s+(image\\s+)?import\\s[^\\n]*[\\w./-]+\\.tar\\s+web:snap\\b' },
          { label: 'Add a CMD with --change (or -c)', re: 'import\\s[^\\n]*(--change|-c)[\\s=]+["\']CMD\\s' },
          { label: 'The CMD runs nginx in the foreground', re: 'CMD[^\\n]*nginx[^\\n]*daemon off' },
        ],
        hint: 'An imported image has no config at all, so give it its CMD while importing.',
        explain: 'export flattens the container’s files into one layer and drops the config; --change puts a CMD back. history shows a single layer.',
        output:
          'sha256:6c0e9b2d4f8a1c3e5b7d9f0a2c4e6b8d1f3a5c7e9b0d2f4a6c8e1b3d5f7a9c2e\nIMAGE          CREATED          CREATED BY   SIZE      COMMENT\n6c0e9b2d4f8a   2 seconds ago                 48.6MB    Imported from -',
      },
    ],
  ],
  linuxOk: {
    'L4.concept': 'a Dockerfile RUN instruction: its \\ continuations and curl run in the Linux build container',
  },
};

export default unit;
