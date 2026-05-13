# Go Backend API

ไฟล์นี้อธิบาย backend ภาษา Go ที่เพิ่มเข้ามาในโปรเจกต์ To-do List

## วิธีรัน

```bash
cd backend
go run .
```

backend จะรันที่:

```text
http://localhost:8080
```

## Endpoints

| Method | Endpoint | หน้าที่ |
| --- | --- | --- |
| GET | `/api/health` | ตรวจสุขภาพ backend |
| GET | `/api/tasks` | ดึงรายการงานทั้งหมด |
| POST | `/api/tasks` | เพิ่มงานใหม่ |
| PUT | `/api/tasks/{id}` | แก้ไขงานตาม id |
| DELETE | `/api/tasks/{id}` | ลบงานตาม id |
| GET | `/metrics` | ส่ง metrics แบบ Prometheus |

## ตัวอย่าง request

เพิ่มงาน:

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"เขียน backend Go\",\"note\":\"ทำ CRUD API\",\"priority\":\"high\"}"
```

แก้ไขงาน:

```bash
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"อัปเดตงาน\",\"note\":\"แก้ไขผ่าน API\",\"priority\":\"medium\",\"completed\":true}"
```

ลบงาน:

```bash
curl -X DELETE http://localhost:8080/api/tasks/1
```

## การเชื่อมกับ frontend

frontend ใน `frontend/app/page.tsx` เรียก backend ผ่าน:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
```

ถ้าไม่ได้กำหนด env นี้ ระบบจะใช้ `http://localhost:8080` เป็นค่าเริ่มต้น

## อธิบายโค้ด backend

ไฟล์หลักคือ `backend/main.go`

1. `type task` คือโครงสร้างข้อมูลงาน มี `id`, `title`, `note`, `priority`, `completed`, `createdAt`, `updatedAt`
2. `type store` คือ in-memory database ใช้ `map[int64]task` เก็บข้อมูล และใช้ `sync.RWMutex` เพื่อให้การอ่าน/เขียนข้อมูลปลอดภัยขึ้นเมื่อมีหลาย request
3. `newStore()` สร้างข้อมูลเริ่มต้น 3 รายการ เพื่อให้ระบบมีข้อมูลสำหรับ demo ทันที
4. `tasksHandler()` รับ `GET /api/tasks` เพื่อ list งาน และ `POST /api/tasks` เพื่อเพิ่มงาน
5. `taskByIDHandler()` รับ `PUT /api/tasks/{id}` เพื่อแก้ไข และ `DELETE /api/tasks/{id}` เพื่อลบ
6. `decodeTaskInput()` อ่าน JSON จาก request body และตรวจว่า `title` ไม่ว่าง
7. `normalizePriority()` จำกัด priority ให้เป็น `low`, `medium`, `high` ถ้าส่งค่าอื่นมาจะใช้ `medium`
8. `healthHandler()` ตอบสถานะ backend สำหรับ Kubernetes readiness/liveness probes
9. `metricsHandler()` ตอบ metrics แบบ Prometheus เช่น `http_requests_total` และ `todo_backend_uptime_seconds`
10. `withMiddleware()` เพิ่ม CORS header และนับจำนวน request ทุกครั้ง

## ทดสอบ

```bash
cd backend
go test ./...
```

ในเครื่องนี้ทดสอบผ่านแล้ว โดยตั้ง `GOCACHE` ชั่วคราวไว้ใน `backend/.gocache` เพราะ cache default ใน `AppData` ถูกปฏิเสธสิทธิ์เขียน
