variable "namespace" {
  description = "Kubernetes namespace for the To-do List application."
  type        = string
  default     = "todo-list"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "dev"
}

variable "kubeconfig_path" {
  description = "Path to kubeconfig used by Terraform."
  type        = string
  default     = "~/.kube/config"
}
