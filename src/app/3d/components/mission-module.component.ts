import { Component, Input } from '@angular/core';

/** Accessible HTML counterpart for a mission module rendered in the 3D environment. */
@Component({
  selector: 'app-mission-module',
  standalone: true,
  template: `
    <article class="mission-module" [attr.aria-label]="missionTitle">
      <span class="mission-module__index">{{ index }}</span>
      <h3>{{ missionTitle }}</h3>
      <p>{{ missionDescription }}</p>
    </article>
  `,
  styles: [`
    .mission-module { border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent); background: color-mix(in srgb, var(--bg-primary) 76%, transparent); backdrop-filter: blur(12px); border-radius: 1rem; padding: 1rem; }
    .mission-module__index { color: var(--primary); font-size: .7rem; letter-spacing: .12em; }
    h3 { margin: .4rem 0; font-weight: 650; } p { margin: 0; color: var(--text-muted); font-size: .82rem; line-height: 1.45; }
  `],
})
export class MissionModuleComponent {
  @Input() index = '';
  @Input() missionTitle = '';
  @Input() missionDescription = '';
}
