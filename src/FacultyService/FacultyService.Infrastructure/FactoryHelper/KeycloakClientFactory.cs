using Keycloak.Net;
using Microsoft.Extensions.Configuration;

namespace FacultyItService.Infrastructure.FactoryHelper;

public class KeycloakClientFactory(IConfiguration configuration)
{
    public KeycloakClient DefaultKeycloakClient()
    {
        var keycloakUrl = configuration["Keycloak:Url"] ??
                          throw new InvalidOperationException("Keycloak URL not configured");
        var userName = configuration["Keycloak:Username"] ??
                       throw new InvalidOperationException("Keycloak UserName not configured");
        var password = configuration["Keycloak:Password"] ??
                       throw new InvalidOperationException("Keycloak Password not configured");

        return new KeycloakClient(keycloakUrl, userName, password, new KeycloakOptions(adminClientId: "admin-cli"));
    }

    public string GetRealmName()
    {
        return configuration["Keycloak:Realm"] ?? throw new InvalidOperationException("Keycloak Realm not configured");
    }
}