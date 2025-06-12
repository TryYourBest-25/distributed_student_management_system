using System.Collections.Immutable;
using ClosedXML.Excel;
using FacultyService.Application.Students.IoDto;
using FacultyService.Domain.ValueObject;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.FileHelper;

namespace FacultyItService.Infrastructure.StudentIo;

public class ExcelStudentReadWrite(ILogger logger) : IReadWriteFile<StudentRecord>
{
    public Task<ReadRecordResult<StudentRecord>> ReadFromFileAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var list = new List<StudentRecord>();

        using var workbook = new XLWorkbook(file.OpenReadStream());

        var worksheet = workbook.Worksheet(1);

        var rowCount = worksheet.LastRowUsed()?.RowNumber() ?? 0;
        var columnCount = worksheet.LastColumnUsed()?.ColumnNumber() ?? 0;

        for (var row = 2; row <= rowCount; row++)
        {
            try
            {
                var studentRecord = new StudentRecord
                {
                    StudentCode = new StudentCode(worksheet.Cell(row, 1).GetString()),
                    ClassCode = new ClassCode(worksheet.Cell(row, 2).GetString()),
                    LastName = new LastName(worksheet.Cell(row, 3).GetString()),
                    FirstName = new FirstName(worksheet.Cell(row, 4).GetString()),
                    Address = worksheet.Cell(row, 5).GetString(),
                    BirthDate = DateOnly.Parse(worksheet.Cell(row, 6).GetString()),
                    Gender = GenderExtensions.FromString(worksheet.Cell(row, 7).GetString()),
                    IsSuspended = worksheet.Cell(row, 8).GetBoolean()
                };

                list.Add(studentRecord);
            }
            catch (Exception ex)
            {
                // Handle exception (e.g., log it, skip the record, etc.)
                // For now, we just log the error and continue
                logger.LogError(ex, "Error reading record at row {Row}", row);
                continue;
            }
        }

        return Task.FromResult(new ReadRecordResult<StudentRecord>
        {
            Records = list.ToImmutableList(),
            TotalRecord = rowCount
        });
    }

    public Task<Stream> WriteToFile(string filePath, StudentRecord data)
    {
        throw new NotImplementedException();
    }

    public Task<Stream> WriteToFileAsync(Stream stream, StudentRecord data, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}