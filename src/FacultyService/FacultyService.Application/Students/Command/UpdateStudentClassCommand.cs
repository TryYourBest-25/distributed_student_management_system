using FacultyService.Application.Students.Response;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Command;

public record UpdateStudentClassCommand(StudentCode StudentCode, ClassCode ClassCode, FacultyCode FacultyCode)
    : IRequest<StudentBasicResponse>;