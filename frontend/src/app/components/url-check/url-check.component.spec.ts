import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UrlCheckComponent } from './url-check.component';

describe('UrlCheckComponent', () => {
  let component: UrlCheckComponent;
  let fixture: ComponentFixture<UrlCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UrlCheckComponent],
      imports: [FormsModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
