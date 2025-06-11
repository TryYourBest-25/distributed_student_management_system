using Shared.Exception;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using FacultyService.Application;
using Finbuckle.MultiTenant;
using MediatR;
using Serilog;
using Shared.Logging;
using Asp.Versioning;
using FacultyItService.Infrastructure;
using FacultyItService.Infrastructure.FactoryHelper;
using FacultyService.Api;
using FacultyService.Domain;
using Finbuckle.MultiTenant.Abstractions;
using FacultyService.Domain.Port;
using FacultyItService.Infrastructure.Generator;
using FacultyItService.Infrastructure.Port;
using FacultyService.Domain.Generator;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>(cf =>
    {
        cf.RegisterModule(new MediatRModule(typeof(Program).Assembly,
            typeof(FacultyDbContext).Assembly));
        cf.RegisterGeneric(typeof(MediatRLoggingBehavior<,>)).As(typeof(IPipelineBehavior<,>))
            .InstancePerLifetimeScope();
        cf.RegisterType<StudentPort>().As<IStudentPort>().InstancePerLifetimeScope();
        cf.RegisterType<StudentIdGenerator>().As<IStudentIdGenerator>().InstancePerLifetimeScope();
        cf.RegisterType<StudentAccountPort>().As<IStudentAccountPort>().InstancePerLifetimeScope();
        cf.RegisterType<KeycloakClientFactory>();
    }).UseSerilog((context, provider, configuration) =>
    {
        configuration.ReadFrom.Configuration(context.Configuration);
    });

builder.Services.Configure<RouteOptions>(options =>
    {
        options.LowercaseUrls = true;
        options.LowercaseQueryStrings = true;
        options.ConstraintMap.Add("facultyCode", typeof(FacultyConstraint));
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
    .WithStaticStrategy(builder.Configuration["Tenant"] ??
                        throw new InvalidOperationException("Tenant is missing.")).WithConfigurationStore();

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
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient();

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.ReportApiVersions = true;
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new QueryStringApiVersionReader("api-version"),
        new HeaderApiVersionReader("X-API-Version")
    );
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});


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

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseExceptionHandler();

app.UseMultiTenant();

app.MapControllers();

app.UseCors();


app.Run();