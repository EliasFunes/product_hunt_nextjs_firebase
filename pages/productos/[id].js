import React, {useEffect, useContext, useEffect} from 'react';
import {useRouter} from "next/router";
import {FirebaseContext} from '../../firebase';
import Layout from "../../components/layouts/Layout";

import Error404 from "../../components/layouts/404";

const Producto = () => {
    //state del componenete
    const [producto, guardarProducto] = useState({});
    const [error, guardarError] = useState(false);

    // routing para obtener el id actual
    const router = useRouter();
    const { query: { id }} = router;

    const {firebase} = useContext(FirebaseContext);

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

    return (
        <Layout>
            <>
                {error && <Error404 /> }
            </>
        </Layout>
    );
};

export default Producto;
