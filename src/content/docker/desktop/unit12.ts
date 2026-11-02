import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 12 (Containerizing .NET apps).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: inside the Compose service (or other YAML block) `name`, some line starts with `line`. Any key order. Use flags 'm'. */
const inBlock = (name: string, line: string) =>
  `^([ \\t]*)${name}:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+${line}`;

const BUILD_STAGE =
  'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish Library.csproj -c Release -o /app/publish\n';

const unit: DesktopUnit = {
  lessons: [
    // L1 Port 8080
    [
      {
        kind: 'write',
        prompt: 'Write a runtime Dockerfile for the published Tickets.dll, listening on port 8080.',
        starter: '',
        solution:
          'FROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY publish/ .\nEXPOSE 8080\nENTRYPOINT ["dotnet", "Tickets.dll"]',
        checks: [
          { label: 'Start FROM mcr.microsoft.com/dotnet/aspnet:10.0', re: '^\\s*FROM\\s+mcr\\.microsoft\\.com/dotnet/aspnet:10\\.0\\S*', flags: 'm' },
          { label: 'Copy the published files in with COPY', re: '^\\s*COPY\\s+\\S+\\s+\\S+', flags: 'm' },
          { label: 'EXPOSE 8080, the aspnet image’s default port', re: '^\\s*EXPOSE\\s+8080\\b', flags: 'm' },
          { label: 'ENTRYPOINT ["dotnet", "Tickets.dll"]', re: 'ENTRYPOINT\\s*\\[\\s*"dotnet"\\s*,\\s*"(\\./|/app/)?Tickets\\.dll"\\s*\\]' },
        ],
        hint: 'The runtime image is aspnet, not sdk. The exec form is a JSON array of strings.',
        explain: 'The aspnet images set ASPNETCORE_HTTP_PORTS=8080, so the app already listens there. EXPOSE just documents it.',
      },
      {
        kind: 'write',
        prompt: 'Fix the runs: one on localhost:5000, one listening on 9000 inside the container.',
        starter: 'docker build -t tickets .\ndocker run -d -p 5000:80 tickets\ndocker run -d -p 9000:9000 tickets',
        solution:
          'docker build -t tickets .\ndocker run -d -p 5000:8080 tickets\ndocker run -d -e ASPNETCORE_HTTP_PORTS=9000 -p 9000:9000 tickets',
        checks: [
          { label: 'Map host 5000 to container 8080', re: '-p[\\s=]+5000:8080\\b' },
          { label: 'Nothing maps to container port 80 any more', re: '^(?![\\s\\S]*-p[\\s=]+\\d+:80\\b)' },
          { label: 'Set ASPNETCORE_HTTP_PORTS=9000 with -e on the second run', re: '^(?=.*(-e|--env)[\\s=]+["\']?ASPNETCORE_HTTP_PORTS=9000\\b)(?=.*-p[\\s=]+9000:9000\\b).*$', flags: 'm' },
        ],
        hint: 'The app inside listens on 8080 unless you set the port variable. -p is host:container.',
        explain: 'Publishing to :80 reaches nothing, because the app isn’t listening there. ASPNETCORE_HTTP_PORTS moves the app itself to 9000.',
        output:
          '3f9b2d7c1e8a4f6b0c5d9e2a7f1b3c8d4e6a0f5b9c2d7e1a8f3b6c4d0e9a5f2b\n7a1e4c9f2b6d8e3a5c0f7b1d4e9a2c6f8b3d5e0a7c1f4b9d2e6a8c3f5b0d7e1a',
      },
    ],
    // L2 The app user
    [
      {
        kind: 'write',
        prompt: 'Add a final stage that runs Library.dll as the non-root app user.',
        starter: BUILD_STAGE,
        solution:
          BUILD_STAGE +
          '\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nUSER $APP_UID\nENTRYPOINT ["dotnet", "Library.dll"]',
        checks: [
          { label: 'A second FROM on the aspnet:10.0 image', re: 'AS\\s+build[\\s\\S]*^\\s*FROM\\s+mcr\\.microsoft\\.com/dotnet/aspnet:10\\.0', flags: 'im' },
          { label: 'COPY --from=build /app/publish', re: 'COPY\\s+--from=build\\s+/app/publish/?\\s+\\S+' },
          { label: 'USER $APP_UID in the final stage', re: 'aspnet:10\\.0[\\s\\S]*^\\s*USER\\s+(\\$APP_UID|\\$\\{APP_UID\\}|app|1654)\\s*$', flags: 'm' },
          { label: 'ENTRYPOINT ["dotnet", "Library.dll"]', re: 'ENTRYPOINT\\s*\\[\\s*"dotnet"\\s*,\\s*"(\\./|/app/)?Library\\.dll"\\s*\\]' },
        ],
        hint: 'Copy from the build stage by its name, then switch user before the ENTRYPOINT.',
        explain: 'The .NET images ship a user named app whose ID is in $APP_UID. Only the final stage runs in production, so that’s where USER matters.',
      },
      {
        kind: 'write',
        prompt: 'Run as the app user, but keep /app/uploads writable for it.',
        starter:
          BUILD_STAGE +
          '\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nRUN mkdir /app/uploads\nUSER root\nENTRYPOINT ["dotnet", "Library.dll"]',
        solution:
          BUILD_STAGE +
          '\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nRUN mkdir /app/uploads && chown $APP_UID /app/uploads\nUSER $APP_UID\nENTRYPOINT ["dotnet", "Library.dll"]',
        checks: [
          { label: 'No more USER root', re: '^(?![\\s\\S]*(^|\\n)\\s*USER\\s+(root|0)\\s*(\\n|$))' },
          { label: 'Switch to USER $APP_UID', re: '^\\s*USER\\s+(\\$APP_UID|\\$\\{APP_UID\\}|app|1654)\\s*$', flags: 'm' },
          { label: 'chown /app/uploads to the app user', re: 'chown\\s+(-R\\s+)?(\\$APP_UID|\\$\\{APP_UID\\}|app|1654)(:\\S+)?\\s+/app/uploads' },
          { label: 'Do the chown before USER, while still root', re: 'chown[^\\n]*/app/uploads[\\s\\S]*^\\s*USER\\s', flags: 'm' },
        ],
        hint: 'Only root can change an owner, so chown while you still are root, then switch.',
        explain: 'The app user can’t write to a folder root created. chown hands it over, then USER $APP_UID drops root for good.',
      },
    ],
    // L3 Cache-friendly restore
    [
      {
        kind: 'write',
        prompt: 'Finish the build stage: restore src/Web/Web.csproj (it needs src/Data), then publish.',
        starter: 'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\n',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY src/Web/Web.csproj src/Web/\nCOPY src/Data/Data.csproj src/Data/\nRUN dotnet restore src/Web/Web.csproj\nCOPY . .\nRUN dotnet publish src/Web/Web.csproj -c Release -o /app/publish --no-restore',
        checks: [
          { label: 'COPY src/Web/Web.csproj into src/Web/', re: 'COPY\\s+(\\./)?src/Web/(Web|\\*)\\.csproj\\s+(\\./)?src/Web/' },
          { label: 'COPY src/Data/Data.csproj into src/Data/', re: 'COPY\\s+(\\./)?src/Data/(Data|\\*)\\.csproj\\s+(\\./)?src/Data/' },
          { label: 'Both project files go in before dotnet restore', re: '(Web|Data)\\.csproj[\\s\\S]*(Web|Data)\\.csproj[\\s\\S]*RUN\\s+dotnet\\s+restore' },
          { label: 'Restore the Web project, then COPY . .', re: 'RUN\\s+dotnet\\s+restore\\s+(\\./)?src/Web/Web\\.csproj[\\s\\S]*COPY\\s+\\.\\s+\\.' },
          { label: 'Publish with --no-restore', re: 'RUN\\s+dotnet\\s+publish[^\\n]*--no-restore' },
        ],
        hint: 'Project files first, each into its own folder, then restore. Copy the rest of the code only after that.',
        explain: 'Restore now sits in a layer that only reruns when a .csproj changes, so editing code skips the slow package download.',
      },
      {
        kind: 'write',
        prompt: 'Make this build cache-friendly: restore runs only when Booking.csproj changes.',
        starter:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet restore Booking.csproj\nRUN dotnet publish Booking.csproj -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Booking.dll"]',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY Booking.csproj .\nRUN dotnet restore Booking.csproj\nCOPY . .\nRUN dotnet publish Booking.csproj -c Release -o /app/publish --no-restore -p:UseAppHost=false\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Booking.dll"]',
        checks: [
          { label: 'COPY Booking.csproj on its own first', re: 'COPY\\s+(\\./)?Booking\\.csproj\\s+\\S+[\\s\\S]*dotnet\\s+restore' },
          { label: 'No COPY . . before the restore', re: '^(?![\\s\\S]*COPY\\s+\\.\\s+\\.[\\s\\S]*dotnet\\s+restore)' },
          { label: 'COPY . . after the restore', re: 'dotnet\\s+restore[\\s\\S]*COPY\\s+\\.\\s+\\.' },
          { label: 'Publish with --no-restore', re: 'dotnet\\s+publish[^\\n]*--no-restore' },
          { label: 'Skip the native launcher with -p:UseAppHost=false', re: 'dotnet\\s+publish[^\\n]*-p:UseAppHost=false' },
        ],
        hint: 'A layer reruns when its input changes. Which input should restore depend on?',
        explain: 'With COPY . . first, any code edit invalidated the restore. Now only a .csproj change does, and the ENTRYPOINT never needed the apphost.',
      },
    ],
    // L4 SDK container builds
    [
      {
        kind: 'write',
        prompt: 'Without a Dockerfile, publish the app as acme/clinic:2.0, then run it.',
        starter: '',
        solution:
          'dotnet publish /t:PublishContainer -p:ContainerRepository=acme/clinic -p:ContainerImageTag=2.0\ndocker run -d -p 8080:8080 acme/clinic:2.0',
        checks: [
          { label: 'dotnet publish /t:PublishContainer', re: 'dotnet\\s+publish\\s[^\\n]*[/-]t:PublishContainer\\b' },
          { label: 'Set ContainerRepository=acme/clinic', re: '-p:ContainerRepository=acme/clinic\\b' },
          { label: 'Set ContainerImageTag=2.0', re: '-p:ContainerImageTag=2\\.0\\b' },
          { label: 'Run acme/clinic:2.0, publishing container port 8080', re: 'docker\\s+(container\\s+)?run\\s[^\\n]*-p[\\s=]+\\d+:8080\\b[^\\n]*acme/clinic:2\\.0' },
        ],
        hint: 'Each MSBuild property is -p:Name=value. The SDK image runs on 8080 like the aspnet one.',
        explain: 'PublishContainer picks the aspnet base, sets the app user and port 8080, and loads the image into Docker.',
        output:
          "  Building image 'acme/clinic' with tags '2.0' on top of base image 'mcr.microsoft.com/dotnet/aspnet:10.0'.\n  Pushed image 'acme/clinic:2.0' to local registry via 'docker'.\n9d2c6f1a4e8b3d7c0a5f2e9b1c6d4a8f3e7b0c5d2a9f6e1b4c8d3a7f0e5b2c9d",
      },
      {
        kind: 'write',
        prompt: 'Set the container defaults in the project file instead of on the command line.',
        starter:
          '<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n  </PropertyGroup>\n</Project>',
        solution:
          '<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n    <ContainerRepository>acme/clinic</ContainerRepository>\n    <ContainerImageTags>2.1;latest</ContainerImageTags>\n    <ContainerFamily>noble-chiseled</ContainerFamily>\n  </PropertyGroup>\n</Project>',
        checks: [
          { label: '<ContainerRepository>acme/clinic</ContainerRepository>', re: '<ContainerRepository>\\s*acme/clinic\\s*</ContainerRepository>' },
          { label: 'Two tags, 2.1 and latest, in <ContainerImageTags>', re: '<ContainerImageTags>\\s*(2\\.1;latest|latest;2\\.1)\\s*</ContainerImageTags>' },
          { label: 'A chiseled base with <ContainerFamily>', re: '<ContainerFamily>\\s*[\\w-]*chiseled[\\w-]*\\s*</ContainerFamily>' },
          { label: 'All inside the <PropertyGroup>', re: '<PropertyGroup>(?:(?!</PropertyGroup>)[\\s\\S])*<ContainerFamily>(?:(?!</PropertyGroup>)[\\s\\S])*</PropertyGroup>' },
        ],
        hint: 'Properties are elements inside <PropertyGroup>. Several tags are separated by semicolons.',
        explain: 'Now a plain dotnet publish /t:PublishContainer builds acme/clinic:2.1 and :latest on the smaller, shell-less chiseled image.',
      },
    ],
    // L5 Compose with Postgres
    [
      {
        kind: 'write',
        prompt: 'Write compose.yaml: the garage API built from here, talking to Postgres 18.',
        starter: '',
        solution:
          'services:\n  api:\n    build: .\n    ports:\n      - "8080:8080"\n    environment:\n      ConnectionStrings__Default: "Host=db;Database=garage;Username=postgres;Password=${DB_PASSWORD}"\n  db:\n    image: postgres:18\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD}',
        checks: [
          { label: 'An api service built from . and published on container port 8080', re: inBlock('api', 'build:\\s*\\.?/?\\s*$') + '[\\s\\S]*:8080\\b', flags: 'm' },
          { label: 'A db service on image postgres:18', re: inBlock('db', 'image:\\s*["\']?postgres:18'), flags: 'm' },
          { label: 'Set ConnectionStrings__Default with Host=db', re: 'ConnectionStrings__Default[:=][^\\n]*Host=db\\b' },
          { label: 'Never Host=localhost: that’s the api container itself', re: '^(?![\\s\\S]*Host=localhost)' },
          { label: 'Give postgres its POSTGRES_PASSWORD', re: 'POSTGRES_PASSWORD[:=]' },
        ],
        hint: 'Services find each other by service name. The double underscore stands for a colon in config keys.',
        explain: 'ASP.NET Core reads ConnectionStrings__Default as ConnectionStrings:Default, and db resolves to the Postgres container on the Compose network.',
      },
      {
        kind: 'write',
        prompt: 'Make api wait for a healthy db, and keep db’s data in a named volume.',
        starter:
          'services:\n  api:\n    build: .\n    environment:\n      ConnectionStrings__Default: "Host=db;Database=garage;Username=postgres;Password=${DB_PASSWORD}"\n  db:\n    image: postgres:18\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n',
        solution:
          'services:\n  api:\n    build: .\n    environment:\n      ConnectionStrings__Default: "Host=db;Database=garage;Username=postgres;Password=${DB_PASSWORD}"\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres:18\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n    volumes:\n      - pgdata:/var/lib/postgresql\n    healthcheck:\n      test: ["CMD", "pg_isready", "-U", "postgres"]\n      interval: 5s\n      retries: 10\nvolumes:\n  pgdata:',
        checks: [
          { label: 'A pg_isready healthcheck on db', re: 'healthcheck:[\\s\\S]*test:[^\\n]*pg_isready' },
          { label: 'api depends_on db with condition: service_healthy', re: inBlock('api', 'depends_on:[\\s\\S]*?db:\\s*\\n\\s+condition:\\s*service_healthy'), flags: 'm' },
          { label: 'Mount a named volume at /var/lib/postgresql', re: '-\\s*["\']?[\\w-]+:/var/lib/postgresql/?["\']?\\s*$', flags: 'm' },
          { label: 'Declare the volume under top-level volumes:', re: '^volumes:\\s*\\n\\s+[\\w-]+:', flags: 'm' },
        ],
        hint: 'service_healthy needs a healthcheck to wait on. Postgres 18 keeps its data under /var/lib/postgresql.',
        explain: 'depends_on alone only waits for db to start. With service_healthy, api starts once pg_isready says Postgres accepts connections.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L1.7': {
      kind: 'fill',
      prompt: 'Mapped to 80 out of habit. What does curl.exe get?',
      code: 'docker run -d -p 8080:80 recipes\ncurl.exe localhost:8080\n# curl.exe gets ___',
      blanks: [{ answer: ['an error'], options: ['an error', 'the home page'] }],
      hint: 'Is anything listening on 80 inside the container?',
      explain: 'Docker forwards to port 80 in the container, but Kestrel is on 8080, so the connection closes with no reply. Use -p 8080:8080.',
      output: 'curl: (52) Empty reply from server',
    },
    'L4.6': {
      kind: 'order',
      prompt: 'Publish 1.2, run it, then call it.',
      lines: [
        'dotnet publish /t:PublishContainer -p:ContainerImageTag=1.2',
        'docker run -d -p 8080:8080 recipes:1.2',
        'curl.exe localhost:8080/recipes/1',
      ],
      hint: 'The image must exist before a container can start.',
      explain: 'The SDK-built image listens on 8080 like any aspnet image, so the usual -p 8080:8080 works. curl.exe is the real curl; in Windows PowerShell plain curl is Invoke-WebRequest.',
      output: '  Building image \'recipes\' with tags \'1.2\' on top of base image \'mcr.microsoft.com/dotnet/aspnet:10.0\'.\n  Pushed image \'recipes:1.2\' to local registry via \'docker\'.\n4b8d2f6a0c1e3957b9d1f3a5c7e9b0d2f4a6c8e1b3d5f7a9c0e2b4d6f8a1c3e5\n{"id":1,"name":"Pancakes","minutes":20}',
    },
  },
};

export default unit;
