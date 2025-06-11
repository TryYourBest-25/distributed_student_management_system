using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Gridify;
using FacultyService.Application.Students.Query;
using FacultyService.Api.Students.Request;
using FacultyService.Application.Students.Command;
using Shared.Domain.ValueObject;
using Shared.Exception;
using FacultyService.Api.Students.Controller;

namespace FacultyService.Api.Students.Controller
{
    [Route("api/v{version:apiVersion}/{facultyCode}/classes/{classCode}/students")]
    [ApiVersion("1.0")]
    [ApiController]
    public class StudentsInClassController : ControllerBase
    {
        private readonly IMediator _mediator;

        public StudentsInClassController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudents([FromRoute] string classCode,
            [FromQuery] GridifyQuery gridifyQuery, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new StudentInClassQuery(gridifyQuery, new ClassCode(classCode)),
                cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStudent([FromRoute] string classCode,
            [FromBody] StudentBasicRequest request, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new CreateStudentCommand(request.FirstName, request.LastName, classCode,
                    GenderExtensions.FromBoolean(request.Gender),
                    DateOnly.ParseExact(
                        request.BirthDate ?? throw new BadInputException($"Ngày sinh phải đúng định dạng dd/MM/yyyy"),
                        "dd/MM/yyyy"), request.Address, request.IsSuspended), cancellationToken);
            return Ok(result);
        }


        [HttpGet("search")]
        public async Task<IActionResult> SearchStudents(GridifyQuery gridifyQuery, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SearchStudentQuery(gridifyQuery), cancellationToken);
            return Ok(result);
        }
    }
}