using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Services;

public sealed class SettingsService : ISettingsService
{
    private readonly IApplicationDbContext _db;

    public SettingsService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<AdminSettingsDto> GetAdminSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await GetOrCreateStoreSettingsAsync(cancellationToken);
        var announcement = await GetOrCreateAnnouncementAsync(cancellationToken);
        return new AdminSettingsDto(MapStore(settings), MapAnnouncement(announcement));
    }

    public async Task<StoreSettingsDto> UpdateStoreSettingsAsync(StoreSettingsRequest request, CancellationToken cancellationToken = default)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.StoreName), request.StoreName, "اسم المتجر مطلوب");
        ValidationHelper.Required(fields, nameof(request.Currency), request.Currency, "العملة مطلوبة");
        ValidationHelper.ThrowIfInvalid(fields);

        var settings = await GetOrCreateStoreSettingsAsync(cancellationToken);
        settings.StoreName = request.StoreName.Trim();
        settings.LogoUrl = request.LogoUrl?.Trim();
        settings.ContactEmail = request.ContactEmail?.Trim();
        settings.Phone = request.Phone?.Trim();
        settings.Address = request.Address?.Trim();
        settings.Currency = "ILS";
        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return MapStore(settings);
    }

    public async Task<AnnouncementDto> GetAnnouncementAsync(CancellationToken cancellationToken = default)
    {
        var announcement = await GetOrCreateAnnouncementAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var active = announcement.IsEnabled &&
            (!announcement.StartDate.HasValue || announcement.StartDate <= now) &&
            (!announcement.EndDate.HasValue || announcement.EndDate >= now);

        return active
            ? MapAnnouncement(announcement)
            : MapAnnouncement(announcement) with { IsEnabled = false };
    }

    public async Task<AnnouncementDto> UpdateAnnouncementAsync(AnnouncementRequest request, CancellationToken cancellationToken = default)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.Text), request.Text, "نص الإعلان مطلوب");
        ValidationHelper.HexColor(fields, nameof(request.BackgroundColor), request.BackgroundColor);
        ValidationHelper.HexColor(fields, nameof(request.TextColor), request.TextColor);
        ValidationHelper.DateRange(fields, nameof(request.StartDate), request.StartDate, nameof(request.EndDate), request.EndDate);
        ValidationHelper.ThrowIfInvalid(fields);

        var announcement = await GetOrCreateAnnouncementAsync(cancellationToken);
        announcement.IsEnabled = request.IsEnabled;
        announcement.Text = request.Text.Trim();
        announcement.BackgroundColor = request.BackgroundColor.Trim();
        announcement.TextColor = request.TextColor.Trim();
        announcement.LinkText = request.LinkText?.Trim();
        announcement.LinkUrl = request.LinkUrl?.Trim();
        announcement.StartDate = request.StartDate;
        announcement.EndDate = request.EndDate;
        announcement.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return MapAnnouncement(announcement);
    }

    private async Task<StoreSettings> GetOrCreateStoreSettingsAsync(CancellationToken cancellationToken)
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is not null)
        {
            if (!string.Equals(settings.Currency, "ILS", StringComparison.OrdinalIgnoreCase))
            {
                settings.Currency = "ILS";
                settings.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync(cancellationToken);
            }

            return settings;
        }

        settings = new StoreSettings { StoreName = "RAHAF BEAUTY", Currency = "ILS" };
        _db.StoreSettings.Add(settings);
        await _db.SaveChangesAsync(cancellationToken);
        return settings;
    }

    private async Task<AnnouncementSettings> GetOrCreateAnnouncementAsync(CancellationToken cancellationToken)
    {
        var announcement = await _db.AnnouncementSettings.FirstOrDefaultAsync(cancellationToken);
        if (announcement is not null)
        {
            return announcement;
        }

        announcement = new AnnouncementSettings
        {
            IsEnabled = false,
            Text = "مرحبا بكم في رهف بيوتي",
            BackgroundColor = "#000000",
            TextColor = "#FFFFFF"
        };
        _db.AnnouncementSettings.Add(announcement);
        await _db.SaveChangesAsync(cancellationToken);
        return announcement;
    }

    private static StoreSettingsDto MapStore(StoreSettings settings) =>
        new(settings.Id, settings.StoreName, settings.LogoUrl, settings.ContactEmail, settings.Phone, settings.Address, settings.Currency);

    private static AnnouncementDto MapAnnouncement(AnnouncementSettings announcement) =>
        new(
            announcement.Id,
            announcement.IsEnabled,
            announcement.Text,
            announcement.BackgroundColor,
            announcement.TextColor,
            announcement.LinkText,
            announcement.LinkUrl,
            announcement.StartDate,
            announcement.EndDate);
}
