# AWS SAA-C03 Prep

A complete revision reference for the **AWS Certified Solutions Architect – Associate (SAA-C03)** exam, organized into logical service groups with exam triggers, memory anchors, comparison tables, and architecture diagrams for every topic.

Each page follows the same structure: a big-picture overview, numbered core concepts, comparison tables where relevant, and callout boxes flagging what the exam actually tests.

[![GitHub Repo stars](https://img.shields.io/github/stars/mubtasimfuad/saa-c03-prep?style=social)](https://github.com/mubtasimfuad/saa-c03-prep)

If these notes help you pass, a :material-star: [star on GitHub](https://github.com/mubtasimfuad/saa-c03-prep) is appreciated — it also helps others studying for SAA-C03 find this.

!!! tip "How to use this site"
    - :material-alert-decagram: **Exam Trigger** boxes flag the exact scenario wording that points to a service/feature.
    - :material-skull-crossbones: **Exam Trap** boxes flag common wrong-answer scenarios.
    - :material-lightbulb-on: **Memory Anchor** boxes are the one-line recall hooks.
    - Use the search bar (top) to jump straight to a service, keyword, or exam trap across all pages.

## Compute & Scaling

<div class="grid cards" markdown>

- :material-server: **[EC2](compute/ec2.md)**
  Instance types, purchasing options, placement groups, metadata.
- :material-harddisk: **[EBS](compute/ebs.md)**
  Volume types, snapshots, encryption, performance.
- :material-scale-balance: **[Load Balancing & Auto Scaling](compute/load-balancing-asg.md)**
  ALB, NLB, GWLB, ASG, sticky sessions, health checks.

</div>

## Networking

<div class="grid cards" markdown>

- :material-lan: **[VPC](networking/vpc.md)**
  Subnets, route tables, NAT, peering, endpoints, Transit Gateway.
- :material-dns: **[Route 53](networking/route53.md)**
  DNS records, routing policies, health checks, failover.
- :material-earth: **[CloudFront & Global Accelerator](networking/cloudfront-global-accelerator.md)**
  CDN caching, OAC/OAI, edge routing.

</div>

## Storage

<div class="grid cards" markdown>

- :material-bucket: **[S3](storage/s3.md)**
  Storage classes, lifecycle, versioning, replication, security.
- :material-folder-network: **[EFS, FSx & Storage Gateway](storage/storage-efs-fsx.md)**
  Shared/networked storage and hybrid storage.

</div>

## Databases

<div class="grid cards" markdown>

- :material-database: **[RDS & Aurora](databases/rds-aurora.md)**
  Multi-AZ, read replicas, Aurora architecture, RDS Proxy.
- :material-database-search: **[DynamoDB & Other Databases](databases/database-dynamodb.md)**
  DynamoDB, ElastiCache, Redshift, DocumentDB, Neptune, and more.

</div>

## Security & Identity

<div class="grid cards" markdown>

- :material-account-key: **[IAM](security/iam.md)**
  Users, roles, policies, federation, STS.
- :material-shield-lock: **[Security Services](security/security.md)**
  KMS, Secrets Manager, WAF/Shield, GuardDuty, security groups vs NACLs.

</div>

## Containers & Serverless

<div class="grid cards" markdown>

- :material-docker: **[ECS, EKS & Kubernetes](containers-serverless/ecs-eks-k8s.md)**
  Fargate vs EC2 launch type, task/service architecture, EKS.
- :material-flash: **[Serverless](containers-serverless/serverless.md)**
  Lambda, API Gateway, Step Functions, event-driven patterns.

</div>

## Messaging & Decoupling

<div class="grid cards" markdown>

- :material-transit-connection-variant: **[SQS & SNS](messaging/decoupling-sqs-sns.md)**
  Queues, topics, fan-out, DLQs, decoupling patterns.

</div>

## Data & Analytics

<div class="grid cards" markdown>

- :material-chart-bar: **[Data & Analytics](data-analytics/data-analytics.md)**
  Kinesis, Glue, Athena, EMR, QuickSight.

</div>

## Resilience

<div class="grid cards" markdown>

- :material-backup-restore: **[Disaster Recovery](resilience/disaster-recovery.md)**
  Backup & restore, pilot light, warm standby, multi-site, RTO/RPO.

</div>

## Exam Practice

<div class="grid cards" markdown>

- :material-lightbulb-group: **[Scenario Walkthroughs](exam-practice/saa-discussion-scenarios.md)**
  End-to-end architecture scenarios that combine services the way the exam does.

</div>
