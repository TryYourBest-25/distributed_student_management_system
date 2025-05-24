using AcademicService.Api.Lecturers.Request;
using AcademicService.Application.Lecturers.Command;
using AcademicService.Application.Lecturers.Query;
using AcademicService.Application.Lecturers.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Domain.ValueObject;

namespace AcademicService.Api.Lecturers.Controller;

[ApiController]
[Route("api/[controller]")]
public partial class LecturersController : ControllerBase
{
    private readonly IMediator _mediator;

    public LecturersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<LecturerCode>> CreateLecturer([FromBody] LecturerBasicRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateLectureCommand(
            request.NewLecturerCode,
            request.FirstName,
            request.LastName,
            request.Degree,
            request.AcademicRank,
            request.Specialization,
            request.FacultyCode
        );

        var result = await _mediator.Send(command, cancellationToken);

        return Created(
            Url.Action(nameof(GetLecturerById), new { lecturerCode = command.LecturerCode }),
            result);
    }

    [HttpPut("{lecturerCode}")]
    public async Task<ActionResult<LecturerCode>> UpdateLecturer(
        string lecturerCode,
        [FromBody] LecturerBasicRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateLectureCommand(
            lecturerCode,
            request.NewLecturerCode,
            request.FirstName,
            request.LastName,
            request.Degree,
            request.AcademicRank,
            request.Specialization,
            request.FacultyCode
        );

        var result = await _mediator.Send(command, cancellationToken);

        return Ok(result);
    }

    [HttpDelete("{lecturerCode}")]
    public async Task<IActionResult> DeleteLecturer(string lecturerCode, CancellationToken cancellationToken)
    {
        var command = new DeleteLecturerByIdCommand(lecturerCode);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }
}

public partial class LecturersController
{
    [HttpGet]
    public async Task<ActionResult<IPagedList<LecturerResponse>>> GetAllLecturers(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new DefaultLecturerQuery(
            gridifyQuery);

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{lecturerCode}")]
    [ProducesResponseType(typeof(LecturerResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<LecturerResponse>> GetLecturerById([FromRoute] string lecturerCode,
        CancellationToken cancellationToken)
    {
        var query = new LecturerByIdQuery(lecturerCode);
        var result = await _mediator.Send(query, cancellationToken);
        return result != null ? Ok(result) : NotFound($"Không tìm thấy giảng viên với mã {lecturerCode}");
    }

    [HttpGet("search/")]
    public async Task<ActionResult<Paging<LecturerResponse>>> SearchLecturers(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchLecturerQuery(gridifyQuery);

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}