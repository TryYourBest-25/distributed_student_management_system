using FacultyService.Domain.Port;
using FacultyService.Domain.Entity;
using FluentResults;
using Shared.Domain.ValueObject;
using Finbuckle.MultiTenant.Abstractions;
using Flurl;
using Flurl.Http;
using FacultyService.Application.Students.Response;
using FacultyService.Domain;

public class StudentPort(IMultiTenantStore<AppTenantInfo> tenantStore) : IStudentPort
{
    public async ValueTask<Result<StudentCode>> CreateStudentAsync(Student student,
        CancellationToken cancellationToken = default)
    {
        var tenant = await tenantStore.TryGetByIdentifierAsync(student.FacultyCode.ToString());
        if (tenant is null)
        {
            return Result.Fail(new Error($"Không tìm thấy server của khoa {student.FacultyCode}"));
        }

        var result = await $"{tenant.Location.Private}".AppendPathSegment("students").PostJsonAsync(new
        {
            first_name = student.FirstName,
            last_name = student.LastName,
            class_code = student.ClassCode,
            gender = student.Gender,
            birth_date = student.BirthDate,
            address = student.Address,
            is_suspended = student.IsSuspended
        }, cancellationToken: cancellationToken).ReceiveJson<StudentCode>();

        if (result is null)
        {
            return Result.Fail(new Error($"Lỗi khi tạo sinh viên {student.StudentCode}"));
        }

        return Result.Ok(result);
    }


    public async ValueTask<Result<int>> DeleteStudentAsync(StudentCode studentCode, FacultyCode facultyCode,
        CancellationToken cancellationToken = default)
    {
        var tenant = await tenantStore.TryGetByIdentifierAsync(facultyCode.ToString());
        if (tenant is null)
        {
            return Result.Fail(new Error($"Không tìm thấy server của khoa {facultyCode}"));
        }

        var result = await $"{tenant.Location.Private}".AppendPathSegment("students")
            .AppendPathSegment(studentCode.Value).DeleteAsync(cancellationToken: cancellationToken).ReceiveJson<int>();

        return Result.Ok(result);
    }

    public async ValueTask<Result<Student>> GetStudentAsync(StudentCode studentCode, FacultyCode facultyCode,
        CancellationToken cancellationToken = default)
    {
        var tenant = await tenantStore.TryGetByIdentifierAsync(facultyCode.ToString());
        if (tenant is null)
        {
            return Result.Fail(new Error($"Không tìm thấy server của khoa {facultyCode}"));
        }

        var result = await $"{tenant.Location.Private}".AppendPathSegment("students")
            .AppendPathSegment(studentCode.Value)
            .GetJsonAsync<StudentBasicResponse>(cancellationToken: cancellationToken);

        if (result is null)
        {
            return Result.Fail(new Error($"Không tìm thấy sinh viên {studentCode}"));
        }

        return Result.Ok(new Student
        {
            StudentCode = result.StudentCode,
            FirstName = result.FirstName,
            LastName = result.LastName,
            ClassCode = result.ClassCode,
            Gender = result.Gender.ToBoolean(),
            BirthDate = result.BirthDate,
            Address = result.Address,
            IsSuspended = result.IsSuspended,
            FacultyCode = result.FacultyCode
        });
    }
}