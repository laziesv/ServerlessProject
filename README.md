# 🚀 ระบบ To-do List (To-do List Management System) — ENG23 3074

> ระบบ Web Application สำหรับจัดการรายการงานในรูปแบบ Frontend + Backend ที่พัฒนาโดยใช้แนวทาง DevOps และ Cloud Native Architecture พร้อมระบบ CI/CD, Kubernetes Deployment และ Monitoring แบบครบวงจร

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ                  | ความรับผิดชอบ           |
| ------------ | --------------------- | ----------------------- |
| B6609061     | ศิริพงษ์ ผิวคำ        | Git & App Development   |
| B6612870     | เกียรติศักดิ์ ปัตตานี | Kubernetes & Monitoring |
| B6617165     | ภูผา คำผานุรัตน์      | Terraform & Ansible     |
| B6631536     | ภูวิศ แสนตา           | Jenkins & Docker        |

---

# 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน

ระบบนี้เป็น Single Page Web Application สำหรับจัดการรายการงาน โดยมี frontend และ backend แยกกัน พร้อม deployment แบบ containerized บน Kubernetes

ระบบถูกออกแบบให้รองรับ:

* CI/CD Pipeline
* Infrastructure as Code
* Containerization
* Kubernetes Deployment
* Monitoring & Metrics
* Local DevOps Demo

---

### Architecture Diagram

```text
Developer
    │
    ▼ git push
 GitHub ──── webhook ────▶ Jenkins CI/CD
                                │
                    ┌───────────┼───────────┐
                    ▼                       ▼
               Build Frontend         Build Backend
               & Docker Image         & Docker Image
                    │                       │
                    └───────────┬───────────┘
                                ▼
                     Terraform + Ansible
                                │
                                ▼
                        Kubernetes Cluster
                  ┌───────────────────────────┐
                  │ Frontend Pods (2 replicas)│
                  │ Backend Pods  (2 replicas)│
                  │                           │
                  │ Frontend Service :30080   │
                  │ Backend Service  :8080    │
                  └───────────────────────────┘
                                │
                  ┌─────────────┴──────────────┐
                  ▼                            ▼
             Prometheus  ──────────────▶  Grafana
            (scrape /metrics)          (dashboard)
```

### ☸️ Kubernetes Deployment

ระบบ deploy บน Docker Desktop Kubernetes โดยใช้ NodePort Services สำหรับเปิด frontend และ backend (Namespace: todo-list)

* **Frontend:** 2 Desired Pods (High Availability)
* **Backend:** 2 Desired Pods (Load Distribution)

---

# 📁 Repository Structure

```text
ServerlessProject/
├── frontend/                        # แอปพลิเคชัน Frontend ด้วย Next.js
│   ├── app/                         # หน้า Frontend และ API Routes
│   │   ├── api/health/route.ts      # Endpoint สำหรับ Health Check ของ Frontend
│   │   ├── metrics/route.ts         # Endpoint สำหรับ Metrics ของ Frontend
│   │   ├── layout.tsx               # Layout หลักของแอปพลิเคชัน
│   │   ├── globals.css              # Global CSS Styles
│   │   └── page.tsx                 # หน้า Main ของ Frontend
│   ├── Dockerfile                   # ใช้ Build Docker Image ของ Frontend
│   ├── package.json                 # Dependencies และ Scripts ของ Frontend
│   └── next.config.ts               # การตั้งค่า Next.js
│
├── backend/                         # Backend API Service ภาษา Go
│   ├── main.go                      # Source Code ของ Backend
│   ├── go.mod                       # การตั้งค่า Go Module และ Dependencies
│   └── Dockerfile                   # ใช้ Build Docker Image ของ Backend
│
├── k8s/                             # Kubernetes Deployment Manifests
│   ├── namespace.yaml               # การกำหนด Namespace
│   ├── deployment.yaml              # Manifest สำหรับ Deployment ของ Frontend
│   ├── service.yaml                 # Manifest สำหรับ Frontend NodePort Service
│   ├── backend-deployment.yaml      # Manifest สำหรับ Deployment ของ Backend
│   └── backend-service.yaml         # Manifest สำหรับ Backend NodePort Service
│
├── terraform/                       # Infrastructure as Code
│   ├── main.tf                      # Terraform Resources
│   ├── variables.tf                 # ตัวแปร Input สำหรับ Terraform
│   └── outputs.tf                   # Outputs ของ Terraform
│
├── ansible/                         # ระบบ Automation และ Inventory ของ Ansible
│   ├── inventory                    # Inventory ของ Host / Environment เป้าหมาย
│   └── playbook.yml                 # Playbook สำหรับตรวจสอบและ Automation การ Deploy
│
├── monitoring/                      # การตั้งค่า Monitoring
│   ├── prometheus.yml               # การตั้งค่า Scrape ของ Prometheus
│   ├── docker-compose.yml           # Compose File สำหรับ Prometheus และ Grafana
│   └── grafana-dashboard.json       # Dashboard Definition ของ Grafana
│
├── Jenkinsfile                      # Declarative Jenkins CI/CD Pipeline
├── README.md                        # เอกสารประกอบโปรเจกต์
└── LOCAL_DEMO.md                    # คู่มือ Demo และการใช้งานบน Local
```

---

# ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

ก่อนเริ่มใช้งาน ต้องติดตั้ง:

| Tool                        | Version    | หน้าที่                            |
| --------------------------- | ---------- | ---------------------------------- |
| Docker Desktop              | ≥ 24.x     | สร้างและรัน Containers             |
| Kubernetes (Docker Desktop) | ≥ 1.28     | ใช้ Deploy Application             |
| Node.js + npm               | ≥ 18       | ใช้รัน Frontend                    |
| Go                          | ≥ 1.23     | ใช้รัน Backend                     |
| Terraform                   | Latest     | Provision Kubernetes Namespace     |
| Ansible (WSL)               | ≥ 2.15     | ตรวจสอบ Environment และ Deployment |
| Jenkins                     | Latest LTS | Automated CI/CD Pipeline           |
| Prometheus                  | ≥ 2.x      | เก็บ Metrics                       |
| Grafana                     | ≥ 10.x     | Monitoring Dashboard               |

เปิด Docker Desktop แล้ว Enable Kubernetes ก่อนเริ่ม

---

# 🏃 วิธีการรันโปรเจค

### Clone Repository

```bash
git clone https://github.com/laziesv/ServerlessProject.git
cd ServerlessProject
```

### 1. Run Application Locally

## 1. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Health Check:

```text
http://localhost:3000/api/health
```

Metrics:

```text
http://localhost:3000/metrics
```

---

## 2. Run Backend

เปิด terminal ใหม่:

```bash
cd backend
go run main.go
```

Backend API:

```text
http://localhost:8080/api/tasks
```

Health Check:

```text
http://localhost:8080/api/health
```

Metrics:

```text
http://localhost:8080/metrics
```

---

# 🐳 Docker

## Build Images

```bash
docker build -t laziesv/todo-list-frontend:latest ./frontend
docker build -t laziesv/todo-list-backend:latest ./backend
```

## Run Containers

```bash
docker run --rm -d -p 3000:3000 --name todo-front laziesv/todo-list-frontend:latest

docker run --rm -d -p 8080:8080 --name todo-back laziesv/todo-list-backend:latest
```

เปิด:

```text
http://localhost:3000
http://localhost:8080/api/tasks
```

หยุด containers:

```bash
docker stop todo-front todo-back
```

---

### 2. รัน CI/CD และ Deployment

1. เปิด Jenkins
2. ตั้งค่า Docker Hub credentials
3. เชื่อม GitHub Webhook
4. Run Pipeline จาก Jenkinsfile

---

# 🔄 CI/CD Pipeline (Jenkins)

## Jenkins Pipeline Stages

โปรเจกต์นี้ใช้ Jenkins Pipeline สำหรับ Automated CI/CD ตั้งแต่ Build → Test → Docker → Deploy

`Jenkinsfile` มีทั้งหมด 6 stages:

| Stage        | หน้าที่                          |
| ------------ | -------------------------------- |
| Checkout     | ดึง source code จาก GitHub       |
| Build        | Build frontend + backend         |
| Test         | Run lint และ unit tests          |
| Docker Build | Build Docker images              |
| Push         | Push images ไป Docker Hub        |
| Deploy       | Terraform + Ansible + Kubernetes |

---

## Jenkins Setup

1. ติดตั้ง plugins:

* Git
* Pipeline
* Docker Pipeline

2. เพิ่ม Docker Hub credential:

```text
ID: dockerhub-credentials
```

3. สร้าง Pipeline Job

4. เชื่อม GitHub Webhook:

```text
http://<jenkins-host>:8080/github-webhook/
```

---

# ☁️ Terraform + Ansible

Terraform ใช้สำหรับ provision Kubernetes namespace

Ansible ใช้สำหรับตรวจสอบ environment และช่วย deployment automation

## Terraform

สร้าง Kubernetes namespace:

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

Namespace ที่สร้าง:

```text
todo-list
```

---

## Ansible

ตรวจ environment และสร้าง deployment summary:

```bash
cd ansible
ansible-playbook -i inventory playbook.yml
```

Ansible จะ:

* ตรวจ kubectl
* ตรวจ Docker
* สร้าง deployment notes
* เขียน environment summary

---

# ☸️ Kubernetes Deployment

## Apply Manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

---

## ตรวจสถานะ

```bash
kubectl get pods -n todo-list
kubectl get svc -n todo-list
```

Expected:

```text
Frontend replicas = 2
Backend replicas = 2
```

---

# 🔌 Kubernetes Port Forward

Frontend:

```bash
kubectl port-forward -n todo-list svc/todo-list-service 30080:3000
```

Backend:

```bash
kubectl port-forward -n todo-list svc/todo-backend-service 8080:8080
```

เปิด:

```text
http://localhost:30080
http://localhost:8080/api/tasks
```

---

# 📊 Monitoring (Prometheus & Grafana)

## Start Prometheus + Grafana

```bash
docker compose -f monitoring/docker-compose.yml up -d
```

---

## Prometheus

เปิด:

```text
http://localhost:9090
```

ตรวจ Targets:

```text
Status -> Targets
```

Metrics ตัวอย่าง:

```text
http_requests_total
```

---

## Grafana

เปิด:

```text
http://localhost:3001
```

Login:

```text
admin / admin
```

Dashboard:

```text
To-do List Monitoring
```

Panels:

| Panel        | ความหมาย       |
| ------------ | -------------- |
| Request Rate | จำนวน requests |
| Pod Health   | สถานะ targets  |
| App Uptime   | uptime ของระบบ |


---

# 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

## Port 8080 Already In Use

สาเหตุ:

* Jenkins ใช้งานอยู่
* มี process เดิมค้าง

แก้:

```bash
docker stop jenkins
```

หรือ:

```bash
netstat -ano | findstr :8080
```

---

## ImagePullBackOff

แก้:

```bash
docker build -t laziesv/todo-list-frontend:latest ./frontend
docker build -t laziesv/todo-list-backend:latest ./backend
```

แล้ว restart deployment

---

## Prometheus Target DOWN

ตรวจว่า port-forward ยังทำงานอยู่

Frontend:

```bash
30080 -> 3000
```

---

# 📄 ข้อมูลการส่งงาน

* วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
* อาจารย์ผู้สอน: **ดร. นันทวุฒิ คะอังกุ**
* ภาควิชาวิศวกรรมคอมพิวเตอร์

---

# 📚 เอกสารอ้างอิง

* [Jenkins Documentation](https://www.jenkins.io/doc/book/pipeline/syntax/)
* [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
* [Ansible Documentation](https://docs.ansible.com/)
* [Kubernetes Documentation](https://kubernetes.io/docs/home/)
* [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
* [Grafana Documentation](https://grafana.com/docs/)


