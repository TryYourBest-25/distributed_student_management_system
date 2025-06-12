using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Gridify;
using FacultyService.Application.Students.Query;
using FacultyService.Api.Students.Request;
using FacultyService.Application.Students.Command;
using Shared.Domain.ValueObject;
using Shared.Exception;
using FacultyService.Application.Registrations.Command;

namespace FacultyService.Api.Students.Controller;

[Route("api/v{version:apiVersion}/{facultyCode:facultyCode}/creditclasses/{creditClassId}/students")]
[ApiVersion("1.0")]
[ApiController]
public class StudentsInCreditClassController : ControllerBase
{
    private readonly IMediator _mediator;

    public StudentsInCreditClassController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStudents([FromRoute] int creditClassId,
        [FromQuery] GridifyQuery gridifyQuery, CancellationToken cancellationToken)
    {
        var result =
            await _mediator.Send(new StudentInCreditClassQuery(gridifyQuery, creditClassId), cancellationToken);
        return Ok(result);
    }

    [HttpPut("{studentCode}")]
    public async Task<IActionResult> CreateStudent([FromRoute] int creditClassId, [FromRoute] string studentCode,
        [FromQuery] bool isCancelled, CancellationToken cancellationToken)
    {
        var result =
            await _mediator.Send(
                new StudentRegisterCreditClassCommand(creditClassId, new StudentCode(studentCode), isCancelled),
                cancellationToken);
        return Ok(result);
    }
}