import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

import { IFileConvert } from "./button-upload/ifile-convert";
import { Container, StorageConnection } from "./services/istorage";
import { StorageService } from "./services/storage.service";

@Component({
  selector: "app-storage",
  templateUrl: "./storage.component.html",
  styleUrls: ["./storage.component.css"],
})
export class StorageComponent implements OnInit {
  @Input() connection: StorageConnection = {} as StorageConnection;
  @Input() load = false;
  @Output() remove = new EventEmitter();
  @Output() duplicate = new EventEmitter();
  container = {} as Container;
  containers: string[] = [];
  files: string[] = [];
  showNewContainer = false;
  constructor(
    public storageService: StorageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.container.connection = this.connection;
    this.getContainers(this.connection.connectionString);
  }

  getFiles(connectionString: string, containerName: string) {
    this.load = true;
    this.storageService.getFiles(connectionString, containerName).subscribe(
      (x) => {
        this.files = x;
        this.load = false;
      },
      () => {
        this.snackBar.open(
          "O container não deve exisiter mais, atualize os containers",
          "😭",
          {
            duration: 5000,
          }
        );
      }
    );
  }

  upload(container: Container, files: IFileConvert[]) {
    this.storageService
      .upload({ container, filesBase64: files })
      .subscribe((x) => {
        files.forEach((x) => this.files.push(x.name));
      });
  }

  getContainers(connectionString: string) {
    this.storageService.getContainers(connectionString).subscribe((x) => {
      this.containers = x;
    });
  }
  removeFile(container: Container, file: string) {
    this.storageService
      .removeFile(container.connection.connectionString, container.name, file)
      .subscribe(() => {});
  }
  removeContainer(connectionString: string, containerName: string) {
    if (!containerName) {
      this.snackBar.open("Escolha um container antes de excluir", "😭", {
        duration: 5000,
      });
      return;
    }

    this.storageService
      .removeContainer(connectionString, containerName)
      .subscribe(() => {
        const index = this.containers.indexOf(containerName);
        this.containers.splice(index, 1);
        this.files = [];
      });
  }

  addContainer(connectionString: string, containerName: string) {
    this.storageService
      .addContainer({ connectionString, containerName })
      .subscribe(
        () => {
          this.containers.push(containerName);
        },
        (x) => {
          this.snackBar.open(
            "Aconteceu um erro, tente colocar um nome sem espaços e caracteres especiais.",
            "😭",
            {
              duration: 5000,
            }
          );
        }
      );
  }

  download(container: Container, file: string) {
    this.storageService
      .download(container.connection.connectionString, container.name, file)
      .subscribe((x) => {
        var downloadURL = window.URL.createObjectURL(x);
        var link = document.createElement("a");
        link.href = downloadURL;
        link.download = file;
        link.click();
      });
  }
}
