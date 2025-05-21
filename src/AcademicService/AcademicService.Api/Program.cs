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
}).AddProblemDetails().AddExceptionHandler<ExceptionHandler>().AddOpenApiDocument().AddDbContext<AcademicDbContext>().AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
});

builder.Configuration.AddUserSecrets<Program>().AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddJsonFile("appsettings.shared.json", optional: true, reloadOnChange: true).AddJsonFile(
        $"appsettings.shared.{builder.Environment.EnvironmentName}.json", optional: true,
        reloadOnChange: true).AddEnvironmentVariables().SetBasePath(AppContext.BaseDirectory);


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

app.Run();