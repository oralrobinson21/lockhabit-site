output "soft_hold_reminder" {
  description = "Soft HOLD banner for operators."
  value       = "SOFT HOLD: do not point custom domains here; do not delete Railway; do not change Zoho/LockHabit MX. Soft URLs only until Oral GO. Forbidden: ${join(", ", local.forbidden_domains)}"
}

output "name_prefix" {
  description = "Resolved Soft resource name prefix."
  value       = local.name_prefix
}

output "resource_tags" {
  description = "Tags applied via provider default_tags."
  value       = local.resource_tags
}

output "bucket_name" {
  description = "Soft S3 bucket for static sync."
  value       = aws_s3_bucket.soft.bucket
}

output "cloudfront_soft_url" {
  description = "CloudFront Soft URL (*.cloudfront.net)."
  value       = "https://${aws_cloudfront_distribution.soft.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "Soft distribution id for invalidations."
  value       = aws_cloudfront_distribution.soft.id
}

output "forbidden_custom_domains" {
  description = "Domains that must not be attached until Oral GO."
  value       = local.forbidden_domains
}

output "aws_account_id" {
  description = "Account Soft resources were applied into."
  value       = data.aws_caller_identity.current.account_id
}

output "expected_account_id" {
  description = "Oral21 account this Soft stack is intended for."
  value       = "021067821343"
}
