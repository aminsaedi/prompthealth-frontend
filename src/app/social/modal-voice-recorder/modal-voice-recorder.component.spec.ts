import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVoiceRecorderComponent } from './modal-voice-recorder.component';

describe('ModalVoiceRecorderComponent', () => {
  let component: ModalVoiceRecorderComponent;
  let fixture: ComponentFixture<ModalVoiceRecorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalVoiceRecorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalVoiceRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
