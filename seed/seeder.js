import categorias from "./categorias.js";
import precios from "./precios.js";
import db from '../config/db.js'
import { Categoria, Precio } from "../models/index.js";

const importarDatos = async () => {
    try {
        //Autenticar
        await db.authenticate()

        //Generar las columnas
        await db.sync()

        //Insertar los datos en las columnas
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ])

        console.log('Datos importados correctamente')
        process.exit(0)

    } catch (error){
        console.log(error)
        process.exit(1)
    }
}

const eliminarDatos = async () => {
    try {
        await Promise.all([
            Categoria.destroy({where: {}, TRUNCATE: true}),
            Precio.destroy({where: {}, TRUNCATE: true}),
            db.sync({force:true})
        ])
        console.log('Datos eliminados correctamente');
        process.exit(0);
    } catch (error){
        console.log(error)
        process.exit(1)
    }
}

if (process.argv[2] === "-i"){
    importarDatos();
}

if (process.argv[2] === "-e"){
    eliminarDatos();
}