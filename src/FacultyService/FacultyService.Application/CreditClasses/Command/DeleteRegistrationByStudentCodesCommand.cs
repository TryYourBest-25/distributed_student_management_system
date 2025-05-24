using System;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.Command;

public record DeleteRegistrationByStudentCodesCommand(int CreditClassId, IList<StudentCode> StudentCodes)
    : IRequest<int>;