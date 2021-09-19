using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Mvc;

namespace api.Storage
{
    [ApiController]
    [Route("[controller]")]
    public class StorageController : ControllerBase
    {

        [HttpGet("containers/{connectionString}")]
        public ActionResult<dynamic> GetContainers(string connectionString)
        {
            var storage = new BlobServiceClient(connectionString);
            var response = storage.GetBlobContainers().Select(x => x.Name);
            return Ok(response);
        }

        [HttpDelete("container/{connectionString}/{containerName}")]
        public ActionResult RemoveContainer(string connectionString, string containerName)
        {
            var blob = new BlobContainerClient(connectionString, containerName);
            blob.Delete();
            return NoContent();
        }

        [HttpPost("container")]
        public ActionResult AddContainer(NewContainer container)
        {
            var storage = new BlobServiceClient(container.ConnectionString);
            storage.CreateBlobContainer(container.ContainerName);
            return Created("", new { response = "Arquivo transferido" });
        }

        [HttpGet("files/{connectionString}/{containerName}")]
        public ActionResult<dynamic> GetFiles(string connectionString, string containerName)
        {
            var container = new BlobContainerClient(connectionString, containerName);
            var response = container.GetBlobs().Select(x => x.Name);
            return Ok(response);
        }

        [HttpDelete("file/{connectionString}/{containerName}/{fileName}")]
        public ActionResult RemoveFile(string connectionString, string containerName, string fileName)
        {
            var blob = new BlobClient(connectionString, containerName, fileName);
            blob.Delete();
            return NoContent();
        }

        [HttpPost("upload")]
        public ActionResult Upload(Upload upload)
        {
            var container = new BlobContainerClient(upload.Container.Connection.ConnectionString, upload.Container.Name);
            foreach (var file in upload.FilesBase64)
            {
                var data = file.Base64.Substring(file.Base64.IndexOf(",") + 1);
                container.UploadBlob(file.Name, new MemoryStream(Convert.FromBase64String(data)));
            }
            return Created("", new { response = "Arquivos enviados" });
        }

        [HttpGet("download/{connectionString}/{containerName}/{fileName}")]
        public async Task<ActionResult> DownloadFile(string connectionString, string containerName, string fileName)
        {
            var blob = new BlobClient(connectionString, containerName, fileName);
            BlobProperties properties = await blob.GetPropertiesAsync();
            var result = await blob.DownloadContentAsync();
            return File(result.Value.Content.ToArray(), properties.ContentType, "");
        }

        [HttpPost("move")]
        public async Task<ActionResult> MoveFile(MoveFile moveFile)
        {
            BlobContainerClient sourceContainer = new(moveFile.From.Connection.ConnectionString, moveFile.From.Name);
            BlobContainerClient destContainer = new(moveFile.To.Connection.ConnectionString, moveFile.To.Name);
            BlobClient destBlob = destContainer.GetBlobClient(moveFile.File);
            await destBlob.StartCopyFromUriAsync(GetSharedAccessUri(moveFile.File, sourceContainer));
            await sourceContainer.DeleteBlobAsync(moveFile.File);
            return Created("", new { response = "Arquivo transferido" });
        }
        private static Uri GetSharedAccessUri(string blobName, BlobContainerClient container)
        {
            DateTimeOffset expiredOn = DateTimeOffset.UtcNow.AddMinutes(60);
            BlobClient blob = container.GetBlobClient(blobName);
            Uri sasUri = blob.GenerateSasUri(BlobSasPermissions.Read, expiredOn);
            return sasUri;
        }

    }

    public record StorageConnection(string ConnectionString, string Alias);
    public record Container(string Name, StorageConnection Connection);
    public record FileConvert(string Name, string Base64);
    public record Upload(Container Container, List<FileConvert> FilesBase64);
    public record MoveFile(Container From, Container To, string File);
    public record NewContainer(string ConnectionString, string ContainerName);

}
