import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { MoveFile, NewContainer, StorageConnection, Upload } from "./istorage";

const url = environment.serviceStorageUrl;
@Injectable({
  providedIn: "root",
})
export class StorageService {
  constructor(private http: HttpClient) {}
  getContainers(connectionString: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${url}containers/${encodeURIComponent(connectionString)}`
    );
  }
  getFiles(
    connectionString: string,
    containerName: string
  ): Observable<string[]> {
    return this.http.get<string[]>(
      `${url}files/${encodeURIComponent(connectionString)}/${containerName}`
    );
  }
  upload(upload: Upload): Observable<string> {
    return this.http.post<string>(`${url}upload`, upload);
  }
  removeFile(
    connectionString: string,
    containerName: string,
    fileName: string
  ) {
    return this.http.delete<string>(
      `${url}file/${encodeURIComponent(
        connectionString
      )}/${containerName}/${fileName}`
    );
  }
  removeContainer(connectionString: string, containerName: string) {
    return this.http.delete<string>(
      `${url}container/${encodeURIComponent(connectionString)}/${containerName}`
    );
  }
  moveFile(moveFile: MoveFile) {
    return this.http.post<string>(`${url}move`, moveFile);
  }
  addContainer(newContainer: NewContainer) {
    return this.http.post<string>(`${url}container`, newContainer);
  }
  download(connectionString: string, containerName: string, fileName: string) {
    return this.http.get<Blob>(
      `${url}download/${encodeURIComponent(
        connectionString
      )}/${containerName}/${fileName}`,
      {
        responseType: "blob" as "json",
      }
    );
  }
  addConnection(connection: StorageConnection) {
    let connections = this.getConnections();
    connections.push(connection);
    localStorage.setItem("connections", JSON.stringify(connections));
  }
  getConnections(): StorageConnection[] {
    const newLocal =
      localStorage.getItem("connections") == null
        ? "[]"
        : localStorage.getItem("connections")!;
    return JSON.parse(newLocal);
  }
  removeConnection(connection: StorageConnection) {
    let connections = this.getConnections();
    const index = connections.indexOf(connection);
    connections.splice(index, 1);
    localStorage.setItem("connections", JSON.stringify(connections));
  }
  duplicateConnection(connection: StorageConnection) {
    this.addConnection(connection);
  }
}
