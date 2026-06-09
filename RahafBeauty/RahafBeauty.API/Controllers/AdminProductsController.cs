using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
[Tags("Admin Products")]
public sealed class AdminProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWebHostEnvironment _environment;

    public AdminProductsController(IProductService productService, IWebHostEnvironment environment)
    {
        _productService = productService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ProductQuery query, CancellationToken cancellationToken)
    {
        var result = await _productService.GetAdminProductsAsync(query, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProductRequest request, CancellationToken cancellationToken)
    {
        var result = await _productService.CreateProductAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إنشاء المنتج"));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, ProductRequest request, CancellationToken cancellationToken)
    {
        var result = await _productService.UpdateProductAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث المنتج"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _productService.DeleteProductAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تعطيل المنتج"));
    }

    [HttpPost("{id:guid}/images")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AddImage(
        Guid id,
        [FromForm] ProductImageUploadRequest request,
        CancellationToken cancellationToken)
    {
        var imageUrl = await SaveUploadAsync(id, request.File, "images", cancellationToken);
        var result = await _productService.AddImageAsync(
            id,
            new ProductImageRequest(imageUrl, request.AltText, request.SortOrder),
            cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تمت إضافة الصورة"));
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        await _productService.DeleteImageAsync(id, imageId, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف الصورة"));
    }

    [HttpPost("{id:guid}/video")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AddVideo(
        Guid id,
        [FromForm] ProductVideoUploadRequest request,
        CancellationToken cancellationToken)
    {
        var videoUrl = await SaveUploadAsync(id, request.File, "videos", cancellationToken);
        var result = await _productService.AddVideoAsync(
            id,
            new ProductVideoRequest(videoUrl, request.SortOrder),
            cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تمت إضافة الفيديو"));
    }

    [HttpDelete("{id:guid}/video/{videoId:guid}")]
    public async Task<IActionResult> DeleteVideo(Guid id, Guid videoId, CancellationToken cancellationToken)
    {
        await _productService.DeleteVideoAsync(id, videoId, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم حذف الفيديو"));
    }

    private async Task<string> SaveUploadAsync(
        Guid productId,
        IFormFile? file,
        string mediaFolder,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            throw new BadHttpRequestException("الملف مطلوب");
        }

        if (mediaFolder == "images" && !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadHttpRequestException("يجب رفع ملف صورة صالح");
        }

        if (mediaFolder == "videos" && !file.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadHttpRequestException("يجب رفع ملف فيديو صالح");
        }

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var uploadFolder = Path.Combine(webRoot, "uploads", "products", productId.ToString("N"), mediaFolder);
        Directory.CreateDirectory(uploadFolder);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadFolder, fileName);

        await using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream, cancellationToken);

        return $"/uploads/products/{productId:N}/{mediaFolder}/{fileName}";
    }
}

public sealed record ProductImageUploadRequest(IFormFile File, string? AltText, int? SortOrder);

public sealed record ProductVideoUploadRequest(IFormFile File, int? SortOrder);
