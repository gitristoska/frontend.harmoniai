import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planner2 } from './planner2';

describe('Planner2', () => {
  let component: Planner2;
  let fixture: ComponentFixture<Planner2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planner2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planner2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
