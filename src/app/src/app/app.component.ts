import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subject, zip } from "rxjs";
import { delay, switchMap } from "rxjs/operators";
import {
  Container,
  MoveFile,
  StorageConnection,
} from "./storage/services/istorage";
import { NewComponent } from "./storage/new/new.component";
import { StorageService } from "./storage/services/storage.service";
import { TransferComponent } from "./storage/transfer/transfer.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  connections: StorageConnection[] = [];
  from = new Subject<Container>();
  move = new Subject<MoveFile>();

  constructor(
    public dialog: MatDialog,
    public storageService: StorageService
  ) {}
  ngOnInit(): void {
    this.getConnections();
    zip(this.from, this.move)
      .pipe(
        switchMap((x) => {
          x[1].from = x[0];
          this.dialog.open(TransferComponent, {
            width: "400px",
          });
          return this.storageService.moveFile(x[1]);
        })
      ).pipe(delay(500))
      .subscribe(() => {
        this.dialog.closeAll();
      });
  }
 getConnections() {
    this.connections = this.storageService.getConnections();
  }

  createNewStorage() {
    const dialogRef = this.dialog.open(NewComponent, {
      width: "400px",
    });

    dialogRef.afterClosed().subscribe((storage) => {
      if (storage) {
        this.storageService.addConnection(storage);
        this.connections.push(storage);
      }
    });
  }

  drop(event: CdkDragDrop<string[]>, container: Container) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      this.move.next({
        file: event.previousContainer.data[event.previousIndex],
        to: container,
        from: {} as Container,
      });
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  exited(container: Container) {
    this.from.next(container);
  }
  removeConnection(connection:StorageConnection){
    const index = this.connections.indexOf(connection);
    this.connections.splice(index, 1);
    this.storageService.removeConnection(connection);
  }
  duplicateConnection(connection:StorageConnection){
    this.storageService.duplicateConnection(connection);
    this.connections.push(connection);
  }
}
