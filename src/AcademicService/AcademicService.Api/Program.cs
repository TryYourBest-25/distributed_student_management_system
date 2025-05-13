using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using AcademicService.Api.Exception;
using AcademicService.Application;
using AcademicService.Application.DbContext;
using AcademicService.Domain;
using AcademicService.Infrastructure;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Serilog;
using MediatR;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using Serilog.Core;
using Serilog.Exceptions;
using Shared.Logging;

var builder = WebApplication.CreateBuilder(args);

// --- Cấu hình Autofac --- 
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(cf =>
{
    cf.RegisterModule(new MediatRModule(typeof(Program).Assembly,
        typeof(IApplicationMarker).Assembly));
});
// --- Cấu hình Serilog --- 
// builder.Host.ConfigureSharedLogging(builder.Environment.ApplicationName);

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
    options.LowercaseQueryStrings = true;
});
builder.Configuration.SetBasePath(AppContext.BaseDirectory);
builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<ExceptionHandler>();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

builder.Services.AddOpenApiDocument();

builder.Configuration.AddUserSecrets<Program>();

builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.shared.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile($"appsettings.shared.{builder.Environment.EnvironmentName}.json", optional: true,
    reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(MediatRLoggingBehavior<,>));
builder.Services.AddDbContext<AcademicDbContext>();

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
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

app.UseExceptionHandler();


app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/", () => "Hello World!");

app.Run();