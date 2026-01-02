export type Course = {
  id: string;
  name: string;
  description: string;
  level: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
};

export type Enrollment = {
  studentId: string;
  courseId: string;
  progress: number;
  grade: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export const courses: Course[] = [
  { id: 'C001', name: 'Unit One: The Basics', description: 'Fundamentals of English language for beginners.', level: 'A1' },
  { id: 'C002', name: 'Intermediate Grammar', description: 'Deep dive into complex grammar rules.', level: 'B1' },
  { id: 'C003', name: 'Advanced Conversation', description: 'Practice conversational skills on various topics.', level: 'C1' },
  { id: 'C004', name: 'Business English', description: 'English for professional communication in a business context.', level: 'B2' },
  { id: 'C005', name: 'IELTS Preparation', description: 'Prepare for the International English Language Testing System exam.', level: 'B2-C1' },
];

export const students: Student[] = [
  { id: 'S001', name: 'Aisha Ndayizeye', email: 'a.ndayizeye@example.com' },
  { id: 'S002', name: 'Ben Irakoze', email: 'b.irakoze@example.com' },
  { id: 'S003', name: 'Carine Keza', email: 'c.keza@example.com' },
  { id: 'S004', name: 'David Mugisha', email: 'd.mugisha@example.com' },
  { id: 'S005', name: 'Eliane Uwineza', email: 'e.uwineza@example.com' },
];

export const enrollments: Enrollment[] = [
  { studentId: 'S001', courseId: 'C001', progress: 85, grade: 'A-' },
  { studentId: 'S001', courseId: 'C002', progress: 60, grade: 'B' },
  { studentId: 'S002', courseId: 'C001', progress: 100, grade: 'A+' },
  { studentId: 'S002', courseId: 'C003', progress: 45, grade: 'C+' },
  { studentId: 'S003', courseId: 'C004', progress: 75, grade: 'B+' },
  { studentId: 'S004', courseId: 'C005', progress: 90, grade: 'A' },
  { studentId: 'S005', courseId: 'C002', progress: 55, grade: 'B-' },
];

export const announcements: Announcement[] = [
  { id: 'A001', title: 'Welcome to the New Semester!', content: 'We are excited to start a new semester. Please check your course schedules and materials.', date: '2024-09-01' },
  { id: 'A002', title: 'Holiday Closure', content: 'The center will be closed for public holidays from December 24th to January 2nd.', date: '2024-08-28' },
  { id: 'A003', title: 'New Conversation Club', content: 'Join our new conversation club every Friday at 4 PM to practice your speaking skills.', date: '2024-08-25' },
];
