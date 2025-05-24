using FacultyService.Application.Students.IoDto;
using FacultyService.Application.Students.Query;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;
using Shared.FileHelper;
using Shared.Infra.StreamHelper;

namespace FacultyService.Application.Students.QueryHandler;

public class ExportStudentScoreQueryHandler(
    FacultyDbContext dbContext,
    IWritingToFile<ExportStudentScoreIoRecord> writer) : IRequestHandler<ExportStudentScoreQuery, Stream>
{
    public async Task<Stream> Handle(ExportStudentScoreQuery request, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
                          .Where(x => x.StudentCode == request.StudentCode)
                          .Select(s => new ExportStudentScoreIoRecord
                          {
                              StudentCode = s.StudentCode,
                              ClassCode = s.ClassCode,
                              LastName = s.LastName,
                              FirstName = s.FirstName,
                              AcademicYearCode = s.Class.AcademicYearCode,
                              FacultyName = dbContext.TenantInfo.Name,
                              ExportStudentScoreInCourseIoRecords = s.Registrations
                                  .GroupBy(r => r.CreditClass.CourseCode)
                                  .Select(g => g.OrderByDescending(r => r.FinalScore).First())
                                  .Select(r => new ExportStudentScoreInCourseIoRecord
                                  {
                                      CourseName = r.CreditClass.CourseCodeNavigation.CourseName,
                                      FinalScore = r.FinalScore ?? 0
                                  })
                                  .ToList()
                          })
                          .FirstOrDefaultAsync(cancellationToken) ??
                      throw new ResourceNotFoundException($"Không tìm thấy sinh viên với mã {request.StudentCode}");

        var tempStream = await writer.WriteToFileAsync(
            new MemoryOptimizedStream(FileMode.Create, FileAccess.ReadWrite, FileShare.Read), student,
            cancellationToken);

        return tempStream;
    }
}