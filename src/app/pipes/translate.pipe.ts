import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 't',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private ts = inject(TranslationService);

  transform(key: string): string {
    return this.ts.t(key);
  }
}
