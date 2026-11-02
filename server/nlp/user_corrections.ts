/**
 * User Corrections Store & Active Exemplar Memory
 * Stores reviewed token corrections with sentence context and integrates them directly
 * into the runtime NLP engine as highest-priority verified exemplars (Confidence = 1.0).
 * Persists corrections to disk so that continuous active learning survives server restarts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LanguageClass, UserCorrection } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSISTENT_FILE_PATH = path.resolve(__dirname, '../../user_corrections.json');

// In-memory cache of verified user corrections
let userCorrectionsMemory: UserCorrection[] = [];

// Load initial corrections from disk if available
function loadFromDisk(): void {
  try {
    if (fs.existsSync(PERSISTENT_FILE_PATH)) {
      const data = fs.readFileSync(PERSISTENT_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        userCorrectionsMemory = parsed;
        return;
      }
    }
  } catch (err) {
    console.warn('Failed to load user_corrections.json from disk, starting empty:', err);
  }
  userCorrectionsMemory = [];
}

// Persist current memory to disk
function saveToDisk(): void {
  try {
    fs.writeFileSync(PERSISTENT_FILE_PATH, JSON.stringify(userCorrectionsMemory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save user_corrections.json to disk:', err);
  }
}

// Initialize on module load
loadFromDisk();

/**
 * Adds or updates a user-reviewed correction with confidence 1.0
 */
export function addUserCorrection(correction: Omit<UserCorrection, 'id' | 'timestamp'>): UserCorrection {
  const existingIdx = userCorrectionsMemory.findIndex(
    (c) => c.surface.toLowerCase() === correction.surface.toLowerCase() &&
           c.sentenceContext === correction.sentenceContext
  );

  const entry: UserCorrection = {
    ...correction,
    id: `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };

  if (existingIdx >= 0) {
    userCorrectionsMemory[existingIdx] = entry;
  } else {
    userCorrectionsMemory.unshift(entry);
  }

  saveToDisk();
  return entry;
}

/**
 * Retrieves all stored user corrections
 */
export function getUserCorrections(): UserCorrection[] {
  return [...userCorrectionsMemory];
}

/**
 * Queries the active user correction memory for a matching token
 * First tries exact sentence context match, then falls back to global surface match
 */
export function matchUserCorrection(
  surface: string,
  sentenceContext?: string
): UserCorrection | null {
  const lower = surface.toLowerCase().trim();

  // 1. Exact context match
  if (sentenceContext) {
    const contextMatch = userCorrectionsMemory.find(
      (c) => c.surface.toLowerCase() === lower && c.sentenceContext === sentenceContext
    );
    if (contextMatch) return contextMatch;
  }

  // 2. Global surface match
  const surfaceMatch = userCorrectionsMemory.find(
    (c) => c.surface.toLowerCase() === lower
  );
  return surfaceMatch || null;
}

/**
 * Deletes a specific user correction by ID
 */
export function removeUserCorrection(id: string): boolean {
  const initialLen = userCorrectionsMemory.length;
  userCorrectionsMemory = userCorrectionsMemory.filter((c) => c.id !== id);
  if (userCorrectionsMemory.length < initialLen) {
    saveToDisk();
    return true;
  }
  return false;
}

/**
 * Resets user corrections store
 */
export function clearUserCorrections(): void {
  userCorrectionsMemory = [];
  saveToDisk();
}
