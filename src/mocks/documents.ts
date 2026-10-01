import { Document } from '../types';

export const mockDocuments: Document[] = [
  {
    id: 'doc-cv-master',
    title: 'Master Technical Resume — Sriram Sugavanam',
    type: 'Master CV',
    version: 'v4.2',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-28',
    content: `# Sriram Sugavanam
**Senior DevOps Engineer** | Chennai, India (Relocating to Germany)
Email: sriramsugavanams@gmail.com | English (Fluent) | German (A1)

## Executive Summary
Results-driven Senior DevOps & Platform Engineer with 8 years of hands-on expertise architecting, scaling, and automating enterprise-grade AWS infrastructure and Kubernetes clusters. Deep background in GitOps, Terraform IaC, container security, and high-uptime site reliability engineering.

## Core Technical Competencies
- **Cloud & Orchestration:** AWS (EKS, VPC, Transit Gateway, IAM, S3, RDS), Kubernetes (v1.28+, k0s, Multi-tenant)
- **Infrastructure as Code:** Terraform, OpenTofu, CloudFormation, Terragrunt
- **GitOps & CI/CD:** ArgoCD, Flux, Helm v3, GitHub Actions, GitLab CI
- **Observability:** Prometheus, Grafana, Thanos, Alertmanager, Jaeger, Datadog
- **Security & Networking:** HashiCorp Vault, SOPS, Trivy, Traefik Gateway API, Cilium CNI
- **Languages:** Python, Bash, YAML, Go (Fundamentals)

## Professional Experience
### Senior DevOps Engineer | Enterprise Cloud Platform
*2021 – Present*
- Spearheaded Kubernetes platform modernization, scaling cluster footprint to 150+ microservices across 3 AWS regions with 99.95% availability SLO.
- Migrated legacy deployment pipelines to declarative GitOps using ArgoCD and Helm, enabling 18+ zero-downtime production deployments daily.
- Implemented automated infrastructure provisioning via modular Terraform suites, reducing developer environment lead time from 3 days to 45 minutes.
- Designed comprehensive Prometheus/Grafana monitoring dashboards and alert routing, reducing Mean Time to Resolution (MTTR) by 45%.
- Mentored a squad of 4 DevOps engineers and authored infrastructure RFC standards for the platform guild.

### Cloud DevOps Engineer | Infrastructure Services
*2018 – 2021*
- Built automated AWS multi-account governance architectures using AWS Organizations and IAM least-privilege boundary policies.
- Automated Docker container security scans and dependency vulnerability checks in CI/CD pipelines using Trivy and Clair.
- Administered Linux production server fleet, automated patching routines with Ansible, and maintained zero-loss database backup automation.`,
    tags: ['Master', 'Full CV', 'AWS', 'Kubernetes'],
    sourceEvidenceReferences: [
      {
        evidenceId: 'ev-10',
        claim: '8 years AWS & multi-tenant Kubernetes with 99.95% SLO track record',
        source: 'Verified Work History & Production Metrics',
      },
      {
        evidenceId: 'ev-candidate-degree',
        claim: 'Bachelor of Engineering in CS recognized on Anabin (H+ status)',
        source: 'ZAB Anabin Database',
      },
    ],
  },
  {
    id: 'doc-cv-platform-lead',
    title: 'Tailored CV — Lead Platform Engineer (Zalando / Personio)',
    type: 'CV Variant',
    linkedJobId: 'job-zalando-01',
    linkedJobTitle: 'Lead Platform Engineer',
    linkedCompany: 'Zalando SE',
    version: 'v2.1',
    createdAt: '2026-09-28',
    updatedAt: '2026-09-29',
    content: `Tailored emphasis on Platform Engineering, Internal Developer Platforms (IDP), Developer Experience (DevEx), and technical mentorship for Zalando SE...`,
    tags: ['Tailored', 'Platform Lead', 'Zalando', 'ArgoCD'],
    sourceEvidenceReferences: [
      {
        evidenceId: 'ce-01',
        claim: 'Reduced developer provisioning time by 60% with modular Terraform',
        source: 'Candidate GitOps Project Record',
      },
      {
        evidenceId: 'ce-03',
        claim: 'Mentored squad of 4 engineers and founded DevOps platform RFC guild',
        source: 'Candidate Leadership Record',
      },
      {
        evidenceId: 'ev-01',
        claim: 'Zalando relocation package & visa assistance verified in careers portal',
        source: 'Zalando Tech Careers Portal',
      },
    ],
  },
  {
    id: 'doc-cv-sre-n26',
    title: 'Tailored CV — Senior SRE (N26 FinTech Focus)',
    type: 'CV Variant',
    linkedJobId: 'job-n26-01',
    linkedJobTitle: 'Senior SRE / Site Reliability Engineer',
    linkedCompany: 'N26',
    version: 'v1.4',
    createdAt: '2026-09-12',
    updatedAt: '2026-09-14',
    content: `Tailored emphasis on 99.99% availability, error budgets, HashiCorp Vault security, and BaFin/ISO 27001 regulatory compliance for N26...`,
    tags: ['Tailored', 'SRE', 'FinTech', 'N26', 'Vault'],
    sourceEvidenceReferences: [
      {
        evidenceId: 'ev-04',
        claim: 'Compensated on-call rotation and SLO error-budget governance',
        source: 'N26 Job Specification',
      },
      {
        evidenceId: 'ev-10',
        claim: 'Maintained 150+ microservices on multi-tenant EKS',
        source: 'Production SLO Records',
      },
    ],
  },
  {
    id: 'doc-cl-zalando',
    title: 'Cover Letter — Zalando SE (Lead Platform Engineer)',
    type: 'Cover Letter',
    linkedJobId: 'job-zalando-01',
    linkedJobTitle: 'Lead Platform Engineer',
    linkedCompany: 'Zalando SE',
    version: 'v1.0',
    createdAt: '2026-09-28',
    updatedAt: '2026-09-30',
    content: `Formal cover letter highlighting developer platform leadership, GitOps at scale, and EU Blue Card skilled worker relocation intent...`,
    tags: ['Cover Letter', 'Zalando', 'Berlin'],
    sourceEvidenceReferences: [
      {
        evidenceId: 'ev-10',
        claim: '8 years AWS & multi-tenant Kubernetes with 99.95% SLO track record',
        source: 'Verified Work History & Production Metrics',
      },
      {
        evidenceId: 'ev-01',
        claim: 'Visa sponsorship & relocation support verified in portal',
        source: 'Zalando Careers Portal',
      },
    ],
  },
  {
    id: 'doc-qa-germany',
    title: 'Standard German Recruitment Q&A Responses',
    type: 'Application Answers',
    version: 'v3.0',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-25',
    content: `Verified answers for work authorization, notice period, salary benchmarks, and German language learning milestones...`,
    tags: ['Q&A', 'Work Authorization', 'Immigration', 'Blue Card'],
    sourceEvidenceReferences: [
      {
        evidenceId: 'ev-candidate-degree',
        claim: 'Bachelor of Engineering in CS recognized on Anabin (H+ status)',
        source: 'ZAB Anabin Database',
      },
      {
        evidenceId: 'ev-10',
        claim: '8 years continuous production experience',
        source: 'Work Verification Record',
      },
    ],
  },
];

