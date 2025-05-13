using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Shared.Exception;

namespace AcademicService.Api.Exception;

public class ExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, System.Exception exception, CancellationToken cancellationToken)
    {
        var problemDetails = exception switch{
            BadInputException => new ProblemDetails{
                Title = "Dữ liệu không hợp lệ",
                Detail = exception.Message,
                Status = StatusCodes.Status400BadRequest,
                Type = "about:blank",
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            },
            ResourceNotFoundException => new ProblemDetails{
                Title = "Không tìm thấy",
                Detail = exception.Message,
                Status = StatusCodes.Status404NotFound,
                Type = "about:blank",
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            },
            DuplicateException => new ProblemDetails{
                Title = "Dữ liệu trùng lặp",
                Detail = exception.Message,
                Status = StatusCodes.Status400BadRequest,
                Type = "about:blank",
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            },
            _ => new ProblemDetails{
                Title = "Lỗi không xác định",
                Detail = exception.Message,
                Status = StatusCodes.Status500InternalServerError,
                Type = "about:blank",
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}",
            }
        };
        
        var contentType = "application/problem+json";

        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(problemDetails, JsonSerializerOptions.Default, contentType, cancellationToken: cancellationToken);  

        return true;
    }
}