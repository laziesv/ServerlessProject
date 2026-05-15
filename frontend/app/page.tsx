"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  Leaf,
  Zap,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL; // ใช้ตัวแปรจาก .env.local

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  // 🔄 LOAD FROM BACKEND
  const fetchTasks = async () => {
    const res = await fetch(`${API}/todos`);
    const data = await res.json();

    setTasks(
      data.map((t: any) => ({
        id: t.id,
        title: t.title,
        completed: t.done,
      }))
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ➕ ADD
  const addTask = async () => {
    if (!title.trim()) return;

    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    const newTask = await res.json();

    setTasks([
      {
        id: newTask.id,
        title: newTask.title,
        completed: false,
      },
      ...tasks,
    ]);

    setTitle("");
  };

  // ✔ TOGGLE
  const toggleTask = async (id: number) => {
    await fetch(`${API}/todos/${id}`, {
      method: "PUT",
    });

    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // 🗑 DELETE
  const deleteTask = async (id: number) => {
    await fetch(`${API}/todos/${id}`, {
      method: "DELETE",
    });

    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <main className="min-h-screen bg-[#F7F9F7] text-slate-700 flex items-center justify-center p-6 font-sans">
      {/* Background Decor - เพิ่มลูกเล่นวงกลมสีเขียวจางๆ */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[5%] left-[10%] w-96 h-96 bg-emerald-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] right-[10%] w-80 h-80 bg-green-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-500 p-3 rounded-[20px] mb-4 shadow-lg shadow-emerald-200"
          >
            <Leaf className="text-white w-6 h-6" />
          </motion.div>

          <h1 className="text-4xl font-black tracking-tight text-slate-800">
            To-do <span className="text-emerald-500">List</span>
          </h1>

          <p className="text-slate-400 font-medium text-sm mt-1 uppercase tracking-[0.2em]">
            ธรรมชาติของการจัดการภารกิจ
          </p>
        </div>

        {/* Status Dashboard */}
        <div className="bg-white rounded-[35px] p-2 flex gap-2 mb-8 shadow-sm border border-emerald-50">
          <div className="flex-1 flex flex-col items-center py-4 rounded-[28px] bg-emerald-50/50">
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest mb-1">
              Total
            </span>
            <span className="text-2xl font-black text-slate-700">
              {tasks.length}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center py-4 rounded-[28px] bg-white border border-emerald-50 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Done
            </span>
            <span className="text-2xl font-black text-emerald-500">
              {completedCount}
            </span>
          </div>
        </div>

        {/* Add Input */}
        <div className="relative mb-10 group">
          <input
            type="text"
            placeholder="เพิ่มภารกิจใหม่ของคุณ..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="w-full bg-white border-none rounded-[24px] px-8 py-5 pr-20 outline-none shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] focus:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.15)] transition-all text-lg placeholder:text-slate-300"
          />

          <button
            onClick={addTask}
            className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 text-white w-14 rounded-[18px] transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-emerald-200"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-white/70 backdrop-blur-sm border border-white hover:border-emerald-100 rounded-[24px] p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleTask(task.id)}>
                    {task.completed ? (
                      <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                    ) : (
                      <Circle className="text-slate-300 w-5 h-5" />
                    )}
                  </button>

                  <span
                    className={`text-base font-semibold ${
                      task.completed
                        ? "text-slate-300 line-through"
                        : "text-slate-600"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button onClick={() => deleteTask(task.id)}>
                  <Trash2 className="text-red-400" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-16">
              <Zap className="mx-auto text-emerald-100 w-12 h-12 mb-3" />
              <p className="text-slate-300 font-bold">
                ว่างเปล่าเหมือนป่าไม้ที่สมบูรณ์!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}