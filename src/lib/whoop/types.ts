/** WHOOP API v2 TypeScript types (subset used by this app) */

export type ScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE";

export type RecoveryRecord = {
  cycle_id: number;
  sleep_id: number | string;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: ScoreState;
  score: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  } | null;
};

export type SleepRecord = {
  id: number | string;
  cycle_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: ScoreState;
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  } | null;
};

export type CycleRecord = {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string | null;
  timezone_offset: string;
  score_state: ScoreState;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  } | null;
};

export type WorkoutRecord = {
  id: number | string;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  sport_name?: string;
  score_state: ScoreState;
  score: {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter?: number;
    altitude_gain_meter?: number;
    altitude_change_meter?: number;
    zone_duration?: Record<string, number>;
  } | null;
};

export type Paginated<T> = {
  records: T[];
  next_token?: string | null;
};

export type UserProfile = {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
};
