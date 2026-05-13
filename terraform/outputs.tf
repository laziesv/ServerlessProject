output "namespace" {
  description = "Namespace created for the application."
  value       = kubernetes_namespace.todo.metadata[0].name
}
