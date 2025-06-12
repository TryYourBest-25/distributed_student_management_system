# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /source

# Copy csproj and restore as distinct layers to leverage caching
COPY ApiGateway/*.csproj ./ApiGateway/

# Clear NuGet cache and restore
RUN dotnet nuget locals all --clear
RUN dotnet restore "./ApiGateway/ApiGateway.csproj" --disable-parallel --no-cache

# Copy everything else and build app
COPY ApiGateway/ ./ApiGateway/
WORKDIR /source/ApiGateway

# Copy Docker-specific appsettings
COPY ApiGateway/appsettings.Docker.json ./appsettings.Docker.json

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
ENTRYPOINT ["dotnet", "ApiGateway.dll"] 