using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Tags("Settings")]
public sealed class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet("api/admin/settings")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminSettings(CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetAdminSettingsAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPut("api/admin/settings")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStoreSettings(StoreSettingsRequest request, CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateStoreSettingsAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث إعدادات المتجر"));
    }

    [HttpGet("api/announcement")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAnnouncement(CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetAnnouncementAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPut("api/admin/announcement")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAnnouncement(AnnouncementRequest request, CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateAnnouncementAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث الإعلان"));
    }
}
