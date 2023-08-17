import nodemailer from "nodemailer";

const emailRegistro = async datos => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

    const {email, nombre, token} = datos;
    
    const info = await transport.sendMail({
        from: 'APV - Administrador de Pacientes de Veterinaria',
        to: email,
        subject: 'Comprueba tu cuenta en APV',
        text: 'Comprueba tu cuenta en APV',
        html: `<p>Hola: ${nombre} </p>
               <p>Tu cuenta está casi lista, solo comprueba en este sig. enlace: 
               <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Comprueba tu cuenta</a></p>
               
               <p>Si tu no creaste una cuenta, puedes ignorar el mensaje</p>`
    });

    console.log('Mensaje enviado: %s', info.messageId);
}

export default emailRegistro;