using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/account")]
[Authorize(Roles = "Customer")]
[Tags("Customer Account")]
public sealed class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount(CancellationToken cancellationToken)
    {
        await _accountService.DeleteCurrentCustomerAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف الحساب بنجاح"));
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var result = await _accountService.GetProfileAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var result = await _accountService.UpdateProfileAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث الملف الشخصي"));
    }

    [HttpGet("addresses")]
    public async Task<IActionResult> GetAddresses(CancellationToken cancellationToken)
    {
        var result = await _accountService.GetAddressesAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost("addresses")]
    public async Task<IActionResult> CreateAddress(AddressRequest request, CancellationToken cancellationToken)
    {
        var result = await _accountService.CreateAddressAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إضافة العنوان"));
    }

    [HttpPut("addresses/{id:guid}")]
    public async Task<IActionResult> UpdateAddress(Guid id, AddressRequest request, CancellationToken cancellationToken)
    {
        var result = await _accountService.UpdateAddressAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث العنوان"));
    }

    [HttpDelete("addresses/{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id, CancellationToken cancellationToken)
    {
        await _accountService.DeleteAddressAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف العنوان"));
    }

    [HttpPut("addresses/{id:guid}/default")]
    public async Task<IActionResult> SetDefaultAddress(Guid id, CancellationToken cancellationToken)
    {
        var result = await _accountService.SetDefaultAddressAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تعيين العنوان الافتراضي"));
    }

}
