import React, {useContext, useState} from 'react';
import {css} from "@emotion/core";
import {useRouter} from "next/router";
import FileUploader from "react-firebase-file-uploader";
import Layout from "../components/layouts/Layout";

import {Campo, Error, Formulario, InputSubmit} from "../components/ui/Formulario";
import {FirebaseContext} from "../firebase/index";
import Error404 from "../components/layouts/404";
//validaciones
import useValidacion from "../hooks/useValidacion";
import validarCrearProducto from "../validacion/validarCrearProducto";

const STATE_INICIAL = {
    nombre: '',
    empresa: '',
    imagen: '',
    url: '',
    descripcion: ''
}

const NuevoProducto = () => {

    //state de las imagenes
    const [nombreImagen, guardarNombreImagen] = useState('');
    const [subiendoImagen, guardarSubiendoImagen] = useState(false);
    const [progresoImagen, guardarProgresoImagen] = useState(0);
    const [urlImagen, guardarUrlImagen] = useState('');

    const [error, guardarError] = useState(false);

    //hook de routing para redireccionar
    const router = useRouter();

    //context con las operaciones crud de firebase
    const {usuario, firebase} = useContext(FirebaseContext);

    const crearProducto = async () => {
        //si el usuario no esta autenticado llevar al login
        if(!usuario) {
            return router.push('/login');
        }

        //crear el objeto de nuevo producto
        const producto = {
            nombre,
            empresa,
            url,
            urlImagen,
            descripcion,
            votos: 0,
            comentarios: [],
            creado: Date.now(),
            creador: {
                id: usuario.uid,
                nombre: usuario.displayName
            },
            haVotado: []
        }

        //insertarlo en la base de datos
        await firebase.db.collection('productos').add(producto);

        return router.push('/');
    }

    const handleUploadStart = () => {
        guardarProgresoImagen(0);
        guardarSubiendoImagen(true);
    }

    const handleProgress = progreso => guardarProgresoImagen({progreso});

    const handleUploadError = error => {
        guardarSubiendoImagen(error);
        console.log(error);
    }

    const handleUploadSuccess = nombre => {
        guardarProgresoImagen(100);
        guardarSubiendoImagen(false);
        guardarNombreImagen(nombre);
        firebase
            .storage
            .ref("productos")
            .child(nombre)
            .getDownloadURL()
            .then(url => {
                console.log(url);
                guardarUrlImagen(url);
            });
    }

    const {
        valores,
        errores,
        submitForm,
        handleSubmit,
        handleChange,
        handleBlur
    } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);

    const {nombre, empresa, /*imagen,*/ url, descripcion} = valores;

    return (
        <div>
            <Layout>
                { !usuario ? <Error404/> : (
                    <>
                        <h1
                            css={css`
                                text-align: center;
                                margin-top: 5rem;  
                            `}
                        >Nuevo Producto</h1>
                        <Formulario
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            <fieldset>
                                <legend>Información General</legend>

                                <Campo>
                                    <label htmlFor="nombre">Nombre</label>
                                    <input
                                        type="text"
                                        id="nobre"
                                        placeholder="Nombre del producto"
                                        name="nombre"
                                        value={nombre}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Campo>
                                {errores.nombre && <Error>{errores.nombre}</Error>}

                                <Campo>
                                    <label htmlFor="empresa">Empresa</label>
                                    <input
                                        type="text"
                                        id="empresa"
                                        placeholder="Nombre Empresa o compañia"
                                        name="empresa"
                                        value={empresa}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Campo>
                                {errores.empresa && <Error>{errores.empresa}</Error>}

                                <Campo>
                                    <label htmlFor="imagen">Imagen</label>
                                    <FileUploader
                                        accept="image/*"
                                        id="imagen"
                                        name="imagen"
                                        randomizeFilename
                                        storageRef={firebase.storage.ref("productos")}
                                        onUploadStart={handleUploadStart}
                                        onUploadError={handleUploadError}
                                        onUploadSuccess={handleUploadSuccess}
                                        onProgress={handleProgress}
                                    />
                                </Campo>

                                <Campo>
                                    <label htmlFor="url">Url</label>
                                    <input
                                        type="url"
                                        id="url"
                                        name="url"
                                        placeholder="URL de tu producto"
                                        value={url}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Campo>
                                {errores.url && <Error>{errores.url}</Error>}

                            </fieldset>

                            <fieldset>
                                <legend>Sobre tu producto</legend>
                                <Campo>
                                    <label htmlFor="descripcion">Descripción</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={descripcion}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </Campo>
                                {errores.descripcion && <Error>{errores.descripcion}</Error>}
                            </fieldset>


                            <InputSubmit type="submit" value="Crear Producto"/>
                            {error && <Error>{error}</Error>}
                        </Formulario>
                    </>
                )}
            </Layout>
        </div>
    );
};

export default NuevoProducto;
