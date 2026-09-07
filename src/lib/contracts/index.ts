/**
 * ⭐ Source of truth for cross-boundary contracts (shared with the frontend).
 *
 * The WebSocket voice protocol (audio_frame, transcript, ai_question, tts_chunk,
 * section_change, state, error, end) and the LLM output Zod schemas will live here
 * and are copied into intervio-frontend/src/lib/contracts via `npm run sync:contracts`.
 *
 * Phase 0 ships only the shared auth/user shape so the frontend has a typed `/me`.
 * These grow in Phases 3–4.
 */

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  authProvider: 'email' | 'google';
}

// ── Phase 1: Upload & Extract ──
export type ParseStatus = 'pending' | 'processing' | 'done' | 'failed';
export type ClaimStatus = 'pending' | 'selected' | 'verified' | 'partial' | 'insufficient';

export interface ProjectItem {
  name: string;
  description: string;
  tech: string[];
}

export interface ExperienceItem {
  company?: string;
  role?: string;
  duration?: string;
  highlights: string[];
}

export interface ExtractedResume {
  skills: string[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  summary?: string;
}

export interface Claim {
  id: string;
  text: string;
  category: string; // scale | impact | ownership | tech-depth | leadership | other
  relatedSkills: string[];
  importance: number; // 1–5
  priority: number; // 1–5
  status: ClaimStatus;
  confidence: number | null;
}

export interface Resume {
  id: string;
  fileName: string;
  parseStatus: ParseStatus;
  parseError: string | null;
  extracted: ExtractedResume | null;
  createdAt: string;
}

export interface ResumeDetail {
  resume: Resume;
  claims: Claim[];
}

export interface JobDescription {
  id: string;
  requiredSkills: string[];
}
