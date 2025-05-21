using FacultyService.Application.Student.Response;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Student.Command;

public record UpdateStudentClassCommand(StudentCode StudentCode,ClassCode ClassCode, FacultyCode FacultyCode) : IRequest<Result<StudentResponse>>
{
    
}