using AcademicService.Api.Course.Request;
using AcademicService.Application.Course.Command;
using AcademicService.Application.Course.Query;
using AcademicService.Application.Course.Response;
using AcademicService.Domain.ValueObject;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FluentResults;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;

namespace AcademicService.Api.Course.Controller;

[ApiController]
[Route("api/[controller]")]
public partial class CoursesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CoursesController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [HttpPost]
    public async Task<ActionResult<CourseCode>> CreateCourse([FromBody] CourseBasicRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateCourseCommand(
           request.CourseCode, 
           request.CourseName,
           request.LectureCredit,
          request.LabCredit
        );

        var result = await _mediator.Send(command, cancellationToken);
        
        return result switch
        {
            { IsFailed: true } => BadRequest(result.Errors.ToResult()),
            { IsSuccess: true } => Created(
                Url.Action(nameof(GetCourseById), new { courseCode = command.CourseCode }),
                result.Value),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPut("{courseCode}")]
    public async Task<ActionResult<CourseCode>> UpdateCourse(
        string courseCode,
        [FromBody] CourseBasicRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateCourseCommand(OldCourseCode: courseCode, 
            CourseCode: request.CourseCode,
            CourseName: request.CourseName,
            LectureCredit: request.LectureCredit,
            LabCredit: request.LabCredit);
        
        var result = await _mediator.Send(command, cancellationToken);
        
        return result switch
        {
            { IsFailed: true } => BadRequest(result.Errors),    
            { IsSuccess: true } => Created(
                Url.Action(nameof(GetCourseById), new { courseCode = command.CourseCode }),
                result),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpDelete("{courseCode}")]
    public async Task<IActionResult> DeleteCourse(string courseCode, CancellationToken cancellationToken)
    {
        var command = new DeleteCourseByIdCommand(courseCode);
        var result = await _mediator.Send(command, cancellationToken);
        return result switch
        {
            { IsFailed: true } => BadRequest(result.Errors.ToResult()),
            { IsSuccess: true } => NoContent(),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
    

    
}

public partial class CoursesController
{
    
    [HttpGet]
    public async Task<ActionResult<IPagedList<CourseResponse>>> GetAllCourses(
        [FromQuery] OrderableParamRequest pageableParamRequest,
        CancellationToken cancellationToken = default)
    {
        var query = new DefaultCourseQuery(
            pageableParamRequest.OrderBy,
            pageableParamRequest.Desc,
            pageableParamRequest.Page,
            pageableParamRequest.Size);
        
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{courseCode}")]
    [ProducesResponseType(typeof(CourseResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CourseResponse>> GetCourseById([FromRoute] string courseCode,
        CancellationToken cancellationToken)
    {
        var query = new CourseByIdQuery(courseCode);
        var result = await _mediator.Send(query, cancellationToken);
        return result != null ? Ok(result) : NotFound($"Không tìm thấy khóa học với mã {courseCode}");
    }

    [HttpGet("search/")]
    public async Task<ActionResult<IPagedList<CourseResponse>>> SearchCourses(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchCourseQuery(gridifyQuery);
        
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}