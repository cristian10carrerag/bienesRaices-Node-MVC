
const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina : 'Mis propiedades',
        loggedIn: true
    })
}

// Formulario para crear una nueva propiedad
const crear = (req, res) => {
    res.render('propiedades/crear', {
        pagina : 'Crear propiedad',
        loggedIn: true
    })
}

export {admin, crear}