export interface Certificate {
  id?: string;
  title: string;
  issuer: string;
  date?: string;
  image?: string;
  link?: string;
  description?: string;
  createdAt: Date;
}
