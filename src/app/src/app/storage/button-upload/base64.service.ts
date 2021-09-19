import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class Base64Service {
  public Convert(file: File) {
    return new Observable((subscriber: Subscriber<any>) =>
      this.readFile(file, subscriber)
    );
  }

  private readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);

    filereader.onload = () => {
      subscriber.next({
        name: file.name,
        base64: filereader.result?.toString(),
      });
      subscriber.complete();
    };
    filereader.onerror = (error) => {
      subscriber.error(error);
      subscriber.complete();
    };
  }
}
