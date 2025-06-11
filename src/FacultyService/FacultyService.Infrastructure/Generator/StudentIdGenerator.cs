using System.Collections.Immutable;
using FacultyService.Application;
using FacultyService.Domain.Generator;
using FacultyService.Domain.ValueObject;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;


namespace FacultyItService.Infrastructure.Generator;

public class StudentIdGenerator(FacultyDbContext facultyDbContext) : IStudentIdGenerator
{
    public async ValueTask<StudentCode> Generate(ClassCode classCode)
    {
        var lastStudentCode = await facultyDbContext.Students
            .Where(s => s.ClassCode == classCode.Value)
            .OrderByDescending(s => s.StudentCode)
            .Select(s => new StudentCode(s.StudentCode).Increment())
            .FirstOrDefaultAsync() ?? StudentCode.Of(classCode, 1);

        return lastStudentCode;
    }

    public IImmutableList<StudentCode> Generate(ClassCode classCode, int count)
    {
        var studentIds = new List<StudentCode>(count);
        var lastStudentCode = facultyDbContext.Students
            .Where(s => s.ClassCode == classCode.Value)
            .OrderByDescending(s => s.StudentCode)
            .Select(s => new StudentCode(s.StudentCode).Increment())
            .FirstOrDefault() ?? StudentCode.Of(classCode.AcademicYear, 1);

        for (var i = 0; i < count; i++)
        {
            studentIds.Add(lastStudentCode);
            lastStudentCode = lastStudentCode.Increment();
        }

        return studentIds.ToImmutableList();
    }
}