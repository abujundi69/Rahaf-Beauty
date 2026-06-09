using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/admin/discounts")]
[Authorize(Roles = "Admin")]
[Tags("Admin Discounts")]
public sealed class DiscountsController : ControllerBase
{
    private readonly IDiscountService _discountService;

    public DiscountsController(IDiscountService discountService)
    {
        _discountService = discountService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _discountService.GetAllAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create(DiscountRequest request, CancellationToken cancellationToken)
    {
        var result = await _discountService.CreateAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إنشاء الخصم"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, DiscountRequest request, CancellationToken cancellationToken)
    {
        var result = await _discountService.UpdateAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث الخصم"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _discountService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف الخصم"));
    }
}
