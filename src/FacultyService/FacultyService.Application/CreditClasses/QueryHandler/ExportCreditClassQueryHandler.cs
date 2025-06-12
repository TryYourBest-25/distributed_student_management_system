using FacultyService.Application.CreditClasses.IoDto;
using FacultyService.Application.CreditClasses.Query;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.FileHelper;
using Shared.Infra.StreamHelper;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class ExportCreditClassQueryHandler(FacultyDbContext dbContext, IWritingToFile<ExportCreditClassIoRecord> writer)
    : IRequestHandler<ExportCreditClassQuery, Stream>
{
    public async Task<Stream> Handle(ExportCreditClassQuery request, CancellationToken cancellationToken)
    {
        var creditClass = await dbContext.CreditClasses
            .Where(c => c.AcademicYear == request.AcademicYearCode && c.Semester == request.Semester)
            .Select(c => new CreditClassIoRecord
            {
                CourseName = c.CourseCodeNavigation.CourseName,
                FirstNameLecturer = c.LecturerCodeNavigation.FirstName,
                LastNameLecturer = c.LecturerCodeNavigation.LastName,
                GroupNumber = c.GroupNumber,
                MinStudent = (ushort)c.MinStudent,
                TotalStudent = c.Registrations.DistinctBy(r => r.StudentCode).Count(),
            })
            .ToListAsync(cancellationToken);

        var creditClassIoRecord = new ExportCreditClassIoRecord
        {
            FacultyName = dbContext.TenantInfo.Name,
            AcademicYearCode = request.AcademicYearCode,
            Semester = request.Semester,
            CreditClasses = creditClass
        };

        var tempStream = await writer.WriteToFileAsync(
            new MemoryOptimizedStream(FileMode.Create, FileAccess.ReadWrite, FileShare.Read), creditClassIoRecord,
            cancellationToken);

        return tempStream;
    }
}