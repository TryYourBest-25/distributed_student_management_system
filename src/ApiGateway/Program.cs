using System.Security.Claims;
using System.Text.Json;
using ApiGateway;
using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});


builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var keycloakSettings = builder.Configuration.GetSection("KeyCloak");
        options.Authority = keycloakSettings["Authority"];
        options.Audience = keycloakSettings["Audience"];
        options.RequireHttpsMetadata = bool.Parse(keycloakSettings["RequireHttpsMetadata"] ?? "false");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = "preferred_username",
        };
    });

builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true,
    reloadOnChange: true);

builder.Services.AddMultiTenant<AppTenantInfo>().WithConfigurationStore();
builder.Services.AddAuthorization();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
app.UseHttpsRedirection();

app.UseMultiTenant();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/tenants", async (HttpContext context) =>
{
    var user = context.User;
    if (user?.Identity?.IsAuthenticated != true)
    {
        return Results.Unauthorized();
    }

    var realmAccessClaim = user.FindFirstValue("realm_access");
    if (string.IsNullOrEmpty(realmAccessClaim))
    {
        return Results.Forbid();
    }

    try
    {
        using var realmAccessDoc = JsonDocument.Parse(realmAccessClaim);
        if (realmAccessDoc.RootElement.TryGetProperty("roles", out var rolesElement))
        {
            var roles = rolesElement.EnumerateArray().Select(r => r.GetString()).ToHashSet();

            if (roles.Contains("PGV"))
            {
                var tenantStore = context.RequestServices.GetRequiredService<IMultiTenantStore<AppTenantInfo>>();
                var allTenants = await tenantStore.GetAllAsync();
                return Results.Ok(allTenants);
            }

            if (roles.Contains("KHOA"))
            {
                var facultyClaim = user.FindFirstValue("faculty");
                if (!string.IsNullOrEmpty(facultyClaim))
                {
                    var tenantStore = context.RequestServices.GetRequiredService<IMultiTenantStore<AppTenantInfo>>();
                    var tenant = await tenantStore.TryGetByIdentifierAsync(facultyClaim);
                    return tenant != null
                        ? Results.Ok(new[] { tenant })
                        : Results.NotFound($"Tenant '{facultyClaim}' not found.");
                }
            }
        }
    }
    catch (JsonException)
    {
        return Results.BadRequest("Invalid realm_access claim format.");
    }

    return Results.Forbid();
}).RequireAuthorization();


await app.UseOcelot();


app.Run();