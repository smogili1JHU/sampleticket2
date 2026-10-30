using SupportTicketApp.Server.Models;
using Microsoft.AspNetCore.Mvc;

namespace SupportTicketApp.Server.Controllers
{
    [ApiController]
    [Route("api/ticketcategories")]
    public class TicketCategoryController : ControllerBase
    {
        [HttpGet]
        public ActionResult<IEnumerable<TicketCategory>> Get() => Ok(CategoryStore.All);
    }
}