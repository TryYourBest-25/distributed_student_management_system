using System;

namespace FacultyService.Api;

public class FacultyConstraint : IRouteConstraint
{
    private readonly string _facultyCode;

    public FacultyConstraint(IConfiguration configuration)
    {
        _facultyCode = configuration["Tenant"]?.ToLower() ??
                       throw new InvalidOperationException("Default tenant not found");
    }

    public bool Match(HttpContext? httpContext, IRouter? route, string routeKey, RouteValueDictionary values,
        RouteDirection routeDirection)
    {
        if (routeKey != "facultyCode")
        {
            return false;
        }

        var facultyCode = values[routeKey]?.ToString()?.ToLower();
        return facultyCode == _facultyCode;
    }
}