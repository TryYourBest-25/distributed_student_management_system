using Asp.Versioning;
using FacultyService.Api.CreditClasses.Request;
using FacultyService.Application.CreditClasses.Command;
using FacultyService.Application.CreditClasses.Query;
using FacultyService.Domain.ValueObject;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Shared.Domain.ValueObject;

namespace FacultyService.Api.CreditClasses.Controller
{
    [Route("api/v{version:apiVersion}/{facultyCode:facultyCode}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public partial class CreditClassesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreditClassesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCreditClasses([FromQuery] GridifyQuery query,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new DefaultCreditClassQuery(query), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCreditClass([FromBody] CreditClassBasicRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreateCreditClassCommand(
                new LecturerCode(request.LecturerCode),
                new CourseCode(request.CourseCode),
                new GroupNumber(request.GroupNumber),
                request.MinStudent,
                new AcademicYearCode(request.AcademicYearCode),
                new Semester(request.Semester)
            ), cancellationToken);
            return Ok(result);
        }

        [HttpPut("{creditClassId}")]
        public async Task<IActionResult> UpdateCreditClass([FromRoute] int creditClassId,
            [FromBody] UpdateCreditClassRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new UpdateCreditClassCommand(
                creditClassId,
                new LecturerCode(request.LecturerCode),
                new CourseCode(request.CourseCode),
                new GroupNumber(request.GroupNumber),
                new Semester(request.Semester),
                request.MinStudent,
                request.IsCancelled,
                new AcademicYearCode(request.AcademicYearCode)
            ), cancellationToken);
            return Ok(result);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCreditClass([FromQuery] GridifyQuery query,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SearchCreditClassQuery(query), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCreditClassById(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreditClassByIdQuery(id), cancellationToken);
            return Ok(result);
        }


        [HttpDelete("{id}/registrations")]
        public async Task<IActionResult> DeleteRegistrationByStudentCodes([FromRoute] int id,
            [FromBody] List<string> studentCodes,
            CancellationToken cancellationToken)
        {
            var result =
                await _mediator.Send(
                    new DeleteRegistrationByStudentCodesCommand(id,
                        studentCodes.Select(e => new StudentCode(e)).ToList()), cancellationToken);
            return Ok(result);
        }

        [HttpDelete("bulk")]
        public async Task<IActionResult> DeleteCreditClass([FromBody] List<int> creditClassIds,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new DeleteCreditClassesCommand(creditClassIds), cancellationToken);
            return Ok(result);
        }
    }
}