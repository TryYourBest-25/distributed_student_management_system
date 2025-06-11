using System;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Gridify;
using FacultyService.Application.Classes.Query;
using FacultyService.Api.Classes.Request;
using FacultyService.Application.Classes.Command;
using Shared.Domain.ValueObject;

namespace FacultyService.Api.Classes.Controller;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/{facultyCode:facultyCode}/[controller]")]
[ApiController]
public partial class ClassesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClassesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllClasses([FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DefaultClassQuery(gridifyQuery), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClassById([FromRoute] string id, [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ClassByIdQuery(new ClassCode(id), gridifyQuery), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] ClassBasicRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateClassCommand(
            request.ClassName,
            request.ClassCode,
            request.AcademicYearCode
        );
        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetClassById), new { id = result }, result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(string id, CancellationToken cancellationToken)
    {
        var command = new DeleteClassByIdCommand(id);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("bulk")]
    public async Task<IActionResult> DeleteClassByIds([FromBody] List<string> ids, CancellationToken cancellationToken)
    {
        var command = new DeleteClassByIdsCommand([.. ids.Select(id => new ClassCode(id))]);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchClasses(GridifyQuery gridifyQuery, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new SearchClassQuery(gridifyQuery), cancellationToken);
        return Ok(result);
    }
}