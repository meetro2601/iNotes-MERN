import React from 'react';
import ReactDOM from 'react-dom/client';
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import './style.css'
import App from './App';
import store from './redux/store';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(
    <Provider store={store}>
        <GoogleOAuthProvider clientId='884118040559-u7hlmd21srheug0obnbhoc14t2c2odqo.apps.googleusercontent.com'>
            <App />
        </GoogleOAuthProvider>
    </Provider>
);

