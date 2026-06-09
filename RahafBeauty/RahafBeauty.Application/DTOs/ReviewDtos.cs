namespace RahafBeauty.Application.DTOs;

public sealed record CreateReviewRequest(int Rating, string? Comment, Guid? OrderId);

public sealed record ReviewDto(
    Guid Id,
    Guid ProductId,
    Guid UserId,
    string CustomerName,
    int Rating,
    string? Comment,
    DateTime CreatedAt);
