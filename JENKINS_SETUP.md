# Jenkins Setup

วิธีติดตั้งและรัน Jenkins สำหรับ demo pipeline บน Docker Desktop (Windows)

---

## Step 1 — รัน Jenkins ด้วย Docker

```powershell
docker run -d --name jenkins `
  -p 8080:8080 -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  jenkins/jenkins:lts
```

ติดตั้ง tools ทั้งหมดที่ pipeline ต้องใช้:

```powershell
docker exec -u root jenkins bash -c "
  apt-get update &&
  apt-get install -y curl unzip python3 python3-pip nodejs npm golang-go docker.io &&
  groupadd -f docker && usermod -aG docker jenkins && chmod 666 /var/run/docker.sock &&
  pip3 install ansible --break-system-packages &&
  curl -LO https://dl.k8s.io/release/v1.31.0/bin/linux/amd64/kubectl &&
  chmod +x kubectl && mv kubectl /usr/local/bin/ &&
  curl -LO https://releases.hashicorp.com/terraform/1.9.0/terraform_1.9.0_linux_amd64.zip &&
  unzip terraform_1.9.0_linux_amd64.zip && mv terraform /usr/local/bin/ &&
  rm -f terraform_1.9.0_linux_amd64.zip &&
  echo 'ALL TOOLS INSTALLED'
"
```

รอ 1-2 นาที แล้วเปิด http://localhost:8080

## Step 2 — ดึง Initial Password

```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

copy password ไปวางในหน้าเว็บ Jenkins แล้วกด Continue

## Step 3 — ติดตั้ง Plugins

เลือก **Install suggested plugins** แล้วรอติดตั้งเสร็จ

หลังจากนั้นติดตั้งเพิ่มเติมที่ Manage Jenkins > Plugins > Available:

- Docker Pipeline
- GitHub Integration

## Step 4 — สร้าง Credential สำหรับ Docker Hub

ไปที่ Manage Jenkins > Credentials > (global) > Add Credentials

```
Kind:     Username with password
ID:       dockerhub-credentials
Username: <Docker Hub username>
Password: <Docker Hub token หรือ password>
```

ถ้า demo แบบไม่ push Docker Hub จริง ข้ามขั้นตอนนี้ได้ (ใช้ SKIP_DOCKER_PUSH=true)

## Step 5 — สร้าง Pipeline Job

1. กด New Item
2. ใส่ชื่อ เช่น `todo-list`
3. เลือก **Pipeline** แล้วกด OK
4. ใน Pipeline section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: ใส่ URL ของ GitHub repo
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. กด Save

## Step 6 — รัน Pipeline

กด **Build with Parameters**:

| Parameter | ค่า | ใช้ตอนไหน |
| --- | --- | --- |
| SKIP_DOCKER_PUSH | `true` | demo แบบไม่ push Docker Hub |
| SKIP_DOCKER_PUSH | `false` | demo แบบ push จริง |
| SKIP_DEPLOY | `false` | ปกติ |

สำหรับ demo ในเครื่อง แนะนำใช้:

```
SKIP_DOCKER_PUSH = true
SKIP_DEPLOY      = true
```

จะรันได้ 4 stages: Checkout, Build, Test, Docker Build

ถ้าอยาก demo Deploy stage ด้วย ต้องติดตั้ง kubectl, terraform, ansible ใน Jenkins container ก่อน (ดู Step 7)

## Step 7 — (Optional) ติดตั้ง tools ใน Jenkins container

ถ้าต้องการรัน Deploy stage จริง ต้องติดตั้ง tools เพิ่มใน container:

```powershell
docker exec -u root jenkins bash -c "
  apt-get update && apt-get install -y curl unzip python3 python3-pip &&
  curl -LO https://dl.k8s.io/release/v1.31.0/bin/linux/amd64/kubectl &&
  chmod +x kubectl && mv kubectl /usr/local/bin/ &&
  curl -LO https://releases.hashicorp.com/terraform/1.9.0/terraform_1.9.0_linux_amd64.zip &&
  unzip terraform_1.9.0_linux_amd64.zip && mv terraform /usr/local/bin/ &&
  pip3 install ansible --break-system-packages
"
```

หลังจากนั้นรันอีกครั้งด้วย `SKIP_DEPLOY=false`

## Step 8 — (Optional) ตั้ง GitHub Webhook

ถ้า Jenkins เข้าถึงได้จาก internet:

1. ไปที่ GitHub repo > Settings > Webhooks > Add webhook
2. Payload URL: `http://<jenkins-host>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: Just the push event
5. กด Add webhook

เมื่อ `git push` Jenkins จะ trigger pipeline อัตโนมัติ

สำหรับ Jenkins ในเครื่อง local ให้ trigger build ด้วยมือจาก Jenkins UI แทน

---

## Pipeline 6 Stages

| # | Stage | ทำอะไร |
| --- | --- | --- |
| 1 | Checkout | ดึง source code จาก Git |
| 2 | Build | `npm ci` + `npm run build` + `go build` |
| 3 | Test | `npm run lint` + `go test` |
| 4 | Docker Build | สร้าง Docker image frontend + backend |
| 5 | Push | login + push image ไป Docker Hub |
| 6 | Deploy | Terraform + Ansible + kubectl apply |

---

## ปัญหาที่อาจเจอ

| ปัญหา | วิธีแก้ |
| --- | --- |
| Jenkins ไม่เห็น Docker | mount `/var/run/docker.sock` ตอน docker run |
| npm ci ช้ามาก | ปกติ ครั้งแรกจะช้า ครั้งหลังจะ cache |
| Build with Parameters ไม่ขึ้น | รัน build ครั้งแรกก่อน 1 รอบ แล้วค่อยกด Build with Parameters |
| Push stage error ไม่มี credentials | ตั้ง dockerhub-credentials หรือใช้ SKIP_DOCKER_PUSH=true |
| Deploy stage error ไม่มี kubectl | ติดตั้ง tools ตาม Step 7 หรือใช้ SKIP_DEPLOY=true |
