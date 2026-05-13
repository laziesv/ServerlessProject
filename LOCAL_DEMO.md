# Local Docker Desktop Demo

Verified local demo flow for Docker Desktop Kubernetes on Windows.

## 1. Build the Application Image

```bash
docker build -t kiadt/todo-list:latest ./frontend
```

## 2. Deploy to Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl rollout status deployment/todo-list -n todo-list
kubectl get pods -n todo-list
kubectl get svc -n todo-list
```

Expected service port:

```text
3000:30080/TCP
```

## 3. Open the App

Docker Desktop may not expose `NodePort` directly on Windows. Keep this command running while demoing:

```bash
kubectl port-forward -n todo-list svc/todo-list-service 30080:3000
```

Open:

```text
http://localhost:30080
http://localhost:30080/api/health
http://localhost:30080/metrics
```

## 4. Run Prometheus and Grafana

```bash
docker compose -f monitoring/docker-compose.yml up -d
```

Open:

```text
Prometheus: http://localhost:9090
Grafana:    http://localhost:3001
Username:   admin
Password:   admin
Dashboard:  To-do List Monitoring
```

Check Prometheus targets:

```text
http://localhost:9090/targets
```

The local Prometheus config scrapes:

```text
host.docker.internal:30080
```

## 5. Run Terraform

Terraform manages the Kubernetes namespace.

If `terraform` is not in `PATH`, reopen PowerShell or run it with:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Hashicorp.Terraform_Microsoft.Winget.Source_8wekyb3d8bbwe\terraform.exe" version
```

```powershell
cd terraform
terraform init
terraform import -var "kubeconfig_path=$env:USERPROFILE\.kube\config" kubernetes_namespace.todo todo-list
terraform apply -auto-approve -var "kubeconfig_path=$env:USERPROFILE\.kube\config"
terraform plan -var "kubeconfig_path=$env:USERPROFILE\.kube\config"
```

Expected final plan:

```text
No changes. Your infrastructure matches the configuration.
```

## 6. Run Ansible

Run Ansible from Ubuntu WSL. The playbook checks `kubectl` and Docker, then writes `deploy-info/environment.txt`.

```powershell
wsl -d Ubuntu-24.04 -- bash -lc "cd '/mnt/c/Users/phuwi/Documents/Serverless and Cloud Architectures/Project/ansible' && ansible-playbook -i inventory playbook.yml"
```

Expected recap:

```text
localhost : ok=4 changed=0 failed=0
```

## 7. Run Jenkins

See `JENKINS_SETUP.md`.

For a local Jenkins demo without Docker Hub credentials, run the pipeline with:

```text
SKIP_DOCKER_PUSH=true
SKIP_DEPLOY=false
```

With `SKIP_DOCKER_PUSH=true`, the deploy stage keeps the image from `k8s/deployment.yaml` instead of switching Kubernetes to an unpushed build-number tag.

The Jenkins agent must be Linux or WSL/Ubuntu because the `Jenkinsfile` uses `sh`.

## 8. Stop the Local Monitoring Stack

```bash
docker compose -f monitoring/docker-compose.yml down
```

Stop `kubectl port-forward` with `Ctrl+C` in the terminal where it is running.
