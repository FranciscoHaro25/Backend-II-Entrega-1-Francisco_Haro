const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Estilos base para todas las plantillas
const emailStyles = {
  container: `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `,
  header: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px;
    text-align: center;
  `,
  headerTitle: `
    color: #ffffff;
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  `,
  body: `
    padding: 30px;
    background-color: #f8f9fa;
  `,
  card: `
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  `,
  button: `
    display: inline-block;
    padding: 14px 28px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 600;
    font-size: 16px;
    text-align: center;
  `,
  footer: `
    background-color: #2d3748;
    padding: 20px;
    text-align: center;
  `,
  footerText: `
    color: #a0aec0;
    font-size: 12px;
    margin: 0;
  `,
};

// ==========================================
// EMAIL DE RECUPERACIÓN DE CONTRASEÑA
// ==========================================
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"E-Commerce" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "🔐 Recuperación de contraseña - E-Commerce",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #edf2f7;">
        <div style="${emailStyles.container}">
          <!-- Header -->
          <div style="${emailStyles.header}">
            <h1 style="${emailStyles.headerTitle}">🔐 Recuperar Contraseña</h1>
          </div>
          
          <!-- Body -->
          <div style="${emailStyles.body}">
            <div style="${emailStyles.card}">
              <h2 style="color: #2d3748; margin-top: 0;">Hola,</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>E-Commerce</strong>.
              </p>
              <p style="color: #4a5568; line-height: 1.6;">
                Si realizaste esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="${emailStyles.button}">
                  Restablecer Contraseña
                </a>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>.
                </p>
              </div>
            </div>
            
            <div style="${emailStyles.card}">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña seguirá siendo la misma.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="${emailStyles.footer}">
            <p style="${emailStyles.footerText}">
              © ${new Date().getFullYear()} E-Commerce. Todos los derechos reservados.
            </p>
            <p style="${emailStyles.footerText}">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// ==========================================
// EMAIL DE CONFIRMACIÓN DE COMPRA
// ==========================================
const sendPurchaseConfirmation = async (email, ticket) => {
  const formattedDate = new Date(ticket.purchase_datetime).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const productsHtml = ticket.products
    .map(
      (p) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #2d3748;">${p.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #4a5568;">
          ${p.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #4a5568;">
          $${p.price.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #2d3748; font-weight: 600;">
          $${(p.price * p.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const mailOptions = {
    from: `"E-Commerce" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `✅ Compra confirmada - Ticket #${ticket.code
      .slice(0, 8)
      .toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #edf2f7;">
        <div style="${emailStyles.container}">
          <!-- Header -->
          <div style="${emailStyles.header}">
            <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
            <h1 style="${emailStyles.headerTitle}">¡Compra Exitosa!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
              Gracias por tu compra
            </p>
          </div>
          
          <!-- Body -->
          <div style="${emailStyles.body}">
            <!-- Ticket Info -->
            <div style="${emailStyles.card}">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;">
                    <p style="color: #718096; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Número de Ticket</p>
                    <p style="color: #2d3748; font-size: 20px; font-weight: 700; margin: 8px 0 0 0;">
                      #${ticket.code.slice(0, 8).toUpperCase()}
                    </p>
                  </td>
                  <td style="padding: 10px 0; vertical-align: top; text-align: right;">
                    <p style="color: #718096; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Fecha</p>
                    <p style="color: #2d3748; font-size: 14px; font-weight: 500; margin: 8px 0 0 0;">
                      ${formattedDate}
                    </p>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Products Table -->
            <div style="${emailStyles.card}">
              <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px;">
                📦 Detalle de productos
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f7fafc;">
                    <th style="padding: 12px; text-align: left; color: #4a5568; font-size: 12px; text-transform: uppercase;">Producto</th>
                    <th style="padding: 12px; text-align: center; color: #4a5568; font-size: 12px; text-transform: uppercase;">Cant.</th>
                    <th style="padding: 12px; text-align: right; color: #4a5568; font-size: 12px; text-transform: uppercase;">Precio</th>
                    <th style="padding: 12px; text-align: right; color: #4a5568; font-size: 12px; text-transform: uppercase;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>
              
              <!-- Total -->
              <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; vertical-align: middle;">
                      <span style="color: #2d3748; font-size: 18px; font-weight: 600;">Total pagado:</span>
                    </td>
                    <td style="padding: 8px 0; vertical-align: middle; text-align: right;">
                      <span style="color: #48bb78; font-size: 28px; font-weight: 700;">$${ticket.amount.toFixed(
                        2
                      )}</span>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <!-- Info Box -->
            <div style="background-color: #ebf8ff; border-left: 4px solid #4299e1; padding: 15px; border-radius: 4px;">
              <p style="color: #2b6cb0; margin: 0; font-size: 14px;">
                <strong>💡 Tip:</strong> Guarda este correo como comprobante de tu compra.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="${emailStyles.footer}">
            <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0;">
              ¿Tienes alguna pregunta? Contáctanos
            </p>
            <p style="${emailStyles.footerText}">
              © ${new Date().getFullYear()} E-Commerce. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// ==========================================
// EMAIL DE BIENVENIDA (NUEVO)
// ==========================================
const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: `"E-Commerce" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🎉 ¡Bienvenido a E-Commerce, ${firstName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #edf2f7;">
        <div style="${emailStyles.container}">
          <!-- Header -->
          <div style="${emailStyles.header}">
            <div style="font-size: 50px; margin-bottom: 10px;">🎉</div>
            <h1 style="${emailStyles.headerTitle}">¡Bienvenido!</h1>
          </div>
          
          <!-- Body -->
          <div style="${emailStyles.body}">
            <div style="${emailStyles.card}">
              <h2 style="color: #2d3748; margin-top: 0;">Hola ${firstName},</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                ¡Gracias por registrarte en <strong>E-Commerce</strong>! Estamos emocionados de tenerte con nosotros.
              </p>
              <p style="color: #4a5568; line-height: 1.6;">
                Ahora puedes disfrutar de:
              </p>
              <ul style="color: #4a5568; line-height: 2;">
                <li>🛒 Agregar productos a tu carrito</li>
                <li>💳 Realizar compras de forma segura</li>
                <li>📦 Seguimiento de tus pedidos</li>
                <li>⭐ Ofertas exclusivas para miembros</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL}/products" style="${
      emailStyles.button
    }">
                  Explorar Productos
                </a>
              </div>
            </div>
            
            <div style="${emailStyles.card}">
              <h3 style="color: #2d3748; margin-top: 0;">📧 Datos de tu cuenta</h3>
              <p style="color: #4a5568; margin: 0;">
                <strong>Email:</strong> ${email}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="${emailStyles.footer}">
            <p style="${emailStyles.footerText}">
              © ${new Date().getFullYear()} E-Commerce. Todos los derechos reservados.
            </p>
            <p style="${emailStyles.footerText}">
              Si no creaste esta cuenta, por favor ignora este correo.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// ==========================================
// ALERTA DE STOCK BAJO (NUEVO)
// ==========================================
const sendLowStockAlert = async (adminEmail, products) => {
  const productsHtml = products
    .map(
      (p) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #2d3748;">${p.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <span style="background-color: ${
            p.stock <= 5 ? "#fed7d7" : "#fef3c7"
          }; color: ${
        p.stock <= 5 ? "#c53030" : "#92400e"
      }; padding: 4px 12px; border-radius: 20px; font-weight: 600;">
            ${p.stock} unidades
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #4a5568;">
          $${p.price.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const mailOptions = {
    from: `"E-Commerce Sistema" <${process.env.MAIL_USER}>`,
    to: adminEmail,
    subject: `⚠️ Alerta: ${products.length} producto(s) con stock bajo`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #edf2f7;">
        <div style="${emailStyles.container}">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f56565 0%, #c53030 100%); padding: 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 10px;">⚠️</div>
            <h1 style="${emailStyles.headerTitle}">Alerta de Stock Bajo</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">
              Algunos productos necesitan reabastecimiento
            </p>
          </div>
          
          <!-- Body -->
          <div style="${emailStyles.body}">
            <div style="${emailStyles.card}">
              <h3 style="color: #2d3748; margin-top: 0;">
                📦 Productos con stock bajo (≤ 10 unidades)
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f7fafc;">
                    <th style="padding: 12px; text-align: left; color: #4a5568; font-size: 12px; text-transform: uppercase;">Producto</th>
                    <th style="padding: 12px; text-align: center; color: #4a5568; font-size: 12px; text-transform: uppercase;">Stock</th>
                    <th style="padding: 12px; text-align: right; color: #4a5568; font-size: 12px; text-transform: uppercase;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>
            </div>
            
            <div style="background-color: #fed7d7; border-left: 4px solid #c53030; padding: 15px; border-radius: 4px;">
              <p style="color: #c53030; margin: 0; font-size: 14px;">
                <strong>🔴 Acción requerida:</strong> Por favor, considera reabastecer estos productos pronto para evitar pérdida de ventas.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.BASE_URL}/products" style="${
      emailStyles.button
    }">
                Ir al Panel de Productos
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="${emailStyles.footer}">
            <p style="${emailStyles.footerText}">
              Este es un correo automático del sistema de inventario.
            </p>
            <p style="${emailStyles.footerText}">
              © ${new Date().getFullYear()} E-Commerce. Sistema de Administración.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
  sendPurchaseConfirmation,
  sendWelcomeEmail,
  sendLowStockAlert,
};
