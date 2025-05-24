using Asp.Versioning;
using FacultyService.Application.CreditClasses.Command;
using FacultyService.Application.CreditClasses.Query;
using Gridify;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Domain.ValueObject;

namespace FacultyService.Api.CreditClasses.Controller
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public partial class CreditClasses : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreditClasses(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCreditClasses(GridifyQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new DefaultCreditClassQuery(query), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCreditClass(CreateCreditClassCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCreditClass(int id, UpdateCreditClassCommand command,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpGet("/search")]
        public async Task<IActionResult> SearchCreditClass(GridifyQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SearchCreditClassQuery(query), cancellationToken);
            return Ok(result);
        }

        [HttpGet("/{id}")]
        public async Task<IActionResult> GetCreditClassById(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new CreditClassByIdQuery(id), cancellationToken);
            return Ok(result);
        }


        [HttpDelete("{id}/registrations")]
        public async Task<IActionResult> DeleteRegistrationByStudentCodes(int id, List<string> studentCodes,
            CancellationToken cancellationToken)
        {
            var result =
                await _mediator.Send(
                    new DeleteRegistrationByStudentCodesCommand(id,
                        studentCodes.Select(e => new StudentCode(e)).ToList()), cancellationToken);
            return Ok(result);
        }
    }
}