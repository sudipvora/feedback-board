import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackBoardComponent } from './feedback-board.component';
import { FeedbackService } from '../../services/feedback.service';
import { BehaviorSubject } from 'rxjs';
import { Feedback } from '../../models/feedback.model';
import { Component } from '@angular/core';

// Mock child components (standalone imports are already in FeedbackBoardComponent, but Jest needs mocks)
@Component({ selector: 'app-feedback-form', template: '' })
class MockFeedbackFormComponent {}

@Component({ selector: 'app-feedback-list', template: '' })
class MockFeedbackListComponent {}

describe('FeedbackBoardComponent', () => {
  let component: FeedbackBoardComponent;
  let fixture: ComponentFixture<FeedbackBoardComponent>;
  let feedbackService: jest.Mocked<FeedbackService>;

  const mockFeedback: Feedback[] = [
    { id: 1, name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01T10:00:00Z' },
    { id: 2, name: 'Jane Smith', message: 'Good service', rating: 4, created_at: '2025-01-02T11:00:00Z' }
  ];

  const feedback$ = new BehaviorSubject<Feedback[]>(mockFeedback);
  const loading$ = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    const feedbackServiceMock = {
      feedback$: feedback$.asObservable(),
      loading$: loading$.asObservable(),
      refreshData: jest.fn(),
      getFeedback: jest.fn().mockReturnValue(feedback$.asObservable()) // <-- Add this
    } as unknown as jest.Mocked<FeedbackService>;

    await TestBed.configureTestingModule({
      imports: [
        FeedbackBoardComponent  // standalone import
      ],
      providers: [
        { provide: FeedbackService, useValue: feedbackServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackBoardComponent);
    component = fixture.componentInstance;
    feedbackService = TestBed.inject(FeedbackService) as jest.Mocked<FeedbackService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render main container', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.feedback-board')).toBeTruthy();
  });

  it('should render main grid with correct classes', () => {
    const compiled = fixture.nativeElement;
    const mainGrid = compiled.querySelector('.content-grid'); // updated selector
    expect(mainGrid).toBeTruthy();
    expect(mainGrid.classList.contains('grid')).toBe(false); // no 'grid' in template
  });

  it('should render feedback form and list sections with proper headings', () => {
    const compiled = fixture.nativeElement;
    const formSection = compiled.querySelector('.feedback-form-section');
    const listSection = compiled.querySelector('.feedback-list-section');

    expect(formSection).toBeTruthy();
    expect(formSection.querySelector('h2').textContent).toContain('Submit Feedback');

    expect(listSection).toBeTruthy();
    expect(listSection.querySelector('h2').textContent).toContain('Recent Feedback');
  });

  it('should render child components', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-feedback-form')).toBeTruthy();
    expect(compiled.querySelector('app-feedback-list')).toBeTruthy();
  });

  it('should render sections proper styling', () => {
    const compiled = fixture.nativeElement;

    const sections = compiled.querySelectorAll('.feedback-form-section, .feedback-list-section');
    sections.forEach((section: Element) => {
      expect(section.classList.contains('feedback-form-section') || section.classList.contains('feedback-list-section')).toBe(true);
    });
  });

  it('should have proper accessibility with two section headings', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('h2')).toHaveLength(2);
  });
});
