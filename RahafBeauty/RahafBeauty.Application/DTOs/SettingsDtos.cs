namespace RahafBeauty.Application.DTOs;

public sealed record StoreSettingsRequest(
    string StoreName,
    string? LogoUrl,
    string? ContactEmail,
    string? Phone,
    string? Address,
    string Currency);

public sealed record StoreSettingsDto(
    Guid Id,
    string StoreName,
    string? LogoUrl,
    string? ContactEmail,
    string? Phone,
    string? Address,
    string Currency);

public sealed record AnnouncementRequest(
    bool IsEnabled,
    string Text,
    string BackgroundColor,
    string TextColor,
    string? LinkText,
    string? LinkUrl,
    DateTime? StartDate,
    DateTime? EndDate);

public sealed record AnnouncementDto(
    Guid Id,
    bool IsEnabled,
    string Text,
    string BackgroundColor,
    string TextColor,
    string? LinkText,
    string? LinkUrl,
    DateTime? StartDate,
    DateTime? EndDate);

public sealed record AdminSettingsDto(StoreSettingsDto StoreSettings, AnnouncementDto Announcement);
