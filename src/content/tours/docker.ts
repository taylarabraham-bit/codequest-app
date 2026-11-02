import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'Find your way around',
    blurb: 'The app that runs Docker on Windows, and what its buttons do.',
    screen: 'dockerdesktop',
    variant: 'containers',
    steps: [
      {
        prompt: 'Check that the Docker Engine is running.',
        hint: 'Bottom-left corner.',
        explain: 'Docker commands only work while the engine (running in WSL 2 on Windows) is up. Green means ready.',
        target: 'engine-status',
      },
      {
        prompt: 'Open the website served by the web container in your browser.',
        hint: 'The web row has a port mapping that is a link.',
        explain: '8080:80 means port 8080 on your PC goes to port 80 in the container. Clicking it opens http://localhost:8080.',
        target: 'port-web',
      },
      {
        prompt: 'Open the web container to read its logs.',
        hint: 'Click its name.',
        explain: 'A container’s page has Logs, Inspect, Bind mounts, Exec, Files and Stats tabs. Logs is what docker logs prints.',
        target: 'row-web',
      },
      {
        prompt: 'Start the stopped old-app container again.',
        hint: 'Its row shows Exited. Look in the Actions column.',
        explain: 'Start is docker start: the same container, with its files, comes back. docker run would make a new one.',
        target: 'start-old-app',
      },
      {
        prompt: 'Stop the database container.',
        hint: 'The square in the db row.',
        explain: 'Stop sends the main process SIGTERM, then SIGKILL after 10 seconds, the same as docker stop.',
        target: 'stop-db',
      },
      {
        prompt: 'See the images you have downloaded or built.',
        hint: 'Left-hand menu.',
        explain: 'Images lists local images, their tags and sizes, and lets you run, push or delete them.',
        target: 'nav-images',
      },
      {
        prompt: 'Where does data that must outlive a container live?',
        hint: 'Left-hand menu, under Images.',
        explain: 'Volumes are storage managed by Docker. Deleting a container leaves its volumes alone.',
        target: 'nav-volumes',
      },
    ],
  },
  {
    title: 'Your first Docker commands',
    blurb: 'Type real commands at a PowerShell prompt.',
    screen: 'terminal',
    steps: [
      {
        prompt: 'Check Docker is installed: type docker --version and press Enter.',
        hint: 'Two dashes before version.',
        explain: 'If this prints a version, the docker command-line tool is on your PATH. Your version number will differ.',
        command: ['docker --version', 'docker -v'],
        output: 'Docker version 28.5.1, build e180ab8',
      },
      {
        prompt: 'Run the hello-world test image.',
        hint: 'docker run, then the image name.',
        explain: 'docker run pulls the image if you do not have it, makes a container from it and starts it. This one prints a message and exits.',
        command: ['docker run hello-world'],
        output:
          "Unable to find image 'hello-world:latest' locally\nlatest: Pulling from library/hello-world\nDigest: sha256:…\nStatus: Downloaded newer image for hello-world:latest\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.",
      },
      {
        prompt: 'List all containers, including stopped ones.',
        hint: 'docker ps on its own only shows running containers. Add a flag for all.',
        explain: 'docker ps -a also shows exited containers. Each gets a random name unless you give it one with --name.',
        command: ['docker ps -a', 'docker ps --all', 'docker container ls -a', 'docker container ls --all'],
        output:
          'CONTAINER ID   IMAGE         COMMAND    CREATED          STATUS                      PORTS   NAMES\n3f2c1e9a7b4d   hello-world   "/hello"   20 seconds ago   Exited (0) 19 seconds ago           eager_turing',
      },
      {
        prompt: 'Start nginx in the background on port 8080, named web.',
        hint: 'docker run -d -p 8080:80 --name web nginx',
        explain: '-d detaches (runs in the background), -p maps PC port 8080 to container port 80, --name sets the name. It prints the new container’s ID.',
        command: ['docker run -d -p 8080:80 --name web nginx', 'docker run --name web -d -p 8080:80 nginx', 'docker run -p 8080:80 -d --name web nginx', 'docker run -d --name web -p 8080:80 nginx'],
        output: 'a41f7c0d2e9b8c51f3e6d7a2b9c04e1f5d8a7b6c3e2f1a0b9c8d7e6f5a4b3c2d',
      },
      {
        prompt: 'Open a second terminal tab for another command while nginx runs.',
        hint: 'The + next to the tab.',
        explain: 'Windows Terminal tabs (Ctrl+Shift+T) let you keep a long-running command in one tab and work in another.',
        target: 'new-tab',
      },
    ],
  },
];

export default tours;
