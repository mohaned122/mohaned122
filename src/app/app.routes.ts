import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/about/about').then((c) => c.About),
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects').then((c) => c.Projects),
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./pages/project-detail/project-detail').then((c) => c.ProjectDetail),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((c) => c.Contact),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery').then((c) => c.default),
  },
  {
    path: 'certificates',
    loadComponent: () => import('./pages/certificates/certificates').then((c) => c.default),
  },
  {
    path: 'articles',
    loadComponent: () => import('./pages/articles/articles').then((c) => c.Articles),
  },
  {
    path: 'articles/:id',
    loadComponent: () => import('./pages/article-detail/article-detail').then((c) => c.ArticleDetail),
  },
  {
    path: 'internships',
    loadComponent: () => import('./pages/internships/internships').then((c) => c.Internships),
  },
  {
    path: ':datePrefix/admin',
    loadComponent: () => import('./pages/admin/admin').then((c) => c.Admin),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
