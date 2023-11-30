import { createRouter, defineRoute, param, createGroup, type Route } from "type-route";

export const routeDefs = {
    "dataExplorer": defineRoute(
        {
            "source": param.query.optional.string,
            "rowsPerPage": param.query.optional.number.default(25),
            "page": param.query.optional.number.default(1)
        },
        () => `/data-explorer`
    )
};

export const routeGroup = createGroup(Object.values(createRouter(routeDefs).routes));

export type PageRoute = Route<typeof routeGroup>;

export const getDoRequireUserLoggedIn: (route: PageRoute) => boolean = () => false;