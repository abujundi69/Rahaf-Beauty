using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Roles = "Customer")]
[Tags("Cart")]
public sealed class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _cartService.GetCartAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemRequest request, CancellationToken cancellationToken)
    {
        var result = await _cartService.AddItemAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تمت إضافة المنتج إلى السلة"));
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemRequest request, CancellationToken cancellationToken)
    {
        var result = await _cartService.UpdateItemAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث السلة"));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id, CancellationToken cancellationToken)
    {
        await _cartService.DeleteItemAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف العنصر من السلة"));
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken cancellationToken)
    {
        await _cartService.ClearAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تفريغ السلة"));
    }
}
