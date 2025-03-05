import {check, validationResult} from 'express-validator'
import { generarId } from '../helpers/tokens.js'
import Usuario from "../models/Usuario.js"
import {emailRegistro} from "../helpers/email.js"

const formularioLogin = (req, res) => {
    res.render('auth/login',{
        pagina : 'Iniciar sesión'
    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro',{
        pagina : 'Crear cuenta',
        csrfToken : req.csrfToken()
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
            csrfToken : req.csrfToken(),
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
        csrfToken : req.csrfToken(),
        errores: [{msg: 'El usuario ya está registrado'}],
        usuario:{
            nombre : req.body.nombre,
            email : req.body.email
        }
    })    
    }
    
    // Almacenar un usuario
    const usuario = await Usuario.create({
        nombre, 
        email,
        password,
        token: generarId()
    })

    // Envia email de confirmación 
    emailRegistro({
        nombre : usuario.nombre,
        email : usuario.email,
        token : usuario.token
    })

    // Mostrar mensaje de confirmación
    res.render('templates/mensaje',{
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de confirmación, presiona en el enlace'
    })
}

//Función que comprueba una cuenta
    const confirmar = async (req, res, next) => {
        const { token } = req.params;

        // Verificar si el token es válido 
        const usuario = await Usuario.findOne({where: {token}})
        
        if (!usuario){
            return res.render('auth/confirmar-cuenta', {
                pagina: 'Error al confirmar tu cuenta',
                mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
                error: true
            })
        }
        // Verificar la cuenta
        usuario.token = null;
        usuario.confirmado = true; 
        await usuario.save();

        res.render('auth/confirmar-cuenta', {
            pagina: 'Cuenta confirmada',
            mensaje: 'La cuenta se confirmó correctamente'
        })

        console.log(usuario)
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
    formularioOlvidePassword, 
    confirmar
}