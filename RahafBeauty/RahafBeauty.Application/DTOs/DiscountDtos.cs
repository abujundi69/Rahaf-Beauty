using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.DTOs;

public sealed record DiscountRequest(
    DiscountType Type,
    Guid? ScopeId,
    decimal Percentage,
    string? Label,
    bool IsEnabled,
    DateTime? StartDate,
    DateTime? EndDate);

public sealed record DiscountDto(
    Guid Id,
    DiscountType Type,
    Guid? ScopeId,
    decimal Percentage,
    string? Label,
    bool IsEnabled,
    DateTime? StartDate,
    DateTime? EndDate);
