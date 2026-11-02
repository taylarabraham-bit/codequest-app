import type { Unit } from '../../engine/types';

// Made-up but consistent pod names, IPs and ids, reused so outputs agree.
const PODS_API = `NAME                   READY   STATUS    RESTARTS   AGE
api-6c9f8d7b5d-4kzqp   1/1     Running   0          21s
api-6c9f8d7b5d-9xw2m   1/1     Running   0          21s
api-6c9f8d7b5d-tq7rl   1/1     Running   0          21s`;

const SVC_WEB = `NAME   TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
web    LoadBalancer   10.96.41.207   localhost     80:31452/TCP   12s`;

const APPLY_ALL = `configmap/api-config created
secret/db-pass created
deployment.apps/api created
service/api created
deployment.apps/db created
service/db created`;

const ROLLOUT_API = `Waiting for deployment "api" rollout to finish: 1 of 3 updated replicas are available...
Waiting for deployment "api" rollout to finish: 2 of 3 updated replicas are available...
deployment "api" successfully rolled out`;

const FORWARD_API = 'Forwarding from 127.0.0.1:8080 -> 8080\nForwarding from [::1]:8080 -> 8080';

const OOM_API = `    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
    Restart Count:  2`;

const unit: Unit = {
  title: 'From Compose to Kubernetes',
  blurb: 'Turn a Compose app into Deployments, Services, ConfigMaps and probes, and run it on a local cluster.',
  lessons: [
    {
      title: 'Pods & Deployments',
      concept: {
        body: 'Kubernetes runs pods, not bare containers: a pod wraps one or more containers that share an IP and volumes. You rarely write pods yourself. A Deployment keeps replicas copies running, stamped from its template and found by its selector’s labels.',
        code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: api }\nspec:\n  replicas: 3\n  selector: { matchLabels: { app: api } }',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Name Kubernetes’ smallest unit that runs containers.',
          code: 'kind: ___',
          blanks: [{ answer: ['Pod'], options: ['Pod', 'Container', 'Service'] }],
          hint: 'A small group of whales is called this.',
          explain: 'Kubernetes never schedules a lone container. Even one container gets a pod around it, with its own IP address.',
        },
        {
          kind: 'fill',
          prompt: 'A log shipper shares api’s pod. How does it reach api?',
          code: '# pod: api (port 8080) + log-shipper\ncurl http://___/metrics',
          blanks: [{ answer: ['localhost:8080'], options: ['localhost:8080', 'api:8080', 'log-shipper:8080'] }],
          hint: 'Containers in one pod share one network.',
          explain: 'A pod’s containers share an IP, so they talk over localhost, like processes on one machine. That’s why they also can’t both use 8080.',
        },
        {
          kind: 'fill',
          prompt: 'Set the API group for a Deployment.',
          code: 'apiVersion: ___\nkind: Deployment\nmetadata:\n  name: api',
          blanks: [{ answer: ['apps/v1'], options: ['apps/v1', 'v1', 'deployments/v1'] }],
          hint: 'Deployments belong to the apps group.',
          explain: 'Pods, Services, ConfigMaps and Secrets are core v1. Deployments are in apps/v1, so each file names the group it belongs to.',
        },
        {
          kind: 'fill',
          prompt: 'Compose had deploy.replicas: 3. Keep three copies here.',
          code: 'spec:\n  ___: 3\n  selector:\n    matchLabels:\n      app: api',
          blanks: [{ answer: ['replicas'], options: ['replicas', 'scale', 'count'] }],
          hint: 'The same word Compose used.',
          explain: 'The Deployment watches the count. If a node dies and takes a pod with it, a new one is started elsewhere.',
        },
        {
          kind: 'fill',
          prompt: 'Make the template’s label match the selector.',
          code: 'spec:\n  selector:\n    matchLabels:\n      app: api\n  template:\n    metadata:\n      labels:\n        app: ___',
          blanks: [{ answer: ['api'], options: ['api', 'web', 'Deployment'] }],
          hint: 'The selector must find the pods the template makes.',
          explain: 'The Deployment owns whatever pods carry its selector’s labels. If they don’t match, kubectl apply rejects the file.',
        },
        {
          kind: 'build',
          prompt: 'Send deployment.yaml to the cluster.',
          answer: ['kubectl', 'apply', '-f', 'deployment.yaml'],
          distractors: ['up', 'run'],
          hint: 'Apply a file, like docker compose up applies a YAML.',
          explain: 'apply creates what’s missing and updates what changed, so you run the same command for the first deploy and every edit after.',
          output: 'deployment.apps/api created',
        },
        {
          kind: 'build',
          prompt: 'List the pods the Deployment made.',
          answer: ['kubectl', 'get', 'pods'],
          distractors: ['ps', 'ls'],
          hint: 'kubectl get, then the kind of thing.',
          explain: 'Each name is the Deployment, a template hash and a random suffix. Delete one and a new pod replaces it within seconds.',
          output: PODS_API,
        },
      ],
    },
    {
      title: 'Services',
      concept: {
        body: 'Pods come and go with new IPs, so a Service gives a set of them one stable name and address. Its selector picks pods by label; port is what callers use and targetPort is the container’s port. The Service name works in DNS, just like a Compose service name.',
        code: 'apiVersion: v1\nkind: Service\nmetadata: { name: db }\nspec:\n  selector: { app: db }\n  ports: [{ port: 5432, targetPort: 5432 }]',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'api connects to DB_HOST=db. Name the Service.',
          code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: ___\nspec:\n  selector:\n    app: postgres',
          blanks: [{ answer: ['db'], options: ['db', 'postgres-pod', 'db-service'] }],
          hint: 'Callers use the Service’s name, not the pod’s labels.',
          explain: 'Keep the Compose service name as the Service name and the app’s connection settings work unchanged.',
        },
        {
          kind: 'fill',
          prompt: 'Keep db reachable only inside the cluster.',
          code: 'spec:\n  type: ___\n  selector:\n    app: db',
          blanks: [{ answer: ['ClusterIP'], options: ['ClusterIP', 'NodePort', 'LoadBalancer'] }],
          hint: 'The default type, with an IP only the cluster knows.',
          explain: 'ClusterIP is what you get if you leave type out, like a Compose service with no ports: other services reach it, the outside can’t.',
        },
        {
          kind: 'fill',
          prompt: 'Callers use port 80; the container listens on 8080.',
          code: 'ports:\n  - port: 80\n    ___: 8080',
          blanks: [{ answer: ['targetPort'], options: ['targetPort', 'containerPort', 'nodePort'] }],
          hint: 'The port the traffic is aimed at.',
          explain: 'It’s like Compose’s "80:8080" turned around: port is the Service’s side, targetPort the pod’s. containerPort belongs in the Deployment.',
        },
        {
          kind: 'fill',
          prompt: 'Open web on a fixed port of every node.',
          code: 'spec:\n  type: NodePort\n  ports:\n    - port: 80\n      targetPort: 8080\n      nodePort: ___',
          blanks: [{ answer: ['30080'], options: ['30080', '8080', '80'] }],
          hint: 'Node ports come from a high range.',
          explain: 'nodePort must be in 30000–32767 by default. Leave it out and Kubernetes picks a free one.',
        },
        {
          kind: 'fill',
          prompt: 'Give web an outside address from the platform.',
          code: 'spec:\n  type: ___\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 8080',
          blanks: [{ answer: ['LoadBalancer'], options: ['LoadBalancer', 'ClusterIP', 'Ingress'] }],
          hint: 'The type that asks for a load balancer.',
          explain: 'In a cloud this provisions a real load balancer. Docker Desktop exposes it on localhost, so it acts like Compose’s ports.',
          output: SVC_WEB,
        },
        {
          kind: 'build',
          prompt: 'List the Services and their ports.',
          answer: ['kubectl', 'get', 'svc'],
          alt: [['kubectl', 'get', 'services']],
          distractors: ['ports', 'ps'],
          hint: 'get, then the short name for services.',
          explain: 'PORT(S) shows 80:31452 for a LoadBalancer: the Service port, then the node port it opens underneath.',
          output: SVC_WEB,
        },
        {
          kind: 'fill',
          prompt: 'db is in the data namespace. Reach it from shop.',
          code: 'env:\n  - name: DB_HOST\n    value: db.___',
          blanks: [{ answer: ['data'], options: ['data', 'shop', 'cluster'] }],
          hint: 'Service name, then the namespace it lives in.',
          explain: 'A bare db only resolves within the same namespace. db.data, or db.data.svc.cluster.local in full, works from anywhere.',
        },
      ],
    },
    {
      title: 'ConfigMaps & Secrets',
      concept: {
        body: 'Compose’s environment: becomes a ConfigMap for plain settings and a Secret for passwords. envFrom loads every key as a variable, and valueFrom.secretKeyRef picks one key. Secret data is only base64-encoded, so stringData lets you write plain text.',
        code: 'apiVersion: v1\nkind: ConfigMap\nmetadata: { name: api-config }\ndata:\n  LOG_LEVEL: info\n  DB_HOST: db',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Type the key that holds a ConfigMap’s settings.',
          code: 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: api-config\n___:\n  LOG_LEVEL: info\n  FEATURE_SEARCH: "true"',
          blanks: [{ answer: ['data'] }],
          hint: 'A generic word for what’s stored.',
          explain: 'Values in data are always strings, so quote "true" and numbers, or YAML will turn them into other types and apply fails.',
        },
        {
          kind: 'order',
          prompt: 'Write the Secret: apiVersion, kind, metadata, then stringData.',
          lines: [
            'apiVersion: v1',
            'kind: Secret',
            'metadata:',
            '  name: db-pass',
            'stringData:',
            '  POSTGRES_PASSWORD: s3cret',
          ],
          hint: 'Each value sits under its own key.',
          explain: 'stringData takes plain text and Kubernetes stores it base64-encoded in data. Keep this file out of git or encrypt it.',
        },
        {
          kind: 'build',
          prompt: 'Create the Secret straight from the command line.',
          answer: ['kubectl', 'create', 'secret', 'generic', 'db-pass', '--from-literal=password=s3cret'],
          distractors: ['configmap', '--env'],
          hint: 'create secret, its type, a name, then the value.',
          explain: 'generic is the plain key-value type. No YAML file means nothing to commit by mistake, though it lands in your shell history.',
          output: 'secret/db-pass created',
        },
        {
          kind: 'fill',
          prompt: 'In data, values are base64. Which is s3cret?',
          code: 'kind: Secret\ndata:\n  password: ___',
          blanks: [{ answer: ['czNjcmV0'], options: ['czNjcmV0', 's3cret'] }],
          hint: 'data never holds the plain text.',
          explain: 'base64 is encoding, not encryption: anyone who can read the Secret can decode it. Access control is what protects it.',
        },
        {
          kind: 'order',
          prompt: 'Load DB_PASSWORD from db-pass’s password key.',
          lines: [
            'env:',
            '  - name: DB_PASSWORD',
            '    valueFrom:',
            '      secretKeyRef:',
            '        name: db-pass',
            '        key: password',
          ],
          hint: 'The variable’s name first; the Secret’s name and key go last.',
          explain: 'This renames as it loads: the Secret’s password key becomes the DB_PASSWORD variable the app expects.',
        },
        {
          kind: 'fill',
          prompt: 'Type the flag that reads a Compose-style env file.',
          code: 'kubectl create configmap api-config --from-___=api.env',
          blanks: [{ answer: ['env-file'] }],
          hint: 'Two words joined by a hyphen, like Compose’s env_file.',
          explain: 'Each KEY=value line becomes a key in the ConfigMap, so the file your Compose env_file used carries straight over.',
          output: 'configmap/api-config created',
        },
        {
          kind: 'fix',
          prompt: 'apply rejects envFrom. Fix the key.',
          code: 'envFrom:\n  - [[configMapKeyRef]]:\n      name: api-config',
          fix: 'configMapRef',
          options: ['configMapRef', 'configMap', 'configMapName'],
          hint: 'envFrom takes a whole ConfigMap, not one key.',
          explain: 'configMapKeyRef picks one key, under env[].valueFrom. envFrom takes configMapRef or secretRef and loads every key.',
        },
      ],
    },
    {
      title: 'Probes & resources',
      concept: {
        body: 'A Compose healthcheck only marks a container unhealthy. In Kubernetes a failing livenessProbe restarts the container, and a failing readinessProbe takes the pod out of its Service until it passes. resources.requests is what gets reserved; limits is the ceiling.',
        code: 'readinessProbe:\n  httpGet: { path: /healthz/ready, port: 8080 }\nlivenessProbe:\n  httpGet: { path: /healthz, port: 8080 }\nresources:\n  limits: { memory: 256Mi }',
      },
      exercises: [
        {
          kind: 'order',
          prompt: 'Check /healthz every 10s: path, port, then periodSeconds.',
          lines: ['livenessProbe:', '  httpGet:', '    path: /healthz', '    port: 8080', '  periodSeconds: 10'],
          hint: 'path and port belong to httpGet; the timing to the probe.',
          explain: 'Any 2xx or 3xx counts as a pass. After failureThreshold misses in a row (3 by default) the container is restarted.',
        },
        {
          kind: 'fill',
          prompt: 'Warming a cache: stop traffic, but don’t restart.',
          code: '___:\n  httpGet:\n    path: /healthz/ready\n    port: 8080',
          blanks: [
            { answer: ['readinessProbe'], options: ['readinessProbe', 'livenessProbe', 'healthcheck'] },
          ],
          hint: 'Is the pod ready for requests yet?',
          explain: 'A failing readiness probe removes the pod from the Service’s endpoints. The container keeps running and rejoins once it passes.',
        },
        {
          kind: 'fill',
          prompt: 'Type the key that runs pg_isready as the check.',
          code: '# Compose: test: ["CMD", "pg_isready", "-U", "postgres"]\nlivenessProbe:\n  exec:\n    ___: ["pg_isready", "-U", "postgres"]',
          blanks: [{ answer: ['command'] }],
          hint: 'The same key a container uses for what it runs.',
          explain: 'exec.command runs inside the container and exit code 0 passes, just like Compose’s CMD form. There’s no "CMD" word in front.',
        },
        {
          kind: 'build',
          prompt: 'Reserve a quarter CPU and 128 MiB of memory.',
          answer: ['requests:', '{', 'cpu:', '250m', ',', 'memory:', '128Mi', '}'],
          alt: [['requests:', '{', 'memory:', '128Mi', ',', 'cpu:', '250m', '}']],
          distractors: ['0.25%', '128MB'],
          hint: 'm means thousandths of a CPU; Mi means mebibytes.',
          explain: 'The scheduler only places a pod on a node with this much free. Compose’s deploy.resources.reservations is the closest match.',
        },
        {
          kind: 'order',
          prompt: 'Probe db’s port: tcpSocket, periodSeconds, then failureThreshold.',
          lines: ['readinessProbe:', '  tcpSocket:', '    port: 5432', '  periodSeconds: 5', '  failureThreshold: 3'],
          hint: 'port belongs to tcpSocket.',
          explain: 'tcpSocket passes when the port accepts a connection, good for services with no HTTP endpoint.',
        },
        {
          kind: 'fix',
          prompt: 'apply rejects the memory limit. Fix the unit.',
          code: 'resources:\n  limits:\n    memory: 256[[MB]]',
          fix: 'Mi',
          options: ['Mi', 'mb', 'Mb'],
          hint: 'Kubernetes uses binary suffixes like Ki, Mi, Gi.',
          explain: 'Quantities take suffixes like Mi or M, never MB. Careful: a lowercase m means thousandths, so 256m is a fraction of a byte.',
        },
        {
          kind: 'fill',
          prompt: 'api grows past 300Mi under load. What happens?',
          code: 'resources:\n  limits:\n    memory: 256Mi\n# api then ___',
          blanks: [
            {
              answer: ['is OOMKilled and restarted'],
              options: ['is OOMKilled and restarted', 'is slowed down', 'keeps running'],
            },
          ],
          hint: 'Memory can’t be throttled the way CPU can.',
          explain: 'Going over a memory limit kills the container with exit code 137. Going over a CPU limit only slows it down.',
          output: OOM_API,
        },
      ],
    },
    {
      title: 'kubectl, kind & Kompose',
      concept: {
        body: 'kind create cluster runs a whole Kubernetes cluster inside Docker containers, and Docker Desktop can switch one on in Settings. kubectl apply -f deploys a folder of YAML; rollout status, logs, describe and port-forward help you check it. kompose convert drafts manifests from a compose.yaml.',
        code: 'kind create cluster --name dev\nkubectl apply -f k8s/\nkubectl rollout status deployment/api\nkubectl port-forward svc/api 8080:80',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Create a local cluster named dev.',
          answer: ['kind', 'create', 'cluster', '--name', 'dev'],
          distractors: ['up', 'start'],
          hint: 'kind’s verb, then what you’re creating, then a name.',
          explain: 'Each node is a Docker container running Kubernetes inside. kind sets your kubectl context to kind-dev, and kind delete cluster --name dev removes it.',
          output: 'Creating cluster "dev" ...\n ✓ Starting control-plane 🕹️\n ✓ Installing CNI 🔌\nSet kubectl context to "kind-dev"',
        },
        {
          kind: 'fill',
          prompt: 'Point kubectl at Docker Desktop’s cluster.',
          code: 'kubectl config use-context ___',
          blanks: [{ answer: ['docker-desktop'], options: ['docker-desktop', 'desktop', 'kind-dev'] }],
          hint: 'The context is named after the app.',
          explain: 'Each cluster is a context in ~/.kube/config. kubectl config get-contexts lists them, with * on the current one.',
          output: 'Switched to context "docker-desktop".',
        },
        {
          kind: 'build',
          prompt: 'Draft manifests from compose.yaml into k8s/.',
          answer: ['kompose', 'convert', '-f', 'compose.yaml', '-o', 'k8s/'],
          distractors: ['up', 'kubectl'],
          hint: 'convert, the input file, then the output folder.',
          explain: 'Kompose writes a Deployment per service and a Service for each with ports. Review them: probes and resources still need adding.',
          output: 'INFO Kubernetes file "k8s/api-service.yaml" created\nINFO Kubernetes file "k8s/db-service.yaml" created\nINFO Kubernetes file "k8s/api-deployment.yaml" created\nINFO Kubernetes file "k8s/db-deployment.yaml" created',
        },
        {
          kind: 'type',
          prompt: 'Wait until the api Deployment has fully rolled out.',
          accept: [
            'kubectl rollout status deployment/api',
            'kubectl rollout status deploy/api',
            'kubectl rollout status deployment api',
          ],
          hint: 'rollout, status, then the Deployment.',
          explain: 'It blocks until every new pod is ready and exits non-zero on failure, so CI scripts can wait on it after kubectl apply.',
          output: ROLLOUT_API,
        },
        {
          kind: 'build',
          prompt: 'Follow the logs of a pod in the api Deployment.',
          answer: ['kubectl', 'logs', '-f', 'deployment/api'],
          distractors: ['--tail-f', 'svc/api'],
          hint: 'Like docker logs -f, aimed at the Deployment.',
          explain: 'deployment/api saves looking up a pod name: kubectl picks one of its pods. Add --previous to see a crashed container’s last run.',
          output: 'info: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://[::]:8080',
        },
        {
          kind: 'fill',
          prompt: 'A pod is stuck in ImagePullBackOff. See its events.',
          code: 'kubectl ___ pod api-6c9f8d7b5d-4kzqp',
          blanks: [{ answer: ['describe'], options: ['describe', 'logs', 'inspect'] }],
          hint: 'The container never started, so there are no logs.',
          explain: 'describe shows the pod’s settings and its Events list, where pull errors, failed probes and scheduling problems show up.',
          output: 'Events:\n  Warning  Failed   12s  kubelet  Failed to pull image "acme/api:2.0": not found\n  Normal   BackOff  10s  kubelet  Back-off pulling image "acme/api:2.0"',
        },
        {
          kind: 'fix',
          prompt: 'Open localhost:8080 for the api Service’s port 80.',
          code: 'kubectl port-forward svc/api [[80:8080]]',
          fix: '8080:80',
          options: ['8080:80', '8080', '80'],
          hint: 'Same order as docker run -p: your side first.',
          explain: 'LOCAL:REMOTE, like -p. port-forward tunnels through kubectl, so it works for a ClusterIP Service with nothing exposed.',
          output: FORWARD_API,
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'order',
      prompt: 'Order the template: labels, then containers.',
      lines: [
        '  template:',
        '    metadata:',
        '      labels:',
        '        app: web',
        '    spec:',
        '      containers:',
        '        - name: web',
      ],
      hint: 'metadata and spec are siblings under template.',
      explain: 'The template is a whole pod spec inside the Deployment. Every pod it stamps out gets the app: web label.',
    },
    {
      kind: 'fix',
      prompt: 'The Service has no endpoints. Fix the selector.',
      code: '# Deployment pods are labelled app: api\nkind: Service\nmetadata:\n  name: api\nspec:\n  selector:\n    app: [[api-svc]]',
      fix: 'api',
      options: ['api', 'api-deployment', 'Deployment'],
      hint: 'A Service finds pods by their labels, not by names.',
      explain: 'A selector that matches no pods leaves the Service with nowhere to send traffic. kubectl get endpoints api would show <none>.',
    },
    {
      kind: 'type',
      prompt: 'List only the pods labelled app=api.',
      accept: ['kubectl get pods -l app=api', 'kubectl get pods --selector app=api', 'kubectl get pods --selector=app=api', 'kubectl get po -l app=api'],
      hint: 'get pods plus a label filter flag.',
      explain: '-l filters by the same labels Services and Deployments select on, so you see exactly the pods behind the api Service.',
      output: PODS_API,
    },
    {
      kind: 'fill',
      prompt: 'Which probe restarts a container that hangs?',
      code: '# Compose healthcheck only marks it unhealthy\n___:\n  httpGet:\n    path: /healthz\n    port: 8080',
      blanks: [{ answer: ['livenessProbe'], options: ['livenessProbe', 'readinessProbe', 'healthcheck'] }],
      hint: 'Is it still alive?',
      explain: 'Liveness failures restart the container; readiness failures only pull it out of the Service. Many apps use both.',
    },
    {
      kind: 'fill',
      prompt: 'kind can’t pull your local image. Copy it in.',
      code: '# api-6c9f8d7b5d-4kzqp   0/1   ErrImagePull\n___ acme/api:2.0 --name dev',
      blanks: [
        {
          answer: ['kind load docker-image'],
          options: ['kind load docker-image', 'docker push', 'kubectl pull'],
        },
      ],
      hint: 'kind’s nodes have their own image store.',
      explain: 'kind’s nodes don’t see your Docker images, so load copies one in. Use a tag other than latest, which would make the kubelet always pull.',
      output: 'Image: "acme/api:2.0" with ID "sha256:8f1e2d3c4b5a" not yet present on node "dev-control-plane", loading...',
    },
    {
      kind: 'fix',
      prompt: 'The pod restarts forever. Fix the probe’s port.',
      code: 'containers:\n  - name: api\n    image: acme/api:2.0\n    ports:\n      - containerPort: 8080\n    livenessProbe:\n      httpGet:\n        path: /healthz\n        port: [[80]]',
      fix: '8080',
      options: ['8080', '443', '30080'],
      hint: 'The probe talks to the container directly, not through the Service.',
      explain: 'Probes come from the kubelet straight to the pod, so they use the container’s port. Nothing listens on 80, so every check fails.',
    },
    {
      kind: 'build',
      prompt: 'Open localhost:8080 for the web Service’s port 80.',
      answer: ['kubectl', 'port-forward', 'svc/web', '8080:80'],
      distractors: ['80:8080', 'expose'],
      hint: 'Your port first, then the Service’s.',
      explain: 'Handy for checking a ClusterIP Service without changing its type. The tunnel stays open until you press Ctrl+C.',
      output: FORWARD_API,
    },
    {
      kind: 'order',
      prompt: 'Load every key: the ConfigMap first, then the Secret.',
      lines: ['envFrom:', '  - configMapRef:', '      name: api-config', '  - secretRef:', '      name: db-pass'],
      hint: 'Each ref holds the name of what it loads.',
      explain: 'This replaces Compose’s environment and env_file in one go. If a key is in both, the one listed last wins.',
    },
    {
      kind: 'fill',
      prompt: 'Type the Service type Docker Desktop puts on localhost.',
      code: 'spec:\n  type: ___\n  ports:\n    - port: 80\n      targetPort: 8080',
      blanks: [{ answer: ['LoadBalancer'] }],
      hint: 'In a cloud, this type gets a real load balancer.',
      explain: 'Docker Desktop answers LoadBalancer Services on localhost. On kind, EXTERNAL-IP stays <pending> unless you add cloud-provider-kind.',
      output: SVC_WEB,
    },
    {
      kind: 'type',
      prompt: 'Apply every manifest in the k8s folder.',
      accept: ['kubectl apply -f k8s/', 'kubectl apply -f k8s', 'kubectl apply -f ./k8s/', 'kubectl apply -f ./k8s'],
      hint: '-f takes a folder as well as a file.',
      explain: 'apply reads every .yaml file in the folder, so ConfigMaps, Secrets, Deployments and Services go up together, like docker compose up.',
      output: APPLY_ALL,
    },
  ],
};

export default unit;
