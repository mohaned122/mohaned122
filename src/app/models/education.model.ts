export interface Education {
  id?: string;
  title: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
  grade?: string;
  createdAt: Date;
}
