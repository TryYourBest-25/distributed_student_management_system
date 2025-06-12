using System.Net.Http.Json;
using FacultyItService.Infrastructure.FactoryHelper;
using FacultyService.Application.Students.Response;
using FacultyService.Domain;
using FacultyService.Domain.Entity;
using FacultyService.Domain.Port;
using Finbuckle.MultiTenant.Abstractions;
using FluentResults;
using Keycloak.Net;
using Keycloak.Net.Models.Users;
using Microsoft.Extensions.Configuration;
using Shared.Domain.ValueObject;

namespace FacultyItService.Infrastructure.Port;

public class StudentAccountPort(
    HttpClient httpClient,
    KeycloakClientFactory keycloakClientFactory,
    IMultiTenantStore<AppTenantInfo> tenantStore) : IStudentAccountPort
{
    public async ValueTask<Result<Student>> CreateOrUpdateAccountAsync(Student student,
        CancellationToken cancellationToken = default)
    {
        var keycloakClient = keycloakClientFactory.DefaultKeycloakClient();

        // Create or update Keycloak user account
        var existingUser = await keycloakClient.GetUsersAsync(
            keycloakClientFactory.GetRealmName(), email: $"{student.StudentCode.ToLower()}@student.ptithcm.edu.vn",
            cancellationToken: cancellationToken);

        var enumerable = existingUser.ToList();
        if (enumerable.Any())
        {
            var updateUser = enumerable.First();

            updateUser.FirstName = student.FirstName;
            updateUser.LastName = student.LastName;
            updateUser.Email = $"{student.StudentCode.ToLower()}@student.ptithcm.edu.vn";
            updateUser.Enabled = student.IsSuspended;
            updateUser.Attributes = new Dictionary<string, IEnumerable<string>>
            {
                { "faculty", new[] { student.FacultyCode.ToString() } }
            };
            await keycloakClient.UpdateUserAsync(keycloakClientFactory.GetRealmName(), updateUser.Id, updateUser,
                cancellationToken);
        }

        else
        {
            var newUser = new User
            {
                UserName = student.StudentCode.ToString(),
                FirstName = student.FirstName,
                LastName = student.LastName,
                Email = $"{student.StudentCode.ToLower()}@student.ptithcm.edu.vn",
                Enabled = !student.IsSuspended,
                Credentials = new List<Credentials>
                {
                    new()
                    {
                        Type = "password",
                        Value = $"{student.StudentCode}",
                    }
                },
                RealmRoles = ["SV"],
                Attributes = new Dictionary<string, IEnumerable<string>>
                {
                    { "faculty", [student.FacultyCode.ToString()] }
                }
            };
            await keycloakClient.CreateUserAsync(keycloakClientFactory.GetRealmName(), newUser, cancellationToken);
        }

        return Result.Ok(student);
    }

    public async ValueTask<Result<int>> DeleteAccountAsync(StudentCode studentCode,
        CancellationToken cancellationToken = default)
    {
        var keycloakClient = keycloakClientFactory.DefaultKeycloakClient();
        var existingUser = await keycloakClient.GetUsersAsync(
            keycloakClientFactory.GetRealmName(), email: $"{studentCode.Value.ToLower()}@student.ptithcm.edu.vn",
            cancellationToken: cancellationToken);

        var enumerable = existingUser.ToList();
        if (enumerable.Count != 0)
        {
            var updateUser = enumerable.First();
            await keycloakClient.DeleteUserAsync(keycloakClientFactory.GetRealmName(), updateUser.Id,
                cancellationToken);
        }

        return Result.Ok(1);
    }
}