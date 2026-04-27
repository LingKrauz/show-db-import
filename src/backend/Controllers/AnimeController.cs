using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly IAniListService _aniListService;
    private readonly ILogger<AnimeController> _logger;

    public AnimeController(IAniListService aniListService, ILogger<AnimeController> logger)
    {
        _aniListService = aniListService;
        _logger = logger;
    }

    [HttpGet("completed/{username}")]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> GetCompleted(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
            return BadRequest(new { error = "Username cannot be empty" });

        var result = await _aniListService.GetCompletedShowsAsync(username);

        if (!result.IsSuccess)
            return StatusCode(result.StatusCode, new { error = result.ErrorMessage });

        return Ok(result.Data);
    }
}
