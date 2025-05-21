using FacultyService.Application.Student.StudentReader;
using FacultyService.Domain.StudentExporter;
using Microsoft.Extensions.Logging;

namespace FacultyItService.Infrastructure.File;

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