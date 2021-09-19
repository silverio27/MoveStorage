import { IFileConvert } from "../button-upload/ifile-convert";

export interface StorageConnection {
  connectionString: string;
  alias: string;
}

export interface Container {
  name: string;
  connection: StorageConnection;
}

export interface Upload {
  container: Container;
  filesBase64: IFileConvert[];
}

export interface MoveFile {
  from: Container;
  to: Container;
  file: string;
}

export interface NewContainer {
  connectionString: string;
  containerName: string;
}
