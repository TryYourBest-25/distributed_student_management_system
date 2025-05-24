using FacultyService.Application.CreditClasses.IoDto;
using FacultyService.Application.CreditClasses.Query;
using MediatR;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.FileHelper;
using Shared.Infra.StreamHelper;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class ExportStudentScoreInCreditClassQueryHandler(
    FacultyDbContext dbContext,
    IWritingToFile<ExportStudentScoreInCreditClassIoRecord> writer)
    : IRequestHandler<ExportStudentScoreInCreditClassQuery, Stream>


{
    public async Task<Stream> Handle(ExportStudentScoreInCreditClassQuery request, CancellationToken cancellationToken)
    {
        var students = await dbContext.CreditClasses
            .Where(c => c.AcademicYear == request.AcademicYearCode && c.Semester == request.Semester &&
                        c.CourseCode == request.CourseCode && c.GroupNumber == request.GroupNumber)
            .Select(c => new ExportStudentScoreInCreditClassIoRecord
            {
                AcademicYearCode = c.AcademicYear,
                Semester = c.Semester,
                CourseName = c.CourseCodeNavigation.CourseName,
                CreditClassId = c.CreditClassId,
                GroupNumber = c.GroupNumber,
                Students = c.Registrations.Select(r => new StudentScoreInCreditClassIoRecord
                {
                    StudentCode = r.StudentCode,
                    FirstName = r.Student.FirstName,
                    LastName = r.Student.LastName,
                    Scores = new Scores(r.AttendanceScore, r.MidtermScore, r.FinalScore)
                }).ToList()
            }).FirstOrDefaultAsync(cancellationToken) ?? throw new ResourceNotFoundException(
            $"Không tìm thấy lớp học nào với mã {request.CourseCode} và nhóm {request.GroupNumber} trong học kỳ {request.Semester} năm học {request.AcademicYearCode}.");

        var tempStream = await writer.WriteToFileAsync(
            new MemoryOptimizedStream(FileMode.Create, FileAccess.ReadWrite, FileShare.Read), students,
            cancellationToken);

        return tempStream;
    }
}