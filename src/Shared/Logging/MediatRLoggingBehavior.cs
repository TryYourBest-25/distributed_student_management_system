using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using Serilog.Context;

namespace Shared.Logging
{
    // Sử dụng ILogger từ Microsoft.Extensions.Logging vì nó là interface chuẩn
    public class MediatRLoggingBehavior<TRequest, TResponse>(
        ILogger<MediatRLoggingBehavior<TRequest, TResponse>> logger)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse> // Đảm bảo TRequest là một MediatR request
    {
        public async Task<TResponse> Handle(TRequest? request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            var requestId = Guid.NewGuid().ToString();

            using (LogContext.PushProperty("RequestId", requestId))
            using (LogContext.PushProperty("RequestName", requestName))
            using (LogContext.PushProperty("RequestType", typeof(TRequest).FullName))
            {
                logger.LogInformation("Processing request {RequestName} with data {@Request}",
                    requestName, SanitizeRequest(request));

                var stopwatch = Stopwatch.StartNew();
                try
                {
                    var response = await next(cancellationToken);
                    stopwatch.Stop();

                    logger.LogInformation("Request {RequestName} processed successfully in {ElapsedMilliseconds}ms",
                        requestName, stopwatch.ElapsedMilliseconds);

                    return response;
                }
                catch (System.Exception ex)
                {
                    stopwatch.Stop();
                    logger.LogError(ex, "Error processing request {RequestName} after {ElapsedMilliseconds}ms",
                        requestName, stopwatch.ElapsedMilliseconds);
                    throw;
                }
            }
        }

        private static object? SanitizeRequest(TRequest? request)
        {
            if (request is null){
                return null;
            }

            try
            {
                // For simple request objects, just return them directly

                // Create a sanitized version with sensitive data masked
                var type = request.GetType();
                var properties = type.GetProperties();
                var sanitizedProperties = new Dictionary<string, object>();
        
                foreach (var prop in properties)
                {
                    var propName = prop.Name;
                    var value = prop.GetValue(request);
            
                    // Mask sensitive data based on property name
                    if (MediatRLoggingBehavior<TRequest, TResponse>.IsSensitiveProperty(propName.ToLowerInvariant()))
                    {
                        sanitizedProperties[propName] = "***REDACTED***";
                    }
                    else
                    {
                        sanitizedProperties[propName] = value ?? "null";
                    }
                }
        
                return sanitizedProperties;
            }
            catch
            {
                // If anything goes wrong, return a simple representation
                return $"{{ Type: {typeof(TRequest).Name} }}";
            }
        }

        private static bool IsSensitiveProperty(string propertyName)
        {
            if (string.IsNullOrEmpty(propertyName))
                return false;
        
            return propertyName.Contains("password") || 
                   propertyName.Contains("secret") || 
                   propertyName.Contains("token") || 
                   propertyName.Contains("key") ||
                   propertyName.Contains("credential") || 
                   propertyName.Contains("ssn") ||
                   propertyName.Contains("creditcard") ||
                   propertyName.Contains("authorization");
        }
    }
}