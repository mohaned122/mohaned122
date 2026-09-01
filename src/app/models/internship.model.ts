export interface Internship {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies: string[];
  projectId?: string;
  companyUrl?: string;
  createdAt: Date;
}
