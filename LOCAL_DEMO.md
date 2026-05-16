# Local Docker Desktop Demo

ขั้นตอน demo ทั้งหมดบน Docker Desktop Kubernetes (Windows) เรียงตาม Phase ของเกณฑ์คะแนน

เวลาโดยประมาณ: 18–20 นาที

## สิ่งที่ต้องเตรียมก่อน Demo

| เครื่องมือ | ตรวจสอบด้วยคำสั่ง |
| --- | --- |
| Docker Desktop (เปิด Kubernetes) | `kubectl cluster-info` |
| Node.js + npm | `node -v && npm -v` |
| Go | `go version` |
| Terraform | `terraform version` |
| Ansible (ใน WSL) | `wsl -- ansible --version` |

เปิด Docker Desktop แล้วเข้า Settings > Kubernetes > Enable Kubernetes ก่อนเริ่ม

ตรวจสอบว่า Kubernetes ทำงาน:

```powershell
kubectl cluster-info
kubectl get nodes
```

ผลลัพธ์ที่คาดหวัง:

```text
NAME                    STATUS   ROLES           AGE   VERSION
desktop-control-plane   Ready    control-plane   ...   ...
desktop-worker          Ready    <none>          ...   ...
```

---

## Phase 1 — Git & Source Code (10 คะแนน)

### 1.1 แสดง Git branching strategy (3 คะแนน)

```powershell
git branch -a
```

ผลลัพธ์ที่คาดหวัง:

```text
* main
  remotes/origin/GTA
  remotes/origin/HEAD -> origin/main
  remotes/origin/Kiatt
  remotes/origin/main
  remotes/origin/todo-app
```

แสดง commit history:

```powershell
git log --oneline --graph --all -15
```

จะเห็น merge commits จาก Pull Request #1 (Kiatt) และ #2 (GTA) เข้า main

### 1.2 ทดสอบแอปรันได้จริง (5 คะแนน)

Frontend:

```powershell
cd frontend
npm install
npm run build
```

ผลลัพธ์ที่คาดหวัง:

```text
✓ Compiled successfully
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/health
└ ƒ /metrics
```

ทดสอบรันจริง:

```powershell
npm run dev
```

เปิด http://localhost:3000 แสดงให้เห็น:

- เพิ่มงาน — กรอกชื่อ + รายละเอียด + ความสำคัญ แล้วกด "เพิ่มงาน"
- แก้ไขงาน — กดปุ่ม "แก้ไข" แก้ข้อมูล แล้วกด "บันทึก"
- ลบงาน — กดปุ่ม "ลบ"
- เปลี่ยนสถานะ — กดวงกลมหน้างาน
- ค้นหา — พิมพ์ในช่องค้นหา

กด `Ctrl+C` หยุด dev server

Backend (เปิด terminal ใหม่):

```powershell
cd backend
go test ./...
```

ผลลัพธ์ที่คาดหวัง:

```text
ok  todo-backend  0.005s
```

### 1.3 แสดง Dockerfile (5 คะแนน)

```powershell
cat frontend/Dockerfile
```

อธิบาย: multi-stage build 3 ขั้น

1. `deps` — ติดตั้ง dependencies ด้วย `npm ci`
2. `builder` — build Next.js ด้วย `npm run build`
3. `runner` — copy output standalone แล้วรัน `node server.js`

```powershell
cat backend/Dockerfile
```

อธิบาย: multi-stage build 2 ขั้น

1. `builder` — go test + go build
2. `runner` — copy binary แล้วรัน `/app/todo-backend`

### 1.4 แสดง README (2 คะแนน)

เปิด `README.md` ใน VS Code — มีวิธี setup, โครงสร้าง repo, อธิบายโค้ด, architecture diagram

---

## Phase 2 — Jenkins CI/CD + Docker (25 คะแนน)

### 2.1 แสดง Jenkinsfile 6 stages (10 คะแนน)

```powershell
cat Jenkinsfile
```

ชี้ให้เห็น 6 stages:

| # | Stage | ทำอะไร |
| --- | --- | --- |
| 1 | Checkout | ดึง source code จาก Git |
| 2 | Build | `npm ci` + `npm run build` + `go build` |
| 3 | Test | `npm run lint` + `go test` |
| 4 | Docker Build | สร้าง Docker image frontend + backend |
| 5 | Push | login + push image ไป Docker Hub |
| 6 | Deploy | Terraform + Ansible + kubectl apply manifests |

### 2.2 Build Docker images (10 คะแนน)

```powershell
docker build -t laziesv/todo-list-frontend:latest ./frontend
docker build -t laziesv/todo-list-backend:latest ./backend
```

ตรวจ images:

```powershell
docker images | findstr "laziesv"
```

ผลลัพธ์ที่คาดหวัง:

```text
laziesv/todo-list-frontend   latest   ...   ...   ...
laziesv/todo-list-backend    latest   ...   ...   ...
```

### 2.3 ทดสอบ Docker container

```powershell
docker run --rm -d -p 3000:3000 --name todo-front laziesv/todo-list-frontend:latest
docker run --rm -d -p 8080:8080 --name todo-back laziesv/todo-list-backend:latest
```

ทดสอบ:

```text
http://localhost:3000          <- เว็บ To-do List
http://localhost:8080/api/tasks <- Backend API
```

หยุด:

```powershell
docker stop todo-front todo-back
```

### 2.4 Jenkins Pipeline (5 คะแนน)

ดู `JENKINS_SETUP.md` สำหรับวิธีติดตั้งและรัน Jenkins

Jenkins ใช้ port **8888** ไม่ชนกับ backend (8080) แล้ว สามารถรัน Jenkins และแอปพร้อมกันได้

สำหรับ demo ใช้ parameters:

```text
SKIP_DOCKER_PUSH=true   (ไม่ต้อง push Docker Hub จริง)
SKIP_DEPLOY=false       (ให้ Deploy stage รัน)
```

Pipeline จะรัน: Checkout → Build → Test → Docker Build → Deploy (ข้าม Push)

Deploy stage เรียก Terraform + Ansible + kubectl apply ครบตาม rubric

---

## Phase 3 — Terraform + Ansible (15 คะแนน)

### 3.1 Terraform สร้าง Kubernetes namespace (7 คะแนน)

แสดงไฟล์:

```powershell
cat terraform/main.tf
```

อธิบาย: ใช้ Kubernetes provider สร้าง namespace `todo-list` พร้อม labels

ถ้า `terraform` ไม่อยู่ใน PATH ให้เปิด PowerShell ใหม่หรือรันด้วย:

```powershell
& "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Hashicorp.Terraform_Microsoft.Winget.Source_8wekyb3d8bbwe\terraform.exe" version
```

รัน Terraform:

```powershell
cd terraform
terraform init
terraform apply -auto-approve -var "kubeconfig_path=$env:USERPROFILE\.kube\config"
```

ถ้า namespace มีอยู่แล้ว ให้ import ก่อน:

```powershell
terraform import -var "kubeconfig_path=$env:USERPROFILE\.kube\config" kubernetes_namespace.todo todo-list
```

ตรวจผลลัพธ์:

```powershell
terraform output
kubectl get namespace todo-list
```

ผลลัพธ์ที่คาดหวัง:

```text
namespace = "todo-list"

NAME        STATUS   AGE
todo-list   Active   ...
```

### 3.2 Ansible ตรวจ environment (5 คะแนน)

แสดงไฟล์:

```powershell
cat ansible/playbook.yml
```

อธิบาย: ตรวจว่า kubectl + Docker ติดตั้งแล้ว แล้วเขียนสรุป environment ลง `deploy-info/environment.txt`

รันผ่าน WSL:

```powershell
wsl -d Ubuntu-24.04 -- bash -lc "cd '/mnt/c/Users/phuwi/Documents/Serverless and Cloud Architectures/Project/ansible' && ansible-playbook -i inventory playbook.yml"
```

ผลลัพธ์ที่คาดหวัง:

```text
TASK [Check kubectl is installed] ---- ok
TASK [Check Docker is installed] ----- ok
TASK [Create deployment notes directory] --- ok
TASK [Write deployment environment summary] --- ok

PLAY RECAP
localhost : ok=4    changed=0    unreachable=0    failed=0
```

ตรวจไฟล์ที่ Ansible สร้าง:

```powershell
cat deploy-info/environment.txt
```

### 3.3 Integration ใน Jenkinsfile (3 คะแนน)

เปิด `Jenkinsfile` ชี้ให้เห็นว่า Deploy stage เรียก Terraform และ Ansible ก่อน kubectl:

```groovy
// Terraform — provision Kubernetes namespace
dir('terraform') {
  sh 'terraform init -input=false'
  sh 'terraform apply -auto-approve -input=false'
}

// Ansible — verify environment & write deployment summary
dir('ansible') {
  sh 'ansible-playbook -i inventory playbook.yml'
}

// Kubernetes — apply manifests
sh "kubectl apply -f k8s/deployment.yaml"
...
```

---

## Phase 4 — Kubernetes Deployment (25 คะแนน)

### 4.1 Deploy ทั้งหมด (10 คะแนน)

Deploy:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

รอ rollout เสร็จ:

```powershell
kubectl rollout status deployment/todo-list -n todo-list
kubectl rollout status deployment/todo-backend -n todo-list
```

ผลลัพธ์ที่คาดหวัง:

```text
deployment "todo-list" successfully rolled out
deployment "todo-backend" successfully rolled out
```

### 4.2 ตรวจ Pods running (8 คะแนน)

```powershell
kubectl get pods -n todo-list
```

ผลลัพธ์ที่คาดหวัง — 4 pods (frontend 2 + backend 2):

```text
NAME                            READY   STATUS    RESTARTS   AGE
todo-list-xxxxx                 1/1     Running   0          ...
todo-list-yyyyy                 1/1     Running   0          ...
todo-backend-aaaaa              1/1     Running   0          ...
todo-backend-bbbbb              1/1     Running   0          ...
```

ตรวจ services:

```powershell
kubectl get svc -n todo-list
```

ผลลัพธ์ที่คาดหวัง:

```text
NAME                   TYPE       CLUSTER-IP      PORT(S)
todo-list-service      NodePort   10.96.x.x       3000:30080/TCP
todo-backend-service   NodePort   10.96.x.x       8080:30081/TCP
```

### 4.3 แสดง YAML files (7 คะแนน)

```powershell
cat k8s/deployment.yaml
```

ชี้ให้เห็น: `replicas: 2`, `readinessProbe`, `livenessProbe`, `resources`

```powershell
cat k8s/service.yaml
```

ชี้ให้เห็น: `type: NodePort`, `nodePort: 30080`

### 4.4 เปิดแอปจาก Kubernetes

Docker Desktop บน Windows ต้อง port-forward เพราะ NodePort ไม่ expose ตรง

เปิด terminal ใหม่สำหรับ frontend (ปล่อยรันค้างไว้ตลอด):

```powershell
kubectl port-forward -n todo-list svc/todo-list-service 30080:3000
```

เปิดอีก terminal สำหรับ backend (ปล่อยรันค้างไว้ตลอด):

```powershell
kubectl port-forward -n todo-list svc/todo-backend-service 8080:8080
```

ข้อควรระวัง: **ต้อง forward backend ไปที่ port 8080** ไม่ใช่ 30081 เพราะ frontend เรียก API ไปที่ `http://localhost:8080`

**ถ้าเจอ error "Unable to listen on port"** แปลว่า port ถูกจองอยู่ แก้ด้วย:

```powershell
# หา PID ที่จอง port อยู่
netstat -ano | findstr ":30080" | findstr "LISTENING"
netstat -ano | findstr ":8080" | findstr "LISTENING"

# kill process ที่จอง (เปลี่ยน <PID> เป็นเลขที่เห็น)
taskkill /PID <PID> /F

# แล้วรัน port-forward ใหม่
```

สาเหตุที่พบบ่อย:

- port-forward เก่าค้างอยู่ (ลืมกด Ctrl+C)
- Jenkins ยังรันที่ port 8080 (ต้อง `docker stop jenkins`)

เปิดใน browser ทดสอบ:

```text
http://localhost:30080              <- เว็บ To-do List
http://localhost:30080/api/health   <- Frontend health check
http://localhost:30080/metrics      <- Frontend Prometheus metrics
http://localhost:8080/api/tasks     <- Backend API (รายการ tasks)
http://localhost:8080/api/health    <- Backend health check
http://localhost:8080/metrics       <- Backend Prometheus metrics
```

ทดสอบหน้าเว็บ:

1. เปิด http://localhost:30080
2. จะเห็นข้อความ **"เชื่อมต่อ Go backend สำเร็จ"** ด้านบน
3. ลองเพิ่มงาน — กรอกชื่อ + รายละเอียด + ความสำคัญ แล้วกด "เพิ่มงาน"
4. ลองแก้ไข — กดปุ่ม "แก้ไข" เปลี่ยนข้อมูล แล้วกด "บันทึก"
5. ลองลบ — กดปุ่ม "ลบ"
6. ลองเปลี่ยนสถานะ — กดวงกลมหน้างาน
7. ลองค้นหา — พิมพ์ในช่องค้นหา

**ถ้าเห็น "ใช้ข้อมูลตัวอย่างชั่วคราว"** แปลว่า backend ยังเชื่อมไม่ได้ ตรวจสอบ:

1. port-forward backend ยังรันอยู่ไหม? — ดู terminal ที่เปิดค้าง
2. port 8080 ถูก process อื่นจองอยู่ไหม? — `netstat -ano | findstr ":8080" | findstr "LISTENING"`
3. ถ้ามี process จอง → `taskkill /PID <PID> /F` → port-forward ใหม่ → refresh browser

---

## Phase 5 — Prometheus + Grafana (15 คะแนน)

port-forward ทั้ง frontend (30080) และ backend (8080) ต้องยังรันอยู่

### 5.1 แสดง /metrics endpoint (5 คะแนน)

เปิดใน browser:

```text
http://localhost:30080/metrics   <- frontend metrics
http://localhost:8080/metrics    <- backend metrics
```

จะเห็น Prometheus text format:

```text
# HELP http_requests_total Example HTTP request counter for Prometheus demo.
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/",status="200"} 42
# HELP todo_app_uptime_seconds Current app uptime placeholder for demo monitoring.
# TYPE todo_app_uptime_seconds gauge
todo_app_uptime_seconds 1747318477
```

### 5.2 เปิด Prometheus + Grafana (5 คะแนน)

```powershell
docker compose -f monitoring/docker-compose.yml up -d
```

รอสักครู่แล้วเปิด Prometheus:

```text
http://localhost:9090
```

ทดสอบ Prometheus:

1. ไปที่ Status > Targets
2. จะเห็น `todo-list` target เป็น **UP** สีเขียว
3. กลับหน้า Graph พิมพ์ `http_requests_total` แล้วกด Execute
4. แสดงผลลัพธ์ที่ scrape มาได้

ถ้า target เป็น DOWN ตรวจว่า port-forward ยังรันอยู่

Prometheus config scrape:

```text
todo-list:    host.docker.internal:30080 (frontend)
todo-backend: host.docker.internal:8080  (backend ต้อง forward ไว้ที่ 8080)
```

### 5.3 Demo Grafana (5 คะแนน)

```text
http://localhost:3001
```

1. Login: `admin` / `admin` (กด Skip เปลี่ยนรหัส)
2. ไปที่ Dashboards > To-do List > To-do List Monitoring
3. จะเห็น 3 panels:

| Panel | PromQL | ความหมาย |
| --- | --- | --- |
| Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Pod Health | `up{job="todo-list"}` | target ทำงานหรือไม่ |
| App Uptime | `todo_app_uptime_seconds` | ค่า uptime |

ถ้า Grafana ไม่เห็น dashboard:

- รอ 30 วินาทีแล้ว refresh
- หรือ import เอง: กด + > Import > Upload `monitoring/grafana-dashboard.json`

---

## หยุดทุกอย่าง

```powershell
# หยุด Prometheus + Grafana
docker compose -f monitoring/docker-compose.yml down

# กด Ctrl+C ที่ terminal port-forward ทั้งสอง

# ลบ Kubernetes resources (ถ้าต้องการ)
kubectl delete -f k8s/ --ignore-not-found

# เปิด Jenkins กลับมา (ถ้าต้องการ)
docker start jenkins
```

---

## ลำดับ Demo ที่แนะนำ

| ลำดับ | ทำอะไร | เวลา |
| --- | --- | --- |
| 1 | ตรวจ Docker Desktop + Kubernetes | 1 นาที |
| 2 | แสดง Git branches + README | 2 นาที |
| 3 | **Jenkins demo** (http://localhost:8888) | 3 นาที |
| 5 | docker build frontend + backend | 3 นาที |
| 6 | terraform apply สร้าง namespace | 1 นาที |
| 7 | ansible-playbook ตรวจ environment (WSL) | 1 นาที |
| 8 | kubectl apply deploy + port-forward | 2 นาที |
| 9 | เปิดแอปใน browser + demo CRUD | 2 นาที |
| 10 | docker compose up Prometheus + Grafana | 1 นาที |
| 11 | แสดง /metrics + Targets + 3 panels | 3 นาที |
| **รวม** | | **~20 นาที** |

---

## ปัญหาที่อาจเจอ + วิธีแก้

### ❌ port-forward error "Unable to listen on port"

สาเหตุ: port ถูก process เก่าจองอยู่

```powershell
# หา PID ที่จอง port (เปลี่ยน 30080 เป็น port ที่ error)
netstat -ano | findstr ":30080" | findstr "LISTENING"

# ผลลัพธ์เช่น: TCP 127.0.0.1:30080 ... LISTENING 5780
# kill process
taskkill /PID 5780 /F

# แล้ว port-forward ใหม่
kubectl port-forward -n todo-list svc/todo-list-service 30080:3000
```

### ❌ "ใช้ข้อมูลตัวอย่างชั่วคราว เพราะยังเชื่อมต่อ Go backend ไม่ได้"

สาเหตุ: frontend เรียก backend ที่ `localhost:8080` แต่ port 8080 ไม่ได้ forward

```powershell
# 1. ตรวจว่า port 8080 ว่างไหม
netstat -ano | findstr ":8080" | findstr "LISTENING"

# 2. ถ้ามี process จอง ให้ kill
taskkill /PID <PID> /F

# 3. port-forward backend ใหม่
kubectl port-forward -n todo-list svc/todo-backend-service 8080:8080

# 4. refresh browser ที่ http://localhost:30080
```

### ❌ Pods เป็น `ImagePullBackOff` หรือ `ErrImagePull`

สาเหตุ: Docker image ยังไม่ได้ build ในเครื่อง

```powershell
# build images ก่อน
docker build -t laziesv/todo-list-frontend:latest ./frontend
docker build -t laziesv/todo-list-backend:latest ./backend

# restart pods
kubectl rollout restart deployment/todo-list -n todo-list
kubectl rollout restart deployment/todo-backend -n todo-list
```

### ❌ `npm ci` error EPERM (operation not permitted)

สาเหตุ: VS Code หรือ Antigravity lock ไฟล์ `.node` อยู่

```powershell
# วิธี 1: ใช้ npm install แทน (ไม่ต้องลบ node_modules)
npm install

# วิธี 2: ปิด VS Code/Antigravity ก่อน แล้วลบ node_modules
cmd /c "rmdir /s /q node_modules"
npm ci
```

### ❌ Terraform error "Resource already exists"

สาเหตุ: namespace `todo-list` มีอยู่แล้วแต่ Terraform ไม่รู้

```powershell
cd terraform
terraform import -var "kubeconfig_path=$env:USERPROFILE\.kube\config" kubernetes_namespace.todo todo-list
terraform apply -auto-approve -var "kubeconfig_path=$env:USERPROFILE\.kube\config"
```

### ❌ Prometheus target เป็น DOWN

สาเหตุ: port-forward หยุดรันแล้ว หรือ port ไม่ตรง

```powershell
# ตรวจว่า port-forward ยังรันอยู่
# frontend ต้อง forward ที่ 30080, backend ต้อง forward ที่ 8080
# ถ้าหยุดแล้วให้รัน port-forward ใหม่
# แล้วไป http://localhost:9090/targets กด reload
```

### ❌ Grafana ไม่มี dashboard

```text
1. รอ 30 วินาทีแล้ว refresh
2. ถ้ายังไม่เห็น: Dashboards > + > Import > Upload monitoring/grafana-dashboard.json
```

### ❌ Ansible ไม่รัน

สาเหตุ: Windows ไม่มี Ansible native ต้องใช้ WSL

```powershell
# ตรวจว่ามี WSL Ubuntu
wsl --list

# ถ้ายังไม่มี Ansible ใน WSL
wsl -d Ubuntu-24.04 -- bash -lc "pip3 install ansible"
```
