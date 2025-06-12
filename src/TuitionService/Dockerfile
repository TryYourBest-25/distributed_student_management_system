# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /source

# Copy csproj files and restore as distinct layers to leverage caching
COPY TuitionService/TuitionService.Api/*.csproj ./TuitionService.Api/
COPY TuitionService/TuitionService.Application/*.csproj ./TuitionService.Application/
COPY TuitionService/TuitionService.Domain/*.csproj ./TuitionService.Domain/
COPY TuitionService/TuitionService.Infrastructure/*.csproj ./TuitionService.Infrastructure/
COPY Shared/*.csproj ./Shared/

# Clear NuGet cache and restore Shared project first
RUN dotnet nuget locals all --clear
RUN dotnet restore "./Shared/Shared.csproj" --disable-parallel --no-cache

# Restore each project individually
RUN dotnet restore "./TuitionService.Api/TuitionService.Api.csproj" --disable-parallel --no-cache

# Copy everything else and build app
COPY TuitionService/ ./TuitionService/
COPY Shared/ ./Shared/
WORKDIR /source/TuitionService/TuitionService.Api

# Copy Docker-specific appsettings
COPY TuitionService/TuitionService.Api/appsettings.Docker.json ./appsettings.Docker.json

# Build and publish
RUN dotnet publish -c Release -o /app/publish --verbosity normal

# Stage 2: Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose default ASP.NET Core ports for .NET 9
EXPOSE 8080
EXPOSE 8081

# Define the entry point
ENTRYPOINT ["dotnet", "TuitionService.Api.dll"] 