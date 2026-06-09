using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize(Roles = "Customer")]
[Tags("Wishlist")]
public sealed class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _wishlistService.GetWishlistAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddWishlistItemRequest request, CancellationToken cancellationToken)
    {
        var result = await _wishlistService.AddItemAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تمت إضافة المنتج إلى المفضلة"));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id, CancellationToken cancellationToken)
    {
        await _wishlistService.DeleteItemAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف العنصر من المفضلة"));
    }
}
