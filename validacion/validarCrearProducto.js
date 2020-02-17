export default function validarCrearProducto(valores) {
    let errores = {};

    //validar el nombre del usuario
    if(!valores.nombre){
        errores.nombre = "El nombre es obligatorio";
    }

    //validar la empresa
    if(!valores.empresa) {
        errores.empresa = "Nombre de Empresa es obligatorio";
    }

    //validar url
    if(!valores.url) {
        errores.url = "La URL del producto es obligatoria";
    } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(valores.url)) {
        errores.url = "URL mal formateada o no válida";
    }

    //validar descripcion
    if(!valores.descripcion) {
        errores.descripcion = "Agrega una descripción de tu producto";
    }

    return errores;
}