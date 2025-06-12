using AcademicService.Api.Courses.Request;
using AcademicService.Application.Courses.Command;
using AcademicService.Application.Courses.Query;
using AcademicService.Application.Courses.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FluentResults;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Shared.Domain.ValueObject;

namespace AcademicService.Api.Courses.Controller;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
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

        return Created(
            Url.Action(nameof(GetCourseById), new { courseCode = command.CourseCode }),
            result);
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

        return Ok(result);
    }

    [HttpDelete("{courseCode}")]
    public async Task<IActionResult> DeleteCourse(string courseCode, CancellationToken cancellationToken)
    {
        var command = new DeleteCourseByIdCommand(courseCode);
        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }
}

public partial class CoursesController
{
    [HttpGet]
    public async Task<ActionResult<IPagedList<CourseBasicResponse>>> GetAllCourses(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new DefaultCourseQuery(
            gridifyQuery);

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{courseCode}")]
    [ProducesResponseType(typeof(CourseBasicResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CourseBasicResponse>> GetCourseById([FromRoute] string courseCode,
        CancellationToken cancellationToken)
    {
        var query = new CourseByIdQuery(courseCode);
        var result = await _mediator.Send(query, cancellationToken);
        return result != null ? Ok(result) : NotFound($"Không tìm thấy khóa học với mã {courseCode}");
    }

    [HttpGet("search")]
    public async Task<ActionResult<IPagedList<CourseBasicResponse>>> SearchCourses(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchCourseQuery(gridifyQuery);

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}