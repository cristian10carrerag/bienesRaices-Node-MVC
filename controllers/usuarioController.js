import {check, validationResult} from 'express-validator'
import { generaJWT, generarId } from '../helpers/tokens.js'
import Usuario from "../models/Usuario.js"
import {emailRegistro, emailOlvidePassword} from "../helpers/email.js"
import { where } from 'sequelize'
import bcrypt from 'bcrypt'

const formularioLogin = (req, res) => {
    res.render('auth/login',{
        pagina : 'Iniciar sesión',
        csrfToken : req.csrfToken()
    })
}

const autenticar = async(req, res) => {
    // Validación de inputs 
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').notEmpty().withMessage('Este espacio no puede ir vacio').run(req)

    let resultado = validationResult(req)

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
        })    
    }

    
    const { email, password } = req.body

    //Evaluar si existe el usuario
    const usuario = await Usuario.findOne({where : {email}} );

    if (!usuario){
        //Errores
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken : req.csrfToken(),
            errores: [{msg : "El usuario no existe"}]
    })
    }

    if (!usuario.confirmado){
        //Errores
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken : req.csrfToken(),
            errores: [{msg : "Tu cuenta no ha sido confirmadada"}]
    })
    }

    // Revisar el password 
    if (!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina : 'Iniciar sesión',
            csrfToken : req.csrfToken(),
            errores: [{msg : "El password es incorrecto"}]
    })
    }

    // Generar JWT 
    const token = generaJWT({ id : usuario.id, nombre : usuario.nombre }); 
    console.log(token)

    // Almacenar en un cookie 
    return res.cookie('_token', token, {
        httpOnly : true,
        //secure : true
    }).redirect('/mis-propiedades')

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
    const confirmar = async (req, res) => {
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


// Recuperación de contraseña 
const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password',{
        pagina : 'Olvidé mi contraseña',
        csrfToken : req.csrfToken(),
    })
}

const resetPassword = async(req, res) => {
    // Validación
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    
    let resultado = validationResult(req)

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/olvide-password',{
            pagina : 'Recupera tu acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
        })    
    }

    //Buscar el usuario

    // Extraer los datos
    const { email } = req.body

    // Verificar que el usuario no esté duplicado
    const usuario = await Usuario.findOne ({where : {email}})

    // Si no existe el usuario, se muestra una alerta
    if (!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Rainces',
            csrfToken : req.csrfToken(),
            errores: [{msg: 'El email no pertenece a nungún usuario'}]
        })
    }

    // Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email 
    emailOlvidePassword({
        nombre : usuario.nombre,
        email : usuario.email,
        token : usuario.token
    })

    // Mostrar mensaje de confirmación
    res.render('templates/mensaje',{
        pagina: 'Reestablece tu contraseña',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}



const comprobarToken = async(req, res) => {
    const {token} = req.params; 
    const usuario = await Usuario.findOne({where: {token}});

    // Si el usuario no existe
    if (!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        })
    }

    res.render('auth/reset-password',{
        pagina: 'Reestablece tu contraseña',
        csrfToken: req.csrfToken()  
    })
}

const nuevoPassword = async(req, res) => {
    // Validar el nuevo password 

    await check('password').isLength({min: 8 }).withMessage('El password debe ser de al menos 8 caracteres').run(req)
    
    let resultado = validationResult(req)

    // Verificar que el resultado esté vacío
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/reset-password',{
            pagina : 'Reestablece tu contraseña',
            csrfToken : req.csrfToken(),
            errores: resultado.array()
        })    
    }

    //Identificar quién hace el cambio 
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({where : {token}})

    // hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina : 'Password reestablecido',
        mensaje : 'El ppasword se guardó correctamente'
    })
}

export{
    formularioLogin,
    autenticar,
    registrar,
    formularioRegistro,
    formularioOlvidePassword, 
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword 
}