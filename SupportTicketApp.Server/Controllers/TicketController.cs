using Microsoft.AspNetCore.Mvc;
using SupportTicketApp.Server.Models;
using System.Net.Sockets;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SupportTicketApp.Server.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    public class TicketController : ControllerBase
    {
        private static readonly List<Ticket> Tickets = new();
        private static readonly object Gate = new();
        private static int _nextId = 1;

        // GET /api/tickets -> 200, list of tickets, newest first
        [HttpGet]
        public ActionResult<IEnumerable<Ticket>> GetAll()
        {
            lock (Gate)
            {
                var newestFirst = Tickets
                    .OrderByDescending(t => t.CreatedAt)
                    .ThenByDescending(t => t.Id)
                    .ToList();
                return Ok(newestFirst);
            }
        }

        [HttpPost]
        public IActionResult Create(CreateTicketRequest request)
        {
            var category = CategoryStore.All.FirstOrDefault(c => c.Id == request.CategoryId);
            if (category is null)
                ModelState.AddModelError(nameof(request.CategoryId), "Choose a valid category.");

            // One day of slack so users in time zones ahead of UTC aren't rejected for "today"
            if (request.DueDate is { } due &&
                due < DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)))
                ModelState.AddModelError(nameof(request.DueDate), "Due date cannot be in the past.");

            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            Ticket ticket;
            lock (Gate)
            {
                ticket = new Ticket(
                    _nextId++,
                    request.Name.Trim(),
                    request.Email.Trim(),
                    category!.Id,
                    category.Name,
                    request.Priority,
                    request.Description.Trim(),
                    request.DueDate,
                    DateTimeOffset.UtcNow);
                Tickets.Add(ticket);
            }
            return Ok(ticket);
        }
    }
}
