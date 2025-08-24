import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have title "feedback-board"', () => {
    expect(component.title).toBe('feedback-board');
  });

  it('should render the header with correct classes', () => {
    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeTruthy();
    expect(header.classList).toContain('bg-white');
    expect(header.classList).toContain('shadow-sm');
    expect(header.classList).toContain('border-b');
  });

  it('should render the header container with max width and padding', () => {
    const container = fixture.nativeElement.querySelector('header > div');
    expect(container.classList).toContain('max-w-7xl');
    expect(container.classList).toContain('mx-auto');
    expect(container.classList).toContain('px-4');
    expect(container.classList).toContain('py-4');
  });

  it('should render logo svg and title text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const svg = compiled.querySelector('header svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList).toContain('w-8');
    expect(svg?.classList).toContain('h-8');
    expect(svg?.classList).toContain('text-blue-600');

    const h1 = compiled.querySelector('header h1');
    expect(h1?.textContent).toContain('Feedback Board');
    expect(h1?.classList).toContain('text-2xl');
    expect(h1?.classList).toContain('font-bold');
    expect(h1?.classList).toContain('text-gray-900');
  });

  it('should render navigation with Home link', () => {
    const link = fixture.nativeElement.querySelector('nav a');
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Home');
    expect(link.getAttribute('ng-reflect-router-link')).toBe('/');
    expect(link.classList).toContain('text-gray-600');
    expect(link.classList).toContain('hover:text-gray-900');
  });

  it('should render main with router-outlet', () => {
    const main = fixture.nativeElement.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render footer with proper structure and text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('footer');
    expect(footer).toBeTruthy();
    expect(footer?.classList).toContain('bg-gray-50');
    expect(footer?.classList).toContain('border-t');
    expect(footer?.classList).toContain('mt-16');

    const container = footer?.querySelector('div');
    expect(container?.classList).toContain('max-w-7xl');
    expect(container?.classList).toContain('mx-auto');
    expect(container?.classList).toContain('px-4');
    expect(container?.classList).toContain('py-8');

    const content = container?.querySelector('div');
    expect(content?.classList).toContain('text-center');
    expect(content?.classList).toContain('text-gray-600');

    const p = content?.querySelector('p');
    expect(p?.textContent).toContain('© 2025 Feedback Board. Simple feedback collection system.');
  });
});
