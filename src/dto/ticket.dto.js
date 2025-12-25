class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = Number(ticket.amount).toFixed(2);
    this.purchaser = ticket.purchaser;
    this.products = ticket.products.map((p) => ({
      ...p,
      price: Number(p.price).toFixed(2),
      subtotal: Number(p.price * p.quantity).toFixed(2),
    }));
  }

  static fromTicket(ticket) {
    return new TicketDTO(ticket);
  }
}

module.exports = TicketDTO;
