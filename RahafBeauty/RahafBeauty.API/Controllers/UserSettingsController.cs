using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
[Tags("User Settings")]
public sealed class UserSettingsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public UserSettingsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpPut("update-info")]
    public async Task<IActionResult> UpdateInfo(UpdateUserInfoRequest request, CancellationToken cancellationToken)
    {
        await _accountService.UpdateUserInfoAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تحديث معلوماتك بنجاح"));
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await _accountService.ChangePasswordAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تغيير كلمة المرور بنجاح"));
    }

    [HttpPut("change-email")]
    public async Task<IActionResult> ChangeEmail(ChangeEmailRequest request, CancellationToken cancellationToken)
    {
        await _accountService.ChangeEmailAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تحديث البريد الإلكتروني بنجاح"));
    }
}
