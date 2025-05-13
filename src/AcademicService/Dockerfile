# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /source

# Copy csproj and restore as distinct layers to leverage caching
COPY *.sln .
COPY AcademicService.Api/*.csproj ./AcademicService.Api/
COPY AcademicService.Application/*.csproj ./AcademicService.Application/
COPY AcademicService.Domain/*.csproj ./AcademicService.Domain/
COPY AcademicService.Infrastructure/*.csproj ./AcademicService.Infrastructure/
# TODO: Thêm các dòng COPY *.csproj khác nếu có thêm project

RUN dotnet restore "AcademicService.sln"

# Copy everything else and build app
COPY . .
WORKDIR /source/AcademicService.Api
# Ensure the output path matches the copy destination in the next stage
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose default ASP.NET Core ports for .NET 8+
# Kestrel defaults to port 8080 (HTTP) and 8081 (HTTPS) if available
EXPOSE 8080
EXPOSE 8081

# Define the entry point
ENTRYPOINT ["dotnet", "AcademicService.Api.dll"] 