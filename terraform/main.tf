terraform {
  required_version = ">= 1.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.33"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

resource "kubernetes_namespace" "todo" {
  metadata {
    name = var.namespace

    labels = {
      app         = "todo-list"
      managed_by  = "terraform"
      environment = var.environment
    }
  }
}
