import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

let uniqueId = 0;

@Component({
  selector: 'zep-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-text.html',
  styleUrl: './input-text.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'zep-input-text',
    '[class.zep-input-text--invalid]': 'invalid()',
    '[class.zep-input-text--disabled]': 'disabled()',
  },
})
export class InputText {
  /** Valeur bindée (two-way via `[(value)]`). */
  readonly value = model<string>('');

  /** Label affiché au-dessus de l'input. */
  readonly label = input<string>('');

  /** Placeholder. */
  readonly placeholder = input<string>('');

  /** Type HTML (text, email, password, etc.). */
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'url'>('text');

  /** Désactive le champ. */
  readonly disabled = input<boolean>(false);

  /** Marque le champ en erreur. */
  readonly invalid = input<boolean>(false);

  /** Message d'aide affiché sous l'input. */
  readonly hint = input<string>('');

  /** Message d'erreur (affiché si `invalid=true`). */
  readonly errorMessage = input<string>('');

  /** ID unique généré si non fourni. */
  readonly inputId = input<string>(`zep-input-${++uniqueId}`);

  protected readonly _focused = signal(false);

  protected readonly describedBy = computed(() => {
    const id = this.inputId();
    if (this.invalid() && this.errorMessage()) return `${id}-error`;
    if (this.hint()) return `${id}-hint`;
    return null;
  });

  protected onFocus(): void {
    this._focused.set(true);
  }

  protected onBlur(): void {
    this._focused.set(false);
  }
}
