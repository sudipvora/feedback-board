import { Component } from '@angular/core';
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';
import { FeedbackListComponent } from '../feedback-list/feedback-list.component';

@Component({
  selector: 'app-feedback-board',
  templateUrl: './feedback-board.component.html',
  styleUrls: ['./feedback-board.component.css'],
  standalone: true,
  imports: [FeedbackFormComponent, FeedbackListComponent]
})
export class FeedbackBoardComponent {
  // Component is now simplified to just display the form and list
} 