export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read?: boolean;
  createdAt: Date;
}
