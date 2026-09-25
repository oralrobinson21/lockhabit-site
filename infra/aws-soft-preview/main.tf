data "aws_caller_identity" "current" {}

locals {
  name_prefix       = var.project_name
  forbidden_domains = ["lockhabit.com", "www.lockhabit.com"]
}

resource "aws_ecr_repository" "soft" {
  name                 = local.name_prefix
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "soft" {
  repository = aws_ecr_repository.soft.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 Soft images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

data "aws_iam_policy_document" "apprunner_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["build.apprunner.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apprunner_ecr" {
  name               = "${local.name_prefix}-apprunner-ecr"
  assume_role_policy = data.aws_iam_policy_document.apprunner_assume.json
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr" {
  role       = aws_iam_role.apprunner_ecr.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_service" "soft" {
  service_name = local.name_prefix

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr.arn
    }

    auto_deployments_enabled = false

    image_repository {
      image_identifier      = "${aws_ecr_repository.soft.repository_url}:${var.image_tag}"
      image_repository_type = "ECR"

      image_configuration {
        port                          = tostring(var.container_port)
        runtime_environment_variables = var.soft_runtime_env
      }
    }
  }

  instance_configuration {
    cpu    = var.cpu
    memory = var.memory
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    SoftPreviewUrlOnly = "true"
  }

  lifecycle {
    ignore_changes = [
      source_configuration[0].image_repository[0].image_configuration[0].runtime_environment_variables,
    ]
  }
}

resource "aws_cloudfront_distribution" "soft" {
  count = var.enable_cloudfront_soft ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "LockHabit Soft preview ONLY — no custom domain"
  default_root_object = ""
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_apprunner_service.soft.service_url
    origin_id   = "apprunner-soft"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "apprunner-soft"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # AWS managed: CachingDisabled + AllViewer
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    SoftHoldDns = "true"
  }
}
