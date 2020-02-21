import React, {useEffect, useContext, useState} from 'react';
import {useRouter} from "next/router";
import {FirebaseContext} from '../../firebase';
import Layout from "../../components/layouts/Layout";
import { css } from "@emotion/core";
import styled from "@emotion/styled";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import {es} from "date-fns/locale";


import Error404 from "../../components/layouts/404";
import {Campo, InputSubmit} from "../../components/ui/Formulario";
import Boton from "../../components/ui/Boton";


const ContenedorProducto = styled.div`
   @media (min-width:768px) {
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: 2rem;
   }
`;
const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #DA552F;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center
`;

const Producto = () => {
    //state del componenete
    const [producto, guardarProducto] = useState({});
    const [error, guardarError] = useState(false);
    const [comentario, guardarComentario] = useState({});
    const [consultarDB, guardarConsultarDB] = useState(true);

    // routing para obtener el id actual
    const router = useRouter();
    const { query: { id }} = router;

    const {firebase, usuario} = useContext(FirebaseContext);

    useEffect(() => {
        if(id && consultarDB) {
            const obtenerProductos = async () => {
                const productoQuery = await firebase.db.collection('productos').doc(id);
                const producto = await productoQuery.get();
                if(producto.exists) {
                    guardarProducto(producto.data());
                    guardarConsultarDB(false);
                } else {
                    guardarError(true);
                    guardarConsultarDB(false);
                }

            }
            obtenerProductos();
        }
    }, [id]);

    if(Object.keys(producto).length === 0 && !error)  return 'Cargando...';
    const {comentarios, creado, descripcion, empresa, nombre, url, urlImagen, votos, creador, haVotado} = producto;

    //administrar y validar votos
    const votarProducto = () => {
        if(!usuario) {
            return router.push('/login');
        }

        //obtener y sumar un nuevo voto
        const nuevoTotal = votos + 1;

        //Verificar si el usuario actual ha votado
        if(haVotado.includes(usuario.uid)) return ;

        //Guardar el id del usuario que ha votado
        const nuevoHaVotado = [...haVotado, usuario.uid];

        //Actualizar en la base de datos
        firebase.db.collection('productos').doc(id).update({votos: nuevoTotal, haVotado: nuevoHaVotado});

        //Actualizar el state
        guardarProducto({
            ...producto,
            votos: nuevoTotal
        });

        //hay un voto, consultar a la base de datos
        guardarConsultarDB(true);

    }

    //Funciones para crear comentarios
    const comentarioHandleChange = e => {
        guardarComentario({
            ...comentario,
            [e.target.name]: e.target.value
        });
    }

    //Identifica si el comentario es el creador del producto
    const esCreador = id => {
        if(creador.id == id) {
            return true
        }
    }

    const comentarioHandleSubmit = e => {
        e.preventDefault();

        if(!usuario) {
            return router.push('/login');
        }

        //Informacion extra
        comentario.usuarioId = usuario.uid;
        comentario.usuarioNombre = usuario.displayName;

        //Tomar copia de comentarios y agregarlos al arreglo
        const nuevosComentarios = [...comentarios, comentario];

        //Actualizar Base de datos
        firebase.db.collection('productos').doc(id).update({
            comentarios: nuevosComentarios
        });

        //Actualizar State
        guardarProducto({
           ...producto,
           comentarios: nuevosComentarios
        });

        //hay un comentario, consultar a la base de datos
        guardarConsultarDB(true);
    }

    // función que revisa que el creador del producto sea el mismo que esta autenticado
    const puedeBorrar = () => {
        if(!usuario) return false;
        if(creador.id === usuario.uid) return true;
    }

    //elimina producto de la base de datos
    const eliminarProducto = async () => {
        if(!usuario) return router.push('/login');
        if(creador.id !== usuario.uid) return router.push('/');

        try {
            await firebase.db.collection('productos').doc(id).delete();
            router.push('/');
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout>
            {error ? <Error404 /> : (
                <div className="contenedor">
                    <h1 css={css`
                        text-align: center;
                        margin-top: 5rem;
                    `}>{nombre} </h1>
                    <ContenedorProducto>
                        <div>
                            <p>Publicado hace: {formatDistanceToNow(new Date(creado), {locale: es})}</p>
                            <p>Publicado por {creador.nombre} de {empresa}</p>
                            <img src={urlImagen}/>
                            <p>{descripcion}</p>

                            {usuario && (
                                <>
                                    <h2>Agrega tu comentario</h2>
                                    <form
                                        onSubmit={comentarioHandleSubmit}
                                    >
                                        <Campo>
                                            <input
                                                type="text"
                                                name="mensaje"
                                                onChange={comentarioHandleChange}
                                            />
                                        </Campo>
                                        <InputSubmit
                                            type="submit"
                                            value="Agregar Comentario"
                                        />
                                    </form>
                                </>
                            )}

                            <h2 css={css`
                                margin: 2rem 0;
                            `}
                            >Comentarios</h2>

                            {comentarios.length === 0 ? "Aún no hay comentarios" : (
                                <ul>
                                    {comentarios.map((comentario, i) => (
                                        <li
                                            key={`${comentario.usuarioId}-${i}`}
                                            css={css`
                                                border: 1px solid #e1e1e1;
                                                padding: 2rem;
                                            `}
                                        >
                                            <p>{comentario.mensaje}</p>
                                            <p>Escrito por: <span css={css`
                                                font-weight: bold;
                                            `}>{''}{comentario.usuarioNombre}</span></p>

                                            {esCreador(comentario.usuarioId) &&
                                            <CreadorProducto>Es creador</CreadorProducto>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <aside>
                            <Boton
                                target="_blank"
                                bgColor="true"
                                href={url}
                            >Visitar URL</Boton>
                            <div css={css`margin-top: 5rem`}>
                                <p css={css`text-align: center`}>{votos} Votos</p>
                                {usuario && (
                                    <Boton
                                        onClick={votarProducto}
                                    >Votar</Boton>
                                )}
                            </div>
                        </aside>
                    </ContenedorProducto>
                    {puedeBorrar() &&
                        <Boton
                            onClick={eliminarProducto}
                        >Eliminar Producto</Boton>
                    }
                </div>
            )}
        </Layout>
    );
};

export default Producto;
