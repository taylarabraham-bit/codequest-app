import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 17 (From Compose to Kubernetes).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: the selector's app label equals the pod template's app label (block or flow style). */
const LABELS_MATCH =
  'matchLabels:\\s*(?:\\{\\s*)?app:\\s*["\']?([\\w.-]+)["\']?[\\s\\S]*?template:[\\s\\S]*?labels:\\s*(?:\\{\\s*)?app:\\s*["\']?\\1["\']?\\s*[\\n}]';

/** Regex source: a Service whose selector picks app=`name`. */
const svcSelects = (name: string) => `kind:\\s*Service\\b[\\s\\S]*?selector:\\s*(?:\\{\\s*)?app:\\s*["']?${name}["']?\\s*[\\n}]`;

const QUIZ_DEPLOY =
  'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: quiz\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: quiz\n  template:\n    metadata:\n      labels:\n        app: quiz\n    spec:\n      containers:\n        - name: quiz\n          image: ghcr.io/ana/quiz:2.0\n          ports:\n            - containerPort: 8080';

const unit: DesktopUnit = {
  lessons: [
    // L1 Pods & Deployments
    [
      {
        kind: 'write',
        prompt: 'Write a Deployment that keeps 2 pods of ghcr.io/ana/quiz:2.0 running on port 8080.',
        starter: '',
        solution: QUIZ_DEPLOY,
        checks: [
          { label: 'apiVersion: apps/v1 and kind: Deployment', re: '^apiVersion:\\s*apps/v1\\s*\\n(?:.*\\n)*?kind:\\s*Deployment\\b|^kind:\\s*Deployment\\s*\\n(?:.*\\n)*?apiVersion:\\s*apps/v1\\b', flags: 'm' },
          { label: 'replicas: 2', re: '^[ \\t]+replicas:\\s*2\\s*$', flags: 'm' },
          { label: 'The selector’s app label matches the template’s', re: LABELS_MATCH },
          { label: 'A container on image ghcr.io/ana/quiz:2.0', re: 'containers:\\s*\\n[\\s\\S]*?image:\\s*["\']?ghcr\\.io/ana/quiz:2\\.0\\b' },
          { label: 'containerPort: 8080', re: 'containerPort:\\s*8080\\b' },
        ],
        hint: 'spec has replicas, selector and template. The template is a pod: metadata.labels plus spec.containers.',
        explain: 'The Deployment finds its pods by label, so the selector must match the template’s labels or the API server rejects it.',
      },
      {
        kind: 'write',
        prompt: 'This Deployment is rejected. Fix the apiVersion and the labels, and run 3 copies.',
        starter:
          'apiVersion: v1\nkind: Deployment\nmetadata:\n  name: shop\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: shop\n  template:\n    metadata:\n      labels:\n        app: storefront\n    spec:\n      containers:\n        - name: shop\n          image: acme/shop:4.1\n',
        solution:
          'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: shop\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: shop\n  template:\n    metadata:\n      labels:\n        app: shop\n    spec:\n      containers:\n        - name: shop\n          image: acme/shop:4.1',
        checks: [
          { label: 'apiVersion: apps/v1', re: '^apiVersion:\\s*apps/v1\\s*$', flags: 'm' },
          { label: 'The selector and template labels match', re: LABELS_MATCH },
          { label: 'replicas: 3', re: '^[ \\t]+replicas:\\s*3\\s*$', flags: 'm' },
        ],
        hint: 'Deployments live in the apps group. Pick one app label and use it in both places.',
        explain: 'Core v1 has no Deployment kind, and a selector that matches none of the template’s pods would never find them.',
      },
    ],
    // L2 Services
    [
      {
        kind: 'write',
        prompt: 'Give the quiz pods a Service: callers use port 80, the container listens on 8080.',
        starter: '',
        solution: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: quiz\nspec:\n  selector:\n    app: quiz\n  ports:\n    - port: 80\n      targetPort: 8080',
        checks: [
          { label: 'apiVersion: v1 and kind: Service', re: '^apiVersion:\\s*v1\\s*\\n(?:.*\\n)*?kind:\\s*Service\\b|^kind:\\s*Service\\s*\\n(?:.*\\n)*?apiVersion:\\s*v1\\b', flags: 'm' },
          { label: 'A metadata name', re: 'metadata:\\s*(\\n\\s+|\\{\\s*)name:\\s*["\']?[\\w-]+' },
          { label: 'selector: app: quiz', re: svcSelects('quiz') },
          { label: 'port: 80', re: '\\bport:\\s*80\\b' },
          { label: 'targetPort: 8080', re: 'targetPort:\\s*8080\\b' },
        ],
        hint: 'port is what callers use, targetPort is where the container listens.',
        explain: 'Other pods now reach any ready quiz pod at http://quiz, with no port in the URL, however often the pods are replaced.',
      },
      {
        kind: 'write',
        prompt: 'Add a Service named cache after the ---, so the app can reach redis at cache:6379.',
        starter:
          'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: redis\nspec:\n  selector:\n    matchLabels: { app: redis }\n  template:\n    metadata:\n      labels: { app: redis }\n    spec:\n      containers:\n        - name: redis\n          image: redis:8\n---\n',
        solution:
          'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: redis\nspec:\n  selector:\n    matchLabels: { app: redis }\n  template:\n    metadata:\n      labels: { app: redis }\n    spec:\n      containers:\n        - name: redis\n          image: redis:8\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: cache\nspec:\n  selector: { app: redis }\n  ports:\n    - port: 6379\n      targetPort: 6379',
        checks: [
          { label: 'A Service after the ---', re: '^---\\s*\\n[\\s\\S]*^kind:\\s*Service\\b', flags: 'm' },
          { label: 'Named cache', re: 'kind:\\s*Service\\b[\\s\\S]*?metadata:\\s*(\\n\\s+|\\{\\s*)name:\\s*["\']?cache\\b' },
          { label: 'Its selector picks app: redis', re: svcSelects('redis') },
          { label: 'port: 6379', re: 'kind:\\s*Service\\b[\\s\\S]*\\bport:\\s*6379\\b' },
        ],
        hint: 'The Service name becomes the DNS name. Its selector must match the pod labels, not the Deployment name.',
        explain: 'The name callers use and the pods’ labels are independent: cache is just a stable address in front of the app=redis pods.',
      },
    ],
    // L3 ConfigMaps & Secrets
    [
      {
        kind: 'write',
        prompt: 'Write a ConfigMap with LOG_LEVEL and a Secret with DB_PASSWORD, as plain text.',
        starter: '',
        solution:
          'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: quiz-config\ndata:\n  LOG_LEVEL: info\n---\napiVersion: v1\nkind: Secret\nmetadata:\n  name: quiz-secrets\nstringData:\n  DB_PASSWORD: s3cret-pass',
        checks: [
          { label: 'A ConfigMap with data: LOG_LEVEL', re: 'kind:\\s*ConfigMap\\b[\\s\\S]*?^data:\\s*\\n(?:[ \\t]+.*\\n)*?[ \\t]+LOG_LEVEL:\\s*\\S', flags: 'm' },
          { label: 'Separate the two with ---', re: '^---\\s*$', flags: 'm' },
          { label: 'A Secret', re: '^kind:\\s*Secret\\b', flags: 'm' },
          { label: 'stringData: DB_PASSWORD, so no base64 by hand', re: '^stringData:\\s*\\n(?:[ \\t]+.*\\n)*?[ \\t]+DB_PASSWORD:\\s*\\S', flags: 'm' },
          { label: 'Each has a metadata name', re: '(metadata:\\s*(\\n\\s+|\\{\\s*)name:\\s*["\']?[\\w-]+[\\s\\S]*){2}' },
        ],
        hint: 'Both are apiVersion: v1. Under stringData the API server does the base64 for you.',
        explain: 'Splitting settings from passwords lets you lock Secrets down with RBAC. Base64 is encoding, not encryption.',
      },
      {
        kind: 'write',
        prompt: 'Load every key of quiz-config, and only DB_PASSWORD from quiz-secrets.',
        starter: '      containers:\n        - name: quiz\n          image: ghcr.io/ana/quiz:2.0\n',
        solution:
          '      containers:\n        - name: quiz\n          image: ghcr.io/ana/quiz:2.0\n          envFrom:\n            - configMapRef:\n                name: quiz-config\n          env:\n            - name: DB_PASSWORD\n              valueFrom:\n                secretKeyRef:\n                  name: quiz-secrets\n                  key: DB_PASSWORD',
        checks: [
          { label: 'envFrom with a configMapRef to quiz-config', re: 'envFrom:\\s*\\n\\s*-\\s*configMapRef:\\s*(\\n\\s*|\\{\\s*)name:\\s*["\']?quiz-config\\b' },
          { label: 'An env entry named DB_PASSWORD', re: 'env:\\s*\\n\\s*-\\s*name:\\s*["\']?DB_PASSWORD\\b' },
          { label: 'valueFrom.secretKeyRef on quiz-secrets', re: 'valueFrom:\\s*\\n\\s*secretKeyRef:\\s*\\n(?:\\s*key:.*\\n)?\\s*name:\\s*["\']?quiz-secrets\\b' },
          { label: 'key: DB_PASSWORD', re: 'secretKeyRef:[\\s\\S]*key:\\s*["\']?DB_PASSWORD\\b' },
        ],
        hint: 'envFrom takes a list of whole sources. A single key comes from env[].valueFrom.',
        explain: 'envFrom turns every ConfigMap key into a variable; secretKeyRef pulls just one key, so other secrets stay out of the process.',
      },
    ],
    // L4 Probes & resources
    [
      {
        kind: 'write',
        prompt: 'Add HTTP probes: ready at /healthz/ready, alive at /healthz, both on 8080.',
        starter: '      containers:\n        - name: quiz\n          image: ghcr.io/ana/quiz:2.0\n          ports:\n            - containerPort: 8080\n',
        solution:
          '      containers:\n        - name: quiz\n          image: ghcr.io/ana/quiz:2.0\n          ports:\n            - containerPort: 8080\n          readinessProbe:\n            httpGet:\n              path: /healthz/ready\n              port: 8080\n          livenessProbe:\n            httpGet:\n              path: /healthz\n              port: 8080',
        checks: [
          { label: 'readinessProbe with httpGet path /healthz/ready', re: 'readinessProbe:\\s*\\n\\s*httpGet:\\s*(\\{[^}]*|\\n(?:\\s+(?!\\w+Probe).*\\n)*?\\s+)path:\\s*["\']?/healthz/ready\\b' },
          { label: 'livenessProbe with httpGet path /healthz', re: 'livenessProbe:\\s*\\n\\s*httpGet:\\s*(\\{[^}]*|\\n(?:\\s+(?!\\w+Probe).*\\n)*?\\s+)path:\\s*["\']?/healthz["\']?\\s*[\\n,}]' },
          { label: 'Both probe port 8080', re: '(Probe:[\\s\\S]*?port:\\s*8080\\b[\\s\\S]*){2}' },
        ],
        hint: 'Each probe holds an httpGet with path and port, at the same level as ports.',
        explain: 'Until /healthz/ready passes the pod gets no traffic; if /healthz keeps failing, the kubelet restarts the container.',
      },
      {
        kind: 'write',
        prompt: 'Translate the Compose healthcheck and limits into the db container spec.',
        starter:
          '# Compose had:\n#   healthcheck: { test: ["CMD", "pg_isready", "-U", "postgres"], interval: 10s }\n#   deploy: { resources: { limits: { memory: 512M } } }\n      containers:\n        - name: db\n          image: postgres:18\n',
        solution:
          '# Compose had:\n#   healthcheck: { test: ["CMD", "pg_isready", "-U", "postgres"], interval: 10s }\n#   deploy: { resources: { limits: { memory: 512M } } }\n      containers:\n        - name: db\n          image: postgres:18\n          livenessProbe:\n            exec:\n              command: ["pg_isready", "-U", "postgres"]\n            periodSeconds: 10\n          resources:\n            requests:\n              memory: 256Mi\n              cpu: 250m\n            limits:\n              memory: 512Mi',
        checks: [
          { label: 'A livenessProbe that execs pg_isready', re: 'livenessProbe:\\s*\\n\\s*exec:\\s*\\n\\s*command:[^\\n]*pg_isready|livenessProbe:\\s*\\n\\s*exec:\\s*\\n\\s*command:\\s*\\n\\s*-\\s*["\']?pg_isready' },
          { label: 'periodSeconds: 10', re: 'periodSeconds:\\s*10\\b' },
          { label: 'resources.limits memory: 512Mi', re: 'limits:\\s*(\\n\\s*(cpu:.*\\n\\s*)?|\\{\\s*)memory:\\s*["\']?512Mi\\b' },
          { label: 'Some resources.requests', re: 'resources:[\\s\\S]*requests:\\s*(\\n\\s+|\\{\\s*)(memory|cpu):' },
        ],
        hint: 'exec.command is a list with no "CMD" in front. Kubernetes writes memory as Mi, not M.',
        explain: 'Requests reserve room on a node and limits cap the container. Unlike Compose, a failing liveness probe restarts it.',
      },
    ],
    // L5 kubectl, kind & Kompose
    [
      {
        kind: 'write',
        prompt: 'Make a kind cluster called dev, load your local quiz:dev image, deploy k8s/ and wait.',
        starter: '',
        solution:
          'kind create cluster --name dev\nkind load docker-image quiz:dev --name dev\nkubectl apply -f k8s/\nkubectl rollout status deployment/quiz',
        checks: [
          { label: 'kind create cluster --name dev', re: 'kind\\s+create\\s+cluster\\s+--name[\\s=]+dev\\b' },
          { label: 'kind load docker-image quiz:dev into dev', re: 'kind\\s+load\\s+docker-image\\s+(?=[^\\n]*quiz:dev\\b)(?=[^\\n]*--name[\\s=]+dev\\b)' },
          { label: 'kubectl apply -f k8s/', re: 'kubectl\\s+apply\\s+-f\\s+(\\./)?k8s/?' },
          { label: 'Wait with kubectl rollout status', re: 'kubectl\\s+rollout\\s+status\\s+(deployment|deploy)[/\\s]\\w+' },
          { label: 'Load the image before applying', re: 'kind\\s+load[\\s\\S]*kubectl\\s+apply' },
        ],
        hint: 'kind nodes can’t see your local images until you load them in.',
        explain: 'kind runs Kubernetes nodes as Docker containers with their own image store, so a locally built tag must be copied in first.',
        output:
          'Creating cluster "dev" ...\n ✓ Ensuring node image (kindest/node:v1.34.0) 🖼\n ✓ Preparing nodes 📦\n ✓ Writing configuration 📜\n ✓ Starting control-plane 🕹️\n ✓ Installing CNI 🔌\n ✓ Installing StorageClass 💾\nSet kubectl context to "kind-dev"\nImage: "quiz:dev" with ID "sha256:4b7e1c9a2f5d" not yet present on node "dev-control-plane", loading...\ndeployment.apps/quiz created\nservice/quiz created\ndeployment "quiz" successfully rolled out',
      },
      {
        kind: 'write',
        prompt: 'Draft manifests from compose.yaml with Kompose, deploy them, then reach web on localhost:8080.',
        starter: '',
        solution:
          'kompose convert -f compose.yaml -o k8s/\nkubectl apply -f k8s/\nkubectl rollout status deployment/web\nkubectl port-forward svc/web 8080:80',
        checks: [
          { label: 'kompose convert -f compose.yaml -o k8s/', re: 'kompose\\s+convert\\s+(?=[^\\n]*-f\\s+(\\./)?compose\\.ya?ml)(?=[^\\n]*(-o|--out)[\\s=]+(\\./)?k8s/?)' },
          { label: 'Apply the folder', re: 'kubectl\\s+apply\\s+-f\\s+(\\./)?k8s/?' },
          { label: 'kubectl port-forward svc/web 8080:…', re: 'kubectl\\s+port-forward\\s+(svc|service)/web\\s+8080:\\d+' },
          { label: 'Convert before you apply', re: 'kompose[\\s\\S]*kubectl\\s+apply' },
        ],
        hint: 'port-forward takes LOCAL:REMOTE, where REMOTE is the Service port.',
        explain: 'Kompose output is a draft: review probes, Secrets and resources before you rely on it. port-forward needs no public Service.',
        output:
          'INFO Kubernetes file "k8s/web-service.yaml" created\nINFO Kubernetes file "k8s/web-deployment.yaml" created\nservice/web created\ndeployment.apps/web created\ndeployment "web" successfully rolled out\nForwarding from 127.0.0.1:8080 -> 80\nForwarding from [::1]:8080 -> 80',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L5.2': {
      kind: 'fill',
      prompt: 'Point kubectl at Docker Desktop’s cluster.',
      code: 'kubectl config use-context ___',
      blanks: [{ answer: ['docker-desktop'], options: ['docker-desktop', 'desktop', 'kind-dev'] }],
      hint: 'The context is named after the app.',
      explain: 'Each cluster is a context in your kubeconfig (%USERPROFILE%\\.kube\\config on Windows). kubectl config get-contexts lists them, with * on the current one.',
      output: 'Switched to context "docker-desktop".',
    },
  },
  linuxOk: {
    'L1.2': 'curl runs inside the log-shipper container in the pod, not in PowerShell on the PC',
  },
};

export default unit;
