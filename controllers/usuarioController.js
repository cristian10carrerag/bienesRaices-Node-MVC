import {check, validationResult} from 'express-validator'
import { generarId } from '../helpers/tokens.js'
import Usuario from "../models/Usuario.js"

const formularioLogin = (req, res) => {
    res.render('auth/login',{
        pagina : 'Iniciar sesión'
    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro',{
        pagina : 'Crear cuenta'
    })
}

const registrar = async (req, res) =>{
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({min: 8 }).withMessage('El password debe ser de al menos 8 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los passwords no son iguales').run(req)
    
    let resultado = validationResult(req)

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/registro',{
            pagina : 'Crear cuenta',
            errores: resultado.array(),
            usuario:{
                nombre : req.body.nombre,
                email : req.body.email
            }
        })    
    }

    // Extraer los datos
    const {nombre, email, password} = req.body

    // Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne ({where : {email}})
    if(existeUsuario){
       //Errores
       return res.render('auth/registro',{
        pagina : 'Crear cuenta',
        errores: [{msg: 'El usuario ya está registrado'}],
        usuario:{
            nombre : req.body.nombre,
            email : req.body.email
        }
    })    
    }
    
    // Almacenar un usuario
    await Usuario.create({
        nombre, 
        email,
        password,
        token: generarId()
    })

    // Mostrar mensaje de confirmación
    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de confirmación, presiona en el enlace'
    })
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password',{
        pagina : 'Olvidé mi contraseña'
    })
}

export{
    formularioLogin,
    registrar,
    formularioRegistro,
    formularioOlvidePassword
}