import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/feedback',
    pathMatch: 'full'
  },
  {
    path: 'feedback',
    loadComponent: () => import('./components/feedback-board/feedback-board.component').then(m => m.FeedbackBoardComponent)
  }
]; 