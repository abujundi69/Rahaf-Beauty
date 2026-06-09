using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/brands")]
[Tags("Brands")]
public sealed class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _brandService.GetActiveAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }
}

[ApiController]
[Route("api/admin/brands")]
[Authorize(Roles = "Admin")]
[Tags("Admin Brands")]
public sealed class AdminBrandsController : ControllerBase
{
    private readonly IBrandService _brandService;
    private readonly IWebHostEnvironment _environment;

    public AdminBrandsController(IBrandService brandService, IWebHostEnvironment environment)
    {
        _brandService = brandService;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _brandService.GetAllAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] BrandFormRequest request, CancellationToken cancellationToken)
    {
        var imageUrl = await ResolveImageUrlAsync(request.Image, request.ImageUrl, cancellationToken);
        var result = await _brandService.CreateAsync(
            new BrandRequest(request.Name, request.Slug, request.Description, imageUrl, request.IsActive),
            cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إنشاء العلامة التجارية"));
    }

    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(Guid id, [FromForm] BrandFormRequest request, CancellationToken cancellationToken)
    {
        var imageUrl = await ResolveImageUrlAsync(request.Image, request.ImageUrl, cancellationToken);
        var result = await _brandService.UpdateAsync(
            id,
            new BrandRequest(request.Name, request.Slug, request.Description, imageUrl, request.IsActive),
            cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث العلامة التجارية"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _brandService.DeleteAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success("تم تعطيل العلامة التجارية"));
    }

    private async Task<string?> ResolveImageUrlAsync(IFormFile? image, string? currentImageUrl, CancellationToken cancellationToken)
    {
        if (image is null || image.Length == 0)
        {
            return string.IsNullOrWhiteSpace(currentImageUrl) ? null : currentImageUrl.Trim();
        }

        if (!image.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadHttpRequestException("يجب رفع ملف صورة صالح");
        }

        var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;
        var uploadFolder = Path.Combine(webRoot, "uploads", "brands");
        Directory.CreateDirectory(uploadFolder);

        var extension = Path.GetExtension(image.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadFolder, fileName);

        await using var stream = System.IO.File.Create(fullPath);
        await image.CopyToAsync(stream, cancellationToken);

        return $"/uploads/brands/{fileName}";
    }
}

public sealed record BrandFormRequest(
    string Name,
    string? Slug,
    string? Description,
    string? ImageUrl,
    bool? IsActive,
    IFormFile? Image);
