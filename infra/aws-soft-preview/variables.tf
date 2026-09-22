variable "aws_region" {
  type        = string
  description = "AWS region for Soft preview (ECR + App Runner). Oral21: us-east-1 only."
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "Oral platform Soft HOLD: us-east-1 only."
  }
}

variable "app" {
  type        = string
  description = "Product tag/name segment: lockhabit | halenor | <site-slug>."
  default     = "lockhabit"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,24}$", var.app))
    error_message = "app must be lowercase slug (e.g. lockhabit, halenor, booker)."
  }
}

variable "env" {
  type        = string
  description = "Environment tag. Soft preview stacks use preview."
  default     = "preview"

  validation {
    condition     = contains(["preview", "test", "prod"], var.env)
    error_message = "env must be preview, test, or prod."
  }
}

variable "name_prefix" {
  type        = string
  description = "Optional override. Default: {app}-{env}-web."
  default     = ""
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

variable "extra_tags" {
  type        = map(string)
  description = "Optional extra tags merged into default_tags."
  default     = {}
}
