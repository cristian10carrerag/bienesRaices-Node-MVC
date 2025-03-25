import Propiedad from './Propiedad.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'

// Relación de 1 a 1
Precio.hasOne(Propiedad); 
// Propiedad.belongsTo(Precio); es lo mismo que arriba

Categoria.hasOne(Propiedad); 

//Relación de 1 a muchos
Usuario.hasMany(Propiedad); 


export {
    Propiedad,
    Precio,
    Categoria, 
    Usuario
}