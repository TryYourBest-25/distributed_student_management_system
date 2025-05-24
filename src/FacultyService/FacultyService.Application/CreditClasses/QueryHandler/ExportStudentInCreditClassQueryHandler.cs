using FacultyService.Application.CreditClasses.IoDto;
using FacultyService.Application.CreditClasses.Query;
using MediatR;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.FileHelper;
using Shared.Infra.StreamHelper;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class ExportStudentInCreditClassQueryHandler(
    FacultyDbContext dbContext,
    IWritingToFile<ExportStudentInCreditClassIoRecord> writer)
    : IRequestHandler<ExportStudentInCreditClassQuery, Stream>
{
    public async Task<Stream> Handle(ExportStudentInCreditClassQuery request, CancellationToken cancellationToken)
    {
        var creditClass = await dbContext.CreditClasses
                              .Where(c => c.AcademicYear == request.AcademicYearCode &&
                                          c.Semester == request.Semester
                                          && c.CourseCode == request.CourseCode &&
                                          c.GroupNumber == request.GroupNumber)
                              .Select(c => new ExportStudentInCreditClassIoRecord
                              {
                                  FacultyName = dbContext.TenantInfo.Name,
                                  AcademicYearCode = c.AcademicYear,
                                  Semester = c.Semester,
                                  CourseName = c.CourseCodeNavigation.CourseName,
                                  GroupNumber = c.GroupNumber,
                                  Students = c.Registrations
                                      .Select(r => new StudentInCreditClassIoRecord
                                      {
                                          StudentCode = r.StudentCode,
                                          FirstName = r.Student.FirstName,
                                          LastName = r.Student.LastName,
                                          ClassCode = r.Student.ClassCode,
                                          Gender = GenderExtensions.FromBoolean(r.Student.Gender ?? false),
                                      })
                                      .OrderBy(s => new { s.FirstName, s.LastName })
                                      .ToList()
                              }).FirstOrDefaultAsync(cancellationToken) ??
                          throw new ResourceNotFoundException("Không tìm thấy lớp tín chỉ để tạo báo cáo");

        var tempStream = await writer.WriteToFileAsync(
            new MemoryOptimizedStream(FileMode.Create, FileAccess.ReadWrite, FileShare.Read), creditClass,
            cancellationToken);

        return tempStream;
    }
}