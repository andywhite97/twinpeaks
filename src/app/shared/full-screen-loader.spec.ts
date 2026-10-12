import { TestBed } from '@angular/core/testing';
import { FullScreenLoader } from './ui/full-screen-loader';

describe('Full screen loader', () => {
  it('opens a modal status overlay and restores scrolling after loading', () => {
    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'scroll';
    const fixture = TestBed.createComponent(FullScreenLoader);
    try {
      fixture.detectChanges();
      const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
      expect(dialog.open).toBeTrue();
      expect(dialog.querySelector('[role="status"]')?.textContent).toContain('Loading');
      expect(document.documentElement.style.overflow).toBe('hidden');
      const cancel = new Event('cancel', { cancelable: true });
      dialog.dispatchEvent(cancel);
      expect(cancel.defaultPrevented).toBeTrue();
      fixture.destroy();
      expect(dialog.open).toBeFalse();
      expect(document.documentElement.style.overflow).toBe('scroll');
    } finally {
      if (!fixture.componentRef.hostView.destroyed) fixture.destroy();
      document.documentElement.style.overflow = original;
    }
  });
  it('keeps its loading message and a static mark if the GIF cannot load', () => {
    const fixture = TestBed.createComponent(FullScreenLoader);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.loader-animation').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loader-animation')).toBeNull();
    expect(fixture.nativeElement.querySelector('.loader-static--fallback')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Please wait a moment');
    fixture.destroy();
  });
});
