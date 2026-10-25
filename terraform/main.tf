# Create the Workers KV Namespace for persistent task storage
resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = var.cloudflare_account_id
  title      = var.kv_namespace_name
}

# Deploy the Cloudflare Worker script as a module and bind it to the KV namespace
resource "cloudflare_worker_script" "task_worker" {
  account_id = var.cloudflare_account_id
  name       = var.worker_name
  content    = file("${path.module}/../application/worker.js")
  module     = true
  compatibility_date = "2024-03-01"

  # Bind the KV namespace so the Worker code can use TASKS_KV
  kv_namespace_binding {
    name         = "TASKS_KV"
    namespace_id = cloudflare_workers_kv_namespace.tasks_kv.id
  }
}