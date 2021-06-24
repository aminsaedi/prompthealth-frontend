import { Component, OnInit } from '@angular/core';
import Quill from 'quill';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill'
import { FormControl, FormGroup } from '@angular/forms';
import { validators } from 'src/app/_helpers/form-settings';

const parchment = Quill.import('parchment')
const block = parchment.query('block')
block.tagName = 'DIV'
// or class NewBlock extends Block {} NewBlock.tagName = 'DIV'
Quill.register(block /* or NewBlock */, true)

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss']
})
export class PostEditorComponent implements OnInit {

  get f() {return this.form.controls; }

  private form: FormGroup;

  constructor(
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl('', validators.postTitle),
    });
  }




  created(event: Quill) {
    // tslint:disable-next-line:no-console
    console.log('editor-created', event)
  }

  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    console.log('editor-change', event)
  }

  focus($event) {
    console.log('focus', $event)
  }

  blur($event) {
    console.log('blur', $event)
  }
}
