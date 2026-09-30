variable "aws_region" {
  type        = string
  description = "AWS region for Soft static preview. Oral21: us-east-1 only."
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "Oral platform Soft HOLD: us-east-1 only."
  }
}

variable "app" {
  type        = string
  description = "Product tag/name segment: lockhabit | halenor | <site-slug>."
  default     = "halenor"

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
  description = "Optional override. Default: {app}-{env}-static."
  default     = ""
}

variable "extra_tags" {
  type        = map(string)
  description = "Optional extra tags merged into default_tags."
  default     = {}
}
