using AcademicService.Api.Lecturer.Request;
using AcademicService.Application.Lecturer.Command;
using AcademicService.Application.Lecturer.Query;
using AcademicService.Application.Lecturer.Response;
using AcademicService.Domain.ValueObject;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FluentResults;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;

namespace AcademicService.Api.Lecturer.Controller;

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
        var command = new CreateLectureCommand{
          LecturerCode  = request.LecturerCode,
           FirstName = request.FirstName,
            LastName = request.LastName,
            Degree = request.Degree,
            AcademicRank = request.AcademicRank,
            Specialization = request.Specialization,
            FacultyCode = request.FacultyCode
        };

        var result = await _mediator.Send(command, cancellationToken);
        
        return result switch
        {
            { IsFailed: true } => BadRequest(result.Errors.ToResult()),
            { IsSuccess: true } => Created(
                Url.Action(nameof(GetLecturerById), new { lecturerCode = command.LecturerCode }),
                result.Value),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPut("{lecturerCode}")]
    public async Task<ActionResult<LecturerCode>> UpdateLecturer(
        string lecturerCode,
        [FromBody] LecturerBasicRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateLectureCommand
        {
            OldLecturerCode = lecturerCode,
            LecturerCode= request.LecturerCode,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Degree= request.Degree,
            AcademicRank = request.AcademicRank,
            Specialization = request.Specialization,
            FacultyCode = request.FacultyCode
        };
        
        var result = await _mediator.Send(command, cancellationToken);
        
        return result switch
        {
            { IsFailed: true } => BadRequest(result.Errors),    
            { IsSuccess: true } => Created(
                Url.Action(nameof(GetLecturerById), new { lecturerCode = command.LecturerCode }),
                result),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpDelete("{lecturerCode}")]
    public async Task<IActionResult> DeleteLecturer(string lecturerCode, CancellationToken cancellationToken)
    {
        var command = new DeleteLecturerByIdCommand(lecturerCode);
        var result = await _mediator.Send(command, cancellationToken);
        return result switch
        {
            { IsFailed: true } => BadRequest(result.Errors.ToResult()),
            { IsSuccess: true } => NoContent(),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
}

public partial class LecturersController
{
    [HttpGet]
    public async Task<ActionResult<IPagedList<LecturerResponse>>> GetAllLecturers(
        [FromQuery] OrderableParamRequest pageableParamRequest,
        CancellationToken cancellationToken = default)
    {
        var query = new DefaultLecturerQuery(
            pageableParamRequest.OrderBy,
            pageableParamRequest.Desc,
            pageableParamRequest.Page,
            pageableParamRequest.Size);
        
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