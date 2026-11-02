import type { Unit } from '../../engine/types';

// Made-up but consistent digests and ids, reused so related outputs agree.
const HISTORY_API = `IMAGE          CREATED       CREATED BY                                      SIZE      COMMENT
3f9c2a7e1b44   2 hours ago   CMD ["dotnet" "Api.dll"]                        0B        buildkit.dockerfile.v0
<missing>      2 hours ago   ENV ASPNETCORE_HTTP_PORTS=8080                  0B        buildkit.dockerfile.v0
<missing>      2 hours ago   COPY /app/publish . # buildkit                  14.2MB    buildkit.dockerfile.v0
<missing>      2 hours ago   RUN /bin/sh -c apt-get update && apt-get ins…   38.6MB    buildkit.dockerfile.v0
<missing>      3 weeks ago   ADD file:9a8f1e7c2b3d4a5e6f70 in /               74.8MB`;

const HISTORY_FULL =
  '<missing>      2 hours ago   RUN /bin/sh -c apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* # buildkit   38.6MB    buildkit.dockerfile.v0';

const LAYERS_API = `[
  "sha256:5f70bf18a086007016e948b04aed3b82103a36bea41755b6cddfaf10ace3c6ef",
  "sha256:a1c4e83b9d12f7c6e5a0b3d2f8e9c1a4b7d6e5f0c3a2b1d4e7f8a9b0c1d2e3f4",
  "sha256:c7d2e9f1a3b5c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8"
]`;

const IMAGETOOLS_NGINX = `Name:      docker.io/library/nginx:alpine
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:4ff102c5d78d254a6f0da062b3cf39eaf07f01eec0927fd21e219d0af8bc0591

Manifests:
  Name:      docker.io/library/nginx:alpine@sha256:7d3a1cbd04f5e1c3a7b9d2e6f8a0c4b2d6e8f0a2c4b6d8e0f2a4c6b8d0e2f4a6
  MediaType: application/vnd.oci.image.manifest.v1+json
  Platform:  linux/amd64

  Name:      docker.io/library/nginx:alpine@sha256:b1c8e2f4a6d8c0e2b4f6a8d0c2e4b6f8a0d2c4e6b8f0a2d4c6e8b0f2a4d6c8e0
  MediaType: application/vnd.oci.image.manifest.v1+json
  Platform:  linux/arm64/v8`;

const DF_V = `Images space usage:

REPOSITORY   TAG   IMAGE ID       CREATED       SIZE    SHARED SIZE   UNIQUE SIZE   CONTAINERS
api          1.0   3f9c2a7e1b44   2 hours ago   128MB   74.8MB        53.2MB        1
worker       1.0   8d01b6e5c9a2   2 hours ago   97MB    74.8MB        22.2MB        0`;

const DIFF_WEB = 'C /etc\nC /etc/nginx/conf.d\nA /etc/nginx/conf.d/shop.conf\nD /usr/share/nginx/html/50x.html';

const SAVE_LIST = 'blobs/\nblobs/sha256/\nblobs/sha256/3f9c2a7e1b44…\nindex.json\nmanifest.json\noci-layout\nrepositories';

const unit: Unit = {
  title: 'Image internals',
  blurb: 'Look inside an image: layers, digests, manifests and indexes, and why a deleted file still costs space.',
  lessons: [
    {
      title: 'The union filesystem',
      concept: {
        body: 'RUN, COPY and ADD each save the files they change as a new read-only layer. A union filesystem like overlayfs stacks the layers into one view, and a container adds a thin writable layer on top. Changing a file from a lower layer copies it up first.',
        code: 'FROM debian:bookworm-slim     # base layers\nRUN apt-get update && apt-get install -y curl   # +1 layer\nCOPY app/ /app/              # +1 layer\nCMD ["/app/run"]             # config only',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Which step adds a layer to the image?',
          code: 'FROM debian:bookworm-slim\nENV TZ=UTC\n___\nCMD ["/app/run"]',
          blanks: [
            {
              answer: ['COPY app/ /app/'],
              options: ['COPY app/ /app/', 'EXPOSE 8080', 'LABEL team=shop'],
            },
          ],
          hint: 'Which one writes files?',
          explain: 'Only steps that change the filesystem make a layer. ENV, EXPOSE, LABEL and CMD just edit the image’s config, so they cost 0B.',
        },
        {
          kind: 'fill',
          prompt: 'Name the writable top layer in overlayfs terms.',
          code: '# overlayfs: lowerdir = image layers (read-only)\n#            ___ = the container’s changes',
          blanks: [{ answer: ['upperdir'], options: ['upperdir', 'topdir', 'workdir'] }],
          hint: 'Lower layers sit below it.',
          explain: 'overlayfs merges the read-only lowerdirs with one writable upperdir. workdir is just scratch space overlayfs needs for itself.',
        },
        {
          kind: 'fill',
          prompt: 'A container edits nginx.conf from the image. What happens?',
          code: '# /etc/nginx/nginx.conf lives in an image layer\n# the container writes to it, so it is ___',
          blanks: [
            {
              answer: ['copied up, then changed'],
              options: ['copied up, then changed', 'changed in the image layer', 'refused as read-only'],
            },
          ],
          hint: 'Image layers are shared, so they never change.',
          explain: 'Copy-on-write: the whole file is copied into the writable layer the first time it’s written. Other containers still see the original.',
        },
        {
          kind: 'fill',
          prompt: 'A container deletes a file from an image layer. How?',
          code: '# rm /usr/share/nginx/html/50x.html\n# overlayfs hides it with a ___ file',
          blanks: [{ answer: ['whiteout'], options: ['whiteout', 'tombstone', 'zero-byte'] }],
          hint: 'It paints over the file in the layer above.',
          explain: 'A whiteout in the upper layer marks the file deleted. The lower layer is untouched, so no space is freed there.',
        },
        {
          kind: 'build',
          prompt: 'List what changed in web’s writable layer.',
          answer: ['docker', 'diff', 'web'],
          distractors: ['history', 'logs'],
          hint: 'Compare the container with its image.',
          explain: 'A means added, C changed and D deleted. Everything listed lives only in the writable layer and is lost on docker rm.',
          output: DIFF_WEB,
        },
        {
          kind: 'fill',
          prompt: 'Read the diff. Which file did the container add?',
          code: `${DIFF_WEB}\n# added: ___`,
          blanks: [
            {
              answer: ['shop.conf'],
              options: ['shop.conf', '50x.html', 'conf.d'],
            },
          ],
          hint: 'Look for the A.',
          explain: 'C on /etc and conf.d only means something inside them changed. D marks 50x.html, hidden by a whiteout.',
        },
        {
          kind: 'build',
          prompt: 'Show the size of each step behind api:1.0.',
          answer: ['docker', 'history', 'api:1.0'],
          alt: [['docker', 'image', 'history', 'api:1.0']],
          distractors: ['diff', 'layers'],
          hint: 'The command lists the steps that built it.',
          explain: 'ENV and CMD show 0B: they only touch config. <missing> just means the step was built elsewhere, so no local image ID exists for it.',
          output: HISTORY_API,
        },
      ],
    },
    {
      title: 'history & inspect',
      concept: {
        body: 'docker history cuts long commands with …; --no-trunc prints them whole. docker image inspect shows the image’s config and RootFS.Layers, one sha256 per layer, bottom first. 0B steps appear in history but have no layer.',
        code: 'docker history --no-trunc api:1.0\ndocker image inspect --format \'{{json .RootFS.Layers}}\' api:1.0',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Show the full RUN command, not cut off.',
          code: 'docker history ___ api:1.0',
          blanks: [{ answer: ['--no-trunc'], options: ['--no-trunc', '--all', '-v'] }],
          hint: 'Don’t truncate.',
          explain: 'Long CREATED BY lines end in … by default. --no-trunc also prints full image IDs, so the table gets very wide.',
          output: HISTORY_FULL,
        },
        {
          kind: 'build',
          prompt: 'Print just each step’s size and command.',
          answer: ['docker', 'history', '--format', '"{{.Size}}\\t{{.CreatedBy}}"', 'api:1.0'],
          distractors: ['"{{.Layers}}"', '--no-stream'],
          hint: 'A Go template with two fields and a tab.',
          explain: 'history’s template fields include .ID, .CreatedSince, .CreatedBy, .Size and .Comment.',
          output: '0B\tCMD ["dotnet" "Api.dll"]\n0B\tENV ASPNETCORE_HTTP_PORTS=8080\n14.2MB\tCOPY /app/publish . # buildkit',
        },
        {
          kind: 'fill',
          prompt: 'Print api’s layer list as JSON.',
          code: 'docker image inspect --format \'{{json .RootFS.___}}\' api:1.0',
          blanks: [{ answer: ['Layers'], options: ['Layers', 'History', 'Blobs'] }],
          hint: 'RootFS holds the filesystem’s pieces.',
          explain: 'Each entry is a diff ID: the sha256 of that layer’s uncompressed tar, listed from the base upward.',
          output: LAYERS_API,
        },
        {
          kind: 'fill',
          prompt: 'history has 5 rows, but RootFS.Layers has 3. Why?',
          code: '# rows: CMD, ENV, COPY, RUN, base\n# layers: 3, because ___',
          blanks: [
            {
              answer: ['CMD and ENV made no layer'],
              options: ['CMD and ENV made no layer', 'two layers were merged', 'the base is not counted'],
            },
          ],
          hint: 'Look at the SIZE column.',
          explain: 'history lists every step, layers or not. Only the base, RUN and COPY wrote files, so only they appear in RootFS.Layers.',
        },
        {
          kind: 'fill',
          prompt: 'Print what api runs at start, from its config.',
          code: 'docker image inspect --format \'{{.Config.___}}\' api:1.0',
          blanks: [{ answer: ['Cmd'], options: ['Cmd', 'Entrypoint', 'RootFS'] }],
          hint: 'The field set by the CMD instruction.',
          explain: 'CMD, ENV, USER and ExposedPorts live in the image config JSON, not in any layer. That’s why they cost 0B.',
          output: '[dotnet Api.dll]',
        },
        {
          kind: 'build',
          prompt: 'Count api’s layers with a template.',
          answer: ['docker', 'image', 'inspect', '--format', "'{{len .RootFS.Layers}}'", 'api:1.0'],
          distractors: ["'{{count .RootFS.Layers}}'", 'history'],
          hint: 'Go templates have a built-in that measures a list.',
          explain: 'len is a standard Go template function. Fewer, well-planned layers mean less to pull, though size matters more than count.',
          output: '3',
        },
        {
          kind: 'fill',
          prompt: 'Show sizes in bytes instead of MB.',
          code: 'docker history ___ api:1.0',
          blanks: [{ answer: ['-H=false'], options: ['-H=false', '--bytes', '-q'] }],
          hint: 'Turn off the human-readable flag.',
          explain: '-H (--human) is on by default. Exact byte counts are handy when you compare two builds in a script.',
          output: 'IMAGE          CREATED AT             CREATED BY                       SIZE       COMMENT\n3f9c2a7e1b44   2026-10-26T09:12:40Z   CMD ["dotnet" "Api.dll"]         0          buildkit.dockerfile.v0\n<missing>      2026-10-26T09:12:38Z   COPY /app/publish . # buildkit   14215680   buildkit.dockerfile.v0',
        },
      ],
    },
    {
      title: 'Digests, manifests & indexes',
      concept: {
        body: 'Registries store content by its sha256 digest. A manifest lists one image’s config blob and layer blobs; an image index lists one manifest per platform, so one tag serves amd64 and arm64. docker buildx imagetools inspect shows what a tag points at.',
        code: 'docker buildx imagetools inspect nginx:alpine\ndocker buildx imagetools inspect --raw nginx:alpine',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'See which platforms nginx:alpine is published for.',
          answer: ['docker', 'buildx', 'imagetools', 'inspect', 'nginx:alpine'],
          distractors: ['history', 'pull'],
          hint: 'buildx’s tool for images in a registry.',
          explain: 'It reads the registry directly and pulls nothing. The tag points at an index, and each manifest inside is one platform.',
          output: IMAGETOOLS_NGINX,
        },
        {
          kind: 'order',
          prompt: 'Write a manifest: mediaType, config, then layers.',
          lines: [
            '{',
            '  "mediaType": "application/vnd.oci.image.manifest.v1+json",',
            '  "config": { "digest": "sha256:9a1f…" },',
            '  "layers": [',
            '    { "digest": "sha256:4c2e…" }',
            '  ]',
            '}',
          ],
          hint: 'One config, a list of layers.',
          explain: 'The manifest is small JSON that points at blobs by digest. Change one byte of a layer and its digest, and so the manifest’s, changes.',
        },
        {
          kind: 'fill',
          prompt: 'Type the flag that prints the raw JSON.',
          code: 'docker buildx imagetools inspect --___ nginx:alpine',
          blanks: [{ answer: ['raw'] }],
          hint: 'The opposite of formatted.',
          explain: '--raw prints exactly what the registry serves: here the index JSON with its manifests array.',
        },
        {
          kind: 'fix',
          prompt: 'This JSON lists per-platform manifests. Fix its type.',
          code: '{\n  "mediaType": "application/vnd.oci.image.[[manifest]].v1+json",\n  "manifests": [\n    { "platform": { "architecture": "amd64", "os": "linux" } },\n    { "platform": { "architecture": "arm64", "os": "linux" } }\n  ]\n}',
          fix: 'index',
          options: ['index', 'config', 'layer'],
          hint: 'A list of manifests is not itself a manifest.',
          explain: 'An image index points at manifests; a manifest points at a config and layers. Docker’s older name for an index is a manifest list.',
        },
        {
          kind: 'fill',
          prompt: 'Pin nginx so both amd64 and arm64 hosts can run it.',
          code: 'FROM nginx:alpine@sha256:4ff1…\n# that digest is ___',
          blanks: [
            {
              answer: ['the index digest'],
              options: ['the index digest', 'the amd64 manifest digest', 'the config digest'],
            },
          ],
          hint: 'Which digest covers every platform?',
          explain: 'The index digest still lets each host pick its own platform. A platform manifest’s digest would force amd64 everywhere.',
          output: IMAGETOOLS_NGINX,
        },
        {
          kind: 'build',
          prompt: 'Join two single-platform tags into one index tag.',
          answer: [
            'docker',
            'buildx',
            'imagetools',
            'create',
            '-t',
            'ghcr.io/ana/api:1.0',
            'ghcr.io/ana/api:1.0-amd64',
            'ghcr.io/ana/api:1.0-arm64',
          ],
          distractors: ['push', 'manifest'],
          hint: 'create, the new tag, then the sources.',
          explain: 'imagetools create writes a new index in the registry that points at existing manifests, so nothing is rebuilt or re-uploaded.',
        },
        {
          kind: 'fill',
          prompt: 'RootFS.Layers and the manifest list different digests. Why?',
          code: '# RootFS.Layers: diff IDs\n# manifest layers: blob digests\n# they differ because blobs are ___',
          blanks: [{ answer: ['compressed'] }],
          hint: 'What happens to a layer before it’s pushed?',
          explain: 'A diff ID hashes the uncompressed tar; the manifest hashes the gzip or zstd blob that’s actually sent and stored.',
        },
      ],
    },
    {
      title: 'Why images stay big',
      concept: {
        body: 'A layer can’t shrink later: deleting a file in the next RUN only adds a whiteout, and the bytes still ship. Clean up in the same RUN that made the mess. A multi-stage build squashes it all: only what the last stage COPYs survives. docker system df -v shows space per image.',
        code: 'RUN apt-get update \\\n    && apt-get install -y --no-install-recommends curl \\\n    && rm -rf /var/lib/apt/lists/*',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'The tarball is deleted later. How big is the image?',
          code: 'COPY data.tar.gz /tmp/          # 300MB\nRUN tar -xzf /tmp/data.tar.gz -C /data\nRUN rm /tmp/data.tar.gz\n# the 300MB ___',
          blanks: [
            {
              answer: ['is still in the image'],
              options: ['is still in the image', 'is freed by rm', 'is compressed away'],
            },
          ],
          hint: 'Each step is its own layer.',
          explain: 'The COPY layer keeps the tarball forever; rm only hides it. A RUN --mount=type=bind with the archive avoids storing it at all.',
        },
        {
          kind: 'order',
          prompt: 'Install curl and clear apt’s lists in one layer.',
          lines: [
            'FROM debian:bookworm-slim',
            'RUN apt-get update \\',
            '    && apt-get install -y --no-install-recommends curl \\',
            '    && rm -rf /var/lib/apt/lists/*',
            'USER 1000',
          ],
          hint: 'update first, clean up last, all in one RUN.',
          explain: 'The lists are deleted before the RUN’s layer is saved, so they never land in the image.',
        },
        {
          kind: 'build',
          prompt: 'Squash a fat stage into one fresh layer.',
          answer: ['COPY', '--from=fat', '/', '/'],
          distractors: ['--squash', 'ADD'],
          hint: 'Copy the whole filesystem out of the stage.',
          explain: 'In a new stage on scratch this copies only the final files, so everything deleted in fat is really gone. The base layers aren’t shared anymore, though.',
        },
        {
          kind: 'order',
          prompt: 'Build in one stage, ship just the output.',
          lines: [
            'FROM node:22-alpine AS build',
            'WORKDIR /src',
            'COPY . .',
            'RUN npm ci && npm run build',
            'FROM nginx:alpine',
            'COPY --from=build /src/dist /usr/share/nginx/html',
          ],
          hint: 'The second FROM starts the image you ship.',
          explain: 'node_modules, the sources and Node itself stay in the build stage. The final image is nginx plus a few static files.',
        },
        {
          kind: 'fill',
          prompt: 'Type the flag that breaks disk use down per image.',
          code: 'docker system df ___',
          blanks: [{ answer: ['-v', '--verbose'] }],
          hint: 'Short for verbose.',
          explain: 'Plain docker system df only shows totals. -v lists each image, container, volume and cache entry.',
          output: DF_V,
        },
        {
          kind: 'fill',
          prompt: 'Which column is the space deleting api would free?',
          code: `${DF_V}\n# freed by docker rmi api:1.0: ___ SIZE`,
          blanks: [{ answer: ['UNIQUE'] }],
          hint: 'Not the part worker also uses.',
          explain: 'SHARED SIZE is base layers other images also use. Only UNIQUE SIZE goes away when you delete api.',
        },
        {
          kind: 'fix',
          prompt: 'COPY fails: /src/dist not found. Fix the source.',
          code: 'FROM node:22-alpine AS build\nWORKDIR /src\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=[[node:22-alpine]] /src/dist /usr/share/nginx/html',
          fix: 'build',
          options: ['build', '0', 'nginx:alpine'],
          hint: 'Copy from your stage, not a fresh image.',
          explain: '--from with an image name reads that image as pulled, which has no /src/dist. The stage name picks up your build’s output.',
        },
      ],
    },
    {
      title: 'save, load, export, import',
      concept: {
        body: 'docker save writes images to a tar with every layer, tag and config, in OCI layout (index.json, oci-layout, blobs/). docker load reads it back. docker export dumps a container’s flattened files only, and docker import turns them into a one-layer image with no CMD.',
        code: 'docker save -o api.tar api:1.0\ndocker load -i api.tar\ndocker export -o web.tar web\ndocker import web.tar web:snap',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Write api:1.0 to api.tar for an offline server.',
          answer: ['docker', 'save', '-o', 'api.tar', 'api:1.0'],
          distractors: ['export', '-i'],
          hint: 'save takes -o for the output file.',
          explain: 'The tar holds every layer and the config, so the image runs exactly the same after loading. Add more names to bundle several images.',
        },
        {
          kind: 'fill',
          prompt: 'List the tar. What holds the layers and config?',
          code: 'tar -tf api.tar\n# layers and config live under ___/',
          blanks: [{ answer: ['blobs'] }],
          hint: 'Named after the registry term for stored content.',
          explain: 'Since Docker 25, save writes an OCI image layout: blobs/sha256/ files named by digest, plus index.json and oci-layout.',
          output: SAVE_LIST,
        },
        {
          kind: 'fill',
          prompt: 'You need history and CMD kept. Pick the pair.',
          code: '# move api:1.0 to another host intact\n___',
          blanks: [
            {
              answer: ['docker save, then docker load'],
              options: ['docker save, then docker load', 'docker export, then docker import'],
            },
          ],
          hint: 'One pair works on images, the other on containers.',
          explain: 'export/import flattens a container’s files into one layer and drops config like CMD, ENV and history.',
        },
        {
          kind: 'order',
          prompt: 'Ship api to the offline host edge and run it.',
          lines: [
            'docker save -o api.tar api:1.0',
            'scp api.tar ops@edge:',
            'ssh ops@edge',
            'docker load -i api.tar',
            'docker run -d -p 8080:8080 api:1.0',
          ],
          hint: 'Save here, copy, log in, load there.',
          explain: 'No registry needed. Layers the edge already has are skipped on load, which prints Loaded image: api:1.0.',
        },
        {
          kind: 'type',
          prompt: 'Load the image from api.tar.',
          accept: ['docker load -i api.tar', 'docker load --input api.tar', 'docker load < api.tar', 'docker image load -i api.tar'],
          hint: 'load, with the input flag.',
          explain: 'load restores the tags that were saved. Without -i it reads from stdin, so docker load < api.tar works too.',
          output: 'Loaded image: api:1.0',
        },
        {
          kind: 'fix',
          prompt: 'web is a container. Dump its files to web.tar.',
          code: 'docker [[save]] -o web.tar web',
          fix: 'export',
          options: ['export', 'commit', 'load'],
          hint: 'save takes images, not containers.',
          explain: 'export writes the container’s merged filesystem as one plain tar. Volumes aren’t included, only the layers and writable layer.',
        },
        {
          kind: 'type',
          prompt: 'Make web.tar an image, setting CMD to sh.',
          template: 'docker import ___ web.tar web:snap',
          accept: ["--change 'CMD [\"sh\"]'", '-c \'CMD ["sh"]\'', '--change "CMD sh"', '-c "CMD sh"'],
          hint: '--change takes a Dockerfile line.',
          explain: 'An imported image has no config at all, so docker run would fail with no command. --change adds CMD, ENV and the like.',
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'fill',
      prompt: 'How many layers does this Dockerfile add to the base?',
      code: 'FROM alpine:3.20\nENV MODE=prod\nRUN apk add --no-cache curl\nCOPY app/ /app/\nEXPOSE 8080\nCMD ["/app/run"]\n# new layers: ___',
      blanks: [{ answer: ['2'], options: ['2', '4', '5'] }],
      hint: 'Count the steps that write files.',
      explain: 'Only RUN and COPY write files. ENV, EXPOSE and CMD show up in docker history as 0B rows.',
    },
    {
      kind: 'fix',
      prompt: 'The final image still carries the whole SDK. Fix it.',
      code: 'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/[[sdk]]:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .',
      fix: 'aspnet',
      options: ['aspnet', 'build', 'publish'],
      hint: 'The last stage only needs to run the app.',
      explain: 'Only the last stage ships, but its base ships whole. The aspnet runtime is a fraction of the SDK’s size, and the build layers stay behind.',
    },
    {
      kind: 'build',
      prompt: 'Print every step of api:1.0 in full.',
      answer: ['docker', 'history', '--no-trunc', 'api:1.0'],
      alt: [['docker', 'image', 'history', '--no-trunc', 'api:1.0']],
      distractors: ['--all', 'diff'],
      hint: 'history, without cutting lines short.',
      explain: 'This is how you spot a secret passed as a build arg or a huge RUN: every command is there for anyone with the image.',
      output: HISTORY_FULL,
    },
    {
      kind: 'type',
      prompt: 'Print api:1.0’s layer list as JSON.',
      accept: [
        "docker image inspect --format '{{json .RootFS.Layers}}' api:1.0",
        'docker image inspect --format "{{json .RootFS.Layers}}" api:1.0',
        "docker image inspect -f '{{json .RootFS.Layers}}' api:1.0",
        'docker image inspect -f "{{json .RootFS.Layers}}" api:1.0',
        "docker inspect -f '{{json .RootFS.Layers}}' api:1.0",
        "docker inspect --format '{{json .RootFS.Layers}}' api:1.0",
      ],
      hint: 'inspect with a json template on RootFS.',
      explain: 'Each digest is a diff ID. Two images whose lists start the same share those base layers on disk.',
      output: LAYERS_API,
    },
    {
      kind: 'order',
      prompt: 'Order from a tag down to the bytes.',
      lines: ['tag nginx:alpine', 'image index', 'linux/arm64 manifest', 'config + layer blobs'],
      hint: 'Each one points at the next by digest.',
      explain: 'A tag names an index, the index picks a manifest per platform, and the manifest lists the blobs. Every hop is a sha256 digest.',
    },
    {
      kind: 'fill',
      prompt: 'Which pair keeps tags, layers and CMD?',
      code: 'docker ___ -o shop.tar shop:2.1\n# later, on the other host\ndocker load -i shop.tar',
      blanks: [{ answer: ['save'], options: ['save', 'export', 'commit'] }],
      hint: 'load reads what this writes.',
      explain: 'save works on images and keeps everything. export works on containers and keeps only a flat filesystem.',
    },
    {
      kind: 'fill',
      prompt: 'worker shares 74.8MB with api. What does rmi worker:1.0 free?',
      code: `${DF_V}\n# freed: ___`,
      blanks: [{ answer: ['22.2MB'], options: ['22.2MB', '97MB', '74.8MB'] }],
      hint: 'Only its unique layers go.',
      explain: 'The shared base layers stay because api still uses them. That’s why images on a common base are cheap to add.',
    },
    {
      kind: 'build',
      prompt: 'Write the build to an OCI layout tar, not your images.',
      answer: ['docker', 'buildx', 'build', '--output', 'type=oci,dest=api-oci.tar', '.'],
      distractors: ['--load', 'type=tar'],
      hint: 'An output type plus a destination.',
      explain: 'type=oci writes index.json and blobs/ to a tar any OCI tool can read. type=tar would write a plain filesystem instead.',
    },
    {
      kind: 'fix',
      prompt: 'The run fails: no command specified. Fix the import.',
      code: 'docker export -o web.tar web\ndocker import [[--message]] \'CMD ["nginx", "-g", "daemon off;"]\' web.tar web:snap\ndocker run -d web:snap',
      fix: '--change',
      options: ['--change', '--cmd', '--entrypoint'],
      hint: 'The flag applies a Dockerfile instruction.',
      explain: '--message only sets a commit message. --change (-c) applies CMD, ENV, EXPOSE and similar lines to the imported image.',
    },
    {
      kind: 'type',
      prompt: 'Show nginx:alpine’s index straight from the registry.',
      accept: [
        'docker buildx imagetools inspect nginx:alpine',
        'docker buildx imagetools inspect --raw nginx:alpine',
        'docker manifest inspect nginx:alpine',
      ],
      hint: 'buildx imagetools, then the verb.',
      explain: 'Nothing is pulled: you see the index, each platform’s manifest digest and any attestations. docker manifest inspect also works.',
      output: IMAGETOOLS_NGINX,
    },
  ],
};

export default unit;
