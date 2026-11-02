import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 3 (Writing Dockerfiles).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Nothing but comments and blank lines before this (start of the file). */
const FIRST = '^(?:[ \\t]*(?:#[^\\n]*)?\\n)*[ \\t]*';
/** A JSON-array (exec form) string, e.g. "node". */
const q = (s: string) => `\\s*"${s}"\\s*`;

const unit: DesktopUnit = {
  lessons: [
    // L1 FROM & RUN
    [
      {
        kind: 'write',
        prompt: 'Write a commented Dockerfile for a tiny Alpine image with git installed.',
        starter: '',
        solution: '# Tiny image with git for cloning repos\nFROM alpine:3.22\nRUN apk add --no-cache git',
        checks: [
          { label: 'A # comment saying what the image is for', re: '^[ \\t]*#\\s*\\S', flags: 'm' },
          { label: 'FROM alpine is the first instruction', re: `${FIRST}FROM\\s+alpine(?::[\\w.-]+)?\\s*\\n` },
          { label: 'RUN apk add to install git', re: '^RUN\\s+apk\\s+add\\b[^\\n]*\\sgit\\b', flags: 'm' },
        ],
        hint: 'Alpine’s package manager is apk: apk add --no-cache git.',
        explain: 'FROM picks the base image and must come first; RUN executes while the image builds, so git is baked in.',
      },
      {
        kind: 'write',
        prompt: 'Fix this Dockerfile so it builds an Ubuntu image with curl and jq.',
        starter: '# API checker with curl and jq\nRUN apt-get update && apt-get install curl jq\nfrom ubuntu:24.04\n',
        solution: '# API checker with curl and jq\nFROM ubuntu:24.04\nRUN apt-get update && apt-get install -y curl jq',
        checks: [
          { label: 'FROM ubuntu:24.04 first, in uppercase', re: `${FIRST}FROM\\s+ubuntu:24\\.04\\s*\\n` },
          { label: 'Run apt-get update before installing', re: '^RUN\\s+apt-get\\s+update\\s*&&\\s*apt-get\\s+install\\b', flags: 'm' },
          {
            label: 'Install curl and jq with -y so nothing asks',
            re: '^RUN\\b(?=[^\\n]*\\sinstall\\b)(?=[^\\n]*\\s(?:-[a-z]*y[a-z]*|--yes)\\b)(?=[^\\n]*\\scurl\\b)(?=[^\\n]*\\sjq\\b)',
            flags: 'm',
          },
          { label: 'No lowercase from left over', not: 'from ubuntu' },
        ],
        hint: 'A build can’t answer apt-get’s “Do you want to continue?”, so it needs -y.',
        explain: 'Nothing can run before FROM, and without -y apt-get aborts the build at its yes/no prompt.',
      },
    ],
    // L2 WORKDIR & COPY
    [
      {
        kind: 'write',
        prompt: 'Set up a Node 22 Alpine image in /app: copy package.json, then the src folder.',
        starter: '',
        solution: 'FROM node:22-alpine\nWORKDIR /app\nCOPY package.json ./\nCOPY src/ ./src/',
        checks: [
          { label: 'FROM node:22-alpine', re: '^FROM\\s+node:22-alpine\\s*$', flags: 'm' },
          { label: 'WORKDIR /app before any COPY', re: '^(?:[ \\t]*(?!COPY\\b)[^\\n]*\\n)*[ \\t]*WORKDIR\\s+/app/?[ \\t]*\\n[\\s\\S]*\\nCOPY\\b' },
          { label: 'COPY package.json into the work folder', re: '^COPY\\s+package\\.json\\s+(?:\\./?|/app/?)\\s*$', flags: 'm' },
          { label: 'COPY src/ to ./src/', re: '^COPY\\s+(?:\\./)?src/?\\s+(?:\\./|/app/)?src/?\\s*$', flags: 'm' },
        ],
        hint: 'After WORKDIR /app, a destination of ./ means /app.',
        explain: 'WORKDIR creates /app and makes it the current folder, so relative COPY destinations land inside it.',
      },
      {
        kind: 'write',
        prompt: 'Fill the static site image: copy the page and css, and unpack the fonts archive.',
        starter: 'FROM nginx:alpine\n# serve files from nginx’s html folder\n',
        solution:
          'FROM nginx:alpine\n# serve files from nginx’s html folder\nWORKDIR /usr/share/nginx/html\nCOPY index.html .\nCOPY css/ ./css/\nADD fonts.tar.gz ./fonts/',
        checks: [
          { label: 'WORKDIR /usr/share/nginx/html', re: '^WORKDIR\\s+/usr/share/nginx/html/?\\s*$', flags: 'm' },
          { label: 'COPY index.html in', re: '^COPY\\s+(?:\\./)?index\\.html\\s+\\S+', flags: 'm' },
          { label: 'COPY the css/ folder to ./css/', re: '^COPY\\s+(?:\\./)?css/?\\s+(?:\\./|/usr/share/nginx/html/)?css/?\\s*$', flags: 'm' },
          { label: 'ADD fonts.tar.gz so it unpacks into ./fonts/', re: '^ADD\\s+(?:\\./)?fonts\\.tar\\.gz\\s+\\S*fonts/?\\s*$', flags: 'm' },
          { label: 'Use COPY, not ADD, for plain files', re: '^(?![\\s\\S]*\\nADD\\s+(?!\\S*\\.tar))' },
        ],
        hint: 'ADD unpacks a local .tar.gz into the destination; COPY just copies.',
        explain: 'COPY is the predictable choice for plain files; ADD is only worth it here because it unpacks the archive for you.',
      },
    ],
    // L3 CMD
    [
      {
        kind: 'write',
        prompt: 'Package quiz.py on Python 3.13 slim so the container runs it by default.',
        starter: '',
        solution: 'FROM python:3.13-slim\nWORKDIR /app\nCOPY quiz.py .\nCMD ["python", "quiz.py"]',
        checks: [
          { label: 'FROM python:3.13-slim', re: '^FROM\\s+python:3\\.13-slim\\s*$', flags: 'm' },
          { label: 'Set a WORKDIR and copy quiz.py in', re: '^WORKDIR\\s+\\S+[\\s\\S]*^COPY\\s+(?:\\./)?quiz\\.py\\s+\\S+', flags: 'm' },
          { label: 'CMD in exec form: ["python", "quiz.py"]', re: `^CMD\\s*\\[${q('python3?')},${q('(?:\\./)?quiz\\.py')}\\]`, flags: 'm' },
        ],
        hint: 'Exec form is a JSON array: every word in double quotes, separated by commas.',
        explain: 'The exec form runs python directly as the container’s main process, with no shell in between.',
        output: 'Question 1: What is the capital of Peru?',
      },
      {
        kind: 'write',
        prompt: 'Fix the Dockerfile so the app starts from one exec-form CMD.',
        starter:
          'FROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY publish/ .\nCMD dotnet Tickets.dll\nCMD [\'dotnet\', \'Tickets.dll\']\n',
        solution: 'FROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY publish/ .\nCMD ["dotnet", "Tickets.dll"]',
        checks: [
          { label: 'CMD ["dotnet", "Tickets.dll"] with double quotes', re: `^CMD\\s*\\[${q('dotnet')},${q('Tickets\\.dll')}\\]`, flags: 'm' },
          { label: 'Only one CMD line', re: '^(?![\\s\\S]*\\nCMD\\b[\\s\\S]*\\nCMD\\b)' },
          { label: 'No shell-form CMD', not: 'CMD dotnet' },
          { label: 'No single quotes in the array', not: "'dotnet'" },
        ],
        hint: 'JSON needs double quotes; with single quotes Docker treats the line as shell form.',
        explain: 'Only the last CMD counts anyway, and single-quoted arrays aren’t JSON, so they silently run through /bin/sh -c.',
        output: 'info: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://[::]:8080',
      },
    ],
    // L4 ENTRYPOINT
    [
      {
        kind: 'write',
        prompt: 'Make a header-checker image: always runs curl -sI, default URL https://example.com.',
        starter: '',
        solution: 'FROM alpine:3.22\nRUN apk add --no-cache curl\nENTRYPOINT ["curl", "-sI"]\nCMD ["https://example.com"]',
        checks: [
          { label: 'Install curl with RUN', re: '^RUN\\s+apk\\s+add\\b[^\\n]*\\scurl\\b', flags: 'm' },
          { label: 'ENTRYPOINT ["curl", "-sI"] in exec form', re: `^ENTRYPOINT\\s*\\[${q('curl')},${q('-(?:sI|Is)')}\\]`, flags: 'm' },
          { label: 'CMD supplies the default URL', re: `^CMD\\s*\\[${q('https://example\\.com/?')}\\]`, flags: 'm' },
        ],
        hint: 'ENTRYPOINT is the fixed program, CMD the default arguments it gets.',
        explain: 'docker run hdr runs curl -sI https://example.com; any URL after the image name replaces only the CMD part.',
        output: 'HTTP/2 200\ncontent-type: text/html\ncache-control: max-age=86400',
      },
      {
        kind: 'write',
        prompt: 'Run the hdr image three ways: default URL, your own URL, then a shell.',
        starter: '# hdr was built from:\n# ENTRYPOINT ["curl", "-sI"]\n# CMD ["https://example.com"]\n',
        solution:
          '# hdr was built from:\n# ENTRYPOINT ["curl", "-sI"]\n# CMD ["https://example.com"]\ndocker run --rm hdr\ndocker run --rm hdr https://docs.docker.com\ndocker run --rm -it --entrypoint sh hdr',
        checks: [
          { label: 'Run hdr with no arguments (default URL)', re: '^docker\\s+(?:container\\s+)?run\\b[^\\n]*\\shdr\\s*$', flags: 'm' },
          { label: 'Run hdr with another URL after the image name', re: '^docker\\s+(?:container\\s+)?run\\b[^\\n]*\\shdr\\s+https?://\\S+\\s*$', flags: 'm' },
          {
            label: 'Swap the program for sh with --entrypoint',
            re: '^docker\\s+(?:container\\s+)?run\\b[^\\n]*\\s--entrypoint[\\s=]+(?:sh|/bin/sh)\\s[^\\n]*\\bhdr\\s*$',
            flags: 'm',
          },
          { label: 'Use -it for the shell', re: '^docker\\s+(?:container\\s+)?run\\b(?=[^\\n]*\\s-[a-z]*(?:it|ti)[a-z]*\\s)[^\\n]*--entrypoint', flags: 'm' },
        ],
        hint: 'Words after the image go to the ENTRYPOINT. --entrypoint goes before the image name.',
        explain: 'Extra words replace CMD only, so curl still runs; to run something else entirely you override the ENTRYPOINT.',
        output: 'HTTP/2 200\ncontent-type: text/html\n\nHTTP/2 200\ncontent-type: text/html; charset=utf-8\n\n/ #',
      },
    ],
    // L5 EXPOSE & USER
    [
      {
        kind: 'write',
        prompt: 'Write a Node 22 image that documents port 3000 and runs as the node user.',
        starter: '',
        solution: 'FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nEXPOSE 3000\nUSER node\nCMD ["node", "server.js"]',
        checks: [
          { label: 'FROM a node:22 image', re: '^FROM\\s+node:22\\S*\\s*$', flags: 'm' },
          { label: 'EXPOSE 3000', re: '^EXPOSE\\s+3000(?:/tcp)?\\s*$', flags: 'm' },
          { label: 'USER node', re: '^USER\\s+node\\s*$', flags: 'm' },
          { label: 'Start server.js with an exec-form CMD after USER', re: `^USER\\b[\\s\\S]*^CMD\\s*\\[${q('node')},${q('(?:\\./)?server\\.js')}\\]`, flags: 'm' },
        ],
        hint: 'The official node images already have a user called node.',
        explain: 'EXPOSE only documents the port; USER node makes the app run without root rights.',
        output: 'Server listening on port 3000',
      },
      {
        kind: 'write',
        prompt: 'Fix the order so pip can install, then run as nobody on port 5000.',
        starter:
          'FROM python:3.13-slim\nUSER nobody\nRUN pip install flask\nWORKDIR /app\nCOPY . .\nCMD ["flask", "run", "--host", "0.0.0.0"]\n',
        solution:
          'FROM python:3.13-slim\nRUN pip install flask\nWORKDIR /app\nCOPY . .\nEXPOSE 5000\nUSER nobody\nCMD ["flask", "run", "--host", "0.0.0.0"]',
        checks: [
          { label: 'pip install flask while still root', re: '^(?![\\s\\S]*\\nUSER\\b[\\s\\S]*\\nRUN\\s+pip\\b)[\\s\\S]*\\nRUN\\s+pip\\s+install\\b[^\\n]*\\bflask\\b' },
          { label: 'Switch to USER nobody after the install', re: '^RUN\\s+pip\\b[\\s\\S]*^USER\\s+nobody\\s*$', flags: 'm' },
          { label: 'Document port 5000 with EXPOSE', re: '^EXPOSE\\s+5000(?:/tcp)?\\s*$', flags: 'm' },
          { label: 'Keep the exec-form CMD last', re: '^USER\\b[\\s\\S]*^CMD\\s*\\[[^\\n]*\\]\\s*$(?![\\s\\S]*\\n\\s*[A-Z]+\\s)', flags: 'm' },
        ],
        hint: 'USER affects every RUN after it, and nobody can’t write to Python’s packages folder.',
        explain: 'Install as root, then drop to an unprivileged user just before the app starts.',
        output: ' * Running on all addresses (0.0.0.0)\n * Running on http://127.0.0.1:5000',
      },
    ],
  ],
};

export default unit;
