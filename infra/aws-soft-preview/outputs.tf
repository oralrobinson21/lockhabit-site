output "soft_hold_reminder" {
  description = "Soft HOLD banner for operators."
  value       = "SOFT HOLD: do not point lockhabit.com / www DNS here; do not delete Railway; do not change MX. Soft URLs only until Oral GO."
}

output "ecr_repository_url" {
  description = "Soft ECR repository URL for docker push."
  value       = aws_ecr_repository.soft.repository_url
}

output "apprunner_soft_url" {
  description = "App Runner Soft URL."
  value       = "https://${aws_apprunner_service.soft.service_url}"
}

output "cloudfront_soft_url" {
  description = "Optional CloudFront Soft URL."
  value       = var.enable_cloudfront_soft ? "https://${aws_cloudfront_distribution.soft[0].domain_name}" : null
}

output "forbidden_custom_domains" {
  description = "Domains that must not be attached until Oral GO."
  value       = local.forbidden_domains
}

output "aws_account_id" {
  description = "Account Soft resources were applied into."
  value       = data.aws_caller_identity.current.account_id
}
