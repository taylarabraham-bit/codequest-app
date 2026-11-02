import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 1 (Containers & images).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const RUN = 'docker\\s+(?:container\\s+)?run\\b';
const PULL = 'docker\\s+(?:image\\s+)?pull\\b';
const RMI = 'docker\\s+(?:rmi|image\\s+rm)\\b';
const IMAGES = 'docker\\s+(?:images|image\\s+ls)\\b';
const HISTORY = 'docker\\s+(?:image\\s+)?history\\b';

const HELLO = 'Hello from Docker!\nThis message shows that your installation appears to be working correctly.';

const unit: DesktopUnit = {
  lessons: [
    // L1 Images vs containers
    [
      {
        kind: 'write',
        prompt: 'Start two hello-world containers: one short form, one long form.',
        starter: '',
        solution: 'docker run hello-world\ndocker container run hello-world',
        checks: [
          { label: 'Run hello-world with docker run', re: cmd('docker\\s+run\\s+hello-world\\b') },
          { label: 'Run it again with docker container run', re: cmd('docker\\s+container\\s+run\\s+hello-world\\b') },
        ],
        hint: 'The long form puts the word container between docker and run.',
        explain: 'Each docker run creates a brand-new container from the same read-only image, so you now have two.',
        output: `${HELLO}\n\n${HELLO}`,
      },
      {
        kind: 'write',
        prompt: 'Fix the script so each line starts a new hello-world container.',
        starter: '# two containers from one image\ndocker start hello-world\ndocker container hello-world\n',
        solution: '# two containers from one image\ndocker run hello-world\ndocker container run hello-world',
        checks: [
          { label: 'Two lines that run hello-world', re: `(?:${RUN}\\s+hello-world\\b[\\s\\S]*){2}` },
          { label: 'No docker start: that restarts an existing container', not: 'docker start' },
          { label: 'The long form needs run after container', not: 'docker container hello-world' },
        ],
        hint: 'docker run makes a container from an image. The long form is docker container run.',
        explain: 'docker start only wakes up a container that already exists; docker run is what creates one from an image.',
        output: `${HELLO}\n\n${HELLO}`,
      },
    ],
    // L2 Pulling images
    [
      {
        kind: 'write',
        prompt: 'Download postgres and redis without running them; use docker image pull for redis.',
        starter: '',
        solution: 'docker pull postgres\ndocker image pull redis',
        checks: [
          { label: 'Pull postgres', re: cmd(`${PULL}\\s+postgres\\b`) },
          { label: 'Pull redis with docker image pull', re: cmd('docker\\s+image\\s+pull\\s+redis\\b') },
          { label: 'Don’t start any containers', re: '^(?![\\s\\S]*docker\\s+(?:container\\s+)?run\\b)' },
        ],
        hint: 'pull downloads only. The long form is docker image pull.',
        explain: 'docker pull fetches an image from Docker Hub and stops there, so it is ready for later without starting anything.',
        output:
          'Using default tag: latest\nlatest: Pulling from library/postgres\nStatus: Downloaded newer image for postgres:latest\ndocker.io/library/postgres:latest\nUsing default tag: latest\nlatest: Pulling from library/redis\nStatus: Downloaded newer image for redis:latest\ndocker.io/library/redis:latest',
      },
      {
        kind: 'write',
        prompt: 'Fix each line so it downloads its image from Docker Hub.',
        starter: 'docker download nginx\ndocker get mongo\ndocker image fetch node\n',
        solution: 'docker pull nginx\ndocker pull mongo\ndocker image pull node',
        checks: [
          { label: 'Pull nginx', re: cmd(`${PULL}\\s+nginx\\b`) },
          { label: 'Pull mongo', re: cmd(`${PULL}\\s+mongo\\b`) },
          { label: 'Pull node', re: cmd(`${PULL}\\s+node\\b`) },
        ],
        hint: 'There is one verb for downloading images, with or without image in front.',
        explain: 'docker pull (or docker image pull) is the only download command; download, get and fetch don’t exist.',
        output:
          'Using default tag: latest\nlatest: Pulling from library/nginx\nStatus: Downloaded newer image for nginx:latest\ndocker.io/library/nginx:latest',
      },
    ],
    // L3 Names & tags
    [
      {
        kind: 'write',
        prompt: 'Pull Node 22 on Alpine, Redis 8, and version 2.1 of maria’s quiz image.',
        starter: '',
        solution: 'docker pull node:22-alpine\ndocker pull redis:8\ndocker pull maria/quiz:2.1',
        checks: [
          { label: 'Pull node:22-alpine', re: cmd(`${PULL}\\s+node:22-alpine(?!\\S)`) },
          { label: 'Pull redis:8', re: cmd(`${PULL}\\s+redis:8(?!\\S)`) },
          { label: 'Pull maria/quiz:2.1', re: cmd(`${PULL}\\s+maria/quiz:2\\.1(?!\\S)`) },
        ],
        hint: 'Write repo:tag. An account’s image is account/repo:tag.',
        explain: 'The tag after the colon picks the version or variant; without it Docker would pull latest.',
        output:
          '22-alpine: Pulling from library/node\nStatus: Downloaded newer image for node:22-alpine\ndocker.io/library/node:22-alpine',
      },
      {
        kind: 'write',
        prompt: 'Fix the image references so every pull works.',
        starter: 'docker pull Ana/Shop:1.0\ndocker pull redis 8\ndocker pull postgres-17\n',
        solution: 'docker pull ana/shop:1.0\ndocker pull redis:8\ndocker pull postgres:17',
        checks: [
          { label: 'ana/shop:1.0 in lowercase', re: cmd(`${PULL}\\s+ana/shop:1\\.0(?!\\S)`) },
          { label: 'redis with tag 8', re: cmd(`${PULL}\\s+redis:8(?!\\S)`) },
          { label: 'postgres with tag 17', re: cmd(`${PULL}\\s+postgres:17(?!\\S)`) },
          { label: 'No uppercase repo names', not: 'Ana/Shop' },
        ],
        hint: 'Repo names are lowercase, and a colon (not a space or dash) separates the tag.',
        explain: 'Uppercase repo names are invalid, and redis 8 passes two arguments, which docker pull rejects.',
        output: '17: Pulling from library/postgres\nStatus: Downloaded newer image for postgres:17\ndocker.io/library/postgres:17',
      },
    ],
    // L4 Listing & removing
    [
      {
        kind: 'write',
        prompt: 'List your images, delete redis:7 and httpd:2.4 in one command, then list again.',
        starter: '',
        solution: 'docker images\ndocker rmi redis:7 httpd:2.4\ndocker images',
        checks: [
          { label: 'List images with docker images', re: cmd(IMAGES) },
          { label: 'Remove redis:7 and httpd:2.4 in one command', re: cmd(RMI, '\\sredis:7(?!\\S)', '\\shttpd:2\\.4(?!\\S)') },
          { label: 'List again after removing', re: `${RMI}[^\\n]*\\n[\\s\\S]*${IMAGES}` },
        ],
        hint: 'docker rmi takes several images, separated by spaces.',
        explain: 'docker rmi untags and deletes each image you name, so one command can clean up several.',
        output:
          'Untagged: redis:7\nDeleted: sha256:664f22d7fe58c3f39d7e6f03dc4406ceadcaa0bcf479b54c66c7ddfe63f29c91\nUntagged: httpd:2.4\nDeleted: sha256:4a1a10ff9cc0734832fa82a6dc95c20c9669b7add96f083b0dc24df5575d9715',
      },
      {
        kind: 'write',
        prompt: 'Using the listing, delete mysql by image ID and mongo:8 by name.',
        starter:
          '# docker images printed:\n# REPOSITORY   TAG         IMAGE ID       CREATED       SIZE\n# mysql        8.4         255e323fe70c   2 weeks ago   797MB\n# mongo        8           cca7f49d9b9d   3 weeks ago   873MB\n# node         22-alpine   9e3a1c4d2b7f   1 week ago    163MB\n',
        solution:
          '# docker images printed:\n# REPOSITORY   TAG         IMAGE ID       CREATED       SIZE\n# mysql        8.4         255e323fe70c   2 weeks ago   797MB\n# mongo        8           cca7f49d9b9d   3 weeks ago   873MB\n# node         22-alpine   9e3a1c4d2b7f   1 week ago    163MB\ndocker rmi 255e323fe70c\ndocker image rm mongo:8\ndocker images',
        checks: [
          { label: 'Remove mysql by its image ID', re: cmd(RMI, '\\s255e[0-9a-f]*(?!\\S)') },
          { label: 'Remove mongo:8 by name', re: cmd(RMI, '\\smongo:8(?!\\S)') },
          { label: 'Keep node: don’t remove it', re: `^(?![\\s\\S]*${RMI}[^\\n]*\\s(?:node|9e3a)\\S*)` },
          { label: 'List the images again at the end', re: `${RMI}[^\\n]*\\n[\\s\\S]*${IMAGES}` },
        ],
        hint: 'Copy the ID from the IMAGE ID column. The long form is docker image rm.',
        explain: 'An image ID (or its first few characters) works anywhere a name does, which helps when an image has no handy tag.',
        output:
          'Untagged: mysql:8.4\nDeleted: sha256:255e323fe70cd28c28a5dbfffdc3a6bf2e19d90139fe32318fbe9eeef977ddd9\nUntagged: mongo:8\nDeleted: sha256:cca7f49d9b9d6a4f1d1b0c6e2a8f3e5d7c9b1a2e4f6d8c0b2a4e6f8d0c2b4a6e',
      },
    ],
    // L5 Image layers
    [
      {
        kind: 'write',
        prompt: 'Pull node:22-alpine, then list the steps that built its layers.',
        starter: '',
        solution: 'docker pull node:22-alpine\ndocker image history node:22-alpine',
        checks: [
          { label: 'Pull node:22-alpine', re: cmd(`${PULL}\\s+node:22-alpine(?!\\S)`) },
          { label: 'Show its history', re: cmd(`${HISTORY}`, '\\snode:22-alpine(?!\\S)') },
          { label: 'Pull first, then history', re: `${PULL}[\\s\\S]*${HISTORY}` },
        ],
        hint: 'docker image history (or just docker history) takes an image name.',
        explain: 'history lists one row per build step, newest first; steps that changed files show a size.',
        output:
          'IMAGE          CREATED       CREATED BY                                      SIZE      COMMENT\nb2d5e1f1c3a8   2 weeks ago   CMD ["node"]                                    0B        buildkit.dockerfile.v0\n<missing>      2 weeks ago   ENTRYPOINT ["docker-entrypoint.sh"]             0B        buildkit.dockerfile.v0\n<missing>      2 weeks ago   RUN /bin/sh -c addgroup -g 1000 node …          113MB     buildkit.dockerfile.v0\n<missing>      3 weeks ago   CMD ["/bin/sh"]                                 0B        buildkit.dockerfile.v0\n<missing>      3 weeks ago   ADD alpine-minirootfs-3.22.2-x86_64.tar.gz /…   8.3MB     buildkit.dockerfile.v0',
      },
      {
        kind: 'write',
        prompt: 'Pull hello-world, show its layers, then start two containers from it.',
        starter: '',
        solution: 'docker pull hello-world\ndocker history hello-world\ndocker run hello-world\ndocker run hello-world',
        checks: [
          { label: 'Pull hello-world', re: cmd(`${PULL}\\s+hello-world\\b`) },
          { label: 'Show its layer history', re: cmd(HISTORY, '\\shello-world\\b') },
          { label: 'Start two containers from it', re: `(?:${RUN}\\s+hello-world\\b[\\s\\S]*){2}` },
        ],
        hint: 'history shows the read-only layers; each run adds a container on top of them.',
        explain: 'Both containers share the image’s read-only layers; each one only gets its own thin writable layer on top.',
        output:
          'IMAGE          CREATED        CREATED BY                SIZE      COMMENT\n1b44b5a3e06a   2 months ago   CMD ["/hello"]            0B        buildkit.dockerfile.v0\n<missing>      2 months ago   COPY hello / # buildkit   14.4kB    buildkit.dockerfile.v0\n\n' +
          `${HELLO}\n\n${HELLO}`,
      },
    ],
  ],
};

export default unit;
