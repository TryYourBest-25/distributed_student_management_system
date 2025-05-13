using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using System;
using System.Reflection;
using Elastic.CommonSchema.Serilog;
using Elastic.Ingest.Elasticsearch;
using Elastic.Ingest.Elasticsearch.DataStreams;
using Elastic.Serilog.Sinks;
using Serilog.Sinks.SystemConsole.Themes;

namespace Shared.Logging
{
    public static class LoggingConfiguration
    {
        public static IHostBuilder ConfigureSharedLogging(this IHostBuilder hostBuilder, string service)
        {
            hostBuilder.UseSerilog((context, services, configuration) =>
            {
                var assembly = Assembly.GetExecutingAssembly();
                var version = assembly.GetName().Version?.ToString() ?? "unknown";

                configuration
                    .Enrich.FromLogContext()
                    .Enrich.WithExceptionDetails()
                    .Enrich.WithMachineName()
                    .Enrich.WithProperty("Version", version)
                    .Enrich.WithProperty("Application", service)
                    .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName)
                    .WriteTo.Console(
                        outputTemplate:
                        "[{Timestamp:HH:mm:ss} {Level:u3}] [{Application}] {Message:lj}{NewLine}{Properties:j}{NewLine}{Exception}",
                        theme: AnsiConsoleTheme.Sixteen)
                    .WriteTo.File(
                        $"{context.Configuration.GetValue<string>("Logging:FilePath")}/{assembly.GetName().Name}.log",
                        rollingInterval: RollingInterval.Day,
                        outputTemplate:
                        "[{Timestamp:HH:mm:ss} {Level:u3}] [{Application}] {Message:lj}{NewLine}{Properties:j}{NewLine}{Exception}"
                    );
                
                var elasticsearchUrl = context.Configuration.GetValue<string>("Elasticsearch:Url");
                if (!string.IsNullOrEmpty(elasticsearchUrl))
                {
                    configuration.WriteTo.Elasticsearch([new Uri(elasticsearchUrl)],
                        configureOptions: options =>
                        {
                            options.DataStream = new DataStreamName("logs");
                            options.BootstrapMethod = BootstrapMethod.Failure;
                        });
                }
            });

            return hostBuilder;
        }
    }
}