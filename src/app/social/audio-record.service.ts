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


  recordingDone(): Observable<RecordedAudioOutput> {
    return this._recordingDone.asObservable();
  }

  recordingStarted(): Observable<void> {
    return this._recordingStarted.asObservable();
  }
  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }


  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
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
  }

  private record() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/mp3',
      sampleRate: 44100
    });

    this.recorder.record();
    this._recordingStarted.next();
  }


  stopRecording() {
    if (this.recorder) {
      this.recorder.stop((blob) => {
        const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
        this.stopMedia();
        this._recordingDone.next({ blob: blob, title: mp3Name });
      }, () => {
        this.stopMedia();
        this._recordingFailed.next();
      });
    }
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