export type Role = 'resident' | 'institution' | 'admin';
export type Trust = 'Official source' | 'Source reported' | 'Community report' | 'Editorial' | 'Demo data' | 'Under review' | 'Sponsored' | 'Corrected' | 'Archived';
export type ProjectStatus = 'Proposed' | 'Planned' | 'Procurement' | 'In progress' | 'Completed' | 'Delayed' | 'Suspended' | 'Ready for handover' | 'Reported activity';
export const caseStatuses = ['Received', 'Under review', 'Verified', 'Referred', 'Action in progress', 'Resolved', 'Closed', 'Unable to verify'] as const;
export type CaseStatus = typeof caseStatuses[number];
export type ResourceKind = 'projects' | 'opportunities' | 'businesses' | 'schools' | 'events' | 'organizations' | 'marketplace' | 'talent' | 'news' | 'public-participation' | 'commitments' | 'alerts';
export interface Source { name: string; url?: string }
export interface MediaAsset { src: string; alt: string; caption?: string }
export interface Resource {
  kind: ResourceKind; slug: string; title: string; summary: string; ward?: string; category: string;
  trust: Trust; source: Source; date?: string; deadline?: string; location?: string; organization?: string;
  status?: string; image?: MediaAsset; gallery?: MediaAsset[]; details?: { heading: string; text: string }[];
  price?: number; href?: string; keywords?: string[];
}
export interface Project extends Resource {
  kind: 'projects'; status: ProjectStatus; progress?: number; funding?: string; spent?: number; financialYear?: string; estimatedCost?: number;
}
export type School = Resource & { kind: 'schools' };
export type Opportunity = Resource & { kind: 'opportunities' };
export type Business = Resource & { kind: 'businesses' };
export type Organization = Resource & { kind: 'organizations' };
export type MarketplaceListing = Resource & { kind: 'marketplace' };
export type Event = Resource & { kind: 'events' };
export type Article = Resource & { kind: 'news' };
export type TalentProfile = Resource & { kind: 'talent' };
export type Commitment = Resource & { kind: 'commitments' };
export type Alert = Resource & { kind: 'alerts' };
export interface CaseUpdate { status: CaseStatus; date: string; response: string }
export interface CivicCase {
  reference: string; category: string; ward: string; location: string; description: string;
  createdAt: string; status: CaseStatus; updates: CaseUpdate[]; staff?: string; priority?: string;
  notes?: string; attachmentCount: number;
}
export type CampaignStatus = 'Draft' | 'Awaiting approval' | 'Approved' | 'Scheduled' | 'Cancelled' | 'Rejected';
export interface CampaignAudience { ward: string; interest: string; channels: string[] }
export interface Campaign extends CampaignAudience { id: string; title: string; message: string; status: CampaignStatus; date: string; scheduledFor?: string }
export interface ConsentRecord { analytics: boolean; personalization: boolean; marketing: boolean }
export interface Subscription { channels: string[]; topics: string[]; marketing: boolean }
export interface AuditEvent { id: string; actor: string; action: string; resource: string; date: string; before?: string }
export interface WorkflowItem {
  id: string; title: string; body: string; ward: string; category: string; date: string; status: string;
  details?: Record<string, string>;
}
export interface Notification { id: string; label: string; href: string; date: string }
export interface AgriculturePrice { product: string; market: string; price: number; unit: string; date: string }
