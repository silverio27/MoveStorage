import { Component } from "@angular/core";
import { StorageConnection } from "../services/istorage";

@Component({
  selector: "app-new",
  templateUrl: "./new.component.html",
  styleUrls: ["./new.component.css"],
})
export class NewComponent {
  storage = {
    connectionString: "",
    alias: "",
  } as StorageConnection;
}
