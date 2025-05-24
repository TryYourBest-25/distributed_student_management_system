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
[Route("api/v{version:apiVersion}/[controller]")]
[ApiController]
public partial class ClassesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClassesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllClasses(GridifyQuery gridifyQuery, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DefaultClassQuery(gridifyQuery), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClassById(string id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ClassByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass(ClassBasicRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateClassCommand(
            request.ClassName,
            request.ClassCode,
            request.AcademicYearCode
        );
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClass(string id, ClassBasicRequest request,
        CancellationToken cancellationToken)
    {
        // TODO: Cần cân nhắc có nên cập nhật lớp
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(string id, CancellationToken cancellationToken)
    {
        var command = new DeleteClassByIdCommand(id);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("ids")]
    public async Task<IActionResult> DeleteClassByIds(IList<string> ids, CancellationToken cancellationToken)
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