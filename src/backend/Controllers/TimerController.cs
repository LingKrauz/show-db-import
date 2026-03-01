using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimerController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { utcTime = DateTime.UtcNow.ToString("o") });
    }
}
