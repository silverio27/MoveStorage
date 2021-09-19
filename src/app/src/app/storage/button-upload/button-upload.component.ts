import { Component, EventEmitter, Output } from "@angular/core";
import { forkJoin } from "rxjs";
import { Base64Service } from "./base64.service";
import { IFileConvert } from "./ifile-convert";

@Component({
  selector: "button-upload",
  templateUrl: "./button-upload.component.html",
  styleUrls: ["./button-upload.component.css"],
})
export class ButtonUploadComponent {
  @Output() upload = new EventEmitter<Array<IFileConvert>>();
  constructor(private base64: Base64Service) {}
  prepareToUpload(e: any) {
    const services = [...e.target.files].map((x: File) =>
      this.base64.Convert(x)
    );
    forkJoin(services).subscribe((x: Array<IFileConvert>) => {
      this.upload.emit(x);
    });
  }
}
