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
  origin?: 'personal' | 'professional';
  org?: string;
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

// ── Phase 2: Interview blueprint ──
export type Level = 'junior' | 'mid' | 'senior';
export type Difficulty = 'easy' | 'standard' | 'hard';

export interface PlanSection {
  key: string;
  title: string;
  budgetMin: number;
}

export interface Blueprint {
  id: string;
  resumeId: string;
  jdId: string | null;
  role: string;
  level: Level;
  difficulty: Difficulty;
  durationMin: number;
  /** Interviewer voice (Deepgram model id). */
  voice?: string;
  sections: PlanSection[];
  probeClaimIds: string[];
  createdAt: string;
}

export interface BlueprintWithClaims {
  blueprint: Blueprint;
  probedClaims: Claim[];
}
// ── Phase 3: Live interview ──
export type InterviewStatus = 'planned' | 'live' | 'completed' | 'abandoned';

export interface EvalSnapshot {
  answerQuality: number;
  technicalDepth: number;
  claimEvidence: 'support' | 'partial' | 'none' | 'weaken';
  issue: 'generic' | 'memorized' | 'no_answer' | 'off_topic' | 'none';
  actionSuggested: string;
  reason: string;
}

/** Returned on every turn. `debug` mirrors the engine's reasoning. */
export interface TurnResult {
  interviewId: string;
  turnIdx: number;
  question: string | null;
  done: boolean;
  sectionKey: string;
  debug?: {
    action: string;
    overrode: boolean;
    rationale: string;
    evaluation: EvalSnapshot;
    difficulty: Difficulty;
  };
}

export interface TranscriptTurn {
  idx: number;
  sectionKey: string;
  objective: string;
  question: string;
  answer: string | null;
  chosenAction: string | null;
  askedAt: string;
  /** The scores behind the report — null while an answer is still pending. */
  evaluation: {
    answerQuality: number;
    technicalDepth: number;
    claimEvidence: 'support' | 'partial' | 'none' | 'weaken';
    issue: 'generic' | 'memorized' | 'no_answer' | 'off_topic' | 'none';
  } | null;
}

export interface InterviewTranscript {
  interview: {
    id: string;
    status: InterviewStatus;
    startedAt: string | null;
    endedAt: string | null;
    blueprintId: string;
    role: string;
    level: string;
    durationMin: number;
  };
  turns: TranscriptTurn[];
}

/** One row of the sidebar's interview history. */
export interface InterviewSummary {
  id: string;
  status: InterviewStatus;
  role: string;
  level: string;
  durationMin: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  turnCount: number;
  /** Set once the report exists. */
  verdict: Verdict | null;
  /** Headline claim numbers from the report, when there is one. */
  claims: { claimsSupported: number; claimsProbed: number } | null;
}

// ── Interviewer voice ──
export interface VoiceOption {
  id: string;
  name: string;
  accent: string;
  description: string;
  /** Deepgram-hosted demo clip for the preview button. */
  sampleUrl: string;
}

// ── Report (Phase 5) ──
/** PRD safe language: evidence bands, never accusations. `not_covered` = time ran out. */
export type ClaimBand = 'supported' | 'partial' | 'insufficient' | 'not_covered';
export type Verdict = 'ready' | 'almost' | 'not_ready';

export interface ClaimAuditEntry {
  claimId: string;
  text: string;
  band: ClaimBand;
  confidence: number;
  turnsSpent: number;
  evidence: { turnIdx: number; polarity: 'support' | 'weaken'; rationale: string; quote: string }[];
}

export interface Report {
  interviewId: string;
  role: string;
  level: string;
  /** The interview was ended early, so the report covers only what was asked. */
  partial: boolean;
  narrative: string;
  generatedAt: string;
  stats: {
    answeredTurns: number;
    claimsProbed: number;
    claimsSupported: number;
    claimsNotCovered: number;
  };
  skills: { skill: string; score: number; samples: number }[];
  dimensions: { key: string; label: string; score: number; detail: string }[];
  claimAudit: ClaimAuditEntry[];
  readiness: { verdict: Verdict; reasons: string[]; gaps: string[] };
  improvements: { title: string; detail: string }[];
}
