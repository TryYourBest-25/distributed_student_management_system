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
using Shared;
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

builder.Services.AddProblemDetails();

builder.Services.AddExceptionHandler<ExceptionHandler>();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApiDocument();

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

builder.Configuration.AddUserSecrets<Program>();

builder.Configuration.AddJsonFile("appsettings.shared.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.shared.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(MediatRLoggingBehavior<,>));
builder.Services.AddDbContext<AcademicDbContext>();

builder.Host.UseSerilog();

var app = builder.Build();

Log.Logger = new LoggerConfiguration().ReadFrom.Configuration(app.Configuration).CreateLogger();

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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
    app.UseDeveloperExceptionPage();
}

app.UseExceptionHandler();


app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/", () => "Hello World!");

app.Run();