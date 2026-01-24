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

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'planner', component: Planner2 },
  { path: 'journal', component: JournalComponent },
  { path: 'ai', component: Ai },
  { path: 'habits', component: Habits },
  { path: 'settings', component: Settings },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
