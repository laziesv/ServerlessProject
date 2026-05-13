export const dynamic = "force-dynamic";

export function GET() {
  const now = Date.now();
  const body = [
    "# HELP todo_app_info Static application information.",
    "# TYPE todo_app_info gauge",
    'todo_app_info{name="todo-list",framework="nextjs"} 1',
    "# HELP http_requests_total Example HTTP request counter for Prometheus demo.",
    "# TYPE http_requests_total counter",
    'http_requests_total{method="GET",route="/",status="200"} 42',
    'http_requests_total{method="GET",route="/metrics",status="200"} 7',
    "# HELP todo_app_uptime_seconds Current app uptime placeholder for demo monitoring.",
    "# TYPE todo_app_uptime_seconds gauge",
    `todo_app_uptime_seconds ${Math.floor(now / 1000)}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  });
}
