# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /source

# Copy csproj and restore as distinct layers to leverage caching
COPY AcademicService/*.sln .
COPY AcademicService/AcademicService.Api/*.csproj ./AcademicService.Api/
COPY AcademicService/AcademicService.Application/*.csproj ./AcademicService.Application/
COPY AcademicService/AcademicService.Domain/*.csproj ./AcademicService.Domain/
COPY AcademicService/AcademicService.Infrastructure/*.csproj ./AcademicService.Infrastructure/
COPY Shared/*.csproj ./Shared/

# Clear NuGet cache and restore Shared project first
RUN dotnet nuget locals all --clear
RUN dotnet restore "./Shared/Shared.csproj" --disable-parallel --no-cache

# Then restore the main solution  
RUN dotnet restore "AcademicService.sln" --disable-parallel --no-cache

# Copy everything else and build app
COPY AcademicService/ ./AcademicService/
COPY Shared/ ./Shared/
WORKDIR /source/AcademicService/AcademicService.Api

# Copy Docker-specific appsettings
COPY AcademicService/AcademicService.Api/appsettings.Docker.json ./appsettings.Docker.json

# Build and publish
RUN dotnet publish -c Release -o /app/publish --verbosity normal

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