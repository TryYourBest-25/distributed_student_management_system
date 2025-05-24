using System;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Classes.Command;

public record DeleteClassByIdsCommand(IList<ClassCode> ClassCodes) : IRequest<int>;