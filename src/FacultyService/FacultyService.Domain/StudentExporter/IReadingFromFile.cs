using Microsoft.AspNetCore.Http;

namespace FacultyService.Domain.StudentExporter;

public interface IReadingFromFile<T> where T : class
{
    Task<ReadRecordResult<T>> ReadFromFileAsync(IFormFile file, CancellationToken cancellationToken);
}