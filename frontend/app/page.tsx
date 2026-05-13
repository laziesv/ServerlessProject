"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Check,
  Circle,
  Edit3,
  ListTodo,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Priority = "low" | "medium" | "high";

type Task = {
  id: number;
  title: string;
  note: string;
  priority: Priority;
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "เตรียม Jenkins pipeline",
    note: "ตรวจ stage build, test, docker push และ deploy",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    title: "ตรวจ Kubernetes manifests",
    note: "deployment.yaml ต้องใช้ image และ replicas ถูกต้อง",
    priority: "medium",
    completed: true,
  },
  {
    id: 3,
    title: "สรุป dashboard monitoring",
    note: "Prometheus scrape /metrics และ Grafana มีอย่างน้อย 3 panels",
    priority: "low",
    completed: false,
  },
];

const priorityLabels: Record<Priority, string> = {
  low: "ทั่วไป",
  medium: "สำคัญ",
  high: "เร่งด่วน",
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-sky-50 text-sky-700 border-sky-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tasks;

    return tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(keyword) ||
        task.note.toLowerCase().includes(keyword) ||
        priorityLabels[task.priority].toLowerCase().includes(keyword)
      );
    });
  }, [search, tasks]);

  const resetForm = () => {
    setTitle("");
    setNote("");
    setPriority("medium");
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      note: note.trim() || "ไม่มีรายละเอียดเพิ่มเติม",
      priority,
      completed: false,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    resetForm();
  };

  const deleteTask = (id: number) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleTask = (id: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditNote(task.note);
    setEditPriority(task.priority);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditNote("");
    setEditPriority("medium");
  };

  const saveEditing = (id: number) => {
    if (!editTitle.trim()) return;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              title: editTitle.trim(),
              note: editNote.trim() || "ไม่มีรายละเอียดเพิ่มเติม",
              priority: editPriority,
            }
          : task,
      ),
    );
    cancelEditing();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <ListTodo size={16} />
              ENG23 3074
            </div>
            <h1 className="text-3xl font-bold text-slate-950 md:text-5xl">
              ระบบ To-do List
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              หน้าเดียวสำหรับเพิ่ม ลบ แก้ไข ค้นหา และติดตามสถานะงาน พร้อมข้อมูลสรุปสำหรับการสาธิตระบบตาม README.md
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <Summary label="ทั้งหมด" value={tasks.length} />
            <Summary label="เสร็จแล้ว" value={completedCount} />
            <Summary label="ค้างอยู่" value={activeCount} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={addTask}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-950">เพิ่มงานใหม่</h2>
          <label className="mt-5 block text-sm font-semibold text-slate-700">
            ชื่องาน
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="เช่น ทำเอกสาร Jenkins"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            รายละเอียด
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="รายละเอียดสั้น ๆ ของงาน"
              rows={4}
              className="mt-2 w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            ความสำคัญ
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="low">ทั่วไป</option>
              <option value="medium">สำคัญ</option>
              <option value="high">เร่งด่วน</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            เพิ่มงาน
          </button>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-bold text-slate-950">รายการงาน</h2>
              <label className="relative block md:w-80">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหางาน"
                  className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredTasks.map((task) => {
              const isEditing = editingId === task.id;

              return (
                <article key={task.id} className="p-5">
                  {isEditing ? (
                    <div className="grid gap-3">
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="rounded-md border border-slate-300 px-3 py-2 font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <textarea
                        value={editNote}
                        onChange={(event) => setEditNote(event.target.value)}
                        rows={3}
                        className="resize-none rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <select
                        value={editPriority}
                        onChange={(event) =>
                          setEditPriority(event.target.value as Priority)
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      >
                        <option value="low">ทั่วไป</option>
                        <option value="medium">สำคัญ</option>
                        <option value="high">เร่งด่วน</option>
                      </select>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveEditing(task.id)}
                          className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                          <Save size={16} />
                          บันทึก
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <X size={16} />
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="mt-1 text-emerald-600 transition hover:text-emerald-700"
                          aria-label="เปลี่ยนสถานะงาน"
                        >
                          {task.completed ? <Check size={22} /> : <Circle size={22} />}
                        </button>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-base font-bold ${
                                task.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-950"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${priorityStyles[task.priority]}`}
                            >
                              {priorityLabels[task.priority]}
                            </span>
                          </div>
                          <p className="mt-2 leading-6 text-slate-600">{task.note}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Edit3 size={16} />
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                          ลบ
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-10 text-center text-slate-500">
                ไม่พบรายการงานที่ตรงกับคำค้นหา
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-950">{value}</div>
    </div>
  );
}
