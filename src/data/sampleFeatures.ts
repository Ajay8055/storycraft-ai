import type { FeatureInput } from '../types/storycraft.ts';

export interface SampleFeaturePreset {
  id: string;
  label: string;
  summary: string;
  input: FeatureInput;
}

export const SAMPLE_FEATURES: SampleFeaturePreset[] = [
  {
    id: 'workspace-invite-rbac',
    label: 'Workspace Member Invites & Role Permissions',
    summary: 'B2B team onboarding with email invites, expiration, and Admin/Editor/Viewer roles.',
    input: {
      featureName: 'Workspace Member Invites & Role-Based Permissions',
      featureDescription:
        'Allow workspace Admins to invite teammates via email and assign them an initial role (Admin, Editor, or Viewer). Invited users receive an email link to join the workspace. Admins can view pending invitations, resend an invitation, revoke an invitation before acceptance, or change an existing member role.',
      businessContext:
        'Self-serve B2B SaaS workspaces currently force users to share a single account. Adding multi-user invites and role boundaries is required before launching our Team tier next quarter and reducing support tickets from enterprise trials.',
      userPersona: 'Workspace Admin (IT or Operations Lead) and Invited Team Member (Analyst / Contributor)',
      constraints:
        'Only Admins may send, resend, or revoke invitations. Viewers have read-only access and cannot export billing data. Duplicate active invites to the same email within the same workspace must be prevented.',
    },
  },
  {
    id: 'scheduled-report-export',
    label: 'Scheduled CSV & PDF Digest Exports',
    summary: 'Recurring weekly analytics email exports with pause/resume and failure alerts.',
    input: {
      featureName: 'Scheduled Weekly Report Exports',
      featureDescription:
        'Enable Product Managers to schedule recurring CSV or PDF exports of any saved analytics dashboard. Users pick a delivery cadence (weekly or monthly), day of week, timezone, and up to 10 recipient email addresses. Users can pause, edit, or delete schedules from the Reports panel.',
      businessContext:
        'Stakeholders who do not log into the analytics tool weekly ask PMs to manually screenshot charts every Monday morning. Automated digests improve executive visibility and cut manual reporting time.',
      userPersona: 'Product Manager / Business Operations Analyst',
      constraints:
        'Maximum 10 recipients per schedule. Export file generation should time out cleanly if a query exceeds 30 seconds without sending broken attachments.',
    },
  },
];
