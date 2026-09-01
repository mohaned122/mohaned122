import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink],
  templateUrl: './article-detail.html',
})
export class ArticleDetail {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private seo = inject(SeoService);
  article = signal<Article | null>(null);
  loading = signal(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleService.getAll().subscribe((articles) => {
        const found = articles.find((a) => a.id === id);
        if (found) {
          this.article.set(found);
          this.seo.setMeta({
            title: `${found.title} — Mohanned Zayoud`,
            description: found.content.slice(0, 160),
            url: `/articles/${id}`,
          });
        }
        this.loading.set(false);
      });
    }
  }
}
