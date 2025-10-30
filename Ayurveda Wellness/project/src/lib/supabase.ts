import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  height?: number;
  weight?: number;
  medical_conditions?: string;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

export interface PrakritiQuestion {
  id: string;
  category: 'physical' | 'mental' | 'behavioral';
  question: string;
  vata_option: string;
  pitta_option: string;
  kapha_option: string;
  order_number: number;
}

export interface PrakritiResult {
  id: string;
  user_id: string;
  vata_score: number;
  pitta_score: number;
  kapha_score: number;
  dominant_dosha: string;
  secondary_dosha?: string;
  quiz_answers: Record<string, string>;
  completed_at: string;
}

export interface DietRecommendation {
  id: string;
  user_id: string;
  dosha_type: string;
  foods_to_favor: string[];
  foods_to_avoid: string[];
  meal_suggestions: Record<string, string[]>;
  lifestyle_tips: string[];
  created_at: string;
}

export interface DailySchedule {
  id: string;
  user_id: string;
  wake_time?: string;
  morning_routine: string[];
  meal_times: Record<string, string>;
  exercise_schedule: string[];
  meditation_times: string[];
  sleep_time?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  user_id: string;
  follow_up_date: string;
  status: 'pending' | 'completed' | 'missed';
  feedback?: string;
  progress_notes?: string;
  reminder_sent: boolean;
  created_at: string;
  completed_at?: string;
}
