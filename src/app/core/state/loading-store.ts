import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingStore {
  private readonly pending = signal(0);
  readonly busy = computed(() => this.pending() > 0);

  begin(): () => void {
    this.pending.update(count => count + 1);
    let finished = false;
    return () => {
      if (finished) return;
      finished = true;
      this.pending.update(count => count - 1);
    };
  }
}
