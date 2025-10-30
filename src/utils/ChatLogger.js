const fs = require('fs');
const path = require('path');

class ChatLogger {
    constructor() {
        this.logFile = path.join(__dirname, '../data/chat.json');
        this.initializeLogFile();
    }

    // Inicializar el archivo de logs si no existe
    initializeLogFile() {
        try {
            if (!fs.existsSync(this.logFile)) {
                const initialData = {
                    logs: [],
                    metadata: {
                        created: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        totalLogs: 0
                    }
                };
                fs.writeFileSync(this.logFile, JSON.stringify(initialData, null, 2));
            }
        } catch (error) {
            console.error('Error inicializando archivo de logs:', error);
        }
    }

    // Agregar un log
    addLog(type, message, data = null) {
        try {
            const logEntry = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                timestampReadable: new Date().toLocaleString('es-ES'),
                type: type, // 'connection', 'disconnection', 'user_joined', 'user_left', 'chat_message', 'product_added', 'product_deleted'
                message: message,
                data: data
            };

            // Leer el archivo actual
            const fileContent = fs.readFileSync(this.logFile, 'utf8');
            const logData = JSON.parse(fileContent);

            // Agregar el nuevo log
            logData.logs.push(logEntry);
            logData.metadata.lastUpdated = new Date().toISOString();
            logData.metadata.totalLogs = logData.logs.length;

            // Mantener solo los últimos 1000 logs para evitar que el archivo crezca demasiado
            if (logData.logs.length > 1000) {
                logData.logs = logData.logs.slice(-1000);
                logData.metadata.totalLogs = logData.logs.length;
            }

            // Escribir de vuelta al archivo
            fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));

            // También mostrar en consola
            console.log(`[${logEntry.timestampReadable}] ${message}`, data ? data : '');

        } catch (error) {
            console.error('Error guardando log:', error);
        }
    }

    // Obtener logs recientes
    getRecentLogs(limit = 50) {
        try {
            const fileContent = fs.readFileSync(this.logFile, 'utf8');
            const logData = JSON.parse(fileContent);
            return logData.logs.slice(-limit);
        } catch (error) {
            console.error('Error leyendo logs:', error);
            return [];
        }
    }

    // Limpiar logs antiguos (mantener solo los últimos N)
    cleanOldLogs(keepCount = 500) {
        try {
            const fileContent = fs.readFileSync(this.logFile, 'utf8');
            const logData = JSON.parse(fileContent);

            if (logData.logs.length > keepCount) {
                logData.logs = logData.logs.slice(-keepCount);
                logData.metadata.lastUpdated = new Date().toISOString();
                logData.metadata.totalLogs = logData.logs.length;

                fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
                console.log(`Logs limpiados. Manteniendo últimos ${keepCount} logs.`);
            }
        } catch (error) {
            console.error('Error limpiando logs:', error);
        }
    }
}

module.exports = ChatLogger;
