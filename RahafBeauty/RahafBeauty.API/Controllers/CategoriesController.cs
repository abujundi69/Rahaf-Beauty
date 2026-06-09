using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/categories")]
[Tags("Categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetActiveAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }
}

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin")]
[Tags("Admin Categories")]
public sealed class AdminCategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly IWebHostEnvironment _environment;

    public AdminCategoriesController(ICategoryService categoryService, IWebHostEnvironment environment)
    {
        _categoryService = categoryService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _categoryService.GetAllAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] CategoryFormRequest request, CancellationToken cancellationToken)
    {
        var imageUrl = await ResolveImageUrlAsync(request.Image, request.ImageUrl, cancellationToken);
        var result = await _categoryService.CreateAsync(
            new CategoryRequest(request.Name, request.Slug, request.Description, imageUrl, request.IsActive),
            cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إنشاء التصنيف"));
    }

    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(Guid id, [FromForm] CategoryFormRequest request, CancellationToken cancellationToken)
    {
        var imageUrl = await ResolveImageUrlAsync(request.Image, request.ImageUrl, cancellationToken);
        var result = await _categoryService.UpdateAsync(
            id,
            new CategoryRequest(request.Name, request.Slug, request.Description, imageUrl, request.IsActive),
            cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث التصنيف"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _categoryService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تعطيل التصنيف"));
    }

    private async Task<string?> ResolveImageUrlAsync(IFormFile? image, string? currentImageUrl, CancellationToken cancellationToken)
    {
        if (image is null || image.Length == 0)
        {
            return NormalizeStoredMediaUrl(currentImageUrl);
        }

        if (!image.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadHttpRequestException("يجب رفع ملف صورة صالح");
        }

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;
        var uploadFolder = Path.Combine(webRoot, "uploads", "categories");
        Directory.CreateDirectory(uploadFolder);

        var extension = Path.GetExtension(image.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadFolder, fileName);

        await using var stream = System.IO.File.Create(fullPath);
        await image.CopyToAsync(stream, cancellationToken);

        return $"/uploads/categories/{fileName}";
    }

    private static string? NormalizeStoredMediaUrl(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var trimmed = value.Trim();
        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var uri) &&
            uri.AbsolutePath.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
        {
            return uri.AbsolutePath;
        }

        return trimmed;
    }
}

public sealed record CategoryFormRequest(
    string Name,
    string? Slug,
    string? Description,
    string? ImageUrl,
    bool? IsActive,
    IFormFile? Image);
