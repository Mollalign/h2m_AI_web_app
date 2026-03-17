export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  avatar_color: string | null;
  is_active: boolean;
  default_socratic_mode: boolean;
  last_login: string | null;
  auth_provider: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  document_count?: number;
  conversation_count?: number;
  quiz_count?: number;
}

export type DocumentStatus = "pending" | "processing" | "ready" | "failed";
export type FileType = "pdf" | "docx" | "pptx" | "txt";

export interface Document {
  id: string;
  project_id: string;
  filename: string;
  original_filename: string;
  file_type: FileType;
  file_path: string;
  file_size: number;
  status: DocumentStatus;
  error_message: string | null;
  chunk_count: number;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  is_socratic: boolean;
  created_at: string;
  updated_at: string;
  project?: Project;
  message_count?: number;
  last_message?: Message;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface MessageSource {
  document_id: string;
  document_name: string;
  chunk_text: string;
  relevance_score: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources: MessageSource[] | null;
  tokens_used: number | null;
  attachments: string[] | null;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface Topic {
  id: string;
  project_id: string;
  document_id: string | null;
  name: string;
  description: string | null;
  parent_topic_id: string | null;
  source_references: string[] | null;
  is_auto_generated: boolean;
  display_order: number;
  created_at: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  description: string | null;
  learning_objectives: string[] | null;
  source_references: string[] | null;
  is_auto_generated: boolean;
  display_order: number;
  created_at: string;
}

export type KnowledgeStatus = "not_started" | "learning" | "reviewing" | "mastered";

export interface KnowledgeState {
  id: string;
  user_id: string;
  project_id: string;
  topic_id: string;
  subtopic_id: string | null;
  mastery_score: number;
  status: KnowledgeStatus;
  correct_count: number;
  total_attempts: number;
  misconceptions: string[] | null;
  last_reviewed: string | null;
  topic?: Topic;
  subtopic?: Subtopic;
}

export type QuestionType = "multiple_choice" | "true_false" | "code_output";
export type Difficulty = "easy" | "medium" | "hard";

export interface Quiz {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  time_limit_minutes: number | null;
  passing_score: number;
  topic_ids: string[] | null;
  question_count: number;
  total_points: number;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  subtopic_id: string | null;
  question_type: QuestionType;
  question_text: string;
  code_snippet: string | null;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string | null;
  points: number;
  display_order: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds: number | null;
  started_at: string;
  completed_at: string | null;
  responses?: QuizResponse[];
  quiz?: Quiz;
}

export interface QuizResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  points_earned: number;
  time_spent_seconds: number | null;
  question?: QuizQuestion;
}

export interface SharedConversation {
  id: string;
  conversation_id: string;
  shared_by_user_id: string;
  share_token: string;
  title: string;
  share_type: "public" | "private";
  allow_replies: boolean;
  is_active: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  conversation?: ConversationDetail;
  shared_by?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  study_reminders_enabled: boolean;
  reminder_time: string | null;
  quiz_results_enabled: boolean;
}

export interface ProgressStats {
  total_projects: number;
  total_conversations: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
  total_messages: number;
  study_streak: number;
  topics_mastered: number;
  total_topics: number;
}

export interface StudyPlan {
  project_id: string;
  project_name: string;
  plan: string;
  topics: string[];
  estimated_hours: number;
}

export interface ExamReadiness {
  project_id: string;
  readiness_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
}
