data "aws_caller_identity" "current" {}

locals {
  name_prefix = var.name_prefix != "" ? var.name_prefix : "${var.app}-${var.env}-static"

  forbidden_domains = [
    "lockhabit.com",
    "www.lockhabit.com",
    "halenor.com",
    "www.halenor.com",
  ]

  resource_tags = merge(
    {
      app         = var.app
      env         = var.env
      SoftSafe    = "true"
      SoftHoldDns = "true"
      ManagedBy   = "terraform"
      Purpose     = "static-preview"
      Project     = local.name_prefix
    },
    var.extra_tags
  )
}

check "soft_hold_no_prod_env_without_notice" {
  assert {
    condition     = var.env != "prod"
    error_message = "Soft preview stack: set env=preview (or test). env=prod is for a future Oral GO cutover stack, not this Soft module as-is."
  }
}

resource "aws_s3_bucket" "soft" {
  bucket        = "${local.name_prefix}-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    SoftPreviewUrlOnly = "true"
  }
}

resource "aws_s3_bucket_public_access_block" "soft" {
  bucket = aws_s3_bucket.soft.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "soft" {
  bucket = aws_s3_bucket.soft.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_cloudfront_origin_access_control" "soft" {
  name                              = "${local.name_prefix}-oac"
  description                       = "Soft static preview OAC — no custom domain"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_iam_policy_document" "soft_bucket" {
  statement {
    sid     = "AllowCloudFrontSoftRead"
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.soft.arn}/*",
    ]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.soft.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "soft" {
  bucket = aws_s3_bucket.soft.id
  policy = data.aws_iam_policy_document.soft_bucket.json
}

resource "aws_cloudfront_distribution" "soft" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.name_prefix} Soft static preview ONLY — no custom domain"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.soft.bucket_regional_domain_name
    origin_id                = "s3-soft"
    origin_access_control_id = aws_cloudfront_origin_access_control.soft.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3-soft"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # AWS managed CachingOptimized
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # Soft SPA-ish fallback: missing paths → index.html (marketing shells)
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  tags = {
    SoftHoldDns        = "true"
    SoftPreviewUrlOnly = "true"
  }
}
