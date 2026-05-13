export function GET() {
  return Response.json({
    status: "ok",
    service: "todo-list",
    timestamp: new Date().toISOString(),
  });
}
