const ticketDAO = require("../dao/ticket.dao");
const { v4: uuidv4 } = require("uuid");

class TicketRepository {
  async createTicket(purchaserEmail, amount, products) {
    const ticketData = {
      code: uuidv4(),
      purchase_datetime: new Date(),
      amount,
      purchaser: purchaserEmail,
      products,
    };
    return await ticketDAO.create(ticketData);
  }

  async getTicketById(id) {
    return await ticketDAO.findById(id);
  }

  async getTicketByCode(code) {
    return await ticketDAO.findByCode(code);
  }

  async getTicketsByUser(email) {
    return await ticketDAO.findByPurchaser(email);
  }

  async getAllTickets() {
    return await ticketDAO.findAll();
  }
}

module.exports = new TicketRepository();
