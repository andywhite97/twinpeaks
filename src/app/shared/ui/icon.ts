import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const paths = {
  arrow: ['M4 12h16M14 6l6 6-6 6'], menu: ['M4 6h16M4 12h16M4 18h16'], close: ['M6 6l12 12M18 6 6 18'],
  shield: ['M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z', 'm8 12 3 3 5-6'],
  progress: ['M4 20V13h4v7zM10 20V8h4v12zM16 20V3h4v17z'],
  people: ['M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M16 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6', 'M2 20v-3c0-3 3-5 6-5s6 2 6 5v3M15 12c4 0 7 2 7 5v3'],
  star: ['m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'],
  camera: ['M4 7h12l4 6-12 5-4-6z', 'm10 17-1 4H5M5 8 2 9l2 5 3-1'],
  pos: ['M5 3h14v11H5zM12 14v4M7 21h10M8 6h8M8 9h3'],
  laptop: ['M4 4h16v13H4zM2 20h20', 'm9 8-2 2 2 2M15 8l2 2-2 2'],
  network: ['M9 3h6v5H9zM3 16h6v5H3zM15 16h6v5h-6zM12 8v4M6 16v-4h12v4'],
  code: ['m7 7-5 5 5 5M17 7l5 5-5 5M14 4l-4 16'],
  lock: ['M5 10h14v11H5z', 'M8 10V7a4 4 0 0 1 8 0v3M12 14v3'],
  consult: ['M3 4h18v13H9l-5 4v-4H3z', 'M7 9h10M7 12h6'],
  plan: ['M5 3h14v18H5zM9 7h6M9 11h6M9 15h4'],
  implement: ['m4 3 5 5-2 2-5-5v5l5 3 10 9 4-4-9-10 3-5h-5l-3 3', 'm14 14-8 8-4-4 8-8'],
  support: ['M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v8H3zM17 12h4v8h-4zM17 20c-1 2-3 2-5 2'],
  sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1'],
  moon: ['M21 14a9 9 0 1 1-11-11 7 7 0 0 0 11 11z'],
  phone: ['M4 3h4l2 5-3 2c2 4 3 5 7 7l2-3 5 2v4c-8 3-19-8-17-17z'],
  mail: ['M3 5h18v14H3zM3 5l9 7 9-7'], pin: ['M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z', 'M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2'],
  check: ['m5 12 4 4L19 6'], image: ['M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M15 6h2v2h-2z'],
} as const;
export type IconName = keyof typeof paths;

@Component({ selector: 'app-icon', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">@for (path of lines(); track $index) { <path [attr.d]="path" /> }</svg>`,
  styles: [`:host{display:inline-flex;width:1.5em;height:1.5em;flex-shrink:0}svg{width:100%;height:100%}`],
})
export class Icon { readonly name = input<IconName>('arrow'); readonly lines = computed(() => paths[this.name()]); }
