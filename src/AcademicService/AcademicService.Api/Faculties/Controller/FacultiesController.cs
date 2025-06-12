using AcademicService.Application.Faculties.Query;
using AcademicService.Application.Faculties.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AcademicService.Api.Faculties.Controller;

[ApiController]
[Route("api/[controller]")]
public class FacultiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public FacultiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IPagedList<FacultyBasicResponse>>> GetAllFaculties(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new DefaultFacultyQuery(
            gridifyQuery);

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{facultyCode}")]
    [ProducesResponseType(typeof(FacultyBasicResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FacultyBasicResponse>> GetFacultyById([FromRoute] string facultyCode,
        CancellationToken cancellationToken)
    {
        var query = new FacultyByIdQuery(facultyCode);
        var result = await _mediator.Send(query, cancellationToken);
        return result != null ? Ok(result) : NotFound($"Không tìm thấy khoa với mã {facultyCode}");
    }

    [HttpGet("search/")]
    public async Task<ActionResult<Paging<FacultyBasicResponse>>> SearchFaculties(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchFacultyQuery(gridifyQuery);

        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}