using FacultyService.Application.Students.IoDto;
using Microsoft.Extensions.Logging;
using Shared.FileHelper;

namespace FacultyItService.Infrastructure.StudentIo;

public class StudentReadWriteFactory(ILogger logger) : IReadWriteFileFactory<StudentRecord>
{
    public IReadWriteFile<StudentRecord> Create(FileTypeSupport fileType)
    {
        return fileType switch
        {
            FileTypeSupport.Csv => new CsvStudentReadWrite(logger),
            FileTypeSupport.Excel => new ExcelStudentReadWrite(logger),
            _ => throw new NotImplementedException()
        };
    }
}