using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Http;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Command;

public record CreateStudentsCommand(IFormFile File, ClassCode ClassCode) : IRequest<int>;