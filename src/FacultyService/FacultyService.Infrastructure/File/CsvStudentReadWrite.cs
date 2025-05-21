using System.Collections.Immutable;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using FacultyService.Application.Student.StudentReader;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.StudentExporter;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FacultyItService.Infrastructure.File;

public class CsvStudentReadWrite(ILogger logger) : IReadWriteFile<StudentRecord>
{
    public async Task<long> WriteToFile(string filePath, IList<StudentRecord> data)
    {
        await using var writer = new StreamWriter(filePath);
        await using var csvWriter = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = (args) =>
            {
                logger.LogWarning("Missing field found: {FieldName}", args.HeaderNames?[args.Index]);
            },
            BadDataFound = (args) =>
            {
                logger.LogWarning("Bad data found at {Field}: {Value}", args.Field, args.RawRecord);
            },
            HeaderValidated = null,
        });
        
        csvWriter.Context.RegisterClassMap<StudentRecordWriterMap>();
        await csvWriter.WriteRecordsAsync(data);
        return data.Count;
        
    }

    public async Task<ReadRecordResult<StudentRecord>> ReadFromFileAsync(IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var current = 0;
        using var csvReader = new CsvReader(new StreamReader(stream), new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = (args) =>
            {
                logger.LogWarning("Missing field found: {FieldName}", args.HeaderNames?[args.Index]);
            },
            BadDataFound = (args) =>
            {
                logger.LogWarning("Bad data found at {Field}: {Value}", args.Field, args.RawRecord);
            },
            HeaderValidated = null,
            
        });
        
        csvReader.Context.RegisterClassMap<StudentRecordReaderMap>();

        var records = new List<StudentRecord>();

        try
        {
            while (await csvReader.ReadAsync())
            {
                try
                {
                    var record = csvReader.GetRecord<StudentRecord>();
                    records.Add(record);
                }
                catch (Exception e)
                {
                    logger.LogError(e, "Error reading record at line {LineNumber}", csvReader.Context.Reader?.CurrentIndex);
                    current++;
                }
            }
            
            return new ReadRecordResult<StudentRecord>
            {
                Records = records.ToImmutableList(),
                TotalRecord = records.Count + current,
            };
            
        }catch (Exception e)
        {
            logger.LogError(e, "Error reading CSV file");
            throw;
        }
    }
}

public sealed class StudentRecordReaderMap : ClassMap<StudentRecord>
{
    public StudentRecordReaderMap()
    {
        Map().Name("StudentCode","MSSV").Ignore();
        Map(m => m.LastName).Name("LastName","HỌ");
        Map(m => m.FirstName).Name("FirstName","TÊN");
        Map(m => m.ClassCode).Name("ClassCode","LỚP");
        Map(m => m.Address).Name("Address","ĐỊA CHỈ");
        Map(m => m.Gender).Name("Gender","GIỚI TÍNH");
        Map(m => m.BirthDate).Name("BirthDate","NGÀY SINH");
    }
}

public sealed class StudentRecordWriterMap : ClassMap<StudentRecord>
{
    public StudentRecordWriterMap()
    {
        Map(m => m.StudentCode).Name("MSSV");
        Map(m => m.LastName).Name("HỌ");
        Map(m => m.FirstName).Name("TÊN");
        Map(m => m.ClassCode).Name("LỚP");
        Map(m => m.Address).Name("ĐỊA CHỈ");
        Map(m => m.Gender.ToString()).Name("GIỚI TÍNH");
        Map(m => m.BirthDate).Name("NGÀY SINH");
    }
}
