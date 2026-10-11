import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, input } from '@angular/core';

/** Move keyboard focus after conditional form content has rendered. Never runs during SSR. */
export class FormFocus {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  move(selector: string): void { afterNextRender(() => { const target = this.element.nativeElement.querySelector<HTMLElement>(selector); if (target) { if (!target.matches('input,select,textarea,button,a')) target.tabIndex = -1; target.focus(); } }, { injector: this.injector }); }
}

@Component({ selector: 'app-form-field', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="form-field"><label [for]="id()">{{ label() }}@if (required()) { <span aria-hidden="true"> *</span> }</label><ng-content />@if (hint()) { <p [id]="id() + '-hint'" class="field-hint">{{ hint() }}</p> }<p [id]="id() + '-error'" class="field-error" aria-live="polite">{{ error() }}</p></div>`,
})
export class FormField { readonly id = input.required<string>({ alias: 'fieldId' }); readonly label = input.required<string>(); readonly required = input(false); readonly hint = input(''); readonly error = input(''); }

@Component({ selector: 'app-submission-feedback', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (message()) { <div class="submission-feedback" role="alert" tabindex="-1">{{ message() }}</div> }`,
})
export class SubmissionFeedback { readonly message = input(''); }

@Component({ selector: 'app-confirmation', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="confirmation-panel" role="status" tabindex="-1"><p class="eyebrow">Request received</p><h2>{{ title() }}</h2><p>The backend has confirmed your request was saved. This is not an appointment booking or confirmation of email delivery.</p>@if (reference()) { <p class="request-reference">Reference: <strong>{{ reference() }}</strong></p> }<ng-content /></section>`,
})
export class Confirmation {
  readonly title = input.required<string>(); readonly reference = input('');
  constructor() { const element = inject<ElementRef<HTMLElement>>(ElementRef); afterNextRender(() => element.nativeElement.querySelector<HTMLElement>('.confirmation-panel')?.focus()); }
}
