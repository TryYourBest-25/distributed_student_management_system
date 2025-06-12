using Finbuckle.MultiTenant.Abstractions;

namespace FacultyService.Domain;

public class AppTenantInfo : ITenantInfo
{
    public string? Id { get; set; }
    public string? Identifier { get; set; }
    public string? Name { get; set; }
    public LocationInfo? Location { get; set; }
}

public class LocationInfo
{
    public string Public { get; set; }
    public string Private { get; set; }
}