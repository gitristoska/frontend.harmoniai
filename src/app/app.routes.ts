import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Homepage } from './pages/homepage/homepage';
import { Settings } from './pages/settings/settings';
import { Ai } from './pages/ai/ai';
import { JournalComponent } from './pages/journal/journal';
import { Habits } from './pages/habits/habits';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { Planner2 } from './pages/planner2/planner2';
import { MonthlyPlanningPage } from './pages/monthly-planning-page/monthly-planning-page';
import { MonthlyReflectionPage } from './pages/monthly-reflection-page/monthly-reflection-page';
import { authGuard, publicGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Homepage, canActivate: [authGuard] },
  { path: 'planner', component: Planner2, canActivate: [authGuard] },
  { path: 'monthly-planning', component: MonthlyPlanningPage, canActivate: [authGuard] },
  { path: 'monthly-reflection', component: MonthlyReflectionPage, canActivate: [authGuard] },
  { path: 'journal', component: JournalComponent, canActivate: [authGuard] },
  { path: 'ai', component: Ai, canActivate: [authGuard] },
  { path: 'habits', component: Habits, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [publicGuard] },
  { path: '**', redirectTo: '' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
