using Finbuckle.MultiTenant.Abstractions;

namespace ApiGateway;

public record class AppTenantInfo : ITenantInfo
{
    public string? Id { get; set; }
    public string? Identifier { get; set; }
    public string? Name { get; set; }
    public Location? Location { get; set; }
}

public record Location
{
    public string? Public { get; set; }
}