namespace RahafBeauty.Application.DTOs;

public sealed record BrandRequest(
    string Name,
    string? Slug,
    string? Description,
    string? ImageUrl,
    bool? IsActive);

public sealed record BrandDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    bool IsActive);

public sealed record CategoryRequest(
    string Name,
    string? Slug,
    string? Description,
    string? ImageUrl,
    bool? IsActive);

public sealed record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    bool IsActive);
