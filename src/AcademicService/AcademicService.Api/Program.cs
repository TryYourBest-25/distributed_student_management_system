using System.Text.Json;
using AcademicService.Application;
using AcademicService.Application.DbContext;
using AcademicService.Infrastructure;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Serilog;
using MediatR;
using Shared.Exception;
using Shared.Logging;
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory()).ConfigureContainer<ContainerBuilder>(cf =>
{
    cf.RegisterModule(new MediatRModule(typeof(Program).Assembly,
        typeof(IApplicationMarker).Assembly));

    cf.RegisterGeneric(typeof(MediatRLoggingBehavior<,>)).As(typeof(IPipelineBehavior<,>)).InstancePerLifetimeScope();
}).UseSerilog((context, provider, configuration) => { configuration.ReadFrom.Configuration(context.Configuration); });

builder.Services.Configure<RouteOptions>(options =>
    {
        options.LowercaseUrls = true;
        options.LowercaseQueryStrings = true;
    }).AddProblemDetails().AddExceptionHandler<ExceptionHandler>().AddOpenApiDocument()
    .AddDbContext<AcademicDbContext>()
    .AddControllers().AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new HeaderApiVersionReader("X-Api-Version");
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});


builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    // .AddJsonFile("appsettings.shared.json", optional: true, reloadOnChange: true).AddJsonFile(
    //     $"appsettings.shared.{builder.Environment.EnvironmentName}.json", optional: true,
    //     reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
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
    };
});

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
    app.UseDeveloperExceptionPage();
    Serilog.Debugging.SelfLog.Enable(Console.Error);
}

var logger = new LoggerConfiguration().ReadFrom.Configuration(app.Configuration)
    .CreateLogger();

logger.Information("Starting Academic Service API");
app.UseExceptionHandler();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();
app.MapControllers();

app.Run();