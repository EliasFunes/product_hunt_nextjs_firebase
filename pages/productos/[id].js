import React, {useEffect, useContext, useEffect} from 'react';
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
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
  }
`;

const Producto = () => {
    //state del componenete
    const [producto, guardarProducto] = useState({});
    const [error, guardarError] = useState(false);

    // routing para obtener el id actual
    const router = useRouter();
    const { query: { id }} = router;

    const {firebase, usuario} = useContext(FirebaseContext);

    useEffect(() => {
        if(id) {
            const obtenerProductos = async () => {
                const productoQuery = await firebase.db.collection('productos').doc('id');
                const producto = await productoQuery.get();
                if(producto.exists) {
                    guardarProducto(producto.data());
                } else {
                    guardarError(true);
                }

            }
            obtenerProductos();
        }
    }, [id]);

    if(Object.keys(producto).length === 0) return 'Cargando...';
    const {comentarios, creado, descripcion, empresa, nombre, url, urlImagen, votos, creador} = producto;

    return (
        <Layout>
            <>
                {error && <Error404 /> }
                <div className="contenedor">
                    <h1 css={css`text-align: center;margin-top: 5rem;`}>{nombre}</h1>
                </div>
                <ContenedorProducto>
                    <div>
                        <p>Publicado hace: {formatDistanceToNow(new Date(creado), {locale: es})}</p>
                        <p>Publicado por {creador.nombre} de {empresa}</p>
                        <img src={urlImagen} />
                        <p>{descripcion}</p>

                        {usuario && (
                            <>
                                <h2>Agrega tu comentario</h2>
                                <form>
                                    <Campo>
                                        <input
                                            type="text"
                                            name="mensaje"
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
                        {comentarios.map(comentario => (
                            <li>
                                <p>{comentario.nombre}</p>
                                <p>Escrito por: {comentario.usuarioNombre}</p>
                            </li>
                        ))}
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
                                <Boton>Votar</Boton>
                            )}
                        </div>
                    </aside>
                </ContenedorProducto>
            </>
        </Layout>
    );
};

export default Producto;
