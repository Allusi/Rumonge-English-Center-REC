
import type { Timestamp } from "firebase/firestore";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
};

export type Course = {
  id: string;
  name: string;
  description: string;
  level: string;
  isEnabled: boolean;
  lessons?: Lesson[];
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'inactive';
  photoURL?: string;
  createdAt: Timestamp;
  // Student-specific fields (optional)
  loginKey?: string;
  age?: number;
  address?: string;
  enrolledCourseId?: string;
  englishLevel?: string;
  phoneNumber?: string;
  maritalStatus?: 'single' | 'married';
  educationalStatus?: 'government_student' | 'dropout' | 'graduated' | 'never_went_to_school';
  learningReason?: string;
};


export type Enrollment = {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  enrolledAt: Timestamp;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  readCount?: number;
};

export type Assignment = {
    id: string;
    title: string;
    instructions: string;
    courseId: string;
    courseName: string;
    createdAt: Timestamp;
    status: 'draft' | 'published';
    maxMarks: number;
};

export type AssignmentSubmission = {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    studentId: string;
    studentName: string;
    courseId: string;
    courseName: string;
    answers: string;
    submittedAt: Timestamp;
    status: 'submitted' | 'graded';
    feedback?: string;
    marks?: number;
};

export type Attendance = {
    id: string;
    studentId: string;
    studentName: string;
    date: string; // YYYY-MM-DD
    status: 'present' | 'absent';
    reason?: string;
    markedAt: Timestamp;
};

export type SchoolSettings = {
    id: 'school'; // Singleton document
    activeDays: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
};

export type AITutorSession = {
    id: string;
    studentId: string;
    studentName: string;
    createdAt: Timestamp;
    lastActivity: Timestamp;
    history: {
        role: 'user' | 'model';
        content: string;
    }[];
};

export type ForumTopic = {
    id: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    createdById: string;
    createdByName: string;
    createdByPhotoURL?: string;
    lastActivity: Timestamp;
    replyCount: number;
    isPinned: boolean;
    isLocked: boolean;
};

export type ForumPost = {
    id: string;
    topicId: string;
    content: string;
    createdAt: Timestamp;
    createdById: string;
    createdByName: string;
    createdByPhotoURL?: string;
};

export type ChatMessage = {
    id: string;
    content: string;
    createdAt: Timestamp;
    createdById: string;
    createdByName: string;
    createdByPhotoURL?: string;
};

export type Notification = {
    id: string;
    userId: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: Timestamp;
};

export type EnrollmentRequest = {
    id: string;
    fullName: string;
    age: number;
    address: string;
    enrolledCourseId: string;
    courseName: string;
    englishLevel: string;
    phoneNumber?: string;
    maritalStatus: 'single' | 'married';
    educationalStatus: 'government_student' | 'dropout' | 'graduated' | 'never_went_to_school';
    learningReason: string;
    requestDate: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
};

export type CompletedLesson = {
    id: string; // This will be the lessonId from the path
    completedAt: Timestamp;
    courseId: string;
};

export type LessonActivity = {
    id: string;
    userId: string;
    userName: string;
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    status: 'watching' | 'completed';
    startedAt: Timestamp;
    completedAt?: Timestamp;
};


// Data is now fetched from Firestore. This can be kept for fallback or removed.
export const courses: Omit<Course, 'id'>[] = [
  { name: 'Unit One: The Basics', description: 'Fundamentals of English language for beginners.', level: 'A1', isEnabled: false },
  { name: 'Intermediate Grammar', description: 'Deep dive into complex grammar rules.', level: 'B1', isEnabled: false },
  { name: 'Advanced Conversation', description: 'Practice conversational skills on various topics.', level: 'C1', isEnabled: false },
  { name: 'Business English', description: 'English for professional communication in a business context.', level: 'B2', isEnabled: false },
  { name: 'IELTS Preparation', description: 'Prepare for the International English Language Testing System exam.', level: 'B2-C1', isEnabled: false },
];

export const announcements: Announcement[] = [
  { id: 'A001', title: 'Welcome to the New Semester!', content: 'We are excited to start a new semester. Please check your course schedules and materials.', date: '2024-09-01' },
  { id: 'A002', title: 'Holiday Closure', content: 'The center will be closed for public holidays from December 24th to January 2nd.', date: '2024-08-28' },
  { id: 'A003', title: 'New Conversation Club', content: 'Join our new conversation club every Friday at 4 PM to practice your speaking skills.', date: '2024-08-25' },
];
