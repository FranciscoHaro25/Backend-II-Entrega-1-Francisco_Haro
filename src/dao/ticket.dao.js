const Ticket = require("../models/Ticket");

class TicketDAO {
  async create(ticketData) {
    const ticket = new Ticket(ticketData);
    return await ticket.save();
  }

  async findById(id) {
    return await Ticket.findById(id);
  }

  async findByCode(code) {
    return await Ticket.findOne({ code });
  }

  async findByPurchaser(email) {
    return await Ticket.find({ purchaser: email }).sort({
      purchase_datetime: -1,
    });
  }

  async findAll() {
    return await Ticket.find({}).sort({ purchase_datetime: -1 });
  }
}

module.exports = new TicketDAO();
