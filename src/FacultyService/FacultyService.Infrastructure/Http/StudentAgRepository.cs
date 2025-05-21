using System.Net.Http.Json;
using FacultyService.Application.Student.Response;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.Repository;
using FacultyService.Domain.ValueObject;
using Finbuckle.MultiTenant.Abstractions;
using FluentResults;
using Shared.Domain.ValueObject;

namespace FacultyItService.Infrastructure.Http;

public class StudentAgRepository(
    HttpClient httpClient,
    IStudentAgRepository studentAgRepository,
    IMultiTenantStore<AppTenantInfo> tenantStore) : IStudentAgRepository
{
    public async Task<Result<StudentAg>> CreateStudentAsync(StudentAg studentAg)
    {
        // Lookup tenant information using student's faculty code
        var tenant = await tenantStore.TryGetAsync(studentAg.Id.FacultyCode);
        if (tenant is null)
        {
            return Result.Fail<StudentAg>($"Không tìm thấy server của khoa {studentAg.Id.FacultyCode}");
        }

        // Get API endpoint from tenant configuration
        var facultyApiEndpoint = tenant.Location.Private;
        var studentApiUrl = $"{facultyApiEndpoint}/api/v1/students";

        // Send student data to faculty's API
        var response = await httpClient.PostAsJsonAsync(studentApiUrl, studentAg);

        if (!response.IsSuccessStatusCode)
        {
            return Result.Fail<StudentAg>(
                $"Không thể chuyển sinh viên {studentAg.FullName} đến server của khoa {studentAg.Id.FacultyCode}. " +
                $"Status code: {response.StatusCode}");
        }

        // Parse response data
        var studentResponse = await response.Content.ReadFromJsonAsync<StudentResponse>();
        if (studentResponse is null)
        {
            return Result.Fail<StudentAg>(
                $"Không nhận được dữ liệu phản hồi từ server của khoa {studentAg.Id.FacultyCode} cho sinh viên {studentAg.FullName}");
        }

        // Map API response to StudentAg domain entity
        var createdStudent = new StudentAg(new StudentId(studentResponse.StudentCode, studentResponse.FacultyCode))
        {
            FirstName = studentResponse.FirstName,
            LastName = studentResponse.LastName,
            Birthdate = studentResponse.BirthDate,
            Address = studentResponse.Address,
            ClassCode = studentResponse.ClassCode
        };

        return Result.Ok(createdStudent);
    }

    public async Task<Result<int>> DeleteStudentAsync(StudentId studentId)
    {
        // Lookup tenant information using student's faculty code
        var tenant = await tenantStore.TryGetAsync(studentId.FacultyCode);
        if (tenant is null)
        {
            return Result.Fail($"Không tìm thấy server của khoa {studentId.FacultyCode}");
        }
        
        // Get API endpoint from tenant configuration
        var facultyApiEndpoint = tenant.Location.Private;
        var studentApiUrl = $"{facultyApiEndpoint}/api/v1/students/{studentId.StudentCode}";
        
        // Send delete request to faculty's API
        var response = await httpClient.DeleteAsync(studentApiUrl);
        
        if (!response.IsSuccessStatusCode)
        {
            return Result.Fail(
                $"Không thể xóa sinh viên {studentId.StudentCode} trên server của khoa {studentId.FacultyCode}. " +
                $"Status code: {response.StatusCode}");
        }
        
        // Parse response data
        var studentResponse = await response.Content.ReadFromJsonAsync<int>();
        
        if (studentResponse == 0)
        {
            return Result.Fail(
                $"Không nhận được dữ liệu phản hồi từ server của khoa {studentId.FacultyCode} cho sinh viên {studentId.StudentCode}");
        }
        
        // Return the number of affected rows
        return Result.Ok(studentResponse);
        throw new NotImplementedException();
    }
}