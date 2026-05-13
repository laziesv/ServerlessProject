# ระบบ To-do List — ENG23 3074

เว็บแอปหน้าเดียวสำหรับจัดการรายการงาน สามารถเพิ่ม ลบ แก้ไข ค้นหา และเปลี่ยนสถานะงานได้ พัฒนาโดยใช้ Next.js, TypeScript และ Tailwind CSS พร้อมไฟล์ Docker, Jenkins, Terraform, Ansible, Kubernetes, Prometheus และ Grafana ตามเกณฑ์การให้คะแนนของโปรเจกต์

---

## สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
| --- | --- | --- |
| B6609061 | ศิริพงษ์ ผิวคำ | Git, App Development |
| B6612870 | เกียรติศักดิ์ ปัตตานี | Kubernetes, Monitoring |
| B6617165 | ภูผา คำผานุรัตน์ | Terraform, Ansible |
| B6631536 | ภูวิศ แสนตา | Jenkins, Docker |

---

## ภาพรวมระบบ

- ชื่อระบบ: ระบบ To-do List
- รูปแบบ: Single Page Web Application
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Runtime: Node.js
- Container: Docker
- CI/CD: Jenkins
- Deployment: Kubernetes NodePort
- Infrastructure/Config: Terraform + Ansible
- Monitoring: Prometheus + Grafana

ฟังก์ชันหลักของหน้าเดียว:

1. เพิ่มงานใหม่ พร้อมชื่อ รายละเอียด และระดับความสำคัญ
2. แก้ไขชื่อ รายละเอียด และระดับความสำคัญของงาน
3. ลบงานออกจากรายการ
4. เปลี่ยนสถานะงานเป็นเสร็จแล้วหรือยังไม่เสร็จ
5. ค้นหางานจากชื่อ รายละเอียด หรือระดับความสำคัญ
6. แสดงจำนวนงานทั้งหมด งานที่เสร็จแล้ว และงานที่ค้างอยู่

---

## โครงสร้าง Repository

```text
ServerlessProject/
├── frontend/
│   ├── app/
│   │   ├── api/health/route.ts      # endpoint ตรวจสุขภาพแอป
│   │   ├── metrics/route.ts         # endpoint /metrics สำหรับ Prometheus
│   │   ├── globals.css              # global style
│   │   ├── layout.tsx               # metadata และ layout หลัก
│   │   └── page.tsx                 # หน้าเดียวของระบบ To-do List
│   ├── Dockerfile                   # สร้าง production image
│   ├── .dockerignore
│   ├── next.config.ts
│   ├── package.json
│   └── package-lock.json
├── Jenkinsfile                      # CI/CD pipeline 6 stages
├── terraform/
│   ├── main.tf                      # provision Kubernetes namespace
│   ├── variables.tf
│   └── outputs.tf
├── ansible/
│   ├── inventory
│   └── playbook.yml                 # ตรวจและเตรียม environment
├── k8s/
│   ├── deployment.yaml              # Deployment replicas 2
│   └── service.yaml                 # NodePort 30080
├── monitoring/
│   ├── prometheus.yml               # scrape /metrics
│   └── grafana-dashboard.json       # dashboard 3 panels
└── README.md
```

---

## วิธีรันบนเครื่อง

ต้องติดตั้ง Node.js และ npm ก่อน

```bash
cd frontend
npm ci
npm run dev
```

เปิดเว็บที่:

```text
http://localhost:3000
```

ตรวจ production build:

```bash
cd frontend
npm run lint
npm run build
npm run start
```

Health check:

```text
http://localhost:3000/api/health
```

Prometheus metrics:

```text
http://localhost:3000/metrics
```

---

## Docker

Build image:

```bash
docker build -t kiadt/todo-list:latest ./frontend
```

Run container:

```bash
docker run --rm -p 3000:3000 kiadt/todo-list:latest
```

Dockerfile ใช้ multi-stage build:

1. `deps` ติดตั้ง dependencies ด้วย `npm ci`
2. `builder` build Next.js ด้วย `npm run build`
3. `runner` copy output แบบ standalone แล้วรัน `node server.js`

---

## Jenkins CI/CD

`Jenkinsfile` มีครบ 6 stages ตาม rubric:

| Stage | หน้าที่ |
| --- | --- |
| Checkout | ดึง source code จาก Git repository |
| Build | ติดตั้ง dependencies และ build Next.js |
| Test | รัน `npm run lint` เพื่อตรวจคุณภาพโค้ด |
| Docker Build | สร้าง Docker image |
| Push to Hub | login และ push image ไป Docker Hub |
| Deploy | รัน Terraform, Ansible และ apply Kubernetes manifests |

ตั้งค่า Jenkins:

1. ติดตั้ง plugins: Git, Pipeline, Docker Pipeline
2. เพิ่ม Docker Hub credential ชื่อ `dockerhub-credentials`
3. สร้าง Pipeline job และชี้ไปยัง repository นี้
4. ตั้ง GitHub webhook ไปที่ `http://<jenkins-host>:8080/github-webhook/`
5. เมื่อ `git push` Jenkins จะ trigger pipeline อัตโนมัติ

---

## Terraform + Ansible

Terraform สร้าง Kubernetes namespace ชื่อ `todo-list`

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

Ansible ตรวจเครื่องมือที่จำเป็นและสร้างไฟล์สรุป environment

```bash
cd ansible
ansible-playbook -i inventory playbook.yml
```

ไฟล์ `Jenkinsfile` เรียก Terraform และ Ansible ใน stage `Deploy` เพื่อแสดงการ integrate ทั้งสองเครื่องมือเข้ากับ pipeline

---

## Kubernetes Deployment

Deploy ด้วย kubectl:

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

ตรวจสถานะ:

```bash
kubectl get pods -n todo-list
kubectl get svc -n todo-list
```

ผลลัพธ์ที่คาดหวัง:

```text
deployment/todo-list มี replicas 2
service/todo-list-service เปิดแบบ NodePort ที่ port 30080
```

เปิดแอป:

```text
http://localhost:30080
```

---

## Monitoring

แอป expose endpoint:

```text
/metrics
```

Prometheus config อยู่ที่ `monitoring/prometheus.yml` และ scrape ทุก 15 วินาที

Grafana dashboard อยู่ที่ `monitoring/grafana-dashboard.json` มี 3 panels:

| Panel | PromQL | ความหมาย |
| --- | --- | --- |
| Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Pod Health | `up{job="todo-list"}` | target ยังทำงานหรือไม่ |
| App Uptime | `todo_app_uptime_seconds` | ค่า uptime สำหรับ demo monitoring |

---

## อธิบายโค้ดหน้าเดียวอย่างละเอียด

ไฟล์หลักคือ `frontend/app/page.tsx`

### 1. ประกาศชนิดข้อมูล

```ts
type Priority = "low" | "medium" | "high";

type Task = {
  id: number;
  title: string;
  note: string;
  priority: Priority;
  completed: boolean;
};
```

ส่วนนี้กำหนดโครงสร้างของงานแต่ละรายการ ทำให้ TypeScript ตรวจได้ว่างานหนึ่งชิ้นต้องมี `id`, `title`, `note`, `priority` และ `completed`

### 2. ข้อมูลเริ่มต้น

```ts
const initialTasks: Task[] = [...]
```

ใช้สร้างตัวอย่างงานตอนเปิดหน้าเว็บ เพื่อให้ผู้ตรวจเห็นฟังก์ชันของระบบทันทีโดยไม่ต้องเพิ่มข้อมูลเองทั้งหมด

### 3. state ของหน้า

```ts
const [tasks, setTasks] = useState<Task[]>(initialTasks);
const [title, setTitle] = useState("");
const [note, setNote] = useState("");
const [priority, setPriority] = useState<Priority>("medium");
const [search, setSearch] = useState("");
```

`tasks` เก็บรายการงานทั้งหมด ส่วน `title`, `note`, `priority` เก็บค่าจากฟอร์มเพิ่มงาน และ `search` เก็บคำค้นหา

### 4. สรุปจำนวนงาน

```ts
const completedCount = tasks.filter((task) => task.completed).length;
const activeCount = tasks.length - completedCount;
```

นับงานที่เสร็จแล้ว และคำนวณงานที่ยังค้างอยู่ เพื่อแสดงบน dashboard ด้านบนของหน้า

### 5. ค้นหางาน

```ts
const filteredTasks = useMemo(() => {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return tasks;
  return tasks.filter(...)
}, [search, tasks]);
```

ใช้ `useMemo` เพื่อคำนวณรายการที่ผ่านการค้นหาเฉพาะตอน `search` หรือ `tasks` เปลี่ยน โดยค้นหาจากชื่องาน รายละเอียด และระดับความสำคัญ

### 6. เพิ่มงาน

```ts
const addTask = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!title.trim()) return;
  const newTask: Task = { ... };
  setTasks((currentTasks) => [newTask, ...currentTasks]);
  resetForm();
};
```

เมื่อ submit ฟอร์ม ระบบจะกันไม่ให้ reload หน้าเว็บ ตรวจว่าชื่องานไม่ว่าง สร้าง object งานใหม่ แล้วเพิ่มไว้ด้านบนสุดของรายการ

### 7. ลบงาน

```ts
const deleteTask = (id: number) => {
  setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
};
```

ใช้ `filter` สร้างรายการใหม่ที่ไม่รวมงาน id ที่ต้องการลบ

### 8. เปลี่ยนสถานะงาน

```ts
const toggleTask = (id: number) => {
  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    ),
  );
};
```

ใช้ `map` เพื่อแก้เฉพาะงานที่ id ตรงกัน แล้วสลับค่า `completed` ระหว่าง true/false

### 9. เริ่มแก้ไขงาน

```ts
const startEditing = (task: Task) => {
  setEditingId(task.id);
  setEditTitle(task.title);
  setEditNote(task.note);
  setEditPriority(task.priority);
};
```

เมื่อกดแก้ไข ระบบจะจำ id ของงานที่กำลังแก้ และ copy ค่าเดิมไปใส่ในฟอร์มแก้ไข

### 10. บันทึกงานที่แก้ไข

```ts
const saveEditing = (id: number) => {
  if (!editTitle.trim()) return;
  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === id ? { ...task, title: editTitle.trim(), ... } : task,
    ),
  );
  cancelEditing();
};
```

ตรวจว่าชื่องานไม่ว่าง จากนั้นแก้ข้อมูลของงาน id นั้น และออกจากโหมดแก้ไข

### 11. ส่วนแสดงผล

หน้าเว็บแบ่งเป็น 3 ส่วนหลัก:

1. Header แสดงชื่อระบบและตัวเลขสรุป
2. Form ด้านซ้ายสำหรับเพิ่มงานใหม่
3. List ด้านขวาสำหรับค้นหา แสดง แก้ไข ลบ และเปลี่ยนสถานะงาน

---

## อธิบาย endpoint

### `frontend/app/api/health/route.ts`

ใช้ตอบ JSON เพื่อให้ Kubernetes readiness/liveness probes ตรวจว่าแอปยังทำงานอยู่

```json
{
  "status": "ok",
  "service": "todo-list",
  "timestamp": "..."
}
```

### `frontend/app/metrics/route.ts`

ตอบข้อมูลแบบ Prometheus text format เช่น `todo_app_info`, `http_requests_total` และ `todo_app_uptime_seconds` เพื่อให้ Prometheus scrape ได้

---

## เกณฑ์คะแนนที่รองรับ

| Phase | รายการที่ทำแล้ว |
| --- | --- |
| Phase 1 Git & Source Code | มีโครงสร้าง repo, แอปรันได้, Dockerfile, README พร้อมวิธี setup |
| Phase 2 Jenkins CI/CD + Docker | มี Jenkinsfile 6 stages, webhook trigger, Docker build และ push stage |
| Phase 3 Terraform + Ansible | มี Terraform namespace, Ansible playbook และ integrate ใน Deploy stage |
| Phase 4 Kubernetes Deployment | มี deployment.yaml replicas 2, service.yaml NodePort 30080, health probes |
| Phase 5 Prometheus + Grafana | มี /metrics, prometheus.yml และ Grafana dashboard 3 panels |
| Bonus Presentation & Demo | README มี architecture, วิธี demo และคำอธิบายโค้ด |

---

## Architecture Diagram

```text
Developer
  |
  | git push
  v
GitHub webhook
  |
  v
Jenkins Pipeline
  |-- Checkout
  |-- Build
  |-- Test
  |-- Docker Build
  |-- Push to Docker Hub
  `-- Deploy
        |-- Terraform creates namespace
        |-- Ansible checks environment
        `-- kubectl applies manifests
              |
              v
        Kubernetes NodePort Service
              |
              v
        To-do List Next.js Pods
              |
              v
        /metrics -> Prometheus -> Grafana
```

---

## หมายเหตุการตรวจงาน

ตรวจแล้วในเครื่องนี้:

```bash
npm run lint
npm run build
```

ผ่านทั้งสองคำสั่งแล้ว ส่วน Docker daemon ในเครื่องยังไม่เปิด จึงยังไม่ได้ build image จริงจาก Dockerfile ในรอบตรวจนี้
# Local demo commands: see [LOCAL_DEMO.md](./LOCAL_DEMO.md).
