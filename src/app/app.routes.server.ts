import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':datePrefix/admin',
    renderMode: RenderMode.Server,
  },
  {
    path: 'articles',
    renderMode: RenderMode.Server,
  },
  {
    path: 'articles/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'projects/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'gallery',
    renderMode: RenderMode.Server,
  },
  {
    path: 'certificates',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
