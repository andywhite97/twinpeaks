import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon, IconName } from './icon';

@Component({ selector: 'app-process-steps', imports: [Icon], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ol class="process-grid">@for (step of steps; track step.title; let i = $index) { <li><span class="process-number">0{{ i + 1 }}</span><app-icon [name]="step.icon" /><h3>{{ step.title }}</h3><p>{{ step.description }}</p></li> }</ol>`,
})
export class ProcessSteps {
  readonly steps: { title: string; description: string; icon: IconName }[] = [
    { title: 'Consult', description: 'Understand your needs and the environment you work in.', icon: 'consult' },
    { title: 'Plan', description: 'Shape a practical solution around your goals.', icon: 'plan' },
    { title: 'Implement', description: 'Bring your technology and systems together.', icon: 'implement' },
    { title: 'Support', description: 'Keep the conversation going as your needs evolve.', icon: 'support' },
  ];
}
