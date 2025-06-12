using System;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Classes.Command;

public record DeleteClassByIdCommand(ClassCode ClassCode) : IRequest<ClassCode>;