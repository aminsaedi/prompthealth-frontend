import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as RecordRTC from 'recordrtc';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordService {

  constructor() { }

  private stream: MediaStream;
  private recorder: any;
  private _recordingDone = new Subject<RecordedAudioOutput>();
  private _recordingFailed = new Subject<string>();
  private _recordingStarted = new Subject<void>();
  private _timerRecording = new Subject<number>();
  private secondsMaxRecordingTime = 600;
  private secondsRemainingRecordingTime: number = this.secondsMaxRecordingTime;


  recordingDone(): Observable<RecordedAudioOutput> {
    return this._recordingDone.asObservable();
  }

  recordingStarted(): Observable<void> {
    return this._recordingStarted.asObservable();
  }
  timerRecording(): Observable<number> {
    return this._timerRecording.asObservable();
  }
  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }


  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }

    if(!('mediaDevices' in navigator)) {
      this._recordingFailed.next('No recorder found. Please use the device which has microphone.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(s => {
        this.stream = s;
        this.record();
      }).catch(error => {
        let message = 'Cannot start recording. Please allow to use microphone.';
        this._recordingFailed.next(message);
      });
  }

  cancelRecording() {
    this.stopMedia();
    this.stopTimer();
  }

  private record() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/mp3',
      sampleRate: 44100
    });

    this.recorder.record();
    this._recordingStarted.next();
    this.startTimer();
  }


  stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob) => {
        const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
        this.stopMedia();
        this.stopTimer();
        this._recordingDone.next({ blob: blob, title: mp3Name });
      }, () => {
        this.stopMedia();
        this.stopTimer();
        this._recordingFailed.next();
      });
    }
  }

  private _intervalTimer: any;
  private startTimer() {
    this._timerRecording.next(this.secondsRemainingRecordingTime);
    this._intervalTimer = setInterval(() => {
      this.secondsRemainingRecordingTime -= 1;
      this._timerRecording.next(this.secondsRemainingRecordingTime);
      if(this.secondsRemainingRecordingTime <= 0) {
        this.stopRecording();
      }
    }, 1000);
  }

  // private pauseTimer() {
  //   clearInterval(this._intervalTimer);
  // }

  private stopTimer() {
    clearInterval(this._intervalTimer);
    this.secondsRemainingRecordingTime = this.secondsMaxRecordingTime;
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }
}

export interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}