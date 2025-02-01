// Function to format a timestamp into a readable date
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
}

export const convertDateTimeToReadableFormat = (dateTime) => {
    // Verificar si la entrada es válida
    if (typeof dateTime !== 'string') {
        throw new Error("Invalid input type. Expected a string in 'YYYY-MM-DD HH:MM:SS' format.");
    }

    // Crear un objeto Date a partir de la cadena datetime
    const date = new Date(dateTime);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: "${dateTime}". Please use 'YYYY-MM-DD HH:MM:SS'.`);
    }

    // Función para formatear la fecha en un formato legible
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Cambiar a false si prefieres el formato de 24 horas
    };

    return date.toLocaleString('es-ES', options);
}


// Regular expression to validate email addresses
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Import lodash for utility functions
export const _ = require('lodash');