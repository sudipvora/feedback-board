import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackListComponent } from './feedback-list.component';
import { FeedbackService } from '../../services/feedback.service';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { Feedback } from '../../models/feedback.model';

describe('FeedbackListComponent', () => {
  let component: FeedbackListComponent;
  let fixture: ComponentFixture<FeedbackListComponent>;
  let feedbackService: any;

  const mockFeedback: Feedback[] = [
    {
      id: 1,
      name: 'John Doe',
      message: 'Great product!',
      rating: 5,
      created_at: '2025-01-01T10:00:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      message: 'Good service',
      rating: 4,
      created_at: '2025-01-02T11:00:00Z'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      message: 'Average experience',
      rating: 3,
      created_at: '2025-01-03T12:00:00Z'
    },
    {
      id: 4,
      name: 'Alice Brown',
      message: 'Bad experience',
      rating: 1,
      created_at: '2025-01-04T13:00:00Z'
    }
  ];

  const mockFeedbackSubject = new BehaviorSubject<Feedback[]>(mockFeedback);
  const mockLoadingSubject = new BehaviorSubject<boolean>(false);
  const mockInitialLoadSubject = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    const spy = {
      getFeedback: jest.fn().mockReturnValue(of([])),
      feedback$: mockFeedbackSubject.asObservable(),
      loading$: mockLoadingSubject.asObservable(),
      initialLoad$: mockInitialLoadSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [FeedbackListComponent],
      providers: [
        { provide: FeedbackService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackListComponent);
    component = fixture.componentInstance;
    feedbackService = TestBed.inject(FeedbackService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.feedback$).toBeDefined();
    expect(component.loading$).toBeDefined();
    expect(component.initialLoad$).toBeDefined();
    expect(component.sortBy).toBe('created_at');
    expect(component.sortOrder).toBe('desc');
    expect(component.sortOptions).toEqual([
      { value: 'created_at', label: 'Date' },
      { value: 'rating', label: 'Rating' },
      { value: 'name', label: 'Name' }
    ]);
  });

  it('should display feedback list when data is available and not initial load', () => {
    mockInitialLoadSubject.next(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.feedback-list')).toBeTruthy();
    expect(compiled.querySelectorAll('.feedback-card')).toHaveLength(4);
  });

  it('should display empty state when no feedback and not initial load', () => {
    mockFeedbackSubject.next([]);
    mockInitialLoadSubject.next(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
    expect(compiled.querySelector('.empty-state h3').textContent).toContain('No feedback yet');
  });

  it('should display loading state only during initial load when loading', () => {
    mockInitialLoadSubject.next(true);
    mockLoadingSubject.next(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.loading-state')).toBeTruthy();
    expect(compiled.querySelector('.loading-state p').textContent).toContain('Loading feedback');
  });

  it('should not display loading state when not initial load even if loading', () => {
    mockInitialLoadSubject.next(false);
    mockLoadingSubject.next(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.loading-state')).toBeFalsy();
  });

  it('should display feedback cards with correct information', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const firstCard = compiled.querySelector('.feedback-card');
    
    expect(firstCard.querySelector('.feedback-name').textContent).toContain('John Doe');
    expect(firstCard.querySelector('.feedback-message').textContent).toContain('Great product!');
    expect(firstCard.querySelector('.feedback-rating')).toBeTruthy();
    expect(firstCard.querySelector('.feedback-date')).toBeTruthy();
  });

  it('should display star rating correctly', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const ratingContainer = compiled.querySelector('.feedback-rating');
    
    // Should have 5 stars for rating 5
    const stars = ratingContainer.querySelectorAll('.star');
    expect(stars).toHaveLength(5);
  });

  it('should display rating badge with correct color', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const firstCard = compiled.querySelector('.feedback-card');
    const ratingBadge = firstCard.querySelector('.rating-badge');
    
    expect(ratingBadge).toBeTruthy();
    expect(ratingBadge.textContent).toContain('5');
    expect(ratingBadge.classList.contains('rating-5')).toBe(true);
  });

  it('should handle sorting change', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    const sortSelect = fixture.nativeElement.querySelector('#sortBy');
    sortSelect.value = 'rating';
    sortSelect.dispatchEvent(new Event('change'));
    
    expect(component.sortBy).toBe('rating');
  });

  it('should handle order change', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    const orderSelect = fixture.nativeElement.querySelector('#sortOrder');
    orderSelect.value = 'asc';
    orderSelect.dispatchEvent(new Event('change'));
    
    expect(component.sortOrder).toBe('asc');
  });

  it('should call service with correct parameters when sorting changes', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    fixture.detectChanges();
    
    component.sortOrder = 'asc';

    const select = fixture.nativeElement.querySelector('#sortOrder');
    select.value = 'asc';
    select.dispatchEvent(new Event('change'));

    component.onSortChange({ target: select } as unknown as Event);
    
    expect(feedbackService.getFeedback).toHaveBeenCalledWith('created_at', 'asc');
  });

  it('should format date correctly', () => {
    const date = '2025-01-01T10:00:00Z';
    const formatted = component.formatDate(date);
    
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should return empty string for null date', () => {
    const formatted = component.formatDate(null as any);
    expect(formatted).toBe('');
  });

  it('should return empty string for undefined date', () => {
    const formatted = component.formatDate(undefined as any);
    expect(formatted).toBe('');
  });

  it('should get rating badge class correctly', () => {
    expect(component.getRatingBadgeClass(5)).toBe('rating-5');
    expect(component.getRatingBadgeClass(4)).toBe('rating-4');
    expect(component.getRatingBadgeClass(3)).toBe('rating-3');
    expect(component.getRatingBadgeClass(2)).toBe('rating-2');
    expect(component.getRatingBadgeClass(1)).toBe('rating-1');
  });

  it('should get rating badge class for rating 0', () => {
    expect(component.getRatingBadgeClass(0)).toBe('rating-0');
  });

  it('should get rating badge class for rating above 5', () => {
    expect(component.getRatingBadgeClass(6)).toBe('rating-5');
  });

  it('should get rating badge class for negative rating', () => {
    expect(component.getRatingBadgeClass(-1)).toBe('rating-0');
  });

  it('should get rating badge class for decimal rating', () => {
    expect(component.getRatingBadgeClass(3.5)).toBe('rating-3');
  });

  it('should display correct number of filled and empty stars', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([
      { name: 'John Doe', message: 'Great product!', rating: 5, created_at: '2025-01-01' }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const firstCard = compiled.querySelector('.feedback-card');
    const stars = firstCard.querySelectorAll('.star');
    
    // Rating 5 should have 5 filled stars
    expect(stars).toHaveLength(5);
  });

  it('should display correct number of filled and empty stars for rating 3', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([mockFeedback[2]]); // Rating 3
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const stars = compiled.querySelectorAll('.star');
    
    // Rating 3 should have 3 filled stars and 2 empty
    expect(stars[0].className.includes('star filled')).toBe(true);
    expect(stars[1].className.includes('star filled')).toBe(true);
    expect(stars[2].className.includes('star filled')).toBe(true);
    expect(stars[3].className.includes('star empty')).toBe(true);
    expect(stars[4].className.includes('star empty')).toBe(true);
  });

  it('should display correct number of filled and empty stars for rating 1', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([mockFeedback[3]]); // Rating 1
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const stars = compiled.querySelectorAll('.star');
    
    // Rating 1 should have 1 filled star and 4 empty
    console.log(stars[1].className);
    console.log(stars.length);
    expect(stars[0].className.includes('star filled')).toBe(true);
    expect(stars[1].className.includes('star empty')).toBe(true);
    expect(stars[2].className.includes('star empty')).toBe(true);
    expect(stars[3].className.includes('star empty')).toBe(true);
    expect(stars[4].className.includes('star empty')).toBe(true);
  });

  it('should handle empty feedback array when not initial load', () => {
    mockFeedbackSubject.next([]);
    mockInitialLoadSubject.next(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.feedback-list')).toBeFalsy();
  });

  it('should handle undefined feedback when not initial load', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next(undefined as any);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should handle null feedback when not initial load', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next(null as any);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should display feedback count correctly', () => {
    mockInitialLoadSubject.next(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const countElement = compiled.querySelector('.feedback-count');
    
    if (countElement) {
      expect(countElement.textContent).toContain('3');
    }
  });

  it('should display sorting controls', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([{ name: 'John', message: 'Nice', rating: 5, created_at: '2025-01-01' }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#sortBy')).toBeTruthy();
    expect(compiled.querySelector('#sortOrder')).toBeTruthy();
    expect(compiled.querySelector('.sorting-controls')).toBeTruthy();
  });

  it('should have correct sort options', () => {
    expect(component.sortOptions).toEqual([
      { value: 'created_at', label: 'Date' },
      { value: 'rating', label: 'Rating' },
      { value: 'name', label: 'Name' }
    ]);
  });

  it('should call onSortChange when sort select changes', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([{ name: 'John', message: 'Nice', rating: 5, created_at: '2025-01-01' }]);
    fixture.detectChanges();

    jest.spyOn(component, 'onSortChange');
    const sortSelect = fixture.nativeElement.querySelector('#sortBy');
    
    sortSelect.value = 'rating';
    sortSelect.dispatchEvent(new Event('change'));
    
    expect(component.onSortChange).toHaveBeenCalled();
  });

  it('should call onSortChange when order select changes', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([{ name: 'John', message: 'Nice', rating: 5, created_at: '2025-01-01' }]);
    fixture.detectChanges();

    jest.spyOn(component, 'onSortChange');
    const orderSelect = fixture.nativeElement.querySelector('#sortOrder');
    
    orderSelect.value = 'asc';
    orderSelect.dispatchEvent(new Event('change'));
    
    expect(component.onSortChange).toHaveBeenCalled();
  });

  it('should update sortBy when sort select changes', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([{ name: 'John', message: 'Nice', rating: 5, created_at: '2025-01-01' }]);
    fixture.detectChanges();

    const sortSelect = fixture.nativeElement.querySelector('#sortBy');
    sortSelect.value = 'name';
    sortSelect.dispatchEvent(new Event('change'));
    
    expect(component.sortBy).toBe('name');
  });

  it('should update sortOrder when order select changes', () => {
    mockLoadingSubject.next(false);
    mockInitialLoadSubject.next(false);
    mockFeedbackSubject.next([{ name: 'John', message: 'Nice', rating: 5, created_at: '2025-01-01' }]);
    fixture.detectChanges();

    const orderSelect = fixture.nativeElement.querySelector('#sortOrder');
    orderSelect.value = 'asc';
    orderSelect.dispatchEvent(new Event('change'));
    
    expect(component.sortOrder).toBe('asc');
  });

  it('should handle error in loadFeedback', () => {
    const error = new Error('Network error');
    feedbackService.getFeedback = jest.fn().mockReturnValue(throwError(() => error));

    // Spy on console.error to prevent logging in test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    component['loadFeedback']();

    expect(feedbackService.getFeedback).toHaveBeenCalledWith(component.sortBy, component.sortOrder);
    expect(consoleSpy).toHaveBeenCalledWith('Error loading feedback:', error);

    consoleSpy.mockRestore();
  });

  it('should return empty string when formatDate throws error', () => {
    // Spy on Date.prototype.toLocaleDateString to throw
    jest.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(() => {
      throw new Error('Fake error');
    });

    const result = component.formatDate('2025-01-01');
    expect(result).toBe(''); // now catch block is executed

    // Restore original implementation
    (Date.prototype.toLocaleDateString as jest.Mock).mockRestore();
  });

});
