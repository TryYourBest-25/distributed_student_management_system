using Microsoft.AspNetCore.Http;

namespace Shared.FileHelper;

public interface IReadingFromFile<T> where T : class
{
    Task<ReadRecordResult<T>> ReadFromFileAsync(IFormFile file, CancellationToken cancellationToken);
}