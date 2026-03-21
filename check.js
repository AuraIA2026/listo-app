import fs from 'fs';

const html = fs.readFileSync('C:\\Users\\13900K\\Documents\\GitHub\\listopatron\\index.html', 'utf8');

console.log('Total characters:', html.length);

const navEndIndex = html.indexOf('</nav>');
if (navEndIndex > -1) {
  console.log('</nav> found at:', navEndIndex);
} else {
  console.log('</nav> NOT FOUND! Checking "<nav":', html.includes('<nav'));
}

const footerStartIndex = html.indexOf('<footer');
if (footerStartIndex > -1) {
  console.log('<footer found at:', footerStartIndex);
} else {
  console.log('<footer NOT FOUND!');
}

console.log('</body> found:', html.includes('</body>'));

// Let's also create the final file directly from here if found
if (navEndIndex > -1 && footerStartIndex > -1) {
  const headAndNav = html.substring(0, navEndIndex + 6);
  const footerAndEnd = html.substring(footerStartIndex);
  
  const privacyContent = `
<section style="padding: 120px 5% 60px; min-height: 80vh; background: #FFF3EC;">
  <div class="section-inner" style="max-width: 800px; background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
    <h1 style="font-family: 'Fredoka One', cursive; color: var(--orange); margin-bottom: 24px;">Política de Privacidad</h1>
    <p style="color: var(--gray); margin-bottom: 24px;"><strong>Última actualización:</strong> 20 de Marzo, 2026</p>
    
    <p style="color: var(--gray); margin-bottom: 16px; line-height: 1.7;">Gracias por usar Listo Patrón. Al utilizar nuestra aplicación o nuestra plataforma web, aceptas la recolección y uso de información bajo las siguientes directrices. Si tienes dudas, puedes comunicarte con nosotros directamente.</p>

    <h2 style="font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--black); margin-top: 30px; margin-bottom: 12px;">1. Información que recopilamos</h2>
    <p style="color: var(--gray); margin-bottom: 16px; line-height: 1.7;">Listo Patrón recopila los siguientes datos para garantizar el correcto funcionamiento de nuestra plataforma de conexión entre clientes y profesionales:</p>
    <ul style="color: var(--gray); margin-bottom: 16px; line-height: 1.7; padding-left: 20px;">
        <li><strong>Información de contacto:</strong> Nombre, apellidos, número de teléfono y correo electrónico al registrarte.</li>
        <li><strong>Ubicación Geográfica:</strong> Recopilamos datos de geolocalización en tiempo real para conectar eficientemente a los clientes con los profesionales más cercanos y ofrecer seguimiento del servicio ("en camino").</li>
        <li><strong>Imágenes y Archivos multimedia:</strong> Acceso a la cámara y galería fotográfica de forma transitoria para que puedas colocar una foto de perfil y enviar fotografías del problema/reparación en los chats de los contratos.</li>
    </ul>

    <h2 style="font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--black); margin-top: 30px; margin-bottom: 12px;">2. Cómo utilizamos tu información</h2>
    <p style="color: var(--gray); margin-bottom: 16px; line-height: 1.7;">Toda la información recolectada se utiliza estrictamente para ofrecer y mejorar la app:</p>
    <ul style="color: var(--gray); margin-bottom: 16px; line-height: 1.7; padding-left: 20px;">
        <li>Agilizar el contacto directo entre quien solicita un servicio y el profesional verificado.</li>
        <li>Generar contratos y órdenes precisas (tipo de servicio, dirección, precio).</li>
        <li>Intermediar las comunicaciones mediante notificaciones y mensajes en tiempo real.</li>
        <li>Brindar soporte al cliente y prevenir fraudes.</li>
    </ul>

    <h2 style="font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--black); margin-top: 30px; margin-bottom: 12px;">3. Compartir datos con terceros</h2>
    <p style="color: var(--gray); margin-bottom: 16px; line-height: 1.7;">No vendemos ni alquilamos tus datos a terceros con fines publicitarios. La información compartida es estrictamente funcional e intermediaria. El profesional asignado a tu orden puede ver tu nombre de pila, foto y ubicación exacta (y tú las suyas) para concluir la visita a domicilio.</p>

    <h2 style="font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--black); margin-top: 30px; margin-bottom: 12px;">4. Retención y Eliminación de Datos de Usuario</h2>
    <p style="color: var(--gray); margin-bottom: 16px; line-height: 1.7;">Como usuario de Listo Patrón, conservas el control absoluto de tu información personal. Entendemos tu derecho al olvido y hemos agilizado el proceso al máximo para eliminar tu historial de nuestra plataforma.</p>
    <div style="background: var(--orange-pale); border-left: 4px solid var(--orange); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p style="color: var(--black); font-weight: 700; margin-bottom: 8px;">Mecanismos para solicitar la eliminación de tu cuenta:</p>
        <ol style="color: var(--gray); margin-bottom: 0; line-height: 1.7; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Borrado automático desde la propia app:</strong> Inicia sesión, dirígete al botón hamburguesa (menú izquierdo) > entra a tu "Perfil", baja hasta el final de las configuraciones y presiona el botón "Eliminar Cuenta". Los datos y chats se borrarán instantáneamente.</li>
            <li><strong>Borrado manual por Soporte:</strong> Si no tienes acceso a la app, envíanos un correo directamente a <strong>soporte@listopatron.com.do</strong> solicitando la eliminación de cuenta e indica el número de teléfono con el cual estabas inscrito. Procesaremos y borraremos tu perfil en menos de 3 días laborables.</li>
        </ol>
    </div>
    
    <h2 style="font-family: 'Fredoka One', cursive; font-size: 22px; color: var(--black); margin-top: 30px; margin-bottom: 12px;">5. Seguridad de la información</h2>
    <p style="color: var(--gray); margin-bottom: 16px; line-height: 1.7;">Diseñamos nuestros sistemas con arquitecturas basadas en Cloud (Firebase) lo cual encripta a nivel de transporte todas las consultas, mensajes e ingresos de sesión.</p>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #efefef;">
        <p style="color: var(--gray); font-size: 14px;">Para dudas referentes a nuestra Política de Privacidad, escríbenos a <strong>soporte@listopatron.com.do</strong></p>
    </div>
  </div>
</section>
  `;

  const newHtml = headAndNav + privacyContent + footerAndEnd;
  const targetPath = 'C:\\Users\\13900K\\Documents\\GitHub\\listopatron\\privacidad.html';
  fs.writeFileSync(targetPath, newHtml);
  console.log('Success! Created:', targetPath);
}

