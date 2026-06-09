using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/products")]
[Tags("Products")]
public sealed class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IReviewService _reviewService;

    public ProductsController(IProductService productService, IReviewService reviewService)
    {
        _productService = productService;
        _reviewService = reviewService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetProducts([FromQuery] ProductQuery query, CancellationToken cancellationToken)
    {
        var result = await _productService.GetProductsAsync(query, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("most-ordered")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMostOrdered([FromQuery] int limit = 4, CancellationToken cancellationToken = default)
    {
        var result = await _productService.GetMostOrderedAsync(limit, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProduct(Guid id, CancellationToken cancellationToken)
    {
        var result = await _productService.GetProductByIdAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("by-slug/{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await _productService.GetProductBySlugAsync(slug, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] ProductSearchQuery query, CancellationToken cancellationToken)
    {
        var result = await _productService.SearchProductsAsync(query, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("{id:guid}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _reviewService.GetProductReviewsAsync(id, page, pageSize, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost("{id:guid}/reviews")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateReview(Guid id, CreateReviewRequest request, CancellationToken cancellationToken)
    {
        var result = await _reviewService.CreateAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إرسال التقييم"));
    }
}
