import { validationResult} from 'express-validator'
import {Precio, Categoria} from '../models/index.js'

const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina : 'Mis propiedades',
        loggedIn: true
    })
}

// Formulario para crear una nueva propiedad
const crear = async (req, res) => {
    // Consultar modelo de precio y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    res.render('propiedades/crear', {
        pagina : 'Crear propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

// Guardar datos del formulario de crear
const guardar = async(req, res) => {

    // Validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){
        // Consultar modelo de precio y categorias
        const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    return res.render('propiedades/crear', {
        pagina : 'Crear propiedad',
        barra: true,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        errores: resultado.array(),
        datos : req.body
    })
    }

    // Crear un registro
    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId} = req.body
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion, 
            habitaciones, 
            estacionamiento, 
            wc, 
            calle, 
            lat, 
            lng
        })
    } catch (error){
        console.log(error)
    }
}

export {admin, crear, guardar}