terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  title      = "student_tasks_live"
  account_id = var.cloudflare_account_id
}

resource "cloudflare_worker_script" "task_worker" {
  account_id         = var.cloudflare_account_id
  name               = "student-task-manager-worker"
  content            = file("${path.module}/../application/worker.js")
  compatibility_date = "2024-03-01"

  kv_namespace_binding {
    name         = "TASKS_KV"
    namespace_id = cloudflare_workers_kv_namespace.tasks_kv.id
  }
}