// Importar los módulos necesarios
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el middleware para procesar solicitudes JSON de cuerpo completo
app.use(express.json({ limit: '10mb' })); // Aumentar el límite si se espera recibir HTML grande

/**
 * Ruta para convertir HTML en PDF
 * Endpoint: POST /generate-pdf
 * Body: { "html": "<html><body>Contenido</body></html>" }
 */
app.post('/generate-pdf', async (req, res) => {
    try {
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'El cuerpo de la solicitud debe contener el campo "html".' });
        }

        // Lanzar el navegador de Puppeteer
        // Lanzar el navegador de Puppeteer
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Establecer el contenido de la página
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // // Generar el PDF a partir del contenido de la página
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Incluir fondo en el PDF
        });

        fs.writeFileSync('documento.pdf', pdfBuffer); // guardar el archivo en el servidor

        await browser.close();

        // Establecer la respuesta con el PDF generado
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="documento.pdf"'
        });

        // res.send(pdfBuffer);
        res.end(pdfBuffer);


    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ error: 'Ocurrió un error al generar el PDF.' });
    }
});

// Definir el puerto en el que escuchará la API
const PORT = process.env.PORT || 3000;

// Iniciar la aplicación
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
