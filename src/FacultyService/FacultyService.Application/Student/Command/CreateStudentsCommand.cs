using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace FacultyService.Application.Student.Command;

public record CreateStudentsCommand(IFormFile File, ClassCode ClassCode) : IRequest<Result<int>>;