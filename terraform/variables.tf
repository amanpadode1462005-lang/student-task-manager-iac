variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token with Workers and KV permissions"
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Your Cloudflare Account ID"
}

variable "worker_name" {
  type        = string
  description = "Name of the Cloudflare Worker"
  default     = "student-task-manager-worker"
}

variable "kv_namespace_name" {
  type        = string
  description = "Name of the Workers KV namespace"
  default     = "student_tasks"
}