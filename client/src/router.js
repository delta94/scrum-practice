import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import HomgePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => {
    if (!!isAuthenticated) return <Redirect to='/login' />
    else return <Component {...rest} />
};

export default function browserRouter({ isAuthenticated }) {
    return (
        <BrowserRouter >
            <Switch>
                <PrivateRoute path='/' exact component={HomgePage} isAuthenticated={isAuthenticated} />
                <Route path='/login' component={LoginPage} isAuthenticated={isAuthenticated} />
            </Switch>
        </BrowserRouter>
    );
}