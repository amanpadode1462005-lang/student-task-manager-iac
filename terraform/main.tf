# Create the Workers KV Namespace for persistent task storage
resource "cloudflare_workers_kv_namespace" "tasks_kv" {
  account_id = "855f0594f5c5ed3a347f9fae869563d"
  title      = ""student_tasks_live"
}

# Deploy the Cloudflare Worker script and bind it to the KV namespace
resource "cloudflare_worker_script" "task_worker" {
  account_id         = "855f0594f5c5ed3a347f9fae869563d"
  name               = "student_tasks_worker" # Updated from literal "worker_name"
  content            = file("${path.module}/../application/worker.js")
  compatibility_date = "2024-03-01"

  # Use the kv_namespace_binding block directly inside the resource block
  kv_namespace_binding {
    name         = "TASKS_KV"
    namespace_id = cloudflare_workers_kv_namespace.tasks_kv.id
  }
}
