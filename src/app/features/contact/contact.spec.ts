import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Contact } from './contact';
import { ApiService } from '../../core/services/api';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['post']);
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks invalid fields and does not submit incomplete messages', () => {
    component.submitContactForm();

    expect(component.contactForm.touched).toBeTrue();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows success and clears the form after a successful submission', () => {
    api.post.and.returnValue(of({ id: 1, name: 'Jane Doe', email: 'jane@example.com', message: 'Hello', created_at: '' }));
    component.contactForm.setValue({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello' });

    component.submitContactForm();

    expect(api.post).toHaveBeenCalledWith('contact/', { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello' });
    expect(component.submitStatus()).toBe('success');
    expect(component.contactForm.getRawValue()).toEqual({ name: '', email: '', message: '' });
  });

  it('shows an error when the contact request fails', () => {
    api.post.and.returnValue(throwError(() => new Error('Request failed')));
    component.contactForm.setValue({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello' });

    component.submitContactForm();

    expect(component.submitStatus()).toBe('error');
    expect(component.isSubmitting()).toBeFalse();
  });
});
