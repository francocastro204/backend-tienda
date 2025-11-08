import { engine } from 'express-handlebars';

/**
 * Configuración de Handlebars
 * @param {Object} app - Instancia de Express
 */
export const configureHandlebars = (app) => {
    app.engine("hbs", engine({
        extname: 'hbs',
        layoutsDir: './src/views/layouts',
        defaultLayout: 'main'
    }));

    app.set('view engine', 'hbs');
    app.set('views', './src/views');
};

