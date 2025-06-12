using Microsoft.AspNetCore.Mvc;
using MediatR;
using Asp.Versioning;
using FacultyService.Api.Students.Request;
using FacultyService.Application.Students.Command;
using Shared.Domain.ValueObject;
using FacultyService.Application.Students.Query;
using Gridify;

namespace FacultyService.Api.Students.Controller;

[Route("api/v{version:apiVersion}/{facultyCode}/students")]
[ApiVersion("1.0")]
[ApiController]
public class StudentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StudentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("{studentCode}")]
    public async Task<IActionResult> UpdateStudent([FromRoute] string studentCode,
        [FromBody] UpdateStudentRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new UpdateStudentCommand(new StudentCode(studentCode),
                request.NewStudentCode != null ? new StudentCode(request.NewStudentCode) : null, request.FirstName,
                request.LastName,
                request.BirthDate != null ? DateOnly.ParseExact(request.BirthDate, "dd/MM/yyyy") : null,
                GenderExtensions.FromBoolean(request.Gender), request.Address, request.IsSuspended), cancellationToken);
        return Ok(result);
    }


    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteStudents([FromBody] List<string> studentCodes,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteStudentsCommand([.. studentCodes.Select(s => new StudentCode(s))]),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("{studentCode}")]
    public async Task<IActionResult> GetStudent(string studentCode, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new StudentByIdQuery(studentCode), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{studentCode}/registrations")]
    public async Task<IActionResult> GetStudentRegistrations(string studentCode, [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new StudentRegistrationsQuery(new StudentCode(studentCode), gridifyQuery),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchStudents([FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new SearchStudentQuery(gridifyQuery), cancellationToken);
        return Ok(result);
    }
}