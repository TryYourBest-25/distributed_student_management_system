using AcademicService.Api.Faculty.Request;
using AcademicService.Application.Faculty.Query;
using AcademicService.Application.Faculty.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;

namespace AcademicService.Api.Faculty.Controller;

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
    public async Task<ActionResult<IPagedList<FacultyResponse>>> GetAllFaculties(
        [FromQuery] OrderableParamRequest pageableParamRequest,
        CancellationToken cancellationToken = default)
    {
        var query = new DefaultFacultyQuery(
            pageableParamRequest.OrderBy,
            pageableParamRequest.Desc,
            pageableParamRequest.Page,
            pageableParamRequest.Size);
        
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{facultyCode}")]
    [ProducesResponseType(typeof(FacultyResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FacultyResponse>> GetFacultyById([FromRoute] string facultyCode,
        CancellationToken cancellationToken)
    {
        var query = new FacultyByIdQuery(facultyCode);
        var result = await _mediator.Send(query, cancellationToken);
        return result != null ? Ok(result) : NotFound($"Không tìm thấy khoa với mã {facultyCode}");
    }

    [HttpGet("search/")]
    public async Task<ActionResult<Paging<FacultyResponse>>> SearchFaculties(
        [FromQuery] GridifyQuery gridifyQuery,
        CancellationToken cancellationToken = default)
    {
        var query = new SearchFacultyQuery(gridifyQuery);
        
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
} 