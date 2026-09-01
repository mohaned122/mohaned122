import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  template: `
    @switch (variant) {
      @case ('row') {
        <div class="flex items-start gap-4 animate-pulse">
          <div class="w-10 h-10 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-3/4 rounded bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
            <div class="h-3 w-1/2 rounded bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
          </div>
        </div>
      }
      @default {
        <div class="glass-card rounded-2xl overflow-hidden animate-pulse">
          <div class="h-48 bg-[var(--bg-card-hover)] border-b border-[var(--border)]"></div>
          <div class="p-5 space-y-3">
            <div class="h-3 w-16 rounded bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
            <div class="h-5 w-3/4 rounded bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
            <div class="h-3 w-full rounded bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
            <div class="h-3 w-2/3 rounded bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
            <div class="flex gap-2 pt-2">
              @for (_ of [0, 1, 2]; track _) {
                <div class="h-6 w-16 rounded-lg bg-[var(--bg-card-hover)] border border-[var(--border)]"></div>
              }
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class Skeleton {
  @Input() variant: 'card' | 'row' = 'card';
}
