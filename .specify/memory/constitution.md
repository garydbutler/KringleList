<!--
SYNC IMPACT REPORT
==================
Version Change: INITIAL → 1.0.0
Modified Principles: N/A (initial constitution)
Added Sections: All sections (initial creation)
Removed Sections: None

Templates Requiring Updates:
✅ .specify/templates/plan-template.md - Reviewed, constitution checks align
✅ .specify/templates/spec-template.md - Reviewed, requirement structure aligns
✅ .specify/templates/tasks-template.md - Reviewed, task organization principles align
⚠ No command files found in .specify/templates/commands/

Follow-up TODOs:
- Database selection needed (see Section 2.4)
- File storage provider needed (see Section 2.4)
- Email service provider needed (see Section 2.4)
- Main git branch should be configured (currently shows empty in git status)
- Create README.md documenting constitution and project setup
-->

# KringleList Constitution
React SaaS Application with Clerk & Vercel

## Core Principles

### I. Component-First Architecture
Every feature starts with well-defined, reusable components following atomic design principles (atoms, molecules, organisms, templates, pages). Components MUST be self-contained, independently testable, and have a single clear purpose. No component may exceed 300 lines. Prop drilling is limited to 2-3 levels maximum; beyond that, context or state management is REQUIRED.

**Rationale**: Enforces modularity, testability, and maintainability. Prevents monolithic components that become impossible to test or reuse.

### II. Type Safety First (NON-NEGOTIABLE)
TypeScript strict mode is MANDATORY. No `any` types without explicit written justification in code comments. All function parameters and return values MUST be properly typed. Branded types MUST be used for IDs and sensitive data. Generics MUST be leveraged for reusable utilities.

**Rationale**: Type safety prevents entire classes of runtime errors, improves developer experience through autocomplete, and serves as living documentation. The cost of any type is technical debt.

### III. Security by Default
All routes requiring authentication MUST be protected via Clerk middleware. No sensitive operations may proceed without verified user sessions. RBAC (Role-Based Access Control) MUST be implemented using Clerk organizations and roles. All user inputs MUST be validated on both client and server using Zod schemas. Sensitive data MUST be encrypted at rest and in transit (HTTPS only). Environment variables MUST be used for all secrets; credentials MUST NEVER be committed to version control.

**Rationale**: Security breaches are catastrophic. Defense in depth with client-server validation, authentication at middleware level, and encrypted data ensures multiple layers of protection.

### IV. Performance Standards
Core Web Vitals targets are NON-NEGOTIABLE: LCP < 2.5s, FID < 100ms, CLS < 0.1, TTFB < 600ms. Initial JavaScript bundle MUST be < 200KB. Code splitting and lazy loading MUST be implemented for routes and heavy components. Images MUST be optimized using Next.js Image or equivalent. Lighthouse scores MUST exceed 90.

**Rationale**: Performance directly impacts user satisfaction, SEO rankings, and conversion rates. These metrics are industry-standard benchmarks for quality user experiences.

### V. Accessibility First (WCAG 2.1 Level AA)
Semantic HTML structure is MANDATORY. All interactive elements MUST have ARIA labels. Keyboard navigation MUST be fully supported. Color contrast ratios MUST meet or exceed 4.5:1 for text. Focus indicators MUST be visible on all interactive elements. Screen reader compatibility MUST be verified. All images MUST have descriptive alt text.

**Rationale**: Accessibility is both a legal requirement (ADA, Section 508) and moral imperative. 15% of the global population has some form of disability. Accessible design benefits all users.

### VI. Test-Driven Quality
Unit tests MUST be written for all utilities and custom hooks using Vitest or Jest. Integration tests MUST cover all API routes. E2E tests MUST validate critical user flows using Playwright or Cypress. Minimum 70% code coverage is REQUIRED for core business logic. Test files MUST be co-located with components (`.test.tsx` or `.spec.tsx`). Tests MUST pass before any PR can be merged.

**Rationale**: Tests are living documentation, catch regressions early, enable confident refactoring, and reduce production bugs.

### VII. Observability & Monitoring
Structured logging in JSON format is MANDATORY. Error boundaries MUST be implemented at route level. All errors MUST be logged to a monitoring service (e.g., Sentry) with sanitized user context. Performance metrics (Core Web Vitals, API response times) MUST be tracked in production via Vercel Analytics. Alerts MUST be configured for critical error rate thresholds and performance degradation.

**Rationale**: You cannot fix what you cannot see. Observability enables rapid incident response, performance optimization, and data-driven decisions.

### VIII. Mobile-First Responsive Design
All interfaces MUST be designed mobile-first. Responsive breakpoints (640px, 768px, 1024px, 1280px, 1536px) MUST be consistently applied using Tailwind's spacing scale. Touch targets MUST be minimum 44x44px. All features MUST be fully functional on mobile devices.

**Rationale**: Over 60% of web traffic is mobile. Mobile-first design ensures core functionality works on constrained devices and progressively enhances on larger screens.

### IX. Code Quality & Consistency
ESLint with React and TypeScript recommended rules is MANDATORY. Prettier MUST be configured for consistent formatting. Husky pre-commit hooks MUST run lint, format, and type-check. Maximum function length is 50 lines. JSDoc comments are REQUIRED for complex functions. Code reviews are MANDATORY before merging.

**Rationale**: Consistency reduces cognitive load, improves collaboration, and catches errors early. Automated tooling enforces standards without manual oversight.

### X. Simplicity & YAGNI
Start simple. Do not implement features until they are needed (YAGNI - You Aren't Gonna Need It). Complexity MUST be justified in writing before implementation. Simpler alternatives MUST be evaluated and documented if rejected. Repository patterns, abstractions, and architectural layers MUST demonstrate clear value over direct implementation.

**Rationale**: Premature optimization and over-engineering create maintenance burden, slow development, and obscure bugs. Simple solutions are easier to understand, test, and modify.

## Technology Standards

### Required Stack
- **Frontend**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Next.js (for React Server Components and optimal Vercel integration)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React Context or Zustand for client state
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Clerk (MFA, social login, email/password, session management, organizations)
- **Deployment**: Vercel (automatic deployments via Git, edge functions, analytics)
- **Database**: TODO(DATABASE): Specify Supabase, PlanetScale, Neon, or other
- **File Storage**: TODO(STORAGE): Specify Vercel Blob, AWS S3, Cloudflare R2, or other
- **API Layer**: REST with standard conventions or tRPC for type-safe APIs
- **Email**: TODO(EMAIL): Specify Resend, SendGrid, AWS SES, or other

### File Structure (MANDATORY)
```
src/
├── app/                    # Next.js app directory
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature-specific components
│   ├── layouts/           # Layout components
│   └── forms/             # Form components
├── lib/
│   ├── api/               # API client and utilities
│   ├── auth/              # Clerk authentication utilities
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── stores/                # State management stores
├── styles/                # Global styles and Tailwind config
├── middleware/            # Clerk middleware and route protection
└── public/                # Static assets
```

### Environment Management
All environment variables MUST be documented in a `.env.example` file. Production secrets MUST be stored in Vercel environment variables. The following environments MUST be maintained:
- **Development**: `.env.local` (never committed)
- **Staging**: Vercel preview deployments
- **Production**: Vercel production environment

Required environment variables:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
NEXT_PUBLIC_API_URL=
```

## Development Workflow

### Git Strategy
- **Branch Naming**: `feature/`, `bugfix/`, `hotfix/`, `release/`
- **Commit Messages**: Conventional Commits format (e.g., `feat:`, `fix:`, `docs:`, `refactor:`)
- **Pull Requests**: Template with checklist REQUIRED; all PRs MUST be reviewed before merging
- **Main Branch**: TODO(MAIN_BRANCH): Configure main/master branch in Git

### Code Review Standards
1. All code MUST be reviewed before merging
2. Reviewers MUST check for security vulnerabilities (XSS, SQL injection, CSRF, etc.)
3. All tests MUST pass and coverage MUST be maintained
4. Documentation MUST be updated if API or behavior changes
5. No `any` types without justification
6. Performance implications MUST be considered for critical paths

### Development Process
1. Create feature branch from `develop` (or main)
2. Implement feature with tests (TDD where applicable)
3. Run `npm run lint`, `npm run type-check`, `npm run test`
4. Submit PR with description, screenshots (for UI changes), and test plan
5. Address all review comments
6. Merge only after approval and passing CI/CD

## Deployment & Release Strategy

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Deployment Workflow
1. **Development**: Push to feature branch → Vercel preview deployment
2. **Staging**: Merge to `develop` → Staging deployment
3. **Production**: Merge to `main` → Production deployment with deployment protection

### Release Process
- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog REQUIRED for each release
- Feature flags for gradual rollouts (where applicable)
- Documented rollback strategy for failed deployments

## Compliance & Privacy

### Data Privacy
- GDPR compliance REQUIRED if serving EU users
- CCPA compliance REQUIRED if serving California users
- Privacy policy and terms of service MUST be clear and accessible
- User data deletion capabilities MUST be implemented

### Data Retention
- Retention policies MUST be defined for each data type
- Automated data cleanup MUST be implemented
- Backup strategy and disaster recovery plan REQUIRED

## Success Metrics

### Technical Metrics (NON-NEGOTIABLE)
- **Uptime**: > 99.9%
- **API Response Time**: < 200ms (p95)
- **Error Rate**: < 0.1%
- **Build Time**: < 5 minutes

### User Experience Metrics
- **Time to Interactive**: < 3 seconds
- **Core Web Vitals**: All green (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Lighthouse Score**: > 90
- **Session Duration**: (track, target varies by feature)
- **Feature Adoption**: (track per feature)

## Governance

### Constitution Authority
This constitution supersedes all other development practices, guidelines, or team preferences. All code reviews, PRs, and architectural decisions MUST verify compliance with these principles.

### Complexity Justification
Any deviation from simplicity MUST be justified in writing. When introducing complexity (additional abstractions, patterns, dependencies), document:
1. What problem does this solve?
2. What simpler alternatives were considered?
3. Why were simpler alternatives rejected?

### Amendment Process
This constitution MUST be reviewed and updated:
- **Quarterly** for minor updates and refinements
- **As needed** when major architectural changes are required
- **As needed** when new technologies are adopted
- **After incidents** based on learnings from production incidents

All amendments require:
1. **Documentation**: Written reasoning for the change
2. **Impact Analysis**: Review of affected code, templates, and workflows
3. **Team Review**: Consensus from development team
4. **Propagation**: Updates to all dependent templates and documentation

### Compliance Review
All pull requests MUST include a constitutional compliance checklist:
- [ ] TypeScript strict mode enabled, no unjustified `any` types
- [ ] Components under 300 lines, functions under 50 lines
- [ ] Accessibility requirements met (ARIA, keyboard nav, contrast)
- [ ] Security validation (input validation, auth checks, no secrets committed)
- [ ] Performance targets met (bundle size, Core Web Vitals)
- [ ] Tests written and passing (unit, integration, or E2E as appropriate)
- [ ] Code review completed
- [ ] Documentation updated

**Version**: 1.0.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01
