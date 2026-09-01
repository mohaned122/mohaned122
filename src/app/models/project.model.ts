export interface Project {
  id?: string;
  title: string;
  problem: string;
  solution?: string;
  image?: string;
  gallery?: string[];
  category: string;
  technologies: string[];
  github?: string;
  live?: string;
  downloadLink?: string;
  featured: boolean;
  createdAt: Date;
  features?: string[];
  challenges?: string[];
  outcomes?: string[];
  role?: string;
  duration?: string;
}
