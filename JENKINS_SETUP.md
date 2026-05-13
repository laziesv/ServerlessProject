# Jenkins Pipeline Setup

This project includes a declarative Jenkins pipeline in `Jenkinsfile`.

## Agent Requirements

Use a Linux Jenkins agent or an agent running inside WSL/Ubuntu. The pipeline uses `sh`, so a plain Windows-only Jenkins node will not run it without a Unix shell.

Required tools on the Jenkins agent:

```bash
node --version
npm --version
docker --version
kubectl version --client
terraform version
ansible-playbook --version
```

The agent also needs access to the Docker daemon and the target Kubernetes cluster.

## Jenkins Plugins

Install these Jenkins plugins:

```text
Git
Pipeline
Docker Pipeline
Credentials Binding
GitHub Integration
```

## Docker Hub Credential

Create a Jenkins credential:

```text
Kind: Username with password
ID: dockerhub-credentials
Username: <Docker Hub username>
Password: <Docker Hub token or password>
```

The `Jenkinsfile` uses this credential in the `Push to Hub` stage.

## Create the Pipeline Job

1. Create a new Jenkins `Pipeline` job.
2. In `Pipeline`, choose `Pipeline script from SCM`.
3. Select Git and enter the repository URL.
4. Set the script path to:

```text
Jenkinsfile
```

## Local Demo Parameters

The pipeline has two parameters:

```text
SKIP_DOCKER_PUSH
SKIP_DEPLOY
```

For a local Jenkins demo without Docker Hub credentials, run with:

```text
SKIP_DOCKER_PUSH=true
SKIP_DEPLOY=false
```

This still runs:

```text
Checkout
Build
Test
Docker Build
Deploy
```

but skips logging in and pushing to Docker Hub.

When `SKIP_DOCKER_PUSH=true`, the deploy stage does not switch Kubernetes to the build-number image tag, because that tag was not pushed to Docker Hub. Kubernetes keeps using the image defined in `k8s/deployment.yaml`.

For a full CI/CD demo with Docker Hub:

```text
SKIP_DOCKER_PUSH=false
SKIP_DEPLOY=false
```

## Deploy Behavior

The deploy stage:

1. Initializes Terraform.
2. Imports the existing `todo-list` namespace if it already exists.
3. Applies Terraform so the namespace is managed.
4. Runs the Ansible playbook.
5. Applies Kubernetes deployment and service manifests.
6. Updates the deployment image tag to the current Jenkins build number when Docker push is enabled.
7. Waits for rollout to complete.

## GitHub Webhook

If Jenkins is reachable from GitHub, configure:

```text
http://<jenkins-host>:8080/github-webhook/
```

For local-only Jenkins, trigger builds manually from the Jenkins UI.
