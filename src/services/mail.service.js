const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Recuperación de contraseña",
    html: `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Restablecer Contraseña
      </a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendPurchaseConfirmation = async (email, ticket) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: `Confirmación de compra - Ticket #${ticket.code}`,
    html: `
      <h1>¡Gracias por tu compra!</h1>
      <p>Tu pedido ha sido procesado correctamente.</p>
      <h2>Detalles del pedido:</h2>
      <p><strong>Código de ticket:</strong> ${ticket.code}</p>
      <p><strong>Fecha:</strong> ${new Date(
        ticket.purchase_datetime
      ).toLocaleString()}</p>
      <p><strong>Total:</strong> $${ticket.amount.toFixed(2)}</p>
      <h3>Productos:</h3>
      <ul>
        ${ticket.products
          .map((p) => `<li>${p.title} x${p.quantity} - $${p.price}</li>`)
          .join("")}
      </ul>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendPurchaseConfirmation,
};
