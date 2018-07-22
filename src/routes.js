import React from 'react';
import Loadable from 'react-loadable'

import DefaultLayout from './containers/DefaultLayout';

function Loading() {
  return <div>Loading...</div>;
}

const Test = Loadable({
  loader: () => import('./views/Test'),
  loading: Loading,
});

const HexagonTrafficMap = Loadable({
  loader: () => import('./views/HexagonTrafficMap'),
  loading: Loading,
});

const FlightsList = Loadable({
  loader: () => import('./views/FlightsList'),
  loading: Loading,
});

const Dashboard = Loadable({
  loader: () => import('./views/Dashboard'),
  loading: Loading,
});

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/test', name: 'Test', component: Test },
  { path: '/hexagonTrafficMap', name: 'HexagonTrafficMap', component: HexagonTrafficMap },
  { path: '/flightsList', name: 'FlightsList', component: FlightsList }
];

export default routes;
