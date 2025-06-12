namespace Shared.FileHelper;

public interface IWritingToFile<T> where T : class
{
    Task<Stream> WriteToFileAsync(Stream stream, T data, CancellationToken cancellationToken);
}