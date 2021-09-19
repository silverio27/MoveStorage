import {
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";

@Component({
  selector: "files",
  templateUrl: "./files.component.html",
  styleUrls: ["./files.component.css"],
})
export class FilesComponent {
  @Input() files: string[] = [];
  @Output() remove = new EventEmitter();
  @Output() download = new EventEmitter<string>();
  removeItem(e: any) {
    const index = this.files.indexOf(e);
    this.files.splice(index, 1);
    this.remove.emit(e);
  }
}
