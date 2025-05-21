using Shared.Exception;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using FacultyService.Application;
using FacultyService.Domain.Aggregate;
using Finbuckle.MultiTenant;
using MediatR;
using Serilog;
using Shared.Logging;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>(cf =>
    {
        cf.RegisterModule(new ApplicationModule());
        cf.RegisterGeneric(typeof(MediatRLoggingBehavior<,>)).As(typeof(IPipelineBehavior<,>))
            .InstancePerLifetimeScope();
    }).UseSerilog((context, provider, configuration) =>
    {
        configuration.ReadFrom.Configuration(context.Configuration);
    });

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
}).AddProblemDetails()
    .AddExceptionHandler<ExceptionHandler>()
    .AddOpenApiDocument()
    .AddDbContext<FacultyDbContext>()
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddMultiTenant<AppTenantInfo>()
    .WithConfigurationStore()
    .WithStaticStrategy(builder.Configuration["Tenants:Default"] ??
                        throw new InvalidOperationException("Tenant is missing."));
builder.Services.AddGrpc(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Configuration.SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.shared.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.shared.{builder.Environment.EnvironmentName}.json", optional: true,
        reloadOnChange: true)
    .AddJsonFile($"tenants.{builder.Environment.EnvironmentName}.json", optional: true,
        reloadOnChange: true)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>();



var app = builder.Build();

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestPath", httpContext.Request.Path);
        diagnosticContext.Set("RequestMethod", httpContext.Request.Method);
        diagnosticContext.Set("RequestQueryString", httpContext.Request.QueryString);
        diagnosticContext.Set("RequestBody", httpContext.Request.Body);
        diagnosticContext.Set("RequestHeaders", httpContext.Request.Headers);
        diagnosticContext.Set("RequestHost", httpContext.Request.Host);
    };
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi();
    app.UseDeveloperExceptionPage();
    Serilog.Debugging.SelfLog.Enable(Console.Error);
}

app.UseHttpsRedirection();

app.UseExceptionHandler();

app.UseMultiTenant();

app.MapControllers();


app.Run();