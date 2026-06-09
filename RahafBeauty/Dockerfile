FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["RahafBeauty.API/RahafBeauty.API.csproj", "RahafBeauty.API/"]
COPY ["RahafBeauty.Application/RahafBeauty.Application.csproj", "RahafBeauty.Application/"]
COPY ["RahafBeauty.Domain/RahafBeauty.Domain.csproj", "RahafBeauty.Domain/"]
COPY ["RahafBeauty.Infrastructure/RahafBeauty.Infrastructure.csproj", "RahafBeauty.Infrastructure/"]

RUN dotnet restore "RahafBeauty.API/RahafBeauty.API.csproj"

COPY . .

RUN dotnet publish "RahafBeauty.API/RahafBeauty.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "RahafBeauty.API.dll"]
