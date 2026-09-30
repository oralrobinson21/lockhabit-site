variable "aws_region" {
  type        = string
  description = "AWS region for Soft preview (ECR + App Runner)."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Soft resource name prefix (no prod DNS)."
  default     = "lockhabit-soft"
}

variable "image_tag" {
  type        = string
  description = "ECR image tag App Runner runs for Soft preview."
  default     = "soft"
}

variable "container_port" {
  type        = number
  description = "Nitro node-server listen port."
  default     = 3000
}

variable "cpu" {
  type        = string
  description = "App Runner CPU units (256 = 0.25 vCPU)."
  default     = "256"
}

variable "memory" {
  type        = string
  description = "App Runner memory (MB)."
  default     = "512"
}

variable "enable_cloudfront_soft" {
  type        = bool
  description = "Create Soft *.cloudfront.net in front of App Runner (still no custom domain)."
  default     = true
}

variable "soft_runtime_env" {
  type        = map(string)
  description = "Non-secret Soft runtime env. Secrets are set out-of-band."
  default = {
    NODE_ENV    = "production"
    PORT        = "3000"
    STRIPE_MODE = "test"
  }
}
