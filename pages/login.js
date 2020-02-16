import React, {useState} from 'react';
import {css} from "@emotion/core";
import Router from "next/router";
import Layout from "../components/layouts/Layout";
import {Formulario, Campo, InputSubmit, Error} from "../components/ui/Formulario";

import firebase from "../firebase";

//validaciones
import useValidacion from "../hooks/useValidacion";
import validarIniciarSesion from "../validacion/validarIniciarSesion";

const STATE_INICIAL = {
    email: '',
    password: ''
}

const Login = () => {

    const [error, guardarError] = useState(false);

    const iniciarSesion = async () => {
        try {
            await firebase.login(email, password);
            Router.push('/');
        } catch (e) {
            console.error('Hubo un error al iniciar sesión', e.message);
            guardarError(e.message);
        }
    }

    const {
        valores,
        errores,
        submitForm,
        handleSubmit,
        handleChange,
        handleBlur
    } = useValidacion(STATE_INICIAL, validarIniciarSesion, iniciarSesion);

    const {email, password} = valores;

    return (
        <div>
            <Layout>
                <>
                    <h1
                        css={css`
                        text-align: center;
                        margin-top: 5rem;  
                    `}
                    >Iniciar Sesión</h1>
                    <Formulario
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <Campo>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Tu email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </Campo>
                        {errores.email && <Error>{errores.email}</Error>}

                        <Campo>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Tu password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </Campo>
                        {errores.password && <Error>{errores.password}</Error>}
                        <InputSubmit type="submit" value="Iniciar Sesión"/>
                        {error && <Error>{error}</Error>}
                    </Formulario>
                </>
            </Layout>
        </div>
    );
};

export default Login;
